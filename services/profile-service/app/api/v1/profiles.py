"""Profile API routes."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from ..schemas import (
    AssessmentResponse,
    CreateProfileRequest,
    ProfileResponse,
    SubmitQuizRequest,
    TherapistRegisterRequest,
    TherapistResponse,
)

router = APIRouter(prefix="/api/v1/profiles", tags=["profiles"])


@router.post("/", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_profile(request: CreateProfileRequest) -> ProfileResponse:
    """Create a user profile during onboarding."""
    # TODO: Wire to CreateProfileUseCase with DI
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Profile creation endpoint — awaiting persistence layer",
    )


@router.get("/me", response_model=ProfileResponse)
async def get_my_profile() -> ProfileResponse:
    """Get current user's profile."""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Get profile endpoint — awaiting persistence layer",
    )


@router.post("/quiz", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
async def submit_quiz(request: SubmitQuizRequest) -> AssessmentResponse:
    """Submit neurocognitive quiz answers and calculate neuro-vector."""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Quiz submission endpoint — awaiting persistence layer",
    )


@router.post("/therapist", response_model=TherapistResponse, status_code=status.HTTP_201_CREATED)
async def register_therapist(request: TherapistRegisterRequest) -> TherapistResponse:
    """Register therapist professional profile (requires admin verification)."""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Therapist registration endpoint — awaiting persistence layer",
    )
