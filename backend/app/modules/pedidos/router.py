"""Router de endpoints para el módulo de pedidos."""

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.enums import EstadoPedido
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoAjeno,
    PedidoCreate,
    PedidoNoEncontrado,
    PedidoRead,
    PedidosPaginados,
    ProductoNoDisponible,
    ProductoRepetido,
    ResumenPedidos,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.pedidos.service import PedidoService
from app.modules.usuarios.models import Usuario

router = APIRouter(tags=["pedidos"])


def get_service() -> PedidoService:
    return PedidoService()


@router.post("/", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def create_pedido(
    data: PedidoCreate,
    service: PedidoService = Depends(get_service),
    current_user: Usuario = Depends(get_current_active_user),
):
    """Crea un nuevo pedido. Cualquier usuario autenticado."""
    try:
        return service.create_pedido(data, current_user.id)
    except ProductoRepetido as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except ProductoNoDisponible as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except StockInsuficiente as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except PedidoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.get("/", response_model=PedidosPaginados)
def list_pedidos(
    service: PedidoService = Depends(get_service),
    current_user: Usuario = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = Query(default=20, ge=1, le=100),
    estado: EstadoPedido | None = None,
):
    """
    Lista pedidos: propios si es user, todos si es admin.
    Soporta filtro por estado y paginación.
    """
    return service.list_pedidos(
        current_user.id, current_user.role,
        skip=skip, limit=limit, estado=estado,
    )


@router.get("/resumen", response_model=ResumenPedidos)
def get_resumen(
    service: PedidoService = Depends(get_service),
    admin_user: Usuario = Depends(require_role("admin")),
):
    """Resumen de pedidos para el panel de administración. Solo admin."""
    return service.get_resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def get_pedido(
    pedido_id: int,
    service: PedidoService = Depends(get_service),
    current_user: Usuario = Depends(get_current_active_user),
):
    """Obtiene un pedido por su ID. El usuario solo ve los suyos; admin ve todos."""
    try:
        pedido = service.get_pedido(pedido_id)
    except PedidoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))

    if current_user.role != "admin" and pedido.usuario_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso")

    return pedido


@router.get("/admin/{pedido_id}", response_model=PedidoRead)
def get_pedido_admin(
    pedido_id: int,
    service: PedidoService = Depends(get_service),
    admin_user: Usuario = Depends(require_role("admin")),
):
    """Obtiene el detalle de un pedido específico. Solo admin."""
    try:
        return service.get_pedido(pedido_id)
    except PedidoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(
    pedido_id: int,
    service: PedidoService = Depends(get_service),
    current_user: Usuario = Depends(get_current_active_user),
):
    """Cancela un pedido propio en estado PENDIENTE. Solo el dueño."""
    try:
        return service.cancelar_pedido(pedido_id, current_user.id)
    except PedidoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except PedidoAjeno as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))
    except TransicionInvalida as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def update_estado(
    pedido_id: int,
    data: CambioEstado,
    service: PedidoService = Depends(get_service),
    admin_user: Usuario = Depends(require_role("admin")),
):
    """Cambia el estado de un pedido. Solo admin."""
    try:
        return service.update_estado_admin(pedido_id, data)
    except PedidoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except TransicionInvalida as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
