"""Profile API routes — wired to use cases via DI."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from shared.auth import TokenPayload

from ..deps import (
    get_create_profile_use_case,
    get_current_user,
    get_profile_repo,
    get_register_therapist_use_case,
    get_submit_quiz_use_case,
)
from ..schemas import (
    AssessmentResponse,
    CreateProfileRequest,
    ProfileResponse,
    SubmitQuizRequest,
    TherapistRegisterRequest,
    TherapistResponse,
)
from app.application.dto.profile_dto import (
    CreateProfileDTO,
    QuizAnswerDTO,
    SubmitQuizDTO,
    TherapistProfileDTO,
)
from app.application.use_cases.create_profile import CreateProfileUseCase, DuplicateProfileError
from app.application.use_cases.submit_quiz import SubmitQuizUseCase
from app.application.use_cases.register_therapist import (
    RegisterTherapistUseCase,
    TherapistAlreadyRegisteredError,
)
from app.domain.entities.profile import ProfileError, ProfileNotFoundError
from app.infrastructure.persistence.profile_repository import SQLAlchemyProfileRepository

router = APIRouter(prefix="/api/v1/profiles", tags=["profiles"])


@router.post("/", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_profile(
    body: CreateProfileRequest,
    current_user: TokenPayload = Depends(get_current_user),
    use_case: CreateProfileUseCase = Depends(get_create_profile_use_case),
) -> ProfileResponse:
    """Create a user profile during onboarding."""
    try:
        result = await use_case.execute(
            CreateProfileDTO(
                user_id=current_user.sub,
                role=body.role,
                display_name=body.display_name,
                bio=body.bio,
            )
        )
    except DuplicateProfileError:
        raise HTTPException(status_code=409, detail="Profile already exists")
    except ProfileError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return ProfileResponse(**result.__dict__)


@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(
    current_user: TokenPayload = Depends(get_current_user),
    profile_repo: SQLAlchemyProfileRepository = Depends(get_profile_repo),
) -> ProfileResponse:
    """Get current user's profile."""
    profile = await profile_repo.find_by_user_id(current_user.sub)
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")

    return ProfileResponse(
        profile_id=profile.id,
        user_id=profile.user_id,
        role=profile.role.value,
        display_name=profile.display_name,
        bio=profile.bio,
        status=profile.status.value,
        has_neuro_vector=profile.is_assessment_complete(),
        onboarding_completed=profile.onboarding_completed,
    )


@router.post("/quiz", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
async def submit_quiz(
    body: SubmitQuizRequest,
    current_user: TokenPayload = Depends(get_current_user),
    use_case: SubmitQuizUseCase = Depends(get_submit_quiz_use_case),
) -> AssessmentResponse:
    """Submit neurocognitive quiz answers and calculate neuro-vector."""
    try:
        result = await use_case.execute(
            SubmitQuizDTO(
                user_id=current_user.sub,
                answers=[
                    QuizAnswerDTO(
                        question_id=a.question_id,
                        dimension=a.dimension,
                        value=a.value,
                    )
                    for a in body.answers
                ],
            )
        )
    except ProfileNotFoundError:
        raise HTTPException(status_code=404, detail="Profile not found — complete onboarding first")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return AssessmentResponse(**result.__dict__)


@router.post("/therapist", response_model=TherapistResponse, status_code=status.HTTP_201_CREATED)
async def register_therapist(
    body: TherapistRegisterRequest,
    current_user: TokenPayload = Depends(get_current_user),
    use_case: RegisterTherapistUseCase = Depends(get_register_therapist_use_case),
) -> TherapistResponse:
    """Register therapist professional profile (requires admin verification)."""
    try:
        result = await use_case.execute(
            TherapistProfileDTO(
                user_id=current_user.sub,
                specialty=body.specialty,
                bio=body.bio,
                support_areas=body.support_areas,
                license_number=body.license_number,
            )
        )
    except TherapistAlreadyRegisteredError:
        raise HTTPException(status_code=409, detail="Therapist profile already registered")

    return TherapistResponse(**result.__dict__)
