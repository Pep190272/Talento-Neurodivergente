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


# ─── Job Offers ───


class CreateJobRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: str = Field("", max_length=5000)
    location: str = Field("", max_length=255)
    modality: str = Field("remote", pattern="^(remote|hybrid|onsite)$")
    required_skills: list[str] = Field(default_factory=list)
    adaptations: list[str] = Field(default_factory=list)
    salary_range: str = Field("", max_length=100)


class JobOfferResponse(BaseModel):
    id: str
    company_user_id: str
    title: str
    description: str
    location: str
    modality: str
    required_skills: list
    adaptations: list
    salary_range: str
    status: str


class MatchedJobResponse(BaseModel):
    id: str
    title: str
    description: str
    location: str
    modality: str
    required_skills: list
    adaptations: list
    salary_range: str
    company_name: str = ""
    company_sector: str = ""
    match_score: float = 0.0
    match_pct: int = 0
    match_reasons: list[str] = Field(default_factory=list)


# ─── Game Scores ───


class SaveGameScoreRequest(BaseModel):
    game: str = Field(..., min_length=1, max_length=100)
    score: int = Field(..., ge=0)
    details: dict = Field(default_factory=dict)


# ─── Inclusivity ───


class InclusivityAnswerRequest(BaseModel):
    category: str
    value: float = Field(..., ge=0.0, le=1.0)


class SubmitInclusivityRequest(BaseModel):
    answers: list[InclusivityAnswerRequest] = Field(..., min_length=1)
