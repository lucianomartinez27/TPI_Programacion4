"""Unit of Work para el módulo de pedidos."""

from app.core.unit_of_work import UnitOfWork as BaseUnitOfWork
from app.modules.pedidos.repository import DetallePedidoRepository, PedidoRepository
from app.modules.productos.repository import ProductoRepository


class PedidoUnitOfWork(BaseUnitOfWork):
    """Unit of Work especializado para operaciones con pedidos."""

    pedidos: PedidoRepository
    detalle_pedidos: DetallePedidoRepository
    productos: ProductoRepository

    def __enter__(self) -> "PedidoUnitOfWork":
        super().__enter__()
        self.pedidos = PedidoRepository(self.session)
        self.detalle_pedidos = DetallePedidoRepository(self.session)
        self.productos = ProductoRepository(self.session)
        return self
