"""Use case: Calculate match between a single candidate and job."""

from __future__ import annotations

from ..dto.matching_dto import CalculateMatchDTO, MatchResultDTO
from ...domain.entities.match import Match
from ...domain.repositories.i_candidate_repository import ICandidateRepository
from ...domain.repositories.i_job_repository import IJobRepository
from ...domain.repositories.i_match_repository import IMatchRepository
from ...domain.services.trilateral_scorer import TherapistAssessment, TrilateralScorer


class CandidateNotFoundError(Exception):
    pass


class JobNotFoundError(Exception):
    pass


class CandidateNotMatchableError(Exception):
    pass


class JobNotActiveError(Exception):
    pass


class CalculateMatchUseCase:
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

    async def execute(self, dto: CalculateMatchDTO) -> MatchResultDTO:
        candidate = await self._candidate_repo.find_by_user_id(dto.candidate_id)
        if candidate is None:
            raise CandidateNotFoundError(f"Candidate '{dto.candidate_id}' not found")

        if not candidate.is_matchable():
            raise CandidateNotMatchableError(
                f"Candidate '{dto.candidate_id}' has not completed assessment"
            )

        job = await self._job_repo.find_by_id(dto.job_id)
        if job is None:
            raise JobNotFoundError(f"Job '{dto.job_id}' not found")

        if not job.is_active():
            raise JobNotActiveError(f"Job '{dto.job_id}' is not active")

        # Build therapist assessment if provided
        assessment = None
        if dto.therapist_id and dto.therapist_score is not None:
            assessment = TherapistAssessment(
                candidate_id=dto.candidate_id,
                job_id=dto.job_id,
                therapist_id=dto.therapist_id,
                score=dto.therapist_score,
                notes=dto.therapist_notes,
            )

        match = self._scorer.calculate_match(candidate, job, assessment)

        # Check for existing match and update, or create new
        existing = await self._match_repo.find_existing(dto.candidate_id, dto.job_id)
        if existing:
            existing.score = match.score
            existing.breakdown = match.breakdown
            existing.therapist_id = match.therapist_id
            existing.touch()
            saved = await self._match_repo.update(existing)
        else:
            saved = await self._match_repo.create(match)

        return self._to_dto(saved)

    @staticmethod
    def _to_dto(match: Match) -> MatchResultDTO:
        return MatchResultDTO(
            match_id=match.id,
            candidate_id=match.candidate_id,
            job_id=match.job_id,
            therapist_id=match.therapist_id,
            total_score=match.score.value,
            vector_score=match.breakdown.vector_score,
            accommodation_score=match.breakdown.accommodation_score,
            therapist_score=match.breakdown.therapist_score,
            preferences_score=match.breakdown.preferences_score,
            status=match.status.value,
        )
