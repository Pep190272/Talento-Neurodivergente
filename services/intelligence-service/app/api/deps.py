"""FastAPI dependency injection for intelligence-service."""

from __future__ import annotations

from fastapi import Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from shared.auth import TokenPayload, decode_access_token
from shared.config import JWTSettings

from app.application.use_cases.generate_report import GenerateReportUseCase
from app.config import IntelligenceServiceSettings
from app.infrastructure.database import get_session
from app.infrastructure.llm.ollama_client import OllamaClient
from app.infrastructure.persistence.report_repository import SQLAlchemyReportRepository

_jwt_settings = JWTSettings()
_app_settings = IntelligenceServiceSettings()


async def get_current_user(request: Request) -> TokenPayload:
    token = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[7:]
    if not token:
        token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = decode_access_token(token, secret=_jwt_settings.JWT_SECRET)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    if payload.is_expired:
        raise HTTPException(status_code=401, detail="Token has expired")
    return payload


async def get_report_repo(
    session: AsyncSession = Depends(get_session),
) -> SQLAlchemyReportRepository:
    return SQLAlchemyReportRepository(session)


async def get_generate_report_use_case(
    report_repo: SQLAlchemyReportRepository = Depends(get_report_repo),
) -> GenerateReportUseCase:
    llm_client = OllamaClient(
        base_url=_app_settings.ollama_url,
        default_model=_app_settings.ollama_model,
    )
    return GenerateReportUseCase(
        report_repo=report_repo,
        llm_client=llm_client,
    )
