"""Repository genérico base para operaciones CRUD con SQLModel."""

from typing import Generic, TypeVar, Sequence

from sqlmodel import Session, SQLModel, select

ModelType = TypeVar("ModelType", bound=SQLModel)


class BaseRepository(Generic[ModelType]):
    """Repository base con las operaciones CRUD más comunes."""

    def __init__(self, session: Session, model: type[ModelType]):
        self.session = session
        self.model = model

    def get_by_id(self, id: int) -> ModelType | None:
        """Obtiene una entidad por su ID."""
        return self.session.get(self.model, id)

    def get_all(self, skip: int = 0, limit: int = 100) -> Sequence[ModelType]:
        """Lista todas las entidades con paginación."""
        stmt = select(self.model).offset(skip).limit(limit)
        return self.session.exec(stmt).all()

    def add(self, obj: ModelType) -> ModelType:
        """Crea una nueva entidad."""
        self.session.add(obj)
        self.session.flush()
        self.session.refresh(obj)
        return obj

    def update(self, id: int, data: dict) -> ModelType | None:
        """Actualiza una entidad por su ID."""
        obj = self.get_by_id(id)
        if obj is None:
            return None
        obj.sqlmodel_update(data)
        self.session.add(obj)
        self.session.flush()
        self.session.refresh(obj)
        return obj

    def delete(self, id: int) -> bool:
        """Elimina una entidad por su ID (baja física)."""
        obj = self.get_by_id(id)
        if obj is None:
            return False
        self.session.delete(obj)
        self.session.flush()
        return True

    def count(self) -> int:
        """Devuelve la cantidad total de entidades."""
        stmt = select(self.model)
        return len(self.session.exec(stmt).all())
