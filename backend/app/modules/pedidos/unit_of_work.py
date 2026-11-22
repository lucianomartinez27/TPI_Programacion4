"""Unit of Work para el módulo de pedidos."""

from sqlmodel import Session

from app.core.unit_of_work import UnitOfWork as BaseUnitOfWork
from app.modules.pedidos.repository import DetallePedidoRepository, PedidoRepository
from app.modules.productos.repository import ProductoRepository


class PedidoUnitOfWork(BaseUnitOfWork):
    """Unit of Work especializado para operaciones con pedidos."""

    @property
    def pedidos(self) -> PedidoRepository:
        """Repository de pedidos sobre la misma sesión."""
        return PedidoRepository(self.session)

    @property
    def detalle_pedidos(self) -> DetallePedidoRepository:
        """Repository de detalle de pedidos sobre la misma sesión."""
        return DetallePedidoRepository(self.session)

    @property
    def productos(self) -> ProductoRepository:
        """Repository de productos sobre la misma sesión."""
        return ProductoRepository(self.session)
