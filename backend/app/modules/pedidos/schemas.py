"""Schemas SQLModel y excepciones de dominio para el módulo de pedidos."""

from datetime import datetime

from pydantic import ConfigDict
from sqlmodel import Field, SQLModel

from app.core.exceptions import ProductoNoDisponible, StockInsuficiente  # noqa: F401
from app.modules.pedidos.enums import EstadoPedido, FormaPago


# --- Excepciones de dominio ---

class PedidoNoEncontrado(Exception):
    """El pedido o producto solicitado no existe."""


class PedidoAjeno(Exception):
    """El pedido no pertenece al usuario actual."""


class ProductoRepetido(Exception):
    """Se intentaron agregar productos repetidos en el mismo pedido."""


class TransicionInvalida(Exception):
    """La transición de estado no es válida."""


class PedidoInvalido(Exception):
    """El pedido no cumple con las reglas de validación de dominio."""


# --- Schemas ---

class PedidoItemCreate(SQLModel):
    """Ítem individual al crear un pedido."""

    producto_id: int
    cantidad: int = Field(ge=1)


class PedidoCreate(SQLModel):
    """Schema para crear un pedido desde el carrito."""

    forma_pago: FormaPago
    direccion_entrega: str = Field(min_length=5, max_length=200)
    notas: str | None = None
    items: list[PedidoItemCreate] = Field(min_length=1)


class CambioEstado(SQLModel):
    """Schema para cambiar el estado de un pedido (admin)."""

    estado: EstadoPedido


class DetallePedidoRead(SQLModel):
    """Schema de lectura de una línea de pedido."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    pedido_id: int
    producto_id: int
    cantidad: int
    nombre_producto: str
    precio_unitario: float
    subtotal: float


class PedidoRead(SQLModel):
    """Schema de lectura de un pedido con sus líneas."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    usuario_id: int
    estado: EstadoPedido
    forma_pago: FormaPago
    direccion_entrega: str
    notas: str | None = None
    total: float
    created_at: datetime
    updated_at: datetime
    items: list[DetallePedidoRead] = []


class PedidosPaginados(SQLModel):
    """Respuesta paginada de pedidos."""

    total: int
    items: list[PedidoRead]


class ResumenPedidos(SQLModel):
    """Resumen de pedidos para el panel de administración."""

    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float
