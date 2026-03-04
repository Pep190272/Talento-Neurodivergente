"""Intelligence service FastAPI application."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.v1.intelligence import router as intelligence_router


def create_app() -> FastAPI:
    application = FastAPI(
        title="DiversIA Intelligence Service",
        version="2.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(intelligence_router)

    @application.get("/health")
    async def health() -> dict:
        return {"status": "ok", "service": "intelligence-service"}

    return application


app = create_app()
