"""Service para el módulo de categorías."""

from app.core.database import session_factory
from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaNoEncontrada,
    CategoriaRead,
    CategoriaUpdate,
    NombreDuplicado,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaService:
    """Lógica de negocio para la gestión de categorías.

    Recibe el Unit of Work por inyección de dependencias y delega todo
    el acceso a datos en los repositorios que este expone.
    """

    def __init__(self, uow: CategoriaUnitOfWork | None = None):
        self.uow = uow or CategoriaUnitOfWork(session_factory)

    def create_categoria(self, data: CategoriaCreate) -> CategoriaRead:
        """Crea una nueva categoría."""
        with self.uow as uow:
            existing = uow.categorias.get_by_name(data.nombre)
            if existing:
                raise NombreDuplicado("Ya existe una categoría con ese nombre")

            categoria = Categoria(
                nombre=data.nombre,
                descripcion=data.descripcion,
            )
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def get_categoria(self, categoria_id: int) -> CategoriaRead:
        """Obtiene una categoría por su ID."""
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if categoria is None or not categoria.activo:
                raise CategoriaNoEncontrada("Categoría no encontrada")
            return CategoriaRead.model_validate(categoria)

    def list_categorias(self, skip: int = 0, limit: int = 100) -> list[CategoriaRead]:
        """Lista todas las categorías."""
        with self.uow as uow:
            categorias = uow.categorias.get_all(skip=skip, limit=limit)
            return [CategoriaRead.model_validate(c) for c in categorias]

    def list_categorias_activas(self, skip: int = 0, limit: int = 100) -> list[CategoriaRead]:
        """Lista las categorías activas."""
        with self.uow as uow:
            categorias = uow.categorias.get_active(skip=skip, limit=limit)
            return [CategoriaRead.model_validate(c) for c in categorias]

    def update_categoria(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        """Actualiza una categoría."""
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if categoria is None or not categoria.activo:
                raise CategoriaNoEncontrada("Categoría no encontrada")

            update_data = data.model_dump(exclude_unset=True)
            if "nombre" in update_data:
                existing = uow.categorias.get_by_name(update_data["nombre"])
                if existing and existing.id != categoria_id:
                    raise NombreDuplicado("Ya existe una categoría con ese nombre")

            categoria.sqlmodel_update(update_data)
            uow.categorias.save(categoria)
            return CategoriaRead.model_validate(categoria)

    def delete_categoria(self, categoria_id: int) -> None:
        """Desactiva una categoría (baja lógica)."""
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if categoria is None or not categoria.activo:
                raise CategoriaNoEncontrada("Categoría no encontrada")

            categoria.activo = False
            uow.categorias.save(categoria)
