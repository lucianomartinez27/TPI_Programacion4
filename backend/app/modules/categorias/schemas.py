"""Schemas SQLModel y excepciones de dominio para el módulo de categorías."""

from pydantic import ConfigDict
from sqlmodel import Field, SQLModel


# --- Excepciones de dominio ---

class CategoriaNoEncontrada(Exception):
    """La categoría solicitada no existe."""


class NombreDuplicado(Exception):
    """Ya existe una categoría con ese nombre."""


# --- Schemas ---

class CategoriaCreate(SQLModel):
    """Schema para crear una categoría."""

    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str | None = None


class CategoriaUpdate(SQLModel):
    """Schema para actualizar una categoría (actualización parcial)."""

    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = None
    activo: bool | None = None


class CategoriaRead(SQLModel):
    """Schema de lectura de una categoría."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    descripcion: str | None
    activo: bool
