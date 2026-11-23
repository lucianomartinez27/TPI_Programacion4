from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def get_by_id_with_categoria(self, producto_id: int) -> Producto | None:
        statement = (
            select(Producto)
            .options(selectinload(Producto.categoria))
            .where(Producto.id == producto_id)
        )
        return self.session.exec(statement).first()

    def search(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[int, list[Producto]]:
        conditions = [Producto.activo.is_(True)]

        if search is not None and search.strip():
            term = search.strip().lower()
            conditions.append(func.lower(Producto.nombre).contains(term))

        if categoria_id is not None:
            conditions.append(Producto.categoria_id == categoria_id)

        if disponible is not None:
            conditions.append(Producto.disponible.is_(disponible))

        count_stmt = select(func.count()).select_from(Producto).where(*conditions)
        total = int(self.session.exec(count_stmt).one())

        items_stmt = (
            select(Producto)
            .options(selectinload(Producto.categoria))
            .where(*conditions)
            .order_by(Producto.id)
            .offset(skip)
            .limit(limit)
        )
        items = list(self.session.exec(items_stmt).all())
        return total, items

    def refresh(self, producto: Producto) -> Producto:
        self.session.refresh(producto)
        return producto
