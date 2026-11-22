"""Excepciones de dominio compartidas entre módulos."""


class StockInsuficiente(Exception):
    """No hay suficiente stock para la operación."""


class ProductoNoDisponible(Exception):
    """El producto no está disponible."""
