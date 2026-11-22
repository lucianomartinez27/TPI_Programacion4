"""Unit of Work base que gestiona transacciones con el patrón context manager."""

from contextlib import contextmanager
from sqlmodel import Session

from app.core.database import engine


class UnitOfWork:
    """
    Unit of Work base que abre una sesión en __enter__ y gestiona
    commit, rollback y close en __exit__.
    """

    def __init__(self):
        self.session: Session | None = None

    def __enter__(self) -> "UnitOfWork":
        self.session = Session(engine)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            self.session.rollback()
        else:
            self.session.commit()
        self.session.close()
        self.session = None
        return False
