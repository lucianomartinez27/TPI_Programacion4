from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioNoEncontrado(Exception):
    pass


class UsuarioDuplicado(Exception):
    pass


class AutoDesactivacionNoPermitida(Exception):
    pass


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar_usuarios(self) -> list[UserPublic]:
        with self.uow as uow:
            usuarios = uow.usuarios.get_all()
            return [UserPublic.model_validate(u) for u in usuarios]

    def activar_usuario(self, user_id: int) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(user_id)
            if usuario is None:
                raise UsuarioNoEncontrado("Usuario no encontrado.")
            usuario.disabled = False
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def desactivar_usuario(self, user_id: int, admin_id: int) -> UserPublic:
        if user_id == admin_id:
            raise AutoDesactivacionNoPermitida(
                "Un administrador no puede desactivarse a sí mismo."
            )
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(user_id)
            if usuario is None:
                raise UsuarioNoEncontrado("Usuario no encontrado.")
            usuario.disabled = True
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)
