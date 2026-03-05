"""DTOs for matching use cases."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class CalculateMatchDTO:
    """Input for calculating a single match."""

    candidate_id: str
    job_id: str
    therapist_id: str | None = None
    therapist_score: float | None = None
    therapist_notes: str = ""


@dataclass(frozen=True)
class MatchResultDTO:
    """Output of a match calculation."""

    match_id: str
    candidate_id: str
    job_id: str
    therapist_id: str | None
    total_score: float
    vector_score: float
    accommodation_score: float
    therapist_score: float
    preferences_score: float
    status: str


@dataclass(frozen=True)
class BatchMatchDTO:
    """Input for running batch matches for a job or candidate."""

    target_id: str  # job_id or candidate_id
    limit: int = 20
