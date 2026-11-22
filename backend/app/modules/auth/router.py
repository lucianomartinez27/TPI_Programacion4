"""Router de endpoints para autenticación: registro, login, logout y perfil."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session

from app.core.config import settings
from app.core.database import get_session
from app.core.deps import get_current_active_user
from app.modules.auth.schemas import TokenResponse, UserRead
from app.modules.auth.service import AuthService
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import (
    PasswordChange,
    UsuarioCreate,
    UsuarioDuplicado,
    UsuarioNoEncontrado,
    UsuarioUpdate,
)

router = APIRouter(tags=["auth"])


def get_service(session: Session = Depends(get_session)) -> AuthService:
    return AuthService(session)


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(user_in: UsuarioCreate, service: AuthService = Depends(get_service)):
    """Registro público de un nuevo usuario con rol 'user'."""
    try:
        return service.register(user_in)
    except UsuarioDuplicado as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )


@router.post("/token", response_model=TokenResponse)
def login(
    form: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_service),
):
    """Inicia sesión y devuelve el token JWT en cookie HttpOnly."""
    try:
        token_response = service.login(form.username, form.password)
    except ValueError as exc:
        if "desactivada" in str(exc):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
        )

    response = JSONResponse(content={"message": "Login exitoso"})
    response.set_cookie(
        key="access_token",
        value=token_response.access_token,
        httponly=True,
        secure=settings.SECURE_COOKIES,
        samesite="lax",
        max_age=60 * 30,
    )
    return response


@router.post("/logout")
def logout():
    """Cierra sesión eliminando la cookie del token."""
    response = JSONResponse(content={"detail": "Sesión cerrada"})
    response.delete_cookie(key="access_token")
    return response


@router.get("/me", response_model=UserRead)
def get_profile(
    current_user: Usuario = Depends(get_current_active_user),
    service: AuthService = Depends(get_service),
):
    """Devuelve el perfil del usuario autenticado."""
    return service.get_current_user_profile(current_user)


@router.put("/me", response_model=UserRead)
def update_profile(
    data: UsuarioUpdate,
    current_user: Usuario = Depends(get_current_active_user),
    service: AuthService = Depends(get_service),
):
    """Actualiza el perfil del usuario autenticado."""
    try:
        return service.usuario_service.update_profile(current_user.id, data)
    except UsuarioDuplicado as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )
    except UsuarioNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


@router.post("/me/password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    data: PasswordChange,
    current_user: Usuario = Depends(get_current_active_user),
    service: AuthService = Depends(get_service),
):
    """Cambia la contraseña del usuario autenticado."""
    try:
        service.usuario_service.change_password(current_user.id, data)
    except UsuarioNoEncontrado as exc:
        if "incorrecta" in str(exc):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(exc),
            )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )
