"""Schemas SQLModel y excepciones de dominio para el módulo de productos."""

from pydantic import ConfigDict
from sqlmodel import Field, SQLModel

from app.core.exceptions import ProductoNoDisponible, StockInsuficiente  # noqa: F401
from app.modules.categorias.schemas import CategoriaRead


# --- Excepciones de dominio ---

class ProductoNoEncontrado(Exception):
    """El producto o categoría solicitada no existe o no está activa."""


# --- Schemas ---

class ProductoCreate(SQLModel):
    """Schema para crear un producto."""

    categoria_id: int
    nombre: str = Field(min_length=2, max_length=200)
    descripcion: str | None = None
    precio_base: float = Field(ge=0)
    imagen_url: str | None = None
    stock: int = Field(ge=0, default=0)
    disponible: bool = True


class ProductoUpdate(SQLModel):
    """Schema para actualizar un producto (actualización parcial)."""

    categoria_id: int | None = None
    nombre: str | None = Field(default=None, min_length=2, max_length=200)
    descripcion: str | None = None
    precio_base: float | None = Field(default=None, ge=0)
    imagen_url: str | None = None
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None
    activo: bool | None = None


class ProductoStockUpdate(SQLModel):
    """Schema para actualizar stock y disponibilidad de un producto."""

    stock: int = Field(ge=0)
    disponible: bool | None = None


class ProductoRead(SQLModel):
    """Schema de lectura de un producto con su categoría."""

    model_config = ConfigDict(from_attributes=True)

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


class ProductosPaginados(SQLModel):
    """Respuesta paginada de productos."""

    total: int
    items: list[ProductoRead]
