"""Router de endpoints para el módulo de productos."""

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import require_role
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoNoEncontrado,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import ProductoService
from app.modules.usuarios.models import Usuario

router = APIRouter(tags=["productos"])


def get_service() -> ProductoService:
    return ProductoService()


@router.get("/", response_model=ProductosPaginados)
def list_productos(
    service: ProductoService = Depends(get_service),
    skip: int = 0,
    limit: int = Query(default=20, ge=1, le=100),
    search: str | None = None,
    categoria_id: int | None = None,
    disponible: bool | None = None,
):
    """Lista los productos con filtros y paginación (público)."""
    return service.list_productos(
        skip=skip, limit=limit, search=search,
        categoria_id=categoria_id, disponible=disponible,
    )


@router.get("/{producto_id}", response_model=ProductoRead)
def get_producto(
    producto_id: int,
    service: ProductoService = Depends(get_service),
):
    """Obtiene un producto por su ID."""
    try:
        return service.get_producto(producto_id)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.post("/", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def create_producto(
    data: ProductoCreate,
    service: ProductoService = Depends(get_service),
    admin_user: Usuario = Depends(require_role("admin")),
):
    """Crea un nuevo producto. Solo admin."""
    try:
        return service.create_producto(data)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.put("/{producto_id}", response_model=ProductoRead)
def update_producto(
    producto_id: int,
    data: ProductoUpdate,
    service: ProductoService = Depends(get_service),
    admin_user: Usuario = Depends(require_role("admin")),
):
    """Actualiza un producto. Solo admin."""
    try:
        return service.update_producto(producto_id, data)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.patch("/{producto_id}/stock", response_model=ProductoRead)
def update_stock(
    producto_id: int,
    data: ProductoStockUpdate,
    service: ProductoService = Depends(get_service),
    admin_user: Usuario = Depends(require_role("admin")),
):
    """Actualiza solo el stock de un producto. Solo admin."""
    try:
        return service.update_stock(producto_id, data)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_producto(
    producto_id: int,
    service: ProductoService = Depends(get_service),
    admin_user: Usuario = Depends(require_role("admin")),
):
    """Desactiva un producto (baja lógica). Solo admin."""
    try:
        service.delete_producto(producto_id)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
