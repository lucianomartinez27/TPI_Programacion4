"""Schemas SQLModel y excepciones de dominio para el módulo de usuarios."""

from datetime import datetime

from pydantic import ConfigDict, EmailStr, field_validator
from sqlmodel import Field, SQLModel


# --- Excepciones de dominio ---

class UsuarioDuplicado(Exception):
    """El username o email ya está registrado."""


class UsuarioNoEncontrado(Exception):
    """El usuario solicitado no existe."""


class OperacionUsuarioInvalida(Exception):
    """La operación solicitada sobre el usuario incumple una regla de negocio."""


class ContrasenaIncorrecta(Exception):
    """La contraseña actual proporcionada no coincide."""


# --- Validación compartida de longitud en bytes para bcrypt ---

def _validate_bcrypt_max_bytes(value: str) -> str:
    if len(value.encode("utf-8")) > 72:
        raise ValueError("La contraseña no puede superar los 72 bytes en UTF-8")
    return value


# --- Schemas ---

class UsuarioCreate(SQLModel):
    """Schema para crear un usuario (registro público)."""

    username: str = Field(min_length=2, max_length=50)
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=100)
    password: str = Field(min_length=8, max_length=72)

    @field_validator("password")
    @classmethod
    def check_password_bytes(cls, value: str) -> str:
        return _validate_bcrypt_max_bytes(value)


class UsuarioUpdate(SQLModel):
    """Schema para actualizar el perfil de un usuario."""

    full_name: str | None = Field(default=None, min_length=2, max_length=100)
    email: EmailStr | None = None


class PasswordChange(SQLModel):
    """Schema para cambiar la contraseña."""

    old_password: str
    new_password: str = Field(min_length=8, max_length=72)

    @field_validator("new_password")
    @classmethod
    def check_new_password_bytes(cls, value: str) -> str:
        return _validate_bcrypt_max_bytes(value)


class UsuarioRead(SQLModel):
    """Schema de lectura del usuario (sin contraseña)."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    full_name: str
    role: str
    disabled: bool
    created_at: datetime


class UsuarioListRead(SQLModel):
    """Schema para listado de usuarios (sin contraseña)."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    full_name: str
    role: str
    disabled: bool
    created_at: datetime
