"""Profile service FastAPI application."""

from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from .api.v1.auth_proxy import router as auth_proxy_router
from .api.v1.pages import router as pages_router
from .config import ProfileServiceSettings

_settings = ProfileServiceSettings()
limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

BASE_DIR = Path(__file__).resolve().parent


def create_app() -> FastAPI:
    is_prod = _settings.ENV == "production"

    application = FastAPI(
        title="DiversIA Profile Service",
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

    application.add_middleware(
        CORSMiddleware,
        allow_origins=[] if is_prod else ["*"],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["Authorization", "Content-Type"],
    )

    # Static files (CSS, JS, images)
    static_dir = BASE_DIR / "static"
    if static_dir.exists():
        application.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

    # Auth proxy (forwards to auth-service — works without DB)
    application.include_router(auth_proxy_router)

    # API routes (require PostgreSQL + asyncpg — graceful skip if unavailable)
    try:
        from .api.v1.profiles import router as profiles_router
        application.include_router(profiles_router)
    except Exception:
        pass  # DB not configured — API routes disabled, HTML pages still work

    # HTML page routes (always available, no DB needed)
    application.include_router(pages_router)

    @application.get("/health")
    async def health() -> dict:
        return {"status": "ok", "service": "profile-service"}

    return application


app = create_app()
