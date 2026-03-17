"""Auth Service — FastAPI application factory."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

import bcrypt
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.api.v1.auth import router as auth_router
from app.config import settings

logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

# Superadmin credentials
SUPERADMIN_EMAIL = "diversiaeternals@gmail.com"
SUPERADMIN_PASSWORD = "d1v3rs14Eternal$"
SUPERADMIN_DISPLAY_NAME = "Super Admin DiversIA"


async def ensure_auth_tables() -> None:
    """Create auth tables if they don't exist (safety net for Alembic failures)."""
    from app.infrastructure.database import engine
    from app.infrastructure.persistence.models import Base
    from sqlalchemy import text

    async with engine.begin() as conn:
        await conn.execute(text("CREATE SCHEMA IF NOT EXISTS auth"))
        await conn.execute(text("""
            DO $$ BEGIN
                CREATE TYPE auth.user_role AS ENUM ('candidate', 'company', 'therapist', 'admin');
            EXCEPTION WHEN duplicate_object THEN NULL;
            END $$
        """))
        await conn.execute(text("""
            DO $$ BEGIN
                CREATE TYPE auth.user_status AS ENUM ('active', 'inactive', 'deleted');
            EXCEPTION WHEN duplicate_object THEN NULL;
            END $$
        """))
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Auth tables verified/created")


async def seed_superadmin() -> None:
    """Ensure the superadmin user exists in auth.users on startup."""
    from app.infrastructure.database import async_session_factory
    from app.infrastructure.persistence.models import UserModel
    from sqlalchemy import select

    # Ensure tables exist before seeding
    try:
        await ensure_auth_tables()
    except Exception:
        logger.exception("Failed to ensure auth tables — cannot seed superadmin")
        return

    async with async_session_factory() as session:
        try:
            result = await session.execute(
                select(UserModel).where(UserModel.email == SUPERADMIN_EMAIL)
            )
            existing = result.scalar_one_or_none()

            password_hash = bcrypt.hashpw(
                SUPERADMIN_PASSWORD.encode("utf-8"),
                bcrypt.gensalt(rounds=12),
            ).decode("utf-8")

            if existing:
                # Update password hash to ensure it's always correct
                existing.password_hash = password_hash
                existing.status = "active"
                existing.role = "admin"
                existing.display_name = SUPERADMIN_DISPLAY_NAME
                logger.info("Superadmin updated: %s", SUPERADMIN_EMAIL)
            else:
                from shared.domain import BaseEntity
                new_id = BaseEntity().id  # generates a cuid
                model = UserModel(
                    id=new_id,
                    email=SUPERADMIN_EMAIL,
                    password_hash=password_hash,
                    role="admin",
                    status="active",
                    display_name=SUPERADMIN_DISPLAY_NAME,
                )
                session.add(model)
                logger.info("Superadmin created: %s -> %s", SUPERADMIN_EMAIL, new_id)

            await session.commit()
            logger.info("Superadmin seed committed successfully")
        except Exception:
            await session.rollback()
            logger.exception("Failed to seed superadmin")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown lifecycle for the auth service."""
    await seed_superadmin()
    yield


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    is_prod = settings.ENV == "production"

    application = FastAPI(
        title="DiversIA Auth Service",
        description="Identity, JWT, registration, and login management",
        version="2.0.0",
        docs_url=None if is_prod else "/docs",
        redoc_url=None if is_prod else "/redoc",
        lifespan=lifespan,
    )

    application.state.limiter = limiter

    @application.exception_handler(RateLimitExceeded)
    async def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
        return JSONResponse(
            status_code=429,
            content={"detail": "Rate limit exceeded. Try again later."},
        )

    # CORS — restricted to known origins in production, open in development
    allowed_origins = (
        [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]
        if is_prod
        else ["*"]
    )
    application.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["Authorization", "Content-Type"],
    )

    # Routes
    application.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])

    @application.get("/health")
    async def health_check() -> dict:
        return {"status": "ok", "service": settings.SERVICE_NAME, "version": "2.0.0"}

    return application


app = create_app()
