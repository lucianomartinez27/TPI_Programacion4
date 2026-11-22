"""Modelo SQLModel de la entidad Categoria."""

from typing import TYPE_CHECKING

from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from app.modules.productos.models import Producto


class Categoria(SQLModel, table=True):
    """Entidad Categoria con tabla en la base de datos."""

    __tablename__ = "categorias"

    id: int | None = Field(default=None, primary_key=True)
    nombre: str = Field(index=True, unique=True, min_length=2, max_length=100)
    descripcion: str | None = Field(default=None, max_length=500)
    activo: bool = Field(default=True)

    productos: list["Producto"] = Relationship(back_populates="categoria")
