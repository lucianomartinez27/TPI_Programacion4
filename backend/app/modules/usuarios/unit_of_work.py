"""Unit of Work para el módulo de usuarios."""

from app.core.unit_of_work import UnitOfWork as BaseUnitOfWork
from app.modules.usuarios.repository import UsuarioRepository


class UsuarioUnitOfWork(BaseUnitOfWork):
    """Unit of Work especializado para operaciones con usuarios."""

    usuarios: UsuarioRepository

    def __enter__(self) -> "UsuarioUnitOfWork":
        super().__enter__()
        self.usuarios = UsuarioRepository(self.session)
        return self
