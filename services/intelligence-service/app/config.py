"""Intelligence service configuration."""

from __future__ import annotations

from pydantic_settings import BaseSettings

from shared.config import DatabaseSettings, JWTSettings


class IntelligenceServiceSettings(BaseSettings):
    db: DatabaseSettings = DatabaseSettings()
    jwt: JWTSettings = JWTSettings()
    service_name: str = "intelligence-service"
    service_port: int = 8004
    ollama_url: str = "http://ollama:11434"
    ollama_model: str = "llama3.2"
    ENV: str = "development"
