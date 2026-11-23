"""Service para el módulo de autenticación."""

from app.core.security import create_access_token, verify_password
from app.modules.auth.schemas import TokenResponse, UserRead
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UsuarioCreate, UsuarioDuplicado
from app.modules.usuarios.service import UsuarioService


class AuthService:
    """Lógica de negocio para autenticación."""

    def __init__(self):
        self.usuario_service = UsuarioService()

    def register(self, user_in: UsuarioCreate) -> UserRead:
        """Registra un nuevo usuario."""
        try:
            user = self.usuario_service.create_user(user_in)
            return UserRead.model_validate(user)
        except UsuarioDuplicado as exc:
            raise UsuarioDuplicado(str(exc))

    def login(self, username: str, password: str) -> TokenResponse:
        """Inicia sesión y devuelve un token JWT."""
        user = self.usuario_service.get_user_by_username(username)
        if user is None or not verify_password(password, user.hashed_password):
            raise ValueError("Credenciales incorrectas")
        if user.disabled:
            raise ValueError("Cuenta de usuario desactivada")

        token = create_access_token(data={"sub": str(user.id)})
        return TokenResponse(access_token=token)

    def get_current_user_profile(self, user: Usuario) -> UserRead:
        """Devuelve el perfil del usuario autenticado."""
        return UserRead.model_validate(user)
