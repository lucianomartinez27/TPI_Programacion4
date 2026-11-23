"""Unit of Work para el módulo de productos."""

from app.core.unit_of_work import UnitOfWork as BaseUnitOfWork
from app.modules.categorias.repository import CategoriaRepository
from app.modules.productos.repository import ProductoRepository


class ProductoUnitOfWork(BaseUnitOfWork):
    """Unit of Work especializado para operaciones con productos."""

    productos: ProductoRepository
    categorias: CategoriaRepository

    def __enter__(self) -> "ProductoUnitOfWork":
        super().__enter__()
        self.productos = ProductoRepository(self.session)
        self.categorias = CategoriaRepository(self.session)
        return self
