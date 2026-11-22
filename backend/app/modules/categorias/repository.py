"""Repository para la entidad Categoria."""

from typing import Sequence

from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    """Repository especializado para la entidad Categoria."""

    def __init__(self, session: Session):
        super().__init__(session, Categoria)

    def get_by_name(self, nombre: str) -> Categoria | None:
        """Busca una categoría por su nombre."""
        stmt = select(Categoria).where(Categoria.nombre == nombre)
        return self.session.exec(stmt).first()

    def get_active(self, skip: int = 0, limit: int = 100) -> Sequence[Categoria]:
        """Lista las categorías activas."""
        stmt = (
            select(Categoria)
            .where(Categoria.activo == True)  # noqa: E712
            .offset(skip)
            .limit(limit)
        )
        return self.session.exec(stmt).all()
