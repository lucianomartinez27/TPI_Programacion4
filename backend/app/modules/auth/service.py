"""Service para el módulo de autenticación."""

from app.core.database import session_factory
from app.core.security import create_access_token, verify_password
from app.modules.auth.schemas import TokenResponse, UserRead
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import (
    PasswordChange,
    UsuarioCreate,
    UsuarioUpdate,
)
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:
    """Lógica de negocio para autenticación."""

    def __init__(
        self,
        uow: UsuarioUnitOfWork | None = None,
        usuario_service: UsuarioService | None = None,
    ):
        self.uow = uow or UsuarioUnitOfWork(session_factory)
        self.usuario_service = usuario_service or UsuarioService(self.uow)

    def register(self, user_in: UsuarioCreate) -> UserRead:
        """Registra un nuevo usuario."""
        user = self.usuario_service.create_user(user_in)
        return UserRead.model_validate(user)

    def login(self, username: str, password: str) -> TokenResponse:
        """Inicia sesión y devuelve un token JWT."""
        with self.uow as uow:
            user = uow.usuarios.get_by_username(username)
            if user is None or not verify_password(password, user.hashed_password):
                raise ValueError("Credenciales incorrectas")
            if user.disabled:
                raise ValueError("Cuenta de usuario desactivada")

            token = create_access_token(data={"sub": str(user.id)})
            return TokenResponse(access_token=token)

    def get_current_user_profile(self, user: Usuario) -> UserRead:
        """Devuelve el perfil del usuario autenticado."""
        return UserRead.model_validate(user)

    def update_profile(self, user_id: int, data: UsuarioUpdate) -> UserRead:
        """Actualiza el perfil del usuario autenticado."""
        updated = self.usuario_service.update_profile(user_id, data)
        return UserRead.model_validate(updated)

    def change_password(self, user_id: int, data: PasswordChange) -> None:
        """Cambia la contraseña del usuario autenticado."""
        self.usuario_service.change_password(user_id, data)
