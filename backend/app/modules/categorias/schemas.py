"""Schemas Pydantic y excepciones de dominio para el módulo de categorías."""

from pydantic import BaseModel, Field


# --- Excepciones de dominio ---

class CategoriaNoEncontrada(Exception):
    """La categoría solicitada no existe."""


class NombreDuplicado(Exception):
    """Ya existe una categoría con ese nombre."""


# --- Schemas ---

class CategoriaCreate(BaseModel):
    """Schema para crear una categoría."""

    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str | None = None


class CategoriaUpdate(BaseModel):
    """Schema para actualizar una categoría."""

    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = None
    activo: bool | None = None


class CategoriaRead(BaseModel):
    """Schema de lectura de una categoría."""

    id: int
    nombre: str
    descripcion: str | None
    activo: bool

    class Config:
        from_attributes = True
