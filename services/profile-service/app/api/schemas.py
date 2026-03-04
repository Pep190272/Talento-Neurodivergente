"""Pydantic schemas for profile API requests/responses."""

from __future__ import annotations

from pydantic import BaseModel, Field


class CreateProfileRequest(BaseModel):
    role: str = Field(..., pattern="^(candidate|company|therapist)$")
    display_name: str = ""
    bio: str = ""


class ProfileResponse(BaseModel):
    profile_id: str
    user_id: str
    role: str
    display_name: str
    bio: str
    status: str
    has_neuro_vector: bool
    onboarding_completed: bool


class QuizAnswerRequest(BaseModel):
    question_id: str
    dimension: str
    value: float = Field(..., ge=0.0, le=1.0)


class SubmitQuizRequest(BaseModel):
    answers: list[QuizAnswerRequest] = Field(..., min_length=1)


class AssessmentResponse(BaseModel):
    assessment_id: str
    user_id: str
    status: str
    is_flagged: bool
    vector_dimensions: dict[str, float] | None = None


class TherapistRegisterRequest(BaseModel):
    specialty: str
    bio: str = ""
    support_areas: list[str] = Field(default_factory=list)
    license_number: str = ""


class TherapistResponse(BaseModel):
    profile_id: str
    user_id: str
    specialty: str
    bio: str
    support_areas: list[str]
    verification_status: str


class ErrorResponse(BaseModel):
    detail: str
