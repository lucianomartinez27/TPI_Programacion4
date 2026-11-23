"""Router de endpoints para el módulo de categorías."""

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.database import session_factory
from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaNoEncontrada,
    CategoriaRead,
    CategoriaUpdate,
    NombreDuplicado,
)
from app.modules.categorias.service import CategoriaService
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork

router = APIRouter(tags=["categorias"])


def get_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork(session_factory))


@router.get("/", response_model=list[CategoriaRead])
def list_categorias(
    service: CategoriaService = Depends(get_service),
    skip: int = 0,
    limit: int = 100,
):
    """Lista las categorías activas (público)."""
    return service.list_categorias_activas(skip=skip, limit=limit)


@router.get("/admin", response_model=list[CategoriaRead])
def list_all_categorias(
    service: CategoriaService = Depends(get_service),
    admin_user: Usuario = Depends(require_role("admin")),
    skip: int = 0,
    limit: int = 100,
):
    """Lista todas las categorías (incluidas las inactivas). Solo admin."""
    return service.list_categorias(skip=skip, limit=limit)


@router.get("/{categoria_id}", response_model=CategoriaRead)
def get_categoria(
    categoria_id: int,
    service: CategoriaService = Depends(get_service),
):
    """Obtiene una categoría por su ID."""
    try:
        return service.get_categoria(categoria_id)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.post("/", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def create_categoria(
    data: CategoriaCreate,
    service: CategoriaService = Depends(get_service),
    admin_user: Usuario = Depends(require_role("admin")),
):
    """Crea una nueva categoría. Solo admin."""
    try:
        return service.create_categoria(data)
    except NombreDuplicado as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))


@router.put("/{categoria_id}", response_model=CategoriaRead)
def update_categoria(
    categoria_id: int,
    data: CategoriaUpdate,
    service: CategoriaService = Depends(get_service),
    admin_user: Usuario = Depends(require_role("admin")),
):
    """Actualiza una categoría. Solo admin."""
    try:
        return service.update_categoria(categoria_id, data)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except NombreDuplicado as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_categoria(
    categoria_id: int,
    service: CategoriaService = Depends(get_service),
    admin_user: Usuario = Depends(require_role("admin")),
):
    """Desactiva una categoría (baja lógica). Solo admin."""
    try:
        service.delete_categoria(categoria_id)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
