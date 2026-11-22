"""Repository para la entidad Usuario."""

from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.usuarios.models import Usuario


class UsuarioRepository(BaseRepository[Usuario]):
    """Repository especializado para la entidad Usuario."""

    def __init__(self, session: Session):
        super().__init__(session, Usuario)

    def get_by_email(self, email: str) -> Usuario | None:
        """Busca un usuario por su email."""
        stmt = select(Usuario).where(Usuario.email == email)
        return self.session.exec(stmt).first()

    def get_by_username(self, username: str) -> Usuario | None:
        """Busca un usuario por su username."""
        stmt = select(Usuario).where(Usuario.username == username)
        return self.session.exec(stmt).first()

    def get_by_role(self, role: str) -> list[Usuario]:
        """Busca todos los usuarios con un rol específico."""
        stmt = select(Usuario).where(Usuario.role == role)
        return self.session.exec(stmt).all()
