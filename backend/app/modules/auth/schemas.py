"""Schemas Pydantic para el módulo de autenticación."""

from datetime import datetime

from pydantic import BaseModel


class TokenResponse(BaseModel):
    """Respuesta con el token JWT."""

    access_token: str
    token_type: str = "bearer"


class UserRead(BaseModel):
    """Schema de lectura del usuario autenticado."""

    id: int
    username: str
    email: str
    full_name: str
    role: str
    disabled: bool
    created_at: datetime

    class Config:
        from_attributes = True
