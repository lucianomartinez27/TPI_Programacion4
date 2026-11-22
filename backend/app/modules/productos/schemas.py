"""Schemas Pydantic y excepciones de dominio para el módulo de productos."""

from pydantic import BaseModel, Field


# --- Excepciones de dominio ---

class ProductoNoEncontrado(Exception):
    """El producto solicitado no existe."""


class StockInsuficiente(Exception):
    """No hay suficiente stock para la operación."""


class ProductoNoDisponible(Exception):
    """El producto no está disponible."""


# --- Schemas ---

class ProductoCreate(BaseModel):
    """Schema para crear un producto."""

    categoria_id: int
    nombre: str = Field(min_length=2, max_length=200)
    descripcion: str | None = None
    precio_base: float = Field(ge=0)
    imagen_url: str | None = None
    stock: int = Field(ge=0, default=0)


class ProductoUpdate(BaseModel):
    """Schema para actualizar un producto."""

    categoria_id: int | None = None
    nombre: str | None = None
    descripcion: str | None = None
    precio_base: float | None = None
    imagen_url: str | None = None
    stock: int | None = None
    disponible: bool | None = None
    activo: bool | None = None


class ProductoStockUpdate(BaseModel):
    """Schema para actualizar solo el stock de un producto."""

    stock: int = Field(ge=0)


class CategoriaRead(BaseModel):
    """Schema de lectura de una categoría (referencia en ProductoRead)."""

    id: int
    nombre: str
    descripcion: str | None
    activo: bool

    class Config:
        from_attributes = True


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
