"""Unit of Work para el módulo de categorías."""

from app.core.unit_of_work import UnitOfWork as BaseUnitOfWork
from app.modules.categorias.repository import CategoriaRepository


class CategoriaUnitOfWork(BaseUnitOfWork):
    """Unit of Work especializado para operaciones con categorías."""

    categorias: CategoriaRepository

    def __enter__(self) -> "CategoriaUnitOfWork":
        super().__enter__()
        self.categorias = CategoriaRepository(self.session)
        return self
