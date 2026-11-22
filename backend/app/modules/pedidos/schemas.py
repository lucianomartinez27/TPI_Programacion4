"""Schemas Pydantic y excepciones de dominio para el módulo de pedidos."""

from datetime import datetime

from pydantic import BaseModel, Field

from app.core.exceptions import ProductoNoDisponible, StockInsuficiente
from app.modules.pedidos.enums import EstadoPedido, FormaPago


# --- Excepciones de dominio ---

class PedidoNoEncontrado(Exception):
    """El pedido solicitado no existe."""


class PedidoAjeno(Exception):
    """El pedido no pertenece al usuario actual."""


class ProductoRepetido(Exception):
    """Se intentaron agregar productos repetidos en el mismo pedido."""


class TransicionInvalida(Exception):
    """La transición de estado no es válida."""


# --- Schemas ---

class PedidoItemCreate(BaseModel):
    producto_id: int
    cantidad: int = Field(ge=1)


class PedidoCreate(BaseModel):
    forma_pago: FormaPago
    direccion_entrega: str = Field(min_length=5, max_length=200)
    notas: str | None = None
    items: list[PedidoItemCreate] = Field(min_length=1)


class CambioEstado(BaseModel):
    """Schema para cambiar el estado de un pedido (admin)."""
    estado: EstadoPedido


class DetallePedidoRead(BaseModel):
    id: int
    pedido_id: int
    producto_id: int
    cantidad: int
    nombre_producto: str
    precio_unitario: float
    subtotal: float

    class Config:
        from_attributes = True


class PedidoRead(BaseModel):
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

    class Config:
        from_attributes = True


class PedidosPaginados(BaseModel):
    """Respuesta paginada de pedidos."""
    total: int
    items: list[PedidoRead]


class ResumenPedidos(BaseModel):
    """Resumen de pedidos para el panel de administración."""
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float
