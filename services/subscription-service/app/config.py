"""Subscription service configuration."""

from pydantic_settings import BaseSettings

from shared.config import DatabaseSettings, JWTSettings


class SubscriptionServiceSettings(BaseSettings):
    """Subscription-service specific settings."""

    SERVICE_NAME: str = "subscription-service"
    SERVICE_PORT: int = 8005
    ENV: str = "development"

    # Stripe (optional — service works without it)
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # Composed settings
    db: DatabaseSettings = DatabaseSettings()
    jwt: JWTSettings = JWTSettings()

    model_config = {"env_prefix": "", "extra": "ignore"}

    @property
    def stripe_enabled(self) -> bool:
        return bool(self.STRIPE_SECRET_KEY)

    def validate_production(self) -> None:
        if self.ENV == "production":
            if not self.jwt.JWT_SECRET:
                raise ValueError("JWT_SECRET is required in production")
            if not self.db.POSTGRES_PASSWORD:
                raise ValueError("POSTGRES_PASSWORD is required in production")


settings = SubscriptionServiceSettings()
