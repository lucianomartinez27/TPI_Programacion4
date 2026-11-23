from datetime import datetime, timezone

from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def add_detalle(self, detalle: DetallePedido) -> DetallePedido:
        self.session.add(detalle)
        self.session.flush()
        return detalle

    def get_by_id_with_items(self, pedido_id: int) -> Pedido | None:
        statement = (
            select(Pedido)
            .options(selectinload(Pedido.items))
            .where(Pedido.id == pedido_id)
        )
        return self.session.exec(statement).first()

    def list_by_usuario(
        self,
        usuario_id: int | None = None,
        estado: str | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[int, list[Pedido]]:
        conditions = []
        if usuario_id is not None:
            conditions.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            conditions.append(Pedido.estado == estado)

        count_stmt = select(func.count()).select_from(Pedido)
        items_stmt = (
            select(Pedido)
            .options(selectinload(Pedido.items))
            .order_by(Pedido.created_at.desc(), Pedido.id.desc())
        )
        if conditions:
            count_stmt = count_stmt.where(*conditions)
            items_stmt = items_stmt.where(*conditions)

        total = int(self.session.exec(count_stmt).one())
        items = list(self.session.exec(items_stmt.offset(skip).limit(limit)).all())
        return total, items

    def count_by_estado(self) -> dict[str, int]:
        statement = select(Pedido.estado, func.count(Pedido.id)).group_by(
            Pedido.estado
        )
        rows = self.session.exec(statement).all()
        return {estado: int(cantidad) for estado, cantidad in rows}

    def count_pedidos_hoy(self) -> int:
        ahora = datetime.now(timezone.utc)
        inicio_dia = ahora.replace(hour=0, minute=0, second=0, microsecond=0)
        # SQLite puede almacenar timestamps naive en UTC; comparamos sin tzinfo si hace falta
        inicio_naive = inicio_dia.replace(tzinfo=None)
        statement = (
            select(func.count())
            .select_from(Pedido)
            .where(Pedido.created_at >= inicio_naive)
        )
        return int(self.session.exec(statement).one())

    def sum_ingresos_entregados(self) -> float:
        statement = select(func.coalesce(func.sum(Pedido.total), 0.0)).where(
            Pedido.estado == "ENTREGADO"
        )
        resultado = self.session.exec(statement).one()
        return round(float(resultado or 0.0), 2)

    def refresh(self, pedido: Pedido) -> Pedido:
        self.session.refresh(pedido)
        return pedido
