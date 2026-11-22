"""Schemas Pydantic y excepciones de dominio para el módulo de productos."""

from pydantic import BaseModel, Field

from app.core.exceptions import ProductoNoDisponible, StockInsuficiente
from app.modules.categorias.schemas import CategoriaRead


# --- Excepciones de dominio ---

class ProductoNoEncontrado(Exception):
    """El producto solicitado no existe."""


# --- Schemas ---

class ProductoCreate(BaseModel):
    """Schema para crear un producto."""

    categoria_id: int
    nombre: str = Field(min_length=2, max_length=200)
    descripcion: str | None = None
    precio_base: float = Field(ge=0)
    imagen_url: str | None = None
    stock: int = Field(ge=0, default=0)
    disponible: bool = True


class ProductoUpdate(BaseModel):
    """Schema para actualizar un producto."""

    categoria_id: int | None = None
    nombre: str | None = Field(default=None, min_length=2, max_length=200)
    descripcion: str | None = None
    precio_base: float | None = Field(default=None, ge=0)
    imagen_url: str | None = None
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None
    activo: bool | None = None


class ProductoStockUpdate(BaseModel):
    """Schema para actualizar stock y disponibilidad de un producto."""

    stock: int = Field(ge=0)
    disponible: bool | None = None


class ProductoRead(BaseModel):
    """Schema de lectura de un producto."""

    id: int
    categoria_id: int
    nombre: str
    descripcion: str | None
    precio_base: float
    imagen_url: str | None
    stock: int
    disponible: bool
    activo: bool
    categoria: CategoriaRead | None = None

    class Config:
        from_attributes = True


class ProductosPaginados(BaseModel):
    """Respuesta paginada de productos."""

    total: int
    items: list[ProductoRead]
