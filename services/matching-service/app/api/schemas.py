"""Pydantic schemas for matching API requests/responses."""

from __future__ import annotations

from pydantic import BaseModel, Field


class CalculateMatchRequest(BaseModel):
    candidate_id: str = Field(..., min_length=1, max_length=25)
    job_id: str = Field(..., min_length=1, max_length=25)
    therapist_id: str | None = Field(None, max_length=25)
    therapist_score: float | None = Field(None, ge=0.0, le=1.0)
    therapist_notes: str = Field("", max_length=2000)


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
