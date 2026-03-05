"""Immutable value objects shared across all bounded contexts."""

from __future__ import annotations

import math
import re
from dataclasses import dataclass
from enum import Enum


# ─── Simple Value Objects ────────────────────────────────────────────────────


class UserRole(str, Enum):
    CANDIDATE = "candidate"
    COMPANY = "company"
    THERAPIST = "therapist"
    ADMIN = "admin"


class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    DELETED = "deleted"


@dataclass(frozen=True)
class Email:
    """Email value object with validation."""

    value: str

    def __post_init__(self) -> None:
        normalized = self.value.strip().lower()
        if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", normalized):
            raise ValueError(f"Invalid email: {self.value}")
        # frozen=True requires object.__setattr__ for post-init mutation
        object.__setattr__(self, "value", normalized)

    def __str__(self) -> str:
        return self.value


@dataclass(frozen=True)
class Score:
    """Score value object constrained to 0.0-100.0."""

    value: float

    def __post_init__(self) -> None:
        if not 0.0 <= self.value <= 100.0:
            raise ValueError(f"Score must be 0-100, got {self.value}")

    def __float__(self) -> float:
        return self.value

    def meets_threshold(self, threshold: float) -> bool:
        return self.value >= threshold


# ─── NeuroVector24D ──────────────────────────────────────────────────────────

# Dimension names grouped by category
COGNITIVE_DIMS = (
    "attention",
    "memory",
    "processing_speed",
    "pattern_recognition",
    "creative_thinking",
    "analytical_thinking",
    "verbal_reasoning",
    "spatial_reasoning",
)

SOCIAL_DIMS = (
    "communication_style",
    "teamwork",
    "leadership",
    "conflict_resolution",
)

WORK_DIMS = (
    "task_switching",
    "deadline_management",
    "autonomy",
    "structure_need",
    "sensory_sensitivity",
    "stress_tolerance",
)

TECHNICAL_DIMS = (
    "domain_expertise",
    "learning_speed",
    "problem_solving",
    "detail_orientation",
    "abstract_thinking",
    "technical_depth",
)

ALL_DIMENSIONS = COGNITIVE_DIMS + SOCIAL_DIMS + WORK_DIMS + TECHNICAL_DIMS
assert len(ALL_DIMENSIONS) == 24, f"Expected 24 dimensions, got {len(ALL_DIMENSIONS)}"


@dataclass(frozen=True)
class NeuroVector24D:
    """
    24-dimension neurocognitive profile vector.

    Each dimension is a float in [0.0, 1.0] representing a normalized score.
    Used for cosine similarity matching between candidates and job requirements.

    Dimensions are grouped into 4 categories:
    - Cognitive (8): attention, memory, processing_speed, pattern_recognition,
                     creative_thinking, analytical_thinking, verbal_reasoning, spatial_reasoning
    - Social (4):    communication_style, teamwork, leadership, conflict_resolution
    - Work (6):      task_switching, deadline_management, autonomy, structure_need,
                     sensory_sensitivity, stress_tolerance
    - Technical (6): domain_expertise, learning_speed, problem_solving,
                     detail_orientation, abstract_thinking, technical_depth
    """

    # Cognitive (8)
    attention: float = 0.5
    memory: float = 0.5
    processing_speed: float = 0.5
    pattern_recognition: float = 0.5
    creative_thinking: float = 0.5
    analytical_thinking: float = 0.5
    verbal_reasoning: float = 0.5
    spatial_reasoning: float = 0.5

    # Social (4)
    communication_style: float = 0.5
    teamwork: float = 0.5
    leadership: float = 0.5
    conflict_resolution: float = 0.5

    # Work (6)
    task_switching: float = 0.5
    deadline_management: float = 0.5
    autonomy: float = 0.5
    structure_need: float = 0.5
    sensory_sensitivity: float = 0.5
    stress_tolerance: float = 0.5

    # Technical (6)
    domain_expertise: float = 0.5
    learning_speed: float = 0.5
    problem_solving: float = 0.5
    detail_orientation: float = 0.5
    abstract_thinking: float = 0.5
    technical_depth: float = 0.5

    def __post_init__(self) -> None:
        for dim in ALL_DIMENSIONS:
            val = getattr(self, dim)
            if not isinstance(val, (int, float)):
                raise TypeError(f"Dimension '{dim}' must be numeric, got {type(val).__name__}")
            if not 0.0 <= float(val) <= 1.0:
                raise ValueError(f"Dimension '{dim}' must be 0.0-1.0, got {val}")

    def to_list(self) -> list[float]:
        """Return all 24 dimensions as a list in canonical order."""
        return [getattr(self, dim) for dim in ALL_DIMENSIONS]

    @classmethod
    def from_list(cls, values: list[float]) -> NeuroVector24D:
        """Create from a list of 24 floats in canonical order."""
        if len(values) != 24:
            raise ValueError(f"Expected 24 values, got {len(values)}")
        return cls(**dict(zip(ALL_DIMENSIONS, values)))

    @classmethod
    def from_dict(cls, data: dict[str, float]) -> NeuroVector24D:
        """Create from a dictionary of dimension names to values."""
        filtered = {k: v for k, v in data.items() if k in ALL_DIMENSIONS}
        return cls(**filtered)

    def cosine_similarity(self, other: NeuroVector24D) -> float:
        """
        Calculate cosine similarity between two 24D vectors.

        Returns a value in [0.0, 1.0] where:
        - 1.0 = identical direction (perfect match)
        - 0.0 = orthogonal (no similarity)

        Handles zero vectors gracefully (returns 0.0).
        """
        a = self.to_list()
        b = other.to_list()

        dot_product = sum(x * y for x, y in zip(a, b))
        magnitude_a = math.sqrt(sum(x * x for x in a))
        magnitude_b = math.sqrt(sum(x * x for x in b))

        if magnitude_a == 0.0 or magnitude_b == 0.0:
            return 0.0

        similarity = dot_product / (magnitude_a * magnitude_b)
        # Clamp to [0, 1] to handle floating-point errors
        return max(0.0, min(1.0, similarity))

    def euclidean_distance(self, other: NeuroVector24D) -> float:
        """Calculate Euclidean distance between two vectors."""
        a = self.to_list()
        b = other.to_list()
        return math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b)))

    # ─── Computed Properties (Rich Domain Model) ────────────────────────

    @property
    def cognitive_score(self) -> float:
        """Average of the 8 cognitive dimensions."""
        vals = [getattr(self, d) for d in COGNITIVE_DIMS]
        return sum(vals) / len(vals)

    @property
    def social_score(self) -> float:
        """Average of the 4 social dimensions."""
        vals = [getattr(self, d) for d in SOCIAL_DIMS]
        return sum(vals) / len(vals)

    @property
    def work_score(self) -> float:
        """Average of the 6 work dimensions."""
        vals = [getattr(self, d) for d in WORK_DIMS]
        return sum(vals) / len(vals)

    @property
    def technical_score(self) -> float:
        """Average of the 6 technical dimensions."""
        vals = [getattr(self, d) for d in TECHNICAL_DIMS]
        return sum(vals) / len(vals)

    @property
    def stress_index(self) -> float:
        """
        Composite stress index based on stress-related dimensions.
        Higher = more stress-resilient.
        """
        return (self.stress_tolerance + self.deadline_management + (1.0 - self.sensory_sensitivity)) / 3.0

    @property
    def autonomy_index(self) -> float:
        """
        Balance between autonomy preference and structure need.
        Higher = prefers more autonomy.
        """
        return (self.autonomy + (1.0 - self.structure_need)) / 2.0
