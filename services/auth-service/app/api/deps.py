"""FastAPI dependency injection — wiring use cases with infrastructure."""

from __future__ import annotations

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from shared.auth import TokenPayload, decode_access_token
from fastapi import HTTPException, Request
from app.application.use_cases.login import LoginUseCase
from app.application.use_cases.register import RegisterUseCase
from app.config import settings
from app.infrastructure.database import get_session
from app.infrastructure.persistence.user_repository import SQLAlchemyUserRepository


async def get_user_repository(
    session: AsyncSession = Depends(get_session),
) -> SQLAlchemyUserRepository:
    return SQLAlchemyUserRepository(session)


async def get_register_use_case(
    user_repo: SQLAlchemyUserRepository = Depends(get_user_repository),
) -> RegisterUseCase:
    return RegisterUseCase(
        user_repo=user_repo,
        jwt_secret=settings.jwt.JWT_SECRET,
    )


async def get_login_use_case(
    user_repo: SQLAlchemyUserRepository = Depends(get_user_repository),
) -> LoginUseCase:
    return LoginUseCase(
        user_repo=user_repo,
        jwt_secret=settings.jwt.JWT_SECRET,
    )


async def get_current_user(request: Request) -> TokenPayload:
    """Extract and verify JWT from Authorization header or cookie."""
    token = None

    # Try Authorization header first
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[7:]

    # Fallback to cookie
    if not token:
        token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = decode_access_token(token, secret=settings.jwt.JWT_SECRET)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    if payload.is_expired:
        raise HTTPException(status_code=401, detail="Token has expired")

    return payload
