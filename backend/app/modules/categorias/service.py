from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar_activas(self) -> list[CategoriaRead]:
        with self.uow as uow:
            categorias = uow.categorias.get_activas()
            return [CategoriaRead.model_validate(c) for c in categorias]

    def obtener_por_id(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if categoria is None or not categoria.activo:
                raise CategoriaNoEncontrada("Categoría no encontrada.")
            return CategoriaRead.model_validate(categoria)

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        nombre = data.nombre.strip()
        with self.uow as uow:
            if uow.categorias.get_by_nombre(nombre) is not None:
                raise NombreDuplicado("Ya existe una categoría con ese nombre.")
            categoria = Categoria(
                nombre=nombre,
                descripcion=data.descripcion.strip(),
                activo=True,
            )
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def actualizar(
        self, categoria_id: int, data: CategoriaUpdate
    ) -> CategoriaRead:
        cambios = data.model_dump(exclude_unset=True)
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if categoria is None or not categoria.activo:
                raise CategoriaNoEncontrada("Categoría no encontrada.")

            if "nombre" in cambios and cambios["nombre"] is not None:
                nuevo_nombre = cambios["nombre"].strip()
                existente = uow.categorias.get_by_nombre(nuevo_nombre)
                if existente is not None and existente.id != categoria.id:
                    raise NombreDuplicado(
                        "Ya existe una categoría con ese nombre."
                    )
                categoria.nombre = nuevo_nombre

            if "descripcion" in cambios and cambios["descripcion"] is not None:
                categoria.descripcion = cambios["descripcion"].strip()

            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if categoria is None or not categoria.activo:
                raise CategoriaNoEncontrada("Categoría no encontrada.")
            categoria.activo = False
            uow.categorias.add(categoria)
