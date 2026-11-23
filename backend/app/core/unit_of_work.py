"""Unit of Work base que gestiona transacciones con el patrón context manager."""

from collections.abc import Callable
from sqlmodel import Session

from app.core.database import session_factory as default_session_factory


class UnitOfWork:
    """
    Unit of Work base que abre una sesión en __enter__ y gestiona
    commit, rollback y close en __exit__.
    """

    def __init__(self, session_factory: Callable[[], Session] = default_session_factory):
        self.session_factory = session_factory
        self.session: Session | None = None

    def __enter__(self) -> "UnitOfWork":
        self.session = self.session_factory()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        try:
            if exc_type:
                self.session.rollback()
            else:
                self.session.commit()
        finally:
            self.session.close()
            self.session = None
