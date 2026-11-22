"""Service para el módulo de usuarios."""

from sqlmodel import Session

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


class UsuarioService:
    """Lógica de negocio para la gestión de usuarios."""

    def __init__(self, session: Session):
        self.session = session
        self.repository = UsuarioRepository(session)

    def create_user(self, user_in: UsuarioCreate) -> UsuarioRead:
        """Crea un nuevo usuario con rol 'user' por defecto."""
        existing_email = self.repository.get_by_email(user_in.email)
        if existing_email:
            raise UsuarioDuplicado("El email ya está registrado")

        existing_username = self.repository.get_by_username(user_in.username)
        if existing_username:
            raise UsuarioDuplicado("El username ya está registrado")

        user = Usuario(
            username=user_in.username,
            email=user_in.email,
            full_name=user_in.full_name,
            hashed_password=get_password_hash(user_in.password),
            role="user",
        )
        self.repository.add(user)
        return UsuarioRead.model_validate(user)

    def get_user(self, user_id: int) -> UsuarioRead | None:
        """Obtiene un usuario por su ID."""
        user = self.repository.get_by_id(user_id)
        if user is None:
            return None
        return UsuarioRead.model_validate(user)

    def get_user_by_email(self, email: str) -> Usuario | None:
        """Obtiene un usuario por su email (modelo completo)."""
        return self.repository.get_by_email(email)

    def get_user_by_username(self, username: str) -> Usuario | None:
        """Obtiene un usuario por su username (modelo completo)."""
        return self.repository.get_by_username(username)

    def list_users(self, skip: int = 0, limit: int = 100) -> list[UsuarioListRead]:
        """Lista todos los usuarios (admin)."""
        users = self.repository.get_all(skip=skip, limit=limit)
        return [UsuarioListRead.model_validate(u) for u in users]

    def activate_user(self, user_id: int) -> UsuarioListRead:
        """Activa un usuario (admin)."""
        user = self.repository.get_by_id(user_id)
        if user is None:
            raise UsuarioNoEncontrado("Usuario no encontrado")
        user.disabled = False
        self.session.add(user)
        self.session.flush()
        self.session.refresh(user)
        return UsuarioListRead.model_validate(user)

    def deactivate_user(self, user_id: int, current_user_id: int) -> UsuarioListRead:
        """Desactiva un usuario (admin). No puede desactivarse a sí mismo.

        Protege contra desactivar al último admin del sistema.
        """
        if user_id == current_user_id:
            raise UsuarioNoEncontrado("No puedes desactivarte a ti mismo")
        user = self.repository.get_by_id(user_id)
        if user is None:
            raise UsuarioNoEncontrado("Usuario no encontrado")

        # No permitir desactivar al último admin
        if user.role == "admin":
            admins = self.repository.get_by_role("admin")
            active_admins = [a for a in admins if not a.disabled]
            if len(active_admins) <= 1:
                raise UsuarioNoEncontrado("No se puede desactivar al último administrador activo")

        user.disabled = True
        self.session.add(user)
        self.session.flush()
        self.session.refresh(user)
        return UsuarioListRead.model_validate(user)

    def update_profile(self, user_id: int, data: UsuarioUpdate) -> UsuarioRead:
        """Actualiza el perfil de un usuario (nombre, email)."""
        user = self.repository.get_by_id(user_id)
        if user is None:
            raise UsuarioNoEncontrado("Usuario no encontrado")

        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return UsuarioRead.model_validate(user)

        # Verificar que el email no esté en uso por otro usuario
        if "email" in update_data:
            existing = self.repository.get_by_email(update_data["email"])
            if existing and existing.id != user_id:
                raise UsuarioDuplicado("El email ya está registrado")

        user.sqlmodel_update(update_data)
        self.session.add(user)
        self.session.flush()
        self.session.refresh(user)
        return UsuarioRead.model_validate(user)

    def change_password(self, user_id: int, data: PasswordChange) -> None:
        """Cambia la contraseña de un usuario."""
        user = self.repository.get_by_id(user_id)
        if user is None:
            raise UsuarioNoEncontrado("Usuario no encontrado")

        if not verify_password(data.old_password, user.hashed_password):
            raise UsuarioNoEncontrado("La contraseña actual es incorrecta")

        user.hashed_password = get_password_hash(data.new_password)
        self.session.add(user)
        self.session.flush()
