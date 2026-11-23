"""Configuración de la aplicación leída desde variables de entorno (.env)."""

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Agrupación de todas las variables de configuración del backend."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Base de datos (PostgreSQL en producción; SQLite aceptado en desarrollo local)
    DATABASE_URL: str = "sqlite:///./food_store.db"

    # JWT (obligatoria en entorno, mínimo 32 caracteres — fail-fast)
    SECRET_KEY: str = Field(min_length=32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    # Cookies (activar en producción sobre HTTPS)
    SECURE_COOKIES: bool = False


settings = Settings()
