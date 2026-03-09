"""Pydantic schemas for profile API requests/responses."""

from __future__ import annotations

from pydantic import BaseModel, Field


class CreateProfileRequest(BaseModel):
    role: str = Field(..., pattern="^(candidate|company|therapist)$")
    display_name: str = Field("", max_length=255)
    bio: str = Field("", max_length=5000)


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
    question_id: str = Field(..., min_length=1, max_length=100)
    dimension: str = Field(..., min_length=1, max_length=50)
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
    specialty: str = Field(..., min_length=2, max_length=255)
    bio: str = Field("", max_length=5000)
    support_areas: list[str] = Field(default_factory=list, max_length=20)
    license_number: str = Field("", max_length=100)


class TherapistResponse(BaseModel):
    profile_id: str
    user_id: str
    specialty: str
    bio: str
    support_areas: list[str]
    verification_status: str


class QuizQuestionResponse(BaseModel):
    question_id: str
    dimension: str
    category: str
    text_es: str
    text_en: str


class QuizQuestionsListResponse(BaseModel):
    total: int
    dimensions: int
    questions: list[QuizQuestionResponse]


class ErrorResponse(BaseModel):
    detail: str
