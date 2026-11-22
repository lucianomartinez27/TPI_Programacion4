"""Schemas Pydantic y excepciones de dominio para el módulo de usuarios."""

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


# --- Excepciones de dominio ---

class UsuarioDuplicado(Exception):
    """El username o email ya está registrado."""


class UsuarioNoEncontrado(Exception):
    """El usuario solicitado no existe."""


# --- Schemas ---

class UsuarioCreate(BaseModel):
    """Schema para crear un usuario (registro público)."""

    username: str = Field(min_length=1, max_length=50)
    email: EmailStr
    full_name: str
    password: str = Field(min_length=8)


class UsuarioRead(BaseModel):
    """Schema de lectura del usuario (sin contraseña)."""

    id: int
    username: str
    email: str
    full_name: str
    role: str
    disabled: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UsuarioListRead(BaseModel):
    """Schema simplificado para listado de usuarios."""

    id: int
    username: str
    email: str
    full_name: str
    role: str
    disabled: bool

    class Config:
        from_attributes = True
