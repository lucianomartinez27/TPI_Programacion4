"""Punto de entrada de la aplicación FastAPI."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.seed import seed
from app.modules.auth.router import router as auth_router
from app.modules.usuarios.router import router as usuarios_router
from app.modules.categorias.router import router as categorias_router
from app.modules.productos.router import router as productos_router
from app.modules.pedidos.router import router as pedidos_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Crea las tablas y carga los datos iniciales al arrancar."""
    seed()
    yield


app = FastAPI(
    title="Food Store API",
    description="API REST para el sistema de pedidos de comida Food Store",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS con credenciales
origins = [origin.strip() for origin in settings.FRONTEND_ORIGIN.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    """Endpoint de salud para verificar que el servicio está activo."""
    return {"status": "ok"}


# Rutas con prefijo /api/v1
app.include_router(auth_router, prefix="/api/v1/auth")
app.include_router(usuarios_router, prefix="/api/v1/usuarios")
app.include_router(categorias_router, prefix="/api/v1/categorias")
app.include_router(productos_router, prefix="/api/v1/productos")
app.include_router(pedidos_router, prefix="/api/v1/pedidos")
