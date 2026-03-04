"""Pydantic schemas for matching API requests/responses."""

from __future__ import annotations

from pydantic import BaseModel, Field


class CalculateMatchRequest(BaseModel):
    candidate_id: str
    job_id: str
    therapist_id: str | None = None
    therapist_score: float | None = Field(None, ge=0.0, le=1.0)
    therapist_notes: str = ""


class MatchBreakdownResponse(BaseModel):
    vector_score: float
    accommodation_score: float
    therapist_score: float
    preferences_score: float


class MatchResponse(BaseModel):
    match_id: str
    candidate_id: str
    job_id: str
    therapist_id: str | None
    total_score: float
    breakdown: MatchBreakdownResponse
    status: str


class ErrorResponse(BaseModel):
    detail: str
