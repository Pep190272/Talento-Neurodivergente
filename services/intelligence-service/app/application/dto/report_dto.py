"""DTOs for intelligence use cases."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class GenerateReportDTO:
    candidate_id: str
    report_type: str  # ReportType value
    job_id: str | None = None
    candidate_vector_data: dict[str, float] | None = None
    job_vector_data: dict[str, float] | None = None
    match_score: float | None = None
    vector_similarity: float | None = None
    accommodation_coverage: float | None = None


@dataclass(frozen=True)
class ReportResultDTO:
    report_id: str
    report_type: str
    status: str
    content: str
    model_name: str
    tokens_used: int
