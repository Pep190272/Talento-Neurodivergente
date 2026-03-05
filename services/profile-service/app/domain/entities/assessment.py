"""Assessment entity — neurocognitive quiz submission and scoring."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum

from shared.domain import BaseEntity, NeuroVector24D


class AssessmentStatus(str, Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FLAGGED = "flagged"  # Suspicious submission (too fast, anomalous)
    EXPIRED = "expired"


MIN_COMPLETION_SECONDS = 10  # Flag submissions faster than this


@dataclass(frozen=True)
class QuizAnswer:
    """A single answer to a quiz question."""

    question_id: str
    dimension: str  # Which NeuroVector24D dimension this maps to
    value: float  # 0.0-1.0 normalized response

    def __post_init__(self) -> None:
        if not 0.0 <= self.value <= 1.0:
            raise ValueError(f"Answer value must be 0.0-1.0, got {self.value}")


@dataclass(eq=False)
class Assessment(BaseEntity):
    """
    A neurocognitive assessment submission.

    Contains quiz answers and calculates the NeuroVector24D.
    Flags suspicious submissions (completed too quickly).
    """

    user_id: str = ""
    answers: list[QuizAnswer] = field(default_factory=list)
    status: AssessmentStatus = AssessmentStatus.IN_PROGRESS
    started_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: datetime | None = None
    result_vector: NeuroVector24D | None = None

    def add_answer(self, answer: QuizAnswer) -> None:
        """Add an answer, replacing any existing answer for the same question."""
        self.answers = [a for a in self.answers if a.question_id != answer.question_id]
        self.answers.append(answer)
        self.touch()

    def complete(self) -> NeuroVector24D:
        """Finalize the assessment, calculate the neuro-vector, and check for flags.

        Returns the calculated NeuroVector24D.
        Raises AssessmentError if no answers provided.
        """
        if not self.answers:
            raise AssessmentError("Cannot complete assessment with no answers")

        self.completed_at = datetime.now(timezone.utc)
        elapsed = (self.completed_at - self.started_at).total_seconds()

        if elapsed < MIN_COMPLETION_SECONDS:
            self.status = AssessmentStatus.FLAGGED
        else:
            self.status = AssessmentStatus.COMPLETED

        self.result_vector = self._calculate_vector()
        self.touch()
        return self.result_vector

    def is_completed(self) -> bool:
        return self.status in (AssessmentStatus.COMPLETED, AssessmentStatus.FLAGGED)

    def is_flagged(self) -> bool:
        return self.status == AssessmentStatus.FLAGGED

    def expire(self) -> None:
        self.status = AssessmentStatus.EXPIRED
        self.touch()

    def _calculate_vector(self) -> NeuroVector24D:
        """Average answer values per dimension to produce the neuro-vector.

        For dimensions with multiple answers, averages them.
        Missing dimensions default to 0.5.
        """
        from shared.domain.value_objects import ALL_DIMENSIONS

        dim_sums: dict[str, float] = {}
        dim_counts: dict[str, int] = {}

        for answer in self.answers:
            if answer.dimension in ALL_DIMENSIONS:
                dim_sums[answer.dimension] = dim_sums.get(answer.dimension, 0.0) + answer.value
                dim_counts[answer.dimension] = dim_counts.get(answer.dimension, 0) + 1

        dim_values: dict[str, float] = {}
        for dim in ALL_DIMENSIONS:
            if dim in dim_sums:
                dim_values[dim] = round(dim_sums[dim] / dim_counts[dim], 4)
            # Dimensions without answers keep the default (0.5)

        return NeuroVector24D(**dim_values)


class AssessmentError(Exception):
    pass
