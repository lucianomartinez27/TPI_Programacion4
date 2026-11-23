"""Schemas SQLModel para el módulo de autenticación."""

from datetime import datetime

from pydantic import ConfigDict
from sqlmodel import SQLModel


class TokenResponse(SQLModel):
    """Respuesta interna con el token JWT."""

    access_token: str
    token_type: str = "bearer"


class LoginMessage(SQLModel):
    """Respuesta pública del login (el JWT viaja en cookie HttpOnly)."""

    message: str


class LogoutMessage(SQLModel):
    """Respuesta del cierre de sesión."""

    detail: str


class UserRead(SQLModel):
    """Schema de lectura del usuario autenticado (sin contraseña)."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    full_name: str
    role: str
    disabled: bool
    created_at: datetime
