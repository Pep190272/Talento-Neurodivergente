"""Auth Service — FastAPI application factory."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.auth import router as auth_router
from app.config import settings


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    application = FastAPI(
        title="DiversIA Auth Service",
        description="Identity, JWT, registration, and login management",
        version="2.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"] if settings.ENV != "production" else [],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routes
    application.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])

    @application.get("/health")
    async def health_check() -> dict:
        return {"status": "ok", "service": settings.SERVICE_NAME, "version": "2.0.0"}

    return application


app = create_app()
