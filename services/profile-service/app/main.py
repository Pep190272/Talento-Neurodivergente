"""Profile service FastAPI application."""

from __future__ import annotations

import logging
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from starlette.exceptions import HTTPException as StarletteHTTPException

from .api.v1.messages import router as messages_router
from .api.v1.pages import router as pages_router
from .api.v1.profiles import router as profiles_router
from .config import ProfileServiceSettings

_settings = ProfileServiceSettings()
limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])
logger = logging.getLogger("profile-service")

BASE_DIR = Path(__file__).resolve().parent
_templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))


def _is_api_request(request: Request) -> bool:
    """Check if request expects JSON (API) or HTML (browser)."""
    accept = request.headers.get("accept", "")
    return (
        request.url.path.startswith("/api/")
        or "application/json" in accept
        and "text/html" not in accept
    )


def create_app() -> FastAPI:
    is_prod = _settings.ENV == "production"

    application = FastAPI(
        title="DiversIA Profile Service",
        version="2.0.0",
        docs_url=None if is_prod else "/docs",
        redoc_url=None if is_prod else "/redoc",
    )

    application.state.limiter = limiter

    # ── Error handlers ─────────────────────────────────────────

    @application.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        if _is_api_request(request):
            return JSONResponse(
                status_code=exc.status_code,
                content={"detail": exc.detail},
            )

        template_map = {401: "errors/401.html", 404: "errors/404.html", 500: "errors/500.html"}
        template = template_map.get(exc.status_code, "errors/404.html")
        return _templates.TemplateResponse(
            template,
            {"request": request},
            status_code=exc.status_code,
        )

    @application.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=422,
            content={"detail": "Datos de entrada invalidos", "errors": exc.errors()},
        )

    @application.exception_handler(RateLimitExceeded)
    async def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
        return JSONResponse(
            status_code=429,
            content={"detail": "Rate limit exceeded. Try again later."},
        )

    @application.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.error("Unhandled exception: %s", exc, exc_info=True)
        if _is_api_request(request):
            return JSONResponse(
                status_code=500,
                content={"detail": "Internal server error"},
            )
        return _templates.TemplateResponse(
            "errors/500.html",
            {"request": request},
            status_code=500,
        )

    # ── Middleware ──────────────────────────────────────────────

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

    # DDD routes — profiles, jobs, games, quiz, therapist (PostgreSQL)
    application.include_router(profiles_router)

    # Chat / messaging routes
    application.include_router(messages_router)

    # HTML page routes (Jinja2 templates)
    application.include_router(pages_router)

    @application.get("/health")
    async def health() -> dict:
        return {"status": "ok", "service": "profile-service"}

    return application


app = create_app()
