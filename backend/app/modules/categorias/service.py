"""Service para el módulo de categorías."""

from app.modules.categorias.models import Categoria
from app.modules.categorias.repository import CategoriaRepository
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaNoEncontrada,
    CategoriaRead,
    CategoriaUpdate,
    NombreDuplicado,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork
from app.modules.productos.models import Producto


class CategoriaService:
    """Lógica de negocio para la gestión de categorías.

    Usa Unit of Work: cada operación abre su propia sesión transaccional
    a través del UoW, sin depender de una sesión inyectada por el router.
    """

    def _repo(self, session):
        """Crea un repository sobre la sesión del UoW."""
        return CategoriaRepository(session)

    def create_categoria(self, data: CategoriaCreate) -> CategoriaRead:
        """Crea una nueva categoría."""
        with CategoriaUnitOfWork() as uow:
            repository = self._repo(uow.session)
            existing = repository.get_by_name(data.nombre)
            if existing:
                raise NombreDuplicado("Ya existe una categoría con ese nombre")

            categoria = Categoria(
                nombre=data.nombre,
                descripcion=data.descripcion,
            )
            uow.session.add(categoria)
            uow.session.flush()
            uow.session.refresh(categoria)
            return CategoriaRead.model_validate(categoria)

    def get_categoria(self, categoria_id: int) -> CategoriaRead:
        """Obtiene una categoría por su ID."""
        with CategoriaUnitOfWork() as uow:
            repository = self._repo(uow.session)
            categoria = repository.get_by_id(categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada("Categoría no encontrada")
            return CategoriaRead.model_validate(categoria)

    def list_categorias(self, skip: int = 0, limit: int = 100) -> list[CategoriaRead]:
        """Lista todas las categorías."""
        with CategoriaUnitOfWork() as uow:
            repository = self._repo(uow.session)
            categorias = repository.get_all(skip=skip, limit=limit)
            return [CategoriaRead.model_validate(c) for c in categorias]

    def list_categorias_activas(self, skip: int = 0, limit: int = 100) -> list[CategoriaRead]:
        """Lista las categorías activas."""
        with CategoriaUnitOfWork() as uow:
            repository = self._repo(uow.session)
            categorias = repository.get_active(skip=skip, limit=limit)
            return [CategoriaRead.model_validate(c) for c in categorias]

    def update_categoria(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        """Actualiza una categoría."""
        with CategoriaUnitOfWork() as uow:
            repository = self._repo(uow.session)
            categoria = repository.get_by_id(categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada("Categoría no encontrada")

            update_data = data.model_dump(exclude_unset=True)
            if "nombre" in update_data:
                existing = repository.get_by_name(update_data["nombre"])
                if existing and existing.id != categoria_id:
                    raise NombreDuplicado("Ya existe una categoría con ese nombre")

            categoria.sqlmodel_update(update_data)
            uow.session.add(categoria)
            uow.session.flush()
            uow.session.refresh(categoria)
            return CategoriaRead.model_validate(categoria)

    def delete_categoria(self, categoria_id: int) -> None:
        """Desactiva una categoría (baja lógica).

        RN: No se puede desactivar si tiene productos activos asociados.
        """
        with CategoriaUnitOfWork() as uow:
            repository = self._repo(uow.session)
            categoria = repository.get_by_id(categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada("Categoría no encontrada")

            # Verificar que no tenga productos activos asociados
            productos = uow.session.exec(
                Producto.__table__.select().where(
                    Producto.categoria_id == categoria_id, Producto.activo == True  # noqa: E712
                )
            ).all()
            if productos:
                raise CategoriaNoEncontrada(
                    "No se puede desactivar una categoría con productos activos asociados"
                )

            categoria.activo = False
            uow.session.add(categoria)
