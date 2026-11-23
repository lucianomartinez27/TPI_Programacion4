"""Motor de base de datos, sesión de SQLModel y utilidades de base de datos."""

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, echo=False)


def create_all_tables():
    """Crea todas las tablas si no existen."""
    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    """Crea y devuelve una nueva sesión de base de datos para el Unit of Work."""
    return Session(engine)


def get_session():
    """Dependencia inyectable que devuelve una sesión de base de datos."""
    with Session(engine) as session:
        yield session
