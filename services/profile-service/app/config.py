"""Profile service configuration."""

from __future__ import annotations

from pydantic_settings import BaseSettings

from shared.config import DatabaseSettings, JWTSettings

# Dev fallback — used when JWT_SECRET env var is not set
DEV_JWT_SECRET = "diversia-dev-secret-change-in-production!!"


class ProfileServiceSettings(BaseSettings):
    db: DatabaseSettings = DatabaseSettings()
    jwt: JWTSettings = JWTSettings()
    service_name: str = "profile-service"
    service_port: int = 8002
    ENV: str = "development"
    AUTH_SERVICE_URL: str = "http://localhost:8001"

    @property
    def jwt_secret(self) -> str:
        """Return JWT secret, with dev fallback when not configured."""
        return self.jwt.JWT_SECRET or DEV_JWT_SECRET
