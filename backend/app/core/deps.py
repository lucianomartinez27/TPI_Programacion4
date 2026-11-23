"""Dependencias inyectables para autenticación y autorización (cookie HttpOnly + RBAC)."""

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer

from app.core.database import session_factory
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

WWW_AUTHENTICATE_HEADERS = {"WWW-Authenticate": "Bearer"}


class OAuth2PasswordBearerWithCookie(OAuth2PasswordBearer):
    """Extrae el JWT exclusivamente desde la cookie HttpOnly 'access_token'."""

    async def __call__(self, request: Request) -> str | None:
        token = request.cookies.get("access_token")
        if not token:
            if self.auto_error:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="No se proporcionó token de autenticación",
                    headers=WWW_AUTHENTICATE_HEADERS,
                )
            return None
        return token


oauth2_scheme = OAuth2PasswordBearerWithCookie(tokenUrl="/api/v1/auth/token")


def get_current_user(token: str = Depends(oauth2_scheme)) -> Usuario:
    """Valida el token JWT de la cookie HttpOnly y obtiene el usuario vigente desde la BD."""
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers=WWW_AUTHENTICATE_HEADERS,
        )

    user_id: str | None = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token sin identificador de usuario",
            headers=WWW_AUTHENTICATE_HEADERS,
        )

    try:
        user_id_int = int(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token con identificador inválido",
            headers=WWW_AUTHENTICATE_HEADERS,
        )

    with UsuarioUnitOfWork(session_factory) as uow:
        user = uow.usuarios.get_by_id(user_id_int)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no encontrado",
                headers=WWW_AUTHENTICATE_HEADERS,
            )
        return user


def get_current_active_user(
    current_user: Usuario = Depends(get_current_user),
) -> Usuario:
    """Asegura que el usuario actual está activo (no deshabilitado)."""
    if current_user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cuenta de usuario desactivada",
        )
    return current_user


def require_role(role: str | list[str]):
    """Devuelve una dependencia que exige uno o más roles específicos."""
    allowed_roles = [role] if isinstance(role, str) else role

    def _require_role(
        current_user: Usuario = Depends(get_current_active_user),
    ) -> Usuario:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permisos insuficientes",
            )
        return current_user

    return _require_role
