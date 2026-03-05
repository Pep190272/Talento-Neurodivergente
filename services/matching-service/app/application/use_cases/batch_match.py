"""Use case: Run batch matching for a job against all matchable candidates."""

from __future__ import annotations

from ..dto.matching_dto import MatchResultDTO
from ...domain.repositories.i_candidate_repository import ICandidateRepository
from ...domain.repositories.i_job_repository import IJobRepository
from ...domain.repositories.i_match_repository import IMatchRepository
from ...domain.services.trilateral_scorer import TrilateralScorer


class BatchMatchForJobUseCase:
    """Calculate matches for all matchable candidates against a specific job."""

    def __init__(
        self,
        candidate_repo: ICandidateRepository,
        job_repo: IJobRepository,
        match_repo: IMatchRepository,
        scorer: TrilateralScorer | None = None,
    ) -> None:
        self._candidate_repo = candidate_repo
        self._job_repo = job_repo
        self._match_repo = match_repo
        self._scorer = scorer or TrilateralScorer()

    async def execute(self, job_id: str, limit: int = 100) -> list[MatchResultDTO]:
        job = await self._job_repo.find_by_id(job_id)
        if job is None or not job.is_active():
            return []

        candidates = await self._candidate_repo.find_matchable(limit=limit)
        results: list[MatchResultDTO] = []

        for candidate in candidates:
            match = self._scorer.calculate_match(candidate, job)
            saved = await self._match_repo.create(match)
            results.append(
                MatchResultDTO(
                    match_id=saved.id,
                    candidate_id=saved.candidate_id,
                    job_id=saved.job_id,
                    therapist_id=saved.therapist_id,
                    total_score=saved.score.value,
                    vector_score=saved.breakdown.vector_score,
                    accommodation_score=saved.breakdown.accommodation_score,
                    therapist_score=saved.breakdown.therapist_score,
                    preferences_score=saved.breakdown.preferences_score,
                    status=saved.status.value,
                )
            )

        # Sort by total score descending
        results.sort(key=lambda r: r.total_score, reverse=True)
        return results
