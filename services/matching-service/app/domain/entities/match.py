"""Match domain entity — represents a scored candidate-job pairing."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum

from shared.domain import BaseEntity, Score


class MatchStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    EXPIRED = "expired"
    REJECTED = "rejected"
    ACCEPTED = "accepted"


@dataclass(frozen=True)
class MatchBreakdown:
    """Detailed breakdown of how a match score was calculated.

    Weights:
    - vector_score: 50% — cosine similarity between neuro-vectors
    - accommodation_score: 25% — ratio of needed accommodations offered
    - therapist_score: 15% — therapist endorsement (or redistributed)
    - preferences_score: 10% — work mode, hours, team size alignment
    """

    vector_score: float = 0.0
    accommodation_score: float = 0.0
    therapist_score: float = 0.0
    preferences_score: float = 0.0

    WEIGHT_VECTOR: float = 0.50
    WEIGHT_ACCOMMODATION: float = 0.25
    WEIGHT_THERAPIST: float = 0.15
    WEIGHT_PREFERENCES: float = 0.10

    @property
    def total(self) -> float:
        """Weighted total score (0.0 to 1.0)."""
        if self.therapist_score < 0:
            # No therapist: redistribute 15% → vector gets 60%, accommodation 30%
            w_vec = self.WEIGHT_VECTOR + self.WEIGHT_THERAPIST * 0.67
            w_acc = self.WEIGHT_ACCOMMODATION + self.WEIGHT_THERAPIST * 0.33
            return (
                self.vector_score * w_vec
                + self.accommodation_score * w_acc
                + self.preferences_score * self.WEIGHT_PREFERENCES
            )
        return (
            self.vector_score * self.WEIGHT_VECTOR
            + self.accommodation_score * self.WEIGHT_ACCOMMODATION
            + self.therapist_score * self.WEIGHT_THERAPIST
            + self.preferences_score * self.WEIGHT_PREFERENCES
        )

    @property
    def total_score(self) -> Score:
        """Total as a Score value object (0-100 scale)."""
        return Score(round(self.total * 100, 2))


@dataclass(eq=False)
class Match(BaseEntity):
    """
    A scored pairing between a candidate and a job.

    Contains the overall score and a detailed breakdown of how
    the score was calculated across the 4 matching dimensions.
    """

    candidate_id: str = ""
    job_id: str = ""
    therapist_id: str | None = None
    score: Score = field(default_factory=lambda: Score(0))
    breakdown: MatchBreakdown = field(default_factory=MatchBreakdown)
    status: MatchStatus = MatchStatus.PENDING

    def is_strong_match(self, threshold: float = 70.0) -> bool:
        return self.score.value >= threshold

    def accept(self) -> None:
        if self.status != MatchStatus.ACTIVE:
            raise MatchError(f"Cannot accept match in status '{self.status.value}'")
        self.status = MatchStatus.ACCEPTED
        self.touch()

    def reject(self) -> None:
        if self.status != MatchStatus.ACTIVE:
            raise MatchError(f"Cannot reject match in status '{self.status.value}'")
        self.status = MatchStatus.REJECTED
        self.touch()

    def expire(self) -> None:
        self.status = MatchStatus.EXPIRED
        self.touch()

    def activate(self) -> None:
        self.status = MatchStatus.ACTIVE
        self.touch()


class MatchError(Exception):
    pass
