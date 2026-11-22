"""Dependencias inyectables para autenticación y autorización."""

from typing import Any

from fastapi import Cookie, Depends, HTTPException, status
from sqlmodel import Session

from app.core.database import get_session
from app.core.security import decode_access_token


def get_current_user(
    access_token: str | None = Cookie(default=None),
    session: Session = Depends(get_session),
):
    """Extrae y valida el usuario actual a partir del token JWT en cookie HttpOnly."""
    from app.modules.usuarios.models import Usuario

    if access_token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No se proporcionó token")

    payload = decode_access_token(access_token)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido o expirado")

    user_id: str | None = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token sin identificador de usuario")

    try:
        user_id_int = int(user_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token con identificador inválido")

    user = session.get(Usuario, user_id_int)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado")
    return user


def get_current_active_user(
    current_user: Any = Depends(get_current_user),
):
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
        current_user: Any = Depends(get_current_active_user),
    ):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Se requiere el rol '{', '.join(allowed_roles)}'",
            )
        return current_user
    return _require_role
