"""DTOs for profile use cases."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class CreateProfileDTO:
    user_id: str
    role: str
    display_name: str = ""
    bio: str = ""


@dataclass(frozen=True)
class ProfileResultDTO:
    profile_id: str
    user_id: str
    role: str
    display_name: str
    bio: str
    status: str
    has_neuro_vector: bool
    onboarding_completed: bool


@dataclass(frozen=True)
class SubmitQuizDTO:
    user_id: str
    answers: list[QuizAnswerDTO]


@dataclass(frozen=True)
class QuizAnswerDTO:
    question_id: str
    dimension: str
    value: float


@dataclass(frozen=True)
class AssessmentResultDTO:
    assessment_id: str
    user_id: str
    status: str
    is_flagged: bool
    vector_dimensions: dict[str, float] | None = None


@dataclass(frozen=True)
class TherapistProfileDTO:
    user_id: str
    specialty: str
    bio: str
    support_areas: list[str]
    license_number: str = ""


@dataclass(frozen=True)
class TherapistResultDTO:
    profile_id: str
    user_id: str
    specialty: str
    bio: str
    support_areas: list[str]
    verification_status: str
