"""Job domain entity — represents a job posting with neurocognitive requirements."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum

from shared.domain import BaseEntity, NeuroVector24D


class WorkMode(str, Enum):
    REMOTE = "remote"
    HYBRID = "hybrid"
    ONSITE = "onsite"


class JobStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    CLOSED = "closed"


@dataclass
class Preferences:
    """Candidate or job preferences for non-vector matching."""

    work_mode: WorkMode = WorkMode.HYBRID
    max_hours_per_week: int = 40
    min_hours_per_week: int = 20
    team_size_min: int = 1
    team_size_max: int = 50


@dataclass
class Accommodation:
    """A workplace accommodation that a company offers or a candidate needs."""

    name: str
    category: str = ""  # e.g. "sensory", "schedule", "communication", "physical"
    description: str = ""


@dataclass(eq=False)
class Job(BaseEntity):
    """
    Job posting with neurocognitive ideal profile.

    The ideal_vector represents the neurocognitive profile that would
    be the best fit for this role. It's used in cosine similarity
    calculations against candidate vectors.
    """

    company_id: str = ""
    title: str = ""
    description: str = ""
    status: JobStatus = JobStatus.DRAFT
    ideal_vector: NeuroVector24D = field(default_factory=NeuroVector24D)
    accommodations_offered: list[Accommodation] = field(default_factory=list)
    preferences: Preferences = field(default_factory=Preferences)

    def is_active(self) -> bool:
        return self.status == JobStatus.ACTIVE

    def activate(self) -> None:
        if not self.title:
            raise JobError("Cannot activate a job without a title")
        self.status = JobStatus.ACTIVE
        self.touch()

    def close(self) -> None:
        self.status = JobStatus.CLOSED
        self.touch()

    def pause(self) -> None:
        self.status = JobStatus.PAUSED
        self.touch()

    def accommodation_names(self) -> set[str]:
        return {a.name.lower() for a in self.accommodations_offered}


class JobError(Exception):
    pass
