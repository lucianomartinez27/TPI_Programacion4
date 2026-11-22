"""Configuración de la aplicación leída desde variables de entorno (.env)."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Agrupación de todas las variables de configuración del backend."""

    # Base de datos
    DATABASE_URL: str = "sqlite:///./food_store.db"

    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    # Cookies
    SECURE_COOKIES: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
