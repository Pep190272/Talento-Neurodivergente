"""Auth API routes — registration, login, and current user."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Response

from shared.auth import TokenPayload

from app.api.deps import get_current_user, get_login_use_case, get_register_use_case, get_user_repository
from app.api.schemas import (
    AuthResponse,
    ErrorResponse,
    LoginRequest,
    RegisterRequest,
    UserResponse,
)
from app.application.dto.auth_dto import LoginDTO, RegisterDTO
from app.application.use_cases.login import LoginUseCase
from app.application.use_cases.register import (
    EARLY_ADOPTER_COMPANY_LIMIT,
    EARLY_ADOPTER_THERAPIST_LIMIT,
    RegisterUseCase,
)
from app.infrastructure.persistence.user_repository import SQLAlchemyUserRepository
from app.domain.entities.user import (
    DomainError,
    DuplicateEmailError,
    InactiveUserError,
    InvalidCredentialsError,
)

router = APIRouter()


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=201,
    responses={409: {"model": ErrorResponse}},
)
async def register(
    body: RegisterRequest,
    response: Response,
    use_case: RegisterUseCase = Depends(get_register_use_case),
) -> AuthResponse:
    """Register a new user and return JWT token."""
    try:
        result = await use_case.execute(
            RegisterDTO(
                email=body.email,
                password=body.password,
                name=body.name,
                role=body.role,
            )
        )
    except DuplicateEmailError:
        raise HTTPException(status_code=409, detail="Email is already registered")
    except DomainError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Set HttpOnly cookie
    response.set_cookie(
        key="access_token",
        value=result.access_token,
        httponly=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 30,  # 30 days
    )

    return AuthResponse(
        user=UserResponse(
            id=result.user.id,
            email=result.user.email,
            role=result.user.role,
            display_name=result.user.display_name,
            status=result.user.status,
            created_at=result.user.created_at,
        ),
        access_token=result.access_token,
    )


@router.post(
    "/login",
    response_model=AuthResponse,
    responses={401: {"model": ErrorResponse}},
)
async def login(
    body: LoginRequest,
    response: Response,
    use_case: LoginUseCase = Depends(get_login_use_case),
) -> AuthResponse:
    """Authenticate with email and password, return JWT token."""
    try:
        result = await use_case.execute(
            LoginDTO(email=body.email, password=body.password)
        )
    except (InvalidCredentialsError, InactiveUserError):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    except DomainError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Set HttpOnly cookie
    response.set_cookie(
        key="access_token",
        value=result.access_token,
        httponly=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 30,
    )

    return AuthResponse(
        user=UserResponse(
            id=result.user.id,
            email=result.user.email,
            role=result.user.role,
            display_name=result.user.display_name,
            status=result.user.status,
            created_at=result.user.created_at,
        ),
        access_token=result.access_token,
    )


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: TokenPayload = Depends(get_current_user),
) -> UserResponse:
    """Get the currently authenticated user's information."""
    return UserResponse(
        id=current_user.sub,
        email=current_user.email,
        role=current_user.role,
        display_name=current_user.email,  # TODO: fetch from DB
        status="active",
        created_at=current_user.iat,
    )


@router.get("/early-adopter-slots")
async def early_adopter_slots(
    user_repo: SQLAlchemyUserRepository = Depends(get_user_repository),
) -> dict:
    """Return remaining early adopter slots for companies and therapists."""
    company_count = await user_repo.count_by_role("company")
    therapist_count = await user_repo.count_by_role("therapist")
    return {
        "company_remaining": max(0, EARLY_ADOPTER_COMPANY_LIMIT - company_count),
        "therapist_remaining": max(0, EARLY_ADOPTER_THERAPIST_LIMIT - therapist_count),
        "company_limit": EARLY_ADOPTER_COMPANY_LIMIT,
        "therapist_limit": EARLY_ADOPTER_THERAPIST_LIMIT,
    }


@router.post("/logout")
async def logout(response: Response) -> dict:
    """Clear the auth cookie."""
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}
