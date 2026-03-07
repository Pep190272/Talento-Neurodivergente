"""Base configuration shared across all services. Uses Pydantic Settings for validation."""

from pydantic_settings import BaseSettings


class DatabaseSettings(BaseSettings):
    """Database connection settings — shared by all services that use PostgreSQL."""

    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "diversia"
    POSTGRES_PASSWORD: str = ""
    POSTGRES_DB: str = "diversia"

    @property
    def async_url(self) -> str:
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def sync_url(self) -> str:
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    model_config = {"env_prefix": "", "extra": "ignore"}


class JWTSettings(BaseSettings):
    """JWT configuration — shared by all services for token verification."""

    JWT_SECRET: str = ""
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 43200  # 30 days

    model_config = {"env_prefix": "", "extra": "ignore"}


class ServiceURLSettings(BaseSettings):
    """URLs for inter-service communication."""

    AUTH_SERVICE_URL: str = "http://auth-service:8001"
    PROFILE_SERVICE_URL: str = "http://profile-service:8002"
    MATCHING_SERVICE_URL: str = "http://matching-service:8003"
    INTELLIGENCE_SERVICE_URL: str = "http://intelligence-service:8004"

    model_config = {"env_prefix": "", "extra": "ignore"}
