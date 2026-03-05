"""Intelligence service FastAPI application."""

from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from .api.v1.intelligence import router as intelligence_router
from .config import IntelligenceServiceSettings

_settings = IntelligenceServiceSettings()
limiter = Limiter(key_func=get_remote_address, default_limits=["30/minute"])


def create_app() -> FastAPI:
    is_prod = _settings.ENV == "production"

    application = FastAPI(
        title="DiversIA Intelligence Service",
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
        allow_methods=["GET", "POST"],
        allow_headers=["Authorization", "Content-Type"],
    )

    application.include_router(intelligence_router)

    @application.get("/health")
    async def health() -> dict:
        return {"status": "ok", "service": "intelligence-service"}

    return application


app = create_app()
