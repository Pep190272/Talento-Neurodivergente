"""FastAPI dependency injection for matching-service."""

from __future__ import annotations

from fastapi import Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from shared.auth import TokenPayload, decode_access_token
from shared.config import JWTSettings

from app.application.use_cases.calculate_match import CalculateMatchUseCase
from app.application.use_cases.batch_match import BatchMatchForJobUseCase
from app.domain.services.trilateral_scorer import TrilateralScorer
from app.infrastructure.database import get_session
from app.infrastructure.persistence.match_repository import SQLAlchemyMatchRepository
from app.infrastructure.persistence.job_repository import SQLAlchemyJobRepository
from app.infrastructure.persistence.candidate_repository import SQLAlchemyCandidateRepository

_jwt_settings = JWTSettings()


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


async def get_match_repo(session: AsyncSession = Depends(get_session)) -> SQLAlchemyMatchRepository:
    return SQLAlchemyMatchRepository(session)


async def get_job_repo(session: AsyncSession = Depends(get_session)) -> SQLAlchemyJobRepository:
    return SQLAlchemyJobRepository(session)


async def get_candidate_repo(session: AsyncSession = Depends(get_session)) -> SQLAlchemyCandidateRepository:
    return SQLAlchemyCandidateRepository(session)


async def get_calculate_match_use_case(
    candidate_repo: SQLAlchemyCandidateRepository = Depends(get_candidate_repo),
    job_repo: SQLAlchemyJobRepository = Depends(get_job_repo),
    match_repo: SQLAlchemyMatchRepository = Depends(get_match_repo),
) -> CalculateMatchUseCase:
    return CalculateMatchUseCase(candidate_repo, job_repo, match_repo, TrilateralScorer())


async def get_batch_match_use_case(
    candidate_repo: SQLAlchemyCandidateRepository = Depends(get_candidate_repo),
    job_repo: SQLAlchemyJobRepository = Depends(get_job_repo),
    match_repo: SQLAlchemyMatchRepository = Depends(get_match_repo),
) -> BatchMatchForJobUseCase:
    return BatchMatchForJobUseCase(candidate_repo, job_repo, match_repo, TrilateralScorer())
