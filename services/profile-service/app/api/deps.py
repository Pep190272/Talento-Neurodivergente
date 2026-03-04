"""FastAPI dependency injection for profile-service."""

from __future__ import annotations

from fastapi import Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from shared.auth import TokenPayload, decode_access_token
from shared.config import JWTSettings

from app.application.use_cases.create_profile import CreateProfileUseCase
from app.application.use_cases.submit_quiz import SubmitQuizUseCase
from app.application.use_cases.register_therapist import RegisterTherapistUseCase
from app.infrastructure.database import get_session
from app.infrastructure.persistence.profile_repository import SQLAlchemyProfileRepository
from app.infrastructure.persistence.assessment_repository import SQLAlchemyAssessmentRepository
from app.infrastructure.persistence.therapist_repository import SQLAlchemyTherapistRepository

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


async def get_profile_repo(
    session: AsyncSession = Depends(get_session),
) -> SQLAlchemyProfileRepository:
    return SQLAlchemyProfileRepository(session)


async def get_assessment_repo(
    session: AsyncSession = Depends(get_session),
) -> SQLAlchemyAssessmentRepository:
    return SQLAlchemyAssessmentRepository(session)


async def get_therapist_repo(
    session: AsyncSession = Depends(get_session),
) -> SQLAlchemyTherapistRepository:
    return SQLAlchemyTherapistRepository(session)


async def get_create_profile_use_case(
    profile_repo: SQLAlchemyProfileRepository = Depends(get_profile_repo),
) -> CreateProfileUseCase:
    return CreateProfileUseCase(profile_repo)


async def get_submit_quiz_use_case(
    assessment_repo: SQLAlchemyAssessmentRepository = Depends(get_assessment_repo),
    profile_repo: SQLAlchemyProfileRepository = Depends(get_profile_repo),
) -> SubmitQuizUseCase:
    return SubmitQuizUseCase(assessment_repo, profile_repo)


async def get_register_therapist_use_case(
    therapist_repo: SQLAlchemyTherapistRepository = Depends(get_therapist_repo),
) -> RegisterTherapistUseCase:
    return RegisterTherapistUseCase(therapist_repo)
