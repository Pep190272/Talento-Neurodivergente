"""Profile service configuration."""

from __future__ import annotations

from pydantic_settings import BaseSettings

from shared.config import DatabaseSettings, JWTSettings


class ProfileServiceSettings(BaseSettings):
    db: DatabaseSettings = DatabaseSettings()
    jwt: JWTSettings = JWTSettings()
    service_name: str = "profile-service"
    service_port: int = 8002
