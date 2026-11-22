"""Modelos SQLModel de las entidades Pedido y DetallePedido."""

from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlmodel import Field, SQLModel, Relationship

from app.modules.pedidos.enums import EstadoPedido, FormaPago

if TYPE_CHECKING:
    from app.modules.usuarios.models import Usuario
    from app.modules.productos.models import Producto


class Pedido(SQLModel, table=True):
    """Entidad Pedido con tabla en la base de datos."""

    __tablename__ = "pedidos"

    id: int | None = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuarios.id", index=True)
    estado: EstadoPedido = Field(default=EstadoPedido.PENDIENTE)
    forma_pago: FormaPago
    direccion_entrega: str = Field(min_length=5, max_length=200)
    notas: str | None = Field(default=None)
    total: float = Field(ge=0)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    usuario: "Usuario" = Relationship(back_populates="pedidos")
    items: list["DetallePedido"] = Relationship(back_populates="pedido")


class DetallePedido(SQLModel, table=True):
    """Entidad DetallePedido (línea de un pedido) con tabla en la base de datos."""

    __tablename__ = "detalle_pedidos"

    id: int | None = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedidos.id", index=True)
    producto_id: int = Field(foreign_key="productos.id", index=True)
    cantidad: int = Field(ge=1)
    nombre_producto: str = Field(max_length=200)
    precio_unitario: float = Field(ge=0)
    subtotal: float = Field(ge=0)

    pedido: "Pedido" = Relationship(back_populates="items")
    producto: "Producto" = Relationship(back_populates="detalles")
