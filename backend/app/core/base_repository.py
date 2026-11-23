"""Repository genérico base para operaciones CRUD con SQLModel."""

from typing import Generic, Sequence, TypeVar

from pydantic import BaseModel
from sqlmodel import Session, SQLModel, func, select

ModelType = TypeVar("ModelType", bound=SQLModel)


class BaseRepository(Generic[ModelType]):
    """Repository base con las operaciones CRUD más comunes."""

    def __init__(self, session: Session, model: type[ModelType]):
        self.session = session
        self.model = model

    def create(self, data: ModelType | SQLModel | BaseModel | dict) -> ModelType:
        """Crea una entidad a partir de un esquema de entrada o modelo y ejecuta flush."""
        obj = data if isinstance(data, self.model) else self.model.model_validate(data)
        self.session.add(obj)
        self.session.flush()
        self.session.refresh(obj)
        return obj

    def get_by_id(self, id: int) -> ModelType | None:
        """Obtiene una entidad por su ID."""
        return self.session.get(self.model, id)

    def get_all(self, skip: int = 0, limit: int = 100) -> Sequence[ModelType]:
        """Lista todas las entidades con orden determinista y paginación."""
        stmt = select(self.model)
        id_col = getattr(self.model, "id", None)
        if id_col is not None:
            stmt = stmt.order_by(id_col)
        stmt = stmt.offset(skip).limit(limit)
        return self.session.exec(stmt).all()

    def add(self, obj: ModelType) -> ModelType:
        """Agrega una nueva entidad a la sesión y ejecuta flush."""
        self.session.add(obj)
        self.session.flush()
        self.session.refresh(obj)
        return obj

    def save(self, obj: ModelType) -> ModelType:
        """Guarda los cambios de una entidad en la sesión y ejecuta flush."""
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

    def delete(self, obj: ModelType) -> None:
        """Elimina una entidad de la sesión."""
        self.session.delete(obj)
        self.session.flush()

    def hard_delete(self, id: int) -> bool:
        """Elimina una entidad por su ID (baja física).

        Preferir baja lógica (marcar activo=False) en lugar de este método.
        """
        obj = self.get_by_id(id)
        if obj is None:
            return False
        self.delete(obj)
        return True

    def count(self) -> int:
        """Devuelve la cantidad total de entidades usando COUNT en base de datos."""
        stmt = select(func.count()).select_from(self.model)
        return self.session.exec(stmt).one()
