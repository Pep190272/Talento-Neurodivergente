"""Candidate profile in the matching bounded context.

This is a read model — the source of truth lives in profile-service.
The matching-service keeps a lightweight copy of what it needs for scoring.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from shared.domain import BaseEntity, NeuroVector24D

from .job import Accommodation, Preferences


@dataclass(eq=False)
class CandidateProfile(BaseEntity):
    """Lightweight candidate representation for matching calculations."""

    user_id: str = ""
    neuro_vector: NeuroVector24D = field(default_factory=NeuroVector24D)
    accommodations_needed: list[Accommodation] = field(default_factory=list)
    preferences: Preferences = field(default_factory=Preferences)
    assessment_completed: bool = False

    def is_matchable(self) -> bool:
        """A candidate can be matched only if assessment is completed."""
        return self.assessment_completed

    def accommodation_names(self) -> set[str]:
        return {a.name.lower() for a in self.accommodations_needed}
