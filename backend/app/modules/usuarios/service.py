"""Service para el módulo de usuarios."""

from app.core.database import session_factory
from app.core.security import get_password_hash, verify_password
from app.modules.usuarios.models import Usuario
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

    Recibe el Unit of Work por inyección de dependencias y delega todo
    el acceso a datos en los repositorios que este expone.
    """

    def __init__(self, uow: UsuarioUnitOfWork | None = None):
        self.uow = uow or UsuarioUnitOfWork(session_factory)

    def create_user(self, user_in: UsuarioCreate) -> UsuarioRead:
        """Crea un nuevo usuario con rol 'user' por defecto."""
        with self.uow as uow:
            existing_email = uow.usuarios.get_by_email(user_in.email)
            if existing_email:
                raise UsuarioDuplicado("El email ya está registrado")

            existing_username = uow.usuarios.get_by_username(user_in.username)
            if existing_username:
                raise UsuarioDuplicado("El username ya está registrado")

            user = Usuario(
                username=user_in.username,
                email=user_in.email,
                full_name=user_in.full_name,
                hashed_password=get_password_hash(user_in.password),
                role="user",
            )
            uow.usuarios.add(user)
            return UsuarioRead.model_validate(user)

    def get_user(self, user_id: int) -> UsuarioRead | None:
        """Obtiene un usuario por su ID."""
        with self.uow as uow:
            user = uow.usuarios.get_by_id(user_id)
            if user is None:
                return None
            return UsuarioRead.model_validate(user)

    def get_user_by_email(self, email: str) -> UsuarioRead | None:
        """Obtiene un usuario por su email."""
        with self.uow as uow:
            user = uow.usuarios.get_by_email(email)
            if user is None:
                return None
            return UsuarioRead.model_validate(user)

    def get_user_by_username(self, username: str) -> UsuarioRead | None:
        """Obtiene un usuario por su username."""
        with self.uow as uow:
            user = uow.usuarios.get_by_username(username)
            if user is None:
                return None
            return UsuarioRead.model_validate(user)

    def list_users(self, skip: int = 0, limit: int = 100) -> list[UsuarioListRead]:
        """Lista todos los usuarios (admin)."""
        with self.uow as uow:
            users = uow.usuarios.get_all(skip=skip, limit=limit)
            return [UsuarioListRead.model_validate(u) for u in users]

    def activate_user(self, user_id: int) -> UsuarioListRead:
        """Activa un usuario (admin)."""
        with self.uow as uow:
            user = uow.usuarios.get_by_id(user_id)
            if user is None:
                raise UsuarioNoEncontrado("Usuario no encontrado")
            user.disabled = False
            uow.usuarios.save(user)
            return UsuarioListRead.model_validate(user)

    def deactivate_user(self, user_id: int, current_user_id: int) -> UsuarioListRead:
        """Desactiva un usuario (admin). No puede desactivarse a sí mismo.

        Protege contra desactivar al último admin del sistema.
        """
        if user_id == current_user_id:
            raise UsuarioNoEncontrado("No puedes desactivarte a ti mismo")
        with self.uow as uow:
            user = uow.usuarios.get_by_id(user_id)
            if user is None:
                raise UsuarioNoEncontrado("Usuario no encontrado")

            # No permitir desactivar al último admin
            if user.role == "admin":
                admins = uow.usuarios.get_by_role("admin")
                active_admins = [a for a in admins if not a.disabled]
                if len(active_admins) <= 1:
                    raise UsuarioNoEncontrado("No se puede desactivar al último administrador activo")

            user.disabled = True
            uow.usuarios.save(user)
            return UsuarioListRead.model_validate(user)

    def update_profile(self, user_id: int, data: UsuarioUpdate) -> UsuarioRead:
        """Actualiza el perfil de un usuario (nombre, email)."""
        with self.uow as uow:
            user = uow.usuarios.get_by_id(user_id)
            if user is None:
                raise UsuarioNoEncontrado("Usuario no encontrado")

            update_data = data.model_dump(exclude_unset=True)
            if not update_data:
                return UsuarioRead.model_validate(user)

            # Verificar que el email no esté en uso por otro usuario
            if "email" in update_data:
                existing = uow.usuarios.get_by_email(update_data["email"])
                if existing and existing.id != user_id:
                    raise UsuarioDuplicado("El email ya está registrado")

            user.sqlmodel_update(update_data)
            uow.usuarios.save(user)
            return UsuarioRead.model_validate(user)

    def change_password(self, user_id: int, data: PasswordChange) -> None:
        """Cambia la contraseña de un usuario."""
        with self.uow as uow:
            user = uow.usuarios.get_by_id(user_id)
            if user is None:
                raise UsuarioNoEncontrado("Usuario no encontrado")

            if not verify_password(data.old_password, user.hashed_password):
                raise UsuarioNoEncontrado("La contraseña actual es incorrecta")

            user.hashed_password = get_password_hash(data.new_password)
            uow.usuarios.save(user)
