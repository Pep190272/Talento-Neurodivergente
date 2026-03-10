"""SQLAlchemy ORM models for the profiles schema."""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum, Float, Integer, String, Text, JSON
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from shared.domain import NeuroVector24D, UserRole
from shared.domain.value_objects import ALL_DIMENSIONS

from app.domain.entities.profile import ProfileStatus, UserProfile
from app.domain.entities.therapist_profile import TherapistProfile, VerificationStatus
from app.domain.entities.assessment import Assessment, AssessmentStatus, QuizAnswer


class Base(DeclarativeBase):
    pass


class ProfileModel(Base):
    __tablename__ = "profiles"
    __table_args__ = {"schema": "profiles"}

    id: Mapped[str] = mapped_column(String(25), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(25), unique=True, nullable=False, index=True)
    role: Mapped[str] = mapped_column(
        Enum("candidate", "company", "therapist", "admin", name="user_role", schema="profiles"),
        nullable=False,
    )
    display_name: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    bio: Mapped[str] = mapped_column(Text, nullable=False, default="")
    status: Mapped[str] = mapped_column(
        Enum("incomplete", "assessment_pending", "active", "inactive",
             name="profile_status", schema="profiles"),
        nullable=False, default="incomplete",
    )
    onboarding_completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # NeuroVector24D stored as individual columns
    attention: Mapped[float | None] = mapped_column(Float, nullable=True)
    memory: Mapped[float | None] = mapped_column(Float, nullable=True)
    processing_speed: Mapped[float | None] = mapped_column(Float, nullable=True)
    pattern_recognition: Mapped[float | None] = mapped_column(Float, nullable=True)
    creative_thinking: Mapped[float | None] = mapped_column(Float, nullable=True)
    analytical_thinking: Mapped[float | None] = mapped_column(Float, nullable=True)
    verbal_reasoning: Mapped[float | None] = mapped_column(Float, nullable=True)
    spatial_reasoning: Mapped[float | None] = mapped_column(Float, nullable=True)
    communication_style: Mapped[float | None] = mapped_column(Float, nullable=True)
    teamwork: Mapped[float | None] = mapped_column(Float, nullable=True)
    leadership: Mapped[float | None] = mapped_column(Float, nullable=True)
    conflict_resolution: Mapped[float | None] = mapped_column(Float, nullable=True)
    task_switching: Mapped[float | None] = mapped_column(Float, nullable=True)
    deadline_management: Mapped[float | None] = mapped_column(Float, nullable=True)
    autonomy: Mapped[float | None] = mapped_column(Float, nullable=True)
    structure_need: Mapped[float | None] = mapped_column(Float, nullable=True)
    sensory_sensitivity: Mapped[float | None] = mapped_column(Float, nullable=True)
    stress_tolerance: Mapped[float | None] = mapped_column(Float, nullable=True)
    domain_expertise: Mapped[float | None] = mapped_column(Float, nullable=True)
    learning_speed: Mapped[float | None] = mapped_column(Float, nullable=True)
    problem_solving: Mapped[float | None] = mapped_column(Float, nullable=True)
    detail_orientation: Mapped[float | None] = mapped_column(Float, nullable=True)
    abstract_thinking: Mapped[float | None] = mapped_column(Float, nullable=True)
    technical_depth: Mapped[float | None] = mapped_column(Float, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    def to_entity(self) -> UserProfile:
        vector = None
        if self.attention is not None:
            dim_values = {dim: getattr(self, dim) for dim in ALL_DIMENSIONS}
            vector = NeuroVector24D(**dim_values)

        return UserProfile(
            id=self.id,
            user_id=self.user_id,
            role=UserRole(self.role),
            display_name=self.display_name,
            bio=self.bio,
            status=ProfileStatus(self.status),
            onboarding_completed=self.onboarding_completed,
            neuro_vector=vector,
            created_at=self.created_at,
            updated_at=self.updated_at,
        )

    @classmethod
    def from_entity(cls, profile: UserProfile) -> ProfileModel:
        model = cls(
            id=profile.id,
            user_id=profile.user_id,
            role=profile.role.value,
            display_name=profile.display_name,
            bio=profile.bio,
            status=profile.status.value,
            onboarding_completed=profile.onboarding_completed,
            created_at=profile.created_at,
            updated_at=profile.updated_at,
        )
        if profile.neuro_vector:
            for dim in ALL_DIMENSIONS:
                setattr(model, dim, getattr(profile.neuro_vector, dim))
        return model


class TherapistModel(Base):
    __tablename__ = "therapists"
    __table_args__ = {"schema": "profiles"}

    id: Mapped[str] = mapped_column(String(25), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(25), unique=True, nullable=False, index=True)
    specialty: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    bio: Mapped[str] = mapped_column(Text, nullable=False, default="")
    support_areas: Mapped[dict] = mapped_column(JSON, nullable=False, default=list)
    license_number: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    verification_status: Mapped[str] = mapped_column(
        Enum("pending", "verified", "rejected",
             name="verification_status", schema="profiles"),
        nullable=False, default="pending",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    def to_entity(self) -> TherapistProfile:
        return TherapistProfile(
            id=self.id,
            user_id=self.user_id,
            specialty=self.specialty,
            bio=self.bio,
            support_areas=self.support_areas if isinstance(self.support_areas, list) else [],
            license_number=self.license_number,
            verification_status=self.verification_status,
            created_at=self.created_at,
            updated_at=self.updated_at,
        )

    @classmethod
    def from_entity(cls, t: TherapistProfile) -> TherapistModel:
        return cls(
            id=t.id,
            user_id=t.user_id,
            specialty=t.specialty,
            bio=t.bio,
            support_areas=t.support_areas,
            license_number=t.license_number,
            verification_status=t.verification_status,
            created_at=t.created_at,
            updated_at=t.updated_at,
        )


class AssessmentModel(Base):
    __tablename__ = "assessments"
    __table_args__ = {"schema": "profiles"}

    id: Mapped[str] = mapped_column(String(25), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(25), nullable=False, index=True)
    status: Mapped[str] = mapped_column(
        Enum("in_progress", "completed", "flagged", "expired",
             name="assessment_status", schema="profiles"),
        nullable=False, default="in_progress",
    )
    answers: Mapped[dict] = mapped_column(JSON, nullable=False, default=list)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    result_vector: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    def to_entity(self) -> Assessment:
        answers = [
            QuizAnswer(
                question_id=a["question_id"],
                dimension=a["dimension"],
                value=a["value"],
            )
            for a in (self.answers if isinstance(self.answers, list) else [])
        ]
        vector = None
        if self.result_vector and isinstance(self.result_vector, dict):
            vector = NeuroVector24D(**self.result_vector)

        return Assessment(
            id=self.id,
            user_id=self.user_id,
            status=AssessmentStatus(self.status),
            answers=answers,
            started_at=self.started_at,
            completed_at=self.completed_at,
            result_vector=vector,
            created_at=self.created_at,
            updated_at=self.updated_at,
        )

    @classmethod
    def from_entity(cls, a: Assessment) -> AssessmentModel:
        answers_data = [
            {"question_id": ans.question_id, "dimension": ans.dimension, "value": ans.value}
            for ans in a.answers
        ]
        vector_data = None
        if a.result_vector:
            vector_data = {dim: getattr(a.result_vector, dim) for dim in ALL_DIMENSIONS}

        return cls(
            id=a.id,
            user_id=a.user_id,
            status=a.status.value,
            answers=answers_data,
            started_at=a.started_at,
            completed_at=a.completed_at,
            result_vector=vector_data,
            created_at=a.created_at,
            updated_at=a.updated_at,
        )


class JobOfferModel(Base):
    __tablename__ = "job_offers"
    __table_args__ = {"schema": "profiles"}

    id: Mapped[str] = mapped_column(String(25), primary_key=True)
    company_user_id: Mapped[str] = mapped_column(String(25), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    location: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    modality: Mapped[str] = mapped_column(String(50), nullable=False, default="remote")
    required_skills: Mapped[dict] = mapped_column(JSON, nullable=False, default=list)
    adaptations: Mapped[dict] = mapped_column(JSON, nullable=False, default=list)
    salary_range: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    status: Mapped[str] = mapped_column(
        Enum("active", "closed", "draft", name="job_status", schema="profiles"),
        nullable=False, default="active",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )


class GameScoreModel(Base):
    __tablename__ = "game_scores"
    __table_args__ = {"schema": "profiles"}

    id: Mapped[str] = mapped_column(String(25), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(25), nullable=False, index=True)
    game: Mapped[str] = mapped_column(String(100), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    details: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    played_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
