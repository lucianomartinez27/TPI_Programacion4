from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    pass


class CategoriaNoEncontrada(Exception):
    pass


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def listar(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, productos = uow.productos.search(
                skip=skip,
                limit=limit,
                search=search,
                categoria_id=categoria_id,
                disponible=disponible,
            )
            return ProductosPaginados(
                total=total,
                items=[ProductoRead.model_validate(p) for p in productos],
            )

    def obtener_por_id(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id_with_categoria(producto_id)
            if producto is None or not producto.activo:
                raise ProductoNoEncontrado("Producto no encontrado.")
            return ProductoRead.model_validate(producto)

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(data.categoria_id)
            if categoria is None or not categoria.activo:
                raise CategoriaNoEncontrada(
                    "La categoría indicada no existe o está dada de baja."
                )

            producto = Producto(
                nombre=data.nombre.strip(),
                descripcion=data.descripcion.strip(),
                precio_base=data.precio_base,
                imagen_url=data.imagen_url.strip(),
                stock=data.stock,
                disponible=data.disponible,
                categoria_id=data.categoria_id,
                activo=True,
            )
            uow.productos.add(producto)
            producto_cargado = uow.productos.get_by_id_with_categoria(
                producto.id  # type: ignore[arg-type]
            )
            return ProductoRead.model_validate(producto_cargado)

    def actualizar(
        self, producto_id: int, data: ProductoUpdate
    ) -> ProductoRead:
        cambios = data.model_dump(exclude_unset=True)
        with self.uow as uow:
            producto = uow.productos.get_by_id_with_categoria(producto_id)
            if producto is None or not producto.activo:
                raise ProductoNoEncontrado("Producto no encontrado.")

            if "categoria_id" in cambios and cambios["categoria_id"] is not None:
                categoria = uow.categorias.get_by_id(cambios["categoria_id"])
                if categoria is None or not categoria.activo:
                    raise CategoriaNoEncontrada(
                        "La categoría indicada no existe o está dada de baja."
                    )
                producto.categoria_id = cambios["categoria_id"]

            if "nombre" in cambios and cambios["nombre"] is not None:
                producto.nombre = cambios["nombre"].strip()
            if "descripcion" in cambios and cambios["descripcion"] is not None:
                producto.descripcion = cambios["descripcion"].strip()
            if "precio_base" in cambios and cambios["precio_base"] is not None:
                producto.precio_base = cambios["precio_base"]
            if "imagen_url" in cambios and cambios["imagen_url"] is not None:
                producto.imagen_url = cambios["imagen_url"].strip()
            if "stock" in cambios and cambios["stock"] is not None:
                producto.stock = cambios["stock"]
            if "disponible" in cambios and cambios["disponible"] is not None:
                producto.disponible = cambios["disponible"]

            uow.productos.add(producto)
            uow.productos.refresh(producto)
            producto_cargado = uow.productos.get_by_id_with_categoria(producto_id)
            return ProductoRead.model_validate(producto_cargado)

    def actualizar_stock(
        self, producto_id: int, data: ProductoStockUpdate
    ) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id_with_categoria(producto_id)
            if producto is None or not producto.activo:
                raise ProductoNoEncontrado("Producto no encontrado.")

            if data.stock is not None:
                producto.stock = data.stock
            if data.disponible is not None:
                producto.disponible = data.disponible

            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if producto is None or not producto.activo:
                raise ProductoNoEncontrado("Producto no encontrado.")
            producto.activo = False
            uow.productos.add(producto)
