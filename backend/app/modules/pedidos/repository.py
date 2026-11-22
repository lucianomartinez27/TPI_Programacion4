"""Repository para las entidades Pedido y DetallePedido."""

from datetime import datetime
from typing import Sequence

from sqlmodel import Session, select, func

from app.core.base_repository import BaseRepository
from app.modules.pedidos.enums import EstadoPedido
from app.modules.pedidos.models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    """Repository especializado para la entidad Pedido."""

    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    def get_by_user(
        self, usuario_id: int, skip: int = 0, limit: int = 100, estado: EstadoPedido | None = None
    ) -> tuple[int, Sequence[Pedido]]:
        """Lista los pedidos de un usuario con filtro opcional por estado."""
        stmt = select(Pedido).where(Pedido.usuario_id == usuario_id)
        if estado is not None:
            stmt = stmt.where(Pedido.estado == estado)
        stmt = stmt.order_by(Pedido.created_at.desc())

        total = self.session.exec(select(func.count()).select_from(stmt.subquery())).one()
        results = stmt.offset(skip).limit(limit).all()
        return total, results

    def get_all_admin(
        self, skip: int = 0, limit: int = 100, estado: EstadoPedido | None = None
    ) -> tuple[int, Sequence[Pedido]]:
        """Lista todos los pedidos (admin) con filtro opcional por estado."""
        stmt = select(Pedido)
        if estado is not None:
            stmt = stmt.where(Pedido.estado == estado)
        stmt = stmt.order_by(Pedido.created_at.desc())

        total = self.session.exec(select(func.count()).select_from(stmt.subquery())).one()
        results = stmt.offset(skip).limit(limit).all()
        return total, results

    def get_counts_by_state(self) -> dict[EstadoPedido, int]:
        """Devuelve la cantidad de pedidos por estado."""
        stmt = select(Pedido.estado, func.count()).group_by(Pedido.estado)
        results = self.session.exec(stmt).all()
        return {estado: count for estado, count in results}

    def get_today_count(self) -> int:
        """Devuelve la cantidad de pedidos creados hoy."""
        today = datetime.now().date()
        stmt = select(func.count()).where(Pedido.created_at >= datetime.combine(today, datetime.min.time()))
        return self.session.exec(stmt).one()

    def get_delivered_revenue(self) -> float:
        """Devuelve el ingreso total de pedidos entregados."""
        stmt = select(func.sum(Pedido.total)).where(Pedido.estado == EstadoPedido.ENTREGADO)
        result = self.session.exec(stmt).one()
        return result or 0.0


class DetallePedidoRepository(BaseRepository[DetallePedido]):
    """Repository especializado para la entidad DetallePedido."""

    def __init__(self, session: Session):
        super().__init__(session, DetallePedido)

    def get_by_pedido(self, pedido_id: int) -> Sequence[DetallePedido]:
        """Lista las líneas de un pedido."""
        stmt = select(DetallePedido).where(DetallePedido.pedido_id == pedido_id)
        return self.session.exec(stmt).all()
