"""Router de endpoints para autenticación: registro, login, logout y perfil."""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.database import session_factory
from app.core.deps import get_current_active_user
from app.modules.auth.schemas import LoginMessage, LogoutMessage, UserRead
from app.modules.auth.service import AuthService, CredencialesInvalidas, CuentaDesactivada
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import (
    ContrasenaIncorrecta,
    PasswordChange,
    UsuarioCreate,
    UsuarioDuplicado,
    UsuarioNoEncontrado,
    UsuarioUpdate,
)
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(tags=["auth"])


def get_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork(session_factory))


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


@router.post("/token", response_model=LoginMessage)
def login(
    response: Response,
    form: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_service),
):
    """Inicia sesión y entrega el token JWT únicamente en cookie HttpOnly."""
    try:
        token_response = service.login(form.username, form.password)
    except CuentaDesactivada as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except CredencialesInvalidas as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        )

    response.set_cookie(
        key="access_token",
        value=token_response.access_token,
        httponly=True,
        secure=settings.SECURE_COOKIES,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    return LoginMessage(message="Login exitoso")


@router.post("/logout", response_model=LogoutMessage)
def logout(response: Response):
    """Cierra sesión eliminando la cookie HttpOnly del token."""
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=settings.SECURE_COOKIES,
        samesite="lax",
    )
    return LogoutMessage(detail="Sesión cerrada")


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
        return service.update_profile(current_user.id, data)
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
        service.change_password(current_user.id, data)
    except ContrasenaIncorrecta as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )
    except UsuarioNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )
