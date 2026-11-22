"""Schemas Pydantic y excepciones de dominio para el módulo de categorías."""

from pydantic import BaseModel


# --- Excepciones de dominio ---

class CategoriaNoEncontrada(Exception):
    """La categoría solicitada no existe."""


class NombreDuplicado(Exception):
    """Ya existe una categoría con ese nombre."""


# --- Schemas ---

class CategoriaCreate(BaseModel):
    """Schema para crear una categoría."""

    nombre: str
    descripcion: str | None = None


class CategoriaUpdate(BaseModel):
    """Schema para actualizar una categoría."""

    nombre: str | None = None
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
