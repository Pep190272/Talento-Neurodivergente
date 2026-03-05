"""SQLAlchemy ORM models for the matching schema."""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, Float, String, Text, JSON
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from shared.domain import NeuroVector24D, Score
from shared.domain.value_objects import ALL_DIMENSIONS

from app.domain.entities.candidate_profile import CandidateProfile
from app.domain.entities.job import Accommodation, Job, JobStatus, Preferences, WorkMode
from app.domain.entities.match import Match, MatchBreakdown, MatchStatus


class Base(DeclarativeBase):
    pass


class JobModel(Base):
    __tablename__ = "jobs"
    __table_args__ = {"schema": "matching"}

    id: Mapped[str] = mapped_column(String(25), primary_key=True)
    company_id: Mapped[str] = mapped_column(String(25), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    status: Mapped[str] = mapped_column(
        Enum("draft", "active", "paused", "closed", name="job_status", schema="matching"),
        nullable=False, default="draft",
    )
    ideal_vector: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    accommodations: Mapped[dict] = mapped_column(JSON, nullable=False, default=list)
    preferences: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    def to_entity(self) -> Job:
        vec_data = self.ideal_vector if isinstance(self.ideal_vector, dict) else {}
        vector = NeuroVector24D(**{k: v for k, v in vec_data.items() if k in ALL_DIMENSIONS})

        accs = [Accommodation(name=a.get("name", ""), category=a.get("category", ""))
                for a in (self.accommodations if isinstance(self.accommodations, list) else [])]

        prefs_data = self.preferences if isinstance(self.preferences, dict) else {}
        prefs = Preferences(
            work_mode=WorkMode(prefs_data.get("work_mode", "hybrid")),
            max_hours_per_week=prefs_data.get("max_hours_per_week", 40),
            min_hours_per_week=prefs_data.get("min_hours_per_week", 20),
            team_size_min=prefs_data.get("team_size_min", 1),
            team_size_max=prefs_data.get("team_size_max", 50),
        )

        return Job(
            id=self.id, company_id=self.company_id, title=self.title,
            description=self.description, status=JobStatus(self.status),
            ideal_vector=vector, accommodations_offered=accs,
            preferences=prefs, created_at=self.created_at, updated_at=self.updated_at,
        )

    @classmethod
    def from_entity(cls, job: Job) -> JobModel:
        vec_data = {dim: getattr(job.ideal_vector, dim) for dim in ALL_DIMENSIONS}
        accs_data = [{"name": a.name, "category": a.category} for a in job.accommodations_offered]
        prefs_data = {
            "work_mode": job.preferences.work_mode.value,
            "max_hours_per_week": job.preferences.max_hours_per_week,
            "min_hours_per_week": job.preferences.min_hours_per_week,
            "team_size_min": job.preferences.team_size_min,
            "team_size_max": job.preferences.team_size_max,
        }
        return cls(
            id=job.id, company_id=job.company_id, title=job.title,
            description=job.description, status=job.status.value,
            ideal_vector=vec_data, accommodations=accs_data, preferences=prefs_data,
            created_at=job.created_at, updated_at=job.updated_at,
        )


class CandidateModel(Base):
    __tablename__ = "candidates"
    __table_args__ = {"schema": "matching"}

    id: Mapped[str] = mapped_column(String(25), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(25), unique=True, nullable=False, index=True)
    neuro_vector: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    accommodations: Mapped[dict] = mapped_column(JSON, nullable=False, default=list)
    preferences: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    assessment_completed: Mapped[bool] = mapped_column(nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    def to_entity(self) -> CandidateProfile:
        vec_data = self.neuro_vector if isinstance(self.neuro_vector, dict) else {}
        vector = NeuroVector24D(**{k: v for k, v in vec_data.items() if k in ALL_DIMENSIONS})

        accs = [Accommodation(name=a.get("name", ""))
                for a in (self.accommodations if isinstance(self.accommodations, list) else [])]

        prefs_data = self.preferences if isinstance(self.preferences, dict) else {}
        prefs = Preferences(
            work_mode=WorkMode(prefs_data.get("work_mode", "hybrid")),
            max_hours_per_week=prefs_data.get("max_hours_per_week", 40),
            min_hours_per_week=prefs_data.get("min_hours_per_week", 20),
        )

        return CandidateProfile(
            id=self.id, user_id=self.user_id, neuro_vector=vector,
            accommodations_needed=accs, preferences=prefs,
            assessment_completed=self.assessment_completed,
            created_at=self.created_at, updated_at=self.updated_at,
        )

    @classmethod
    def from_entity(cls, c: CandidateProfile) -> CandidateModel:
        vec_data = {dim: getattr(c.neuro_vector, dim) for dim in ALL_DIMENSIONS}
        accs_data = [{"name": a.name} for a in c.accommodations_needed]
        prefs_data = {
            "work_mode": c.preferences.work_mode.value,
            "max_hours_per_week": c.preferences.max_hours_per_week,
            "min_hours_per_week": c.preferences.min_hours_per_week,
        }
        return cls(
            id=c.id, user_id=c.user_id, neuro_vector=vec_data,
            accommodations=accs_data, preferences=prefs_data,
            assessment_completed=c.assessment_completed,
            created_at=c.created_at, updated_at=c.updated_at,
        )


class MatchModel(Base):
    __tablename__ = "matches"
    __table_args__ = {"schema": "matching"}

    id: Mapped[str] = mapped_column(String(25), primary_key=True)
    candidate_id: Mapped[str] = mapped_column(String(25), nullable=False, index=True)
    job_id: Mapped[str] = mapped_column(String(25), nullable=False, index=True)
    therapist_id: Mapped[str | None] = mapped_column(String(25), nullable=True)
    score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    breakdown: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    status: Mapped[str] = mapped_column(
        Enum("pending", "active", "expired", "rejected", "accepted",
             name="match_status", schema="matching"),
        nullable=False, default="pending",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    def to_entity(self) -> Match:
        bd = self.breakdown if isinstance(self.breakdown, dict) else {}
        breakdown = MatchBreakdown(
            vector_score=bd.get("vector_score", 0.0),
            accommodation_score=bd.get("accommodation_score", 0.0),
            therapist_score=bd.get("therapist_score", 0.0),
            preferences_score=bd.get("preferences_score", 0.0),
        )
        return Match(
            id=self.id, candidate_id=self.candidate_id, job_id=self.job_id,
            therapist_id=self.therapist_id, score=Score(self.score),
            breakdown=breakdown, status=MatchStatus(self.status),
            created_at=self.created_at, updated_at=self.updated_at,
        )

    @classmethod
    def from_entity(cls, m: Match) -> MatchModel:
        bd = {
            "vector_score": m.breakdown.vector_score,
            "accommodation_score": m.breakdown.accommodation_score,
            "therapist_score": m.breakdown.therapist_score,
            "preferences_score": m.breakdown.preferences_score,
        }
        return cls(
            id=m.id, candidate_id=m.candidate_id, job_id=m.job_id,
            therapist_id=m.therapist_id, score=m.score.value,
            breakdown=bd, status=m.status.value,
            created_at=m.created_at, updated_at=m.updated_at,
        )
