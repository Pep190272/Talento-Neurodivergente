"""Auth service configuration — fails fast if critical vars are missing in production."""

from pydantic_settings import BaseSettings

from shared.config import DatabaseSettings, JWTSettings


class AuthServiceSettings(BaseSettings):
    """Auth-service specific settings."""

    SERVICE_NAME: str = "auth-service"
    SERVICE_PORT: int = 8001
    ENV: str = "development"

    # Composed settings
    db: DatabaseSettings = DatabaseSettings()
    jwt: JWTSettings = JWTSettings()

    model_config = {"env_prefix": "", "extra": "ignore"}

    def validate_production(self) -> None:
        """Fail fast if critical variables are missing in production."""
        if self.ENV == "production":
            if not self.jwt.JWT_SECRET:
                raise ValueError("JWT_SECRET is required in production")
            if not self.db.POSTGRES_PASSWORD:
                raise ValueError("POSTGRES_PASSWORD is required in production")


settings = AuthServiceSettings()
