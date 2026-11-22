# Food Store Backend

Backend API REST para el sistema de pedidos de comida Food Store.

## Tecnologías

- FastAPI
- SQLModel (SQLAlchemy + Pydantic)
- SQLite (desarrollo) / PostgreSQL (producción)
- JWT con cookie HttpOnly
- Arquitectura en capas con Unit of Work y Repository

## Instalación

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

## Ejecución

```bash
uvicorn app.main:app --reload
```

La API estará disponible en `http://localhost:8000/api/v1`.

## Documentación

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
