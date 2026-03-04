"""Trilateral matching scorer — the core matching algorithm.

Calculates a weighted score across 4 dimensions:
- Vector similarity (50%): cosine similarity between 24D neuro-vectors
- Accommodation fit (25%): ratio of needed accommodations offered
- Therapist endorsement (15%): optional therapist assessment score
- Preferences match (10%): work mode, hours, team size alignment

When no therapist is involved, the 15% weight is redistributed:
- 10% → vector similarity (becomes 60%)
- 5% → accommodation fit (becomes 30%)
"""

from __future__ import annotations

from dataclasses import dataclass

from shared.domain import NeuroVector24D

from ..entities.candidate_profile import CandidateProfile
from ..entities.job import Job, Preferences, WorkMode
from ..entities.match import Match, MatchBreakdown


@dataclass(frozen=True)
class TherapistAssessment:
    """Assessment from a therapist about a candidate-job fit.

    score: 0.0-1.0 representing therapist confidence in the match
    notes: free-text explanation
    """

    candidate_id: str
    job_id: str
    therapist_id: str
    score: float  # 0.0-1.0
    notes: str = ""

    def __post_init__(self) -> None:
        if not 0.0 <= self.score <= 1.0:
            raise ValueError(f"Therapist score must be 0.0-1.0, got {self.score}")


class TrilateralScorer:
    """
    Trilateral matching engine.

    Computes a match score between a candidate and a job,
    optionally incorporating a therapist's assessment.
    """

    def calculate_vector_score(
        self,
        candidate_vector: NeuroVector24D,
        job_ideal_vector: NeuroVector24D,
    ) -> float:
        """Cosine similarity between candidate and job ideal vectors.

        Returns 0.0-1.0. Higher means more aligned neurocognitive profiles.
        """
        return candidate_vector.cosine_similarity(job_ideal_vector)

    def calculate_accommodation_score(
        self,
        candidate_needs: set[str],
        company_offers: set[str],
    ) -> float:
        """Ratio of candidate's accommodation needs that the company offers.

        Returns 1.0 if candidate needs nothing or company offers everything.
        Returns 0.0 if candidate has needs and company offers nothing.
        """
        if not candidate_needs:
            return 1.0
        if not company_offers:
            return 0.0
        covered = candidate_needs & company_offers
        return len(covered) / len(candidate_needs)

    def calculate_therapist_score(
        self,
        assessment: TherapistAssessment | None,
    ) -> float:
        """Therapist endorsement score.

        Returns the therapist's assessment score if available.
        Returns -1.0 as sentinel if no therapist (triggers weight redistribution).
        """
        if assessment is None:
            return -1.0
        return assessment.score

    def calculate_preferences_score(
        self,
        candidate_prefs: Preferences,
        job_prefs: Preferences,
    ) -> float:
        """Match on work mode, hours, and team size preferences.

        Each dimension contributes equally (33.3%):
        - Work mode: 1.0 if same, 0.5 if one is hybrid, 0.0 otherwise
        - Hours: overlap ratio of [min, max] ranges
        - Team size: overlap ratio of [min, max] ranges
        """
        # Work mode
        work_mode_score = self._work_mode_compatibility(
            candidate_prefs.work_mode, job_prefs.work_mode
        )

        # Hours overlap
        hours_score = self._range_overlap(
            candidate_prefs.min_hours_per_week,
            candidate_prefs.max_hours_per_week,
            job_prefs.min_hours_per_week,
            job_prefs.max_hours_per_week,
        )

        # Team size overlap
        team_score = self._range_overlap(
            candidate_prefs.team_size_min,
            candidate_prefs.team_size_max,
            job_prefs.team_size_min,
            job_prefs.team_size_max,
        )

        return (work_mode_score + hours_score + team_score) / 3.0

    def calculate_match(
        self,
        candidate: CandidateProfile,
        job: Job,
        assessment: TherapistAssessment | None = None,
    ) -> Match:
        """Calculate a full trilateral match between candidate and job.

        Returns a Match entity with score and detailed breakdown.
        """
        vector_score = self.calculate_vector_score(
            candidate.neuro_vector, job.ideal_vector
        )
        accommodation_score = self.calculate_accommodation_score(
            candidate.accommodation_names(), job.accommodation_names()
        )
        therapist_score = self.calculate_therapist_score(assessment)
        preferences_score = self.calculate_preferences_score(
            candidate.preferences, job.preferences
        )

        breakdown = MatchBreakdown(
            vector_score=round(vector_score, 4),
            accommodation_score=round(accommodation_score, 4),
            therapist_score=round(therapist_score, 4),
            preferences_score=round(preferences_score, 4),
        )

        return Match(
            candidate_id=candidate.user_id,
            job_id=job.id,
            therapist_id=assessment.therapist_id if assessment else None,
            score=breakdown.total_score,
            breakdown=breakdown,
        )

    # ── Private helpers ──

    @staticmethod
    def _work_mode_compatibility(a: WorkMode, b: WorkMode) -> float:
        if a == b:
            return 1.0
        if WorkMode.HYBRID in (a, b):
            return 0.5
        return 0.0

    @staticmethod
    def _range_overlap(a_min: int, a_max: int, b_min: int, b_max: int) -> float:
        """Calculate overlap ratio between two integer ranges."""
        overlap_start = max(a_min, b_min)
        overlap_end = min(a_max, b_max)
        if overlap_start > overlap_end:
            return 0.0
        overlap = overlap_end - overlap_start
        total_span = max(a_max, b_max) - min(a_min, b_min)
        if total_span == 0:
            return 1.0
        return overlap / total_span
