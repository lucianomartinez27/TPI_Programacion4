"""Service para el módulo de usuarios."""

from app.core.security import get_password_hash, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.repository import UsuarioRepository
from app.modules.usuarios.schemas import (
    PasswordChange,
    UsuarioCreate,
    UsuarioDuplicado,
    UsuarioListRead,
    UsuarioNoEncontrado,
    UsuarioRead,
    UsuarioUpdate,
)
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    """Lógica de negocio para la gestión de usuarios.

    Usa Unit of Work: cada operación abre su propia sesión transaccional
    a través del UoW, sin depender de una sesión inyectada por el router.
    """

    def _repo(self, session):
        """Crea un repository sobre la sesión del UoW."""
        return UsuarioRepository(session)

    def create_user(self, user_in: UsuarioCreate) -> UsuarioRead:
        """Crea un nuevo usuario con rol 'user' por defecto."""
        with UsuarioUnitOfWork() as uow:
            repository = self._repo(uow.session)
            existing_email = repository.get_by_email(user_in.email)
            if existing_email:
                raise UsuarioDuplicado("El email ya está registrado")

            existing_username = repository.get_by_username(user_in.username)
            if existing_username:
                raise UsuarioDuplicado("El username ya está registrado")

            user = Usuario(
                username=user_in.username,
                email=user_in.email,
                full_name=user_in.full_name,
                hashed_password=get_password_hash(user_in.password),
                role="user",
            )
            repository.add(user)
            return UsuarioRead.model_validate(user)

    def get_user(self, user_id: int) -> UsuarioRead | None:
        """Obtiene un usuario por su ID."""
        with UsuarioUnitOfWork() as uow:
            repository = self._repo(uow.session)
            user = repository.get_by_id(user_id)
            if user is None:
                return None
            return UsuarioRead.model_validate(user)

    def get_user_by_email(self, email: str) -> Usuario | None:
        """Obtiene un usuario por su email (modelo completo)."""
        with UsuarioUnitOfWork() as uow:
            repository = self._repo(uow.session)
            user = repository.get_by_email(email)
            if user is not None:
                uow.session.expunge(user)
            return user

    def get_user_by_username(self, username: str) -> Usuario | None:
        """Obtiene un usuario por su username (modelo completo)."""
        with UsuarioUnitOfWork() as uow:
            repository = self._repo(uow.session)
            user = repository.get_by_username(username)
            if user is not None:
                uow.session.expunge(user)
            return user

    def list_users(self, skip: int = 0, limit: int = 100) -> list[UsuarioListRead]:
        """Lista todos los usuarios (admin)."""
        with UsuarioUnitOfWork() as uow:
            repository = self._repo(uow.session)
            users = repository.get_all(skip=skip, limit=limit)
            return [UsuarioListRead.model_validate(u) for u in users]

    def activate_user(self, user_id: int) -> UsuarioListRead:
        """Activa un usuario (admin)."""
        with UsuarioUnitOfWork() as uow:
            repository = self._repo(uow.session)
            user = repository.get_by_id(user_id)
            if user is None:
                raise UsuarioNoEncontrado("Usuario no encontrado")
            user.disabled = False
            uow.session.add(user)
            uow.session.flush()
            uow.session.refresh(user)
            return UsuarioListRead.model_validate(user)

    def deactivate_user(self, user_id: int, current_user_id: int) -> UsuarioListRead:
        """Desactiva un usuario (admin). No puede desactivarse a sí mismo.

        Protege contra desactivar al último admin del sistema.
        """
        if user_id == current_user_id:
            raise UsuarioNoEncontrado("No puedes desactivarte a ti mismo")
        with UsuarioUnitOfWork() as uow:
            repository = self._repo(uow.session)
            user = repository.get_by_id(user_id)
            if user is None:
                raise UsuarioNoEncontrado("Usuario no encontrado")

            # No permitir desactivar al último admin
            if user.role == "admin":
                admins = repository.get_by_role("admin")
                active_admins = [a for a in admins if not a.disabled]
                if len(active_admins) <= 1:
                    raise UsuarioNoEncontrado("No se puede desactivar al último administrador activo")

            user.disabled = True
            uow.session.add(user)
            uow.session.flush()
            uow.session.refresh(user)
            return UsuarioListRead.model_validate(user)

    def update_profile(self, user_id: int, data: UsuarioUpdate) -> UsuarioRead:
        """Actualiza el perfil de un usuario (nombre, email)."""
        with UsuarioUnitOfWork() as uow:
            repository = self._repo(uow.session)
            user = repository.get_by_id(user_id)
            if user is None:
                raise UsuarioNoEncontrado("Usuario no encontrado")

            update_data = data.model_dump(exclude_unset=True)
            if not update_data:
                return UsuarioRead.model_validate(user)

            # Verificar que el email no esté en uso por otro usuario
            if "email" in update_data:
                existing = repository.get_by_email(update_data["email"])
                if existing and existing.id != user_id:
                    raise UsuarioDuplicado("El email ya está registrado")

            user.sqlmodel_update(update_data)
            uow.session.add(user)
            uow.session.flush()
            uow.session.refresh(user)
            return UsuarioRead.model_validate(user)

    def change_password(self, user_id: int, data: PasswordChange) -> None:
        """Cambia la contraseña de un usuario."""
        with UsuarioUnitOfWork() as uow:
            repository = self._repo(uow.session)
            user = repository.get_by_id(user_id)
            if user is None:
                raise UsuarioNoEncontrado("Usuario no encontrado")

            if not verify_password(data.old_password, user.hashed_password):
                raise UsuarioNoEncontrado("La contraseña actual es incorrecta")

            user.hashed_password = get_password_hash(data.new_password)
            uow.session.add(user)
            uow.session.flush()
