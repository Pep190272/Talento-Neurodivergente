"""Auth Service — FastAPI application factory."""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.api.v1.auth import router as auth_router
from app.config import settings

limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    is_prod = settings.ENV == "production"

    application = FastAPI(
        title="DiversIA Auth Service",
        description="Identity, JWT, registration, and login management",
        version="2.0.0",
        docs_url=None if is_prod else "/docs",
        redoc_url=None if is_prod else "/redoc",
    )

    application.state.limiter = limiter

    @application.exception_handler(RateLimitExceeded)
    async def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
        return JSONResponse(
            status_code=429,
            content={"detail": "Rate limit exceeded. Try again later."},
        )

    # CORS — restricted in production
    application.add_middleware(
        CORSMiddleware,
        allow_origins=[] if is_prod else ["*"],
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
