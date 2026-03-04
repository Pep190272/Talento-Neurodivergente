"""Matching service configuration."""

from __future__ import annotations

from pydantic_settings import BaseSettings

from shared.config import DatabaseSettings, JWTSettings


class MatchingServiceSettings(BaseSettings):
    db: DatabaseSettings = DatabaseSettings()
    jwt: JWTSettings = JWTSettings()
    service_name: str = "matching-service"
    service_port: int = 8003
    ENV: str = "development"
