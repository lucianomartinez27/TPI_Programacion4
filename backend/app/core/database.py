"""Motor de base de datos, sesión de SQLModel y utilidades de base de datos."""

from sqlalchemy import event
from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, echo=False)

if settings.DATABASE_URL.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def _set_sqlite_pragma(dbapi_connection, _connection_record):
        """Habilita la integridad referencial de claves foráneas en SQLite."""
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


def create_all_tables():
    """Crea todas las tablas si no existen."""
    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    """Crea y devuelve una nueva sesión de base de datos para el Unit of Work."""
    return Session(engine, expire_on_commit=False)


def get_session():
    """Dependencia inyectable que devuelve una sesión de base de datos."""
    with Session(engine, expire_on_commit=False) as session:
        yield session
