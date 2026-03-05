"""SQLAlchemy ORM models for the ai schema."""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from app.domain.entities.talent_report import ReportStatus, ReportType, TalentReport


class Base(DeclarativeBase):
    pass


class ReportModel(Base):
    __tablename__ = "reports"
    __table_args__ = {"schema": "ai"}

    id: Mapped[str] = mapped_column(String(25), primary_key=True)
    report_type: Mapped[str] = mapped_column(
        Enum("candidate_summary", "match_analysis", "accommodation_guide", "team_fit",
             name="report_type", schema="ai"),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        Enum("pending", "generating", "completed", "failed",
             name="report_status", schema="ai"),
        nullable=False, default="pending",
    )
    candidate_id: Mapped[str] = mapped_column(String(25), nullable=False, index=True)
    job_id: Mapped[str | None] = mapped_column(String(25), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False, default="")
    prompt_used: Mapped[str] = mapped_column(Text, nullable=False, default="")
    model_name: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    tokens_used: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    def to_entity(self) -> TalentReport:
        return TalentReport(
            id=self.id,
            report_type=ReportType(self.report_type),
            status=ReportStatus(self.status),
            candidate_id=self.candidate_id,
            job_id=self.job_id,
            content=self.content,
            prompt_used=self.prompt_used,
            model_name=self.model_name,
            tokens_used=self.tokens_used,
            created_at=self.created_at,
            updated_at=self.updated_at,
        )

    @classmethod
    def from_entity(cls, report: TalentReport) -> ReportModel:
        return cls(
            id=report.id,
            report_type=report.report_type.value,
            status=report.status.value,
            candidate_id=report.candidate_id,
            job_id=report.job_id,
            content=report.content,
            prompt_used=report.prompt_used,
            model_name=report.model_name,
            tokens_used=report.tokens_used,
            created_at=report.created_at,
            updated_at=report.updated_at,
        )
