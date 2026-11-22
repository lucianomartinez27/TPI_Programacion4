"""Service para el módulo de productos."""

from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaRead
from app.modules.productos.models import Producto
from app.modules.productos.repository import ProductoRepository
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoNoEncontrado,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoService:
    """Lógica de negocio para la gestión de productos.

    Usa Unit of Work: cada operación abre su propia sesión transaccional
    a través del UoW, sin depender de una sesión inyectada por el router.
    """

    def _repo(self, session):
        """Crea un repository sobre la sesión del UoW."""
        return ProductoRepository(session)

    def create_producto(self, data: ProductoCreate) -> ProductoRead:
        """Crea un nuevo producto."""
        with ProductoUnitOfWork() as uow:
            repository = self._repo(uow.session)
            # Validar que la categoría exista y esté activa
            categoria = uow.session.get(Categoria, data.categoria_id)
            if categoria is None or not categoria.activo:
                raise ProductoNoEncontrado("La categoría especificada no existe o no está activa")

            producto = Producto(
                categoria_id=data.categoria_id,
                nombre=data.nombre,
                descripcion=data.descripcion,
                precio_base=data.precio_base,
                imagen_url=data.imagen_url,
                stock=data.stock,
                disponible=data.disponible,
            )
            uow.session.add(producto)
            uow.session.flush()
            uow.session.refresh(producto)
            return self._build_producto_read(producto, uow.session)

    def get_producto(self, producto_id: int) -> ProductoRead:
        """Obtiene un producto por su ID."""
        with ProductoUnitOfWork() as uow:
            repository = self._repo(uow.session)
            producto = repository.get_by_id(producto_id)
            if producto is None or not producto.activo:
                raise ProductoNoEncontrado("Producto no encontrado")
            return self._build_producto_read(producto, uow.session)

    def list_productos(
        self,
        skip: int = 0,
        limit: int = 100,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> ProductosPaginados:
        """Lista los productos con filtros y paginación."""
        with ProductoUnitOfWork() as uow:
            repository = self._repo(uow.session)
            total, productos = repository.search(
                skip=skip, limit=limit, search=search,
                categoria_id=categoria_id, disponible=disponible,
            )
            items = [self._build_producto_read(p, uow.session) for p in productos]
            return ProductosPaginados(total=total, items=items)

    def update_producto(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        """Actualiza un producto."""
        with ProductoUnitOfWork() as uow:
            repository = self._repo(uow.session)
            producto = repository.get_by_id(producto_id)
            if producto is None or not producto.activo:
                raise ProductoNoEncontrado("Producto no encontrado")

            update_data = data.model_dump(exclude_unset=True)
            if "categoria_id" in update_data:
                categoria = uow.session.get(Categoria, update_data["categoria_id"])
                if categoria is None or not categoria.activo:
                    raise ProductoNoEncontrado("La categoría especificada no existe o no está activa")

            producto.sqlmodel_update(update_data)
            uow.session.add(producto)
            uow.session.flush()
            uow.session.refresh(producto)
            return self._build_producto_read(producto, uow.session)

    def update_stock(self, producto_id: int, data: ProductoStockUpdate) -> ProductoRead:
        """Actualiza el stock y la disponibilidad de un producto."""
        with ProductoUnitOfWork() as uow:
            repository = self._repo(uow.session)
            producto = repository.get_by_id(producto_id)
            if producto is None or not producto.activo:
                raise ProductoNoEncontrado("Producto no encontrado")

            producto.stock = data.stock
            if data.disponible is not None:
                producto.disponible = data.disponible
            else:
                producto.disponible = data.stock > 0
            uow.session.add(producto)
            uow.session.flush()
            uow.session.refresh(producto)
            return self._build_producto_read(producto, uow.session)

    def delete_producto(self, producto_id: int) -> None:
        """Desactiva un producto (baja lógica)."""
        with ProductoUnitOfWork() as uow:
            repository = self._repo(uow.session)
            producto = repository.get_by_id(producto_id)
            if producto is None or not producto.activo:
                raise ProductoNoEncontrado("Producto no encontrado")
            producto.activo = False
            uow.session.add(producto)

    def _build_producto_read(self, producto: Producto, session) -> ProductoRead:
        """Construye un ProductoRead con su categoría."""
        categoria = session.get(Categoria, producto.categoria_id)
        return ProductoRead(
            id=producto.id,
            categoria_id=producto.categoria_id,
            nombre=producto.nombre,
            descripcion=producto.descripcion,
            precio_base=producto.precio_base,
            imagen_url=producto.imagen_url,
            stock=producto.stock,
            disponible=producto.disponible,
            activo=producto.activo,
            categoria=CategoriaRead.model_validate(categoria) if categoria else None,
        )
