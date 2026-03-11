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
    STRIPE_PUBLISHABLE_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # Email (SMTP for coupon delivery)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "no-reply@diversia.click"
    SMTP_FROM_NAME: str = "DiversIA"

    # Early adopter coupons
    EARLY_ADOPTER_COMPANY_LIMIT: int = 25
    EARLY_ADOPTER_THERAPIST_LIMIT: int = 25
    EARLY_ADOPTER_FREE_MONTHS: int = 3

    # Composed settings
    db: DatabaseSettings = DatabaseSettings()
    jwt: JWTSettings = JWTSettings()

    model_config = {"env_prefix": "", "extra": "ignore"}

    @property
    def stripe_enabled(self) -> bool:
        return bool(self.STRIPE_SECRET_KEY)

    @property
    def email_enabled(self) -> bool:
        return bool(self.SMTP_USER and self.SMTP_PASSWORD)

    def validate_production(self) -> None:
        if self.ENV == "production":
            if not self.jwt.JWT_SECRET:
                raise ValueError("JWT_SECRET is required in production")
            if not self.db.POSTGRES_PASSWORD:
                raise ValueError("POSTGRES_PASSWORD is required in production")
            if not self.STRIPE_SECRET_KEY:
                raise ValueError("STRIPE_SECRET_KEY is required in production")
            if not self.SMTP_USER:
                raise ValueError("SMTP_USER is required in production")


settings = SubscriptionServiceSettings()
