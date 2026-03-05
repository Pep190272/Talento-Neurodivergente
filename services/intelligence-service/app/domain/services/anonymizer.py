"""Anonymization service — strips PII before sending data to LLM.

This is a critical privacy boundary. All data sent to Ollama must
pass through anonymization first. The LLM never sees names, emails,
or any identifying information — only dimension values and scores.
"""

from __future__ import annotations

from dataclasses import dataclass

from shared.domain import NeuroVector24D
from shared.domain.value_objects import ALL_DIMENSIONS


@dataclass(frozen=True)
class AnonymizedProfile:
    """A profile stripped of all PII, safe for LLM consumption."""

    dimensions: dict[str, float]
    cognitive_score: float
    stress_index: float
    autonomy_index: float
    role: str = ""

    def to_prompt_context(self) -> str:
        """Format as a text block suitable for LLM prompt injection."""
        lines = [f"Role: {self.role}"]
        lines.append(f"Cognitive Score: {self.cognitive_score:.2f}")
        lines.append(f"Stress Index: {self.stress_index:.2f}")
        lines.append(f"Autonomy Index: {self.autonomy_index:.2f}")
        lines.append("Dimensions:")
        for dim, val in sorted(self.dimensions.items()):
            lines.append(f"  {dim}: {val:.2f}")
        return "\n".join(lines)


@dataclass(frozen=True)
class AnonymizedMatch:
    """An anonymized match context for report generation."""

    candidate_profile: AnonymizedProfile
    job_dimensions: dict[str, float]
    match_score: float
    vector_similarity: float
    accommodation_coverage: float

    def to_prompt_context(self) -> str:
        lines = [
            "--- CANDIDATE ---",
            self.candidate_profile.to_prompt_context(),
            "",
            "--- JOB IDEAL PROFILE ---",
            "Dimensions:",
        ]
        for dim, val in sorted(self.job_dimensions.items()):
            lines.append(f"  {dim}: {val:.2f}")
        lines.append("")
        lines.append(f"Match Score: {self.match_score:.1f}%")
        lines.append(f"Vector Similarity: {self.vector_similarity:.2f}")
        lines.append(f"Accommodation Coverage: {self.accommodation_coverage:.0%}")
        return "\n".join(lines)


class Anonymizer:
    """Strips PII from domain objects, producing LLM-safe representations."""

    def anonymize_vector(self, vector: NeuroVector24D, role: str = "") -> AnonymizedProfile:
        """Convert a NeuroVector24D to an anonymous profile."""
        dimensions = {dim: getattr(vector, dim) for dim in ALL_DIMENSIONS}
        return AnonymizedProfile(
            dimensions=dimensions,
            cognitive_score=vector.cognitive_score,
            stress_index=vector.stress_index,
            autonomy_index=vector.autonomy_index,
            role=role,
        )

    def anonymize_match(
        self,
        candidate_vector: NeuroVector24D,
        job_vector: NeuroVector24D,
        match_score: float,
        vector_similarity: float,
        accommodation_coverage: float,
        candidate_role: str = "candidate",
    ) -> AnonymizedMatch:
        """Create an anonymized match context from vectors and scores."""
        return AnonymizedMatch(
            candidate_profile=self.anonymize_vector(candidate_vector, candidate_role),
            job_dimensions={dim: getattr(job_vector, dim) for dim in ALL_DIMENSIONS},
            match_score=match_score,
            vector_similarity=vector_similarity,
            accommodation_coverage=accommodation_coverage,
        )
