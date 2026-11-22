"""Repository para la entidad Producto."""

from typing import Sequence

from sqlmodel import Session, select, func

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    """Repository especializado para la entidad Producto."""

    def __init__(self, session: Session):
        super().__init__(session, Producto)

    def get_disponibles(self, skip: int = 0, limit: int = 100) -> Sequence[Producto]:
        """Lista los productos activos y disponibles."""
        stmt = (
            select(Producto)
            .where(Producto.activo == True)  # noqa: E712
            .where(Producto.disponible == True)  # noqa: E712
            .offset(skip)
            .limit(limit)
        )
        return self.session.exec(stmt).all()

    def get_by_categoria(self, categoria_id: int, skip: int = 0, limit: int = 100) -> Sequence[Producto]:
        """Lista los productos de una categoría."""
        stmt = (
            select(Producto)
            .where(Producto.categoria_id == categoria_id)
            .where(Producto.activo == True)  # noqa: E712
            .where(Producto.disponible == True)  # noqa: E712
            .offset(skip)
            .limit(limit)
        )
        return self.session.exec(stmt).all()

    def search(
        self,
        skip: int = 0,
        limit: int = 100,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[int, Sequence[Producto]]:
        """
        Busca productos con filtros opcionales.
        Devuelve (total, lista_de_productos).
        """
        stmt = select(Producto).where(Producto.activo == True)  # noqa: E712

        if search:
            stmt = stmt.where(Producto.nombre.ilike(f"%{search}%"))
        if categoria_id is not None:
            stmt = stmt.where(Producto.categoria_id == categoria_id)
        if disponible is not None:
            stmt = stmt.where(Producto.disponible == disponible)

        # Contar total
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.session.exec(count_stmt).one()

        # Obtener resultados paginados
        results = stmt.offset(skip).limit(limit).all()
        return total, results
