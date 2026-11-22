"""Router de endpoints para el módulo de usuarios (admin)."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.core.database import get_session
from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import (
    UsuarioDuplicado,
    UsuarioListRead,
    UsuarioNoEncontrado,
)
from app.modules.usuarios.service import UsuarioService

router = APIRouter(tags=["usuarios"])


def get_service(session: Session = Depends(get_session)) -> UsuarioService:
    return UsuarioService(session)


@router.get("/", response_model=list[UsuarioListRead])
def list_users(
    service: UsuarioService = Depends(get_service),
    admin_user: Usuario = Depends(require_role("admin")),
    skip: int = 0,
    limit: int = 100,
):
    """Lista todos los usuarios. Solo admin."""
    return service.list_users(skip=skip, limit=limit)


@router.post("/{user_id}/activar", response_model=UsuarioListRead)
def activate_user(
    user_id: int,
    service: UsuarioService = Depends(get_service),
    admin_user: Usuario = Depends(require_role("admin")),
):
    """Activa un usuario. Solo admin."""
    try:
        return service.activate_user(user_id)
    except UsuarioNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


@router.post("/{user_id}/desactivar", response_model=UsuarioListRead)
def deactivate_user(
    user_id: int,
    service: UsuarioService = Depends(get_service),
    admin_user: Usuario = Depends(require_role("admin")),
):
    """Desactiva un usuario. Solo admin. No puede desactivarse a sí mismo."""
    try:
        return service.deactivate_user(user_id, admin_user.id)
    except UsuarioNoEncontrado as exc:
        if "ti mismo" in str(exc) or "último administrador" in str(exc):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(exc),
            )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )
