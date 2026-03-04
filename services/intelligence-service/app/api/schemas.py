"""Pydantic schemas for intelligence API."""

from __future__ import annotations

from pydantic import BaseModel, Field


class GenerateReportRequest(BaseModel):
    candidate_id: str
    report_type: str = Field(..., pattern="^(candidate_summary|match_analysis|accommodation_guide|team_fit)$")
    job_id: str | None = None
    candidate_vector: dict[str, float] | None = None
    job_vector: dict[str, float] | None = None
    match_score: float | None = Field(None, ge=0, le=100)
    vector_similarity: float | None = Field(None, ge=0, le=1)
    accommodation_coverage: float | None = Field(None, ge=0, le=1)


class ReportResponse(BaseModel):
    report_id: str
    report_type: str
    status: str
    content: str
    model_name: str
    tokens_used: int


class ErrorResponse(BaseModel):
    detail: str
