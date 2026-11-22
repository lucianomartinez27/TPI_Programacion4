"""Enums compartidos para el módulo de pedidos."""

from enum import Enum


class EstadoPedido(str, Enum):
    """Estados posibles de un pedido."""

    PENDIENTE = "PENDIENTE"
    EN_PREPARACION = "EN_PREPARACION"
    ENTREGADO = "ENTREGADO"
    CANCELADO = "CANCELADO"


class FormaPago(str, Enum):
    """Formas de pago aceptadas."""

    EFECTIVO = "EFECTIVO"
    TRANSFERENCIA = "TRANSFERENCIA"
