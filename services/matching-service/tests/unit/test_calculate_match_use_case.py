"""Unit tests for CalculateMatchUseCase — mocked repos, no IO."""

from __future__ import annotations

from unittest.mock import AsyncMock

import pytest

from shared.domain import NeuroVector24D

from app.application.dto.matching_dto import CalculateMatchDTO
from app.application.use_cases.calculate_match import (
    CalculateMatchUseCase,
    CandidateNotFoundError,
    CandidateNotMatchableError,
    JobNotActiveError,
    JobNotFoundError,
)
from app.domain.entities.candidate_profile import CandidateProfile
from app.domain.entities.job import Accommodation, Job, JobStatus, Preferences
from app.domain.entities.match import Match


def _mock_candidate(user_id: str = "candidate-1", matchable: bool = True) -> CandidateProfile:
    return CandidateProfile(
        user_id=user_id,
        neuro_vector=NeuroVector24D(attention=0.8, memory=0.7, creative_thinking=0.9),
        accommodations_needed=[Accommodation(name="quiet room")],
        preferences=Preferences(),
        assessment_completed=matchable,
    )


def _mock_job(job_id: str = "job-1", active: bool = True) -> Job:
    return Job(
        id=job_id,
        company_id="company-1",
        title="Developer",
        status=JobStatus.ACTIVE if active else JobStatus.DRAFT,
        ideal_vector=NeuroVector24D(attention=0.75, memory=0.65, creative_thinking=0.85),
        accommodations_offered=[Accommodation(name="quiet room")],
        preferences=Preferences(),
    )


@pytest.fixture
def repos():
    candidate_repo = AsyncMock()
    job_repo = AsyncMock()
    match_repo = AsyncMock()
    match_repo.find_existing = AsyncMock(return_value=None)
    match_repo.create = AsyncMock(side_effect=lambda m: m)
    return candidate_repo, job_repo, match_repo


class TestCalculateMatchUseCase:
    @pytest.mark.asyncio
    async def test_successful_match(self, repos):
        candidate_repo, job_repo, match_repo = repos
        candidate_repo.find_by_user_id = AsyncMock(return_value=_mock_candidate())
        job_repo.find_by_id = AsyncMock(return_value=_mock_job())

        use_case = CalculateMatchUseCase(candidate_repo, job_repo, match_repo)
        dto = CalculateMatchDTO(candidate_id="candidate-1", job_id="job-1")

        result = await use_case.execute(dto)

        assert result.candidate_id == "candidate-1"
        assert result.job_id == "job-1"
        assert result.total_score > 0
        assert result.vector_score > 0
        match_repo.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_candidate_not_found_raises(self, repos):
        candidate_repo, job_repo, match_repo = repos
        candidate_repo.find_by_user_id = AsyncMock(return_value=None)

        use_case = CalculateMatchUseCase(candidate_repo, job_repo, match_repo)
        dto = CalculateMatchDTO(candidate_id="nonexistent", job_id="job-1")

        with pytest.raises(CandidateNotFoundError):
            await use_case.execute(dto)

    @pytest.mark.asyncio
    async def test_candidate_not_matchable_raises(self, repos):
        candidate_repo, job_repo, match_repo = repos
        candidate_repo.find_by_user_id = AsyncMock(
            return_value=_mock_candidate(matchable=False)
        )

        use_case = CalculateMatchUseCase(candidate_repo, job_repo, match_repo)
        dto = CalculateMatchDTO(candidate_id="candidate-1", job_id="job-1")

        with pytest.raises(CandidateNotMatchableError):
            await use_case.execute(dto)

    @pytest.mark.asyncio
    async def test_job_not_found_raises(self, repos):
        candidate_repo, job_repo, match_repo = repos
        candidate_repo.find_by_user_id = AsyncMock(return_value=_mock_candidate())
        job_repo.find_by_id = AsyncMock(return_value=None)

        use_case = CalculateMatchUseCase(candidate_repo, job_repo, match_repo)
        dto = CalculateMatchDTO(candidate_id="candidate-1", job_id="nonexistent")

        with pytest.raises(JobNotFoundError):
            await use_case.execute(dto)

    @pytest.mark.asyncio
    async def test_inactive_job_raises(self, repos):
        candidate_repo, job_repo, match_repo = repos
        candidate_repo.find_by_user_id = AsyncMock(return_value=_mock_candidate())
        job_repo.find_by_id = AsyncMock(return_value=_mock_job(active=False))

        use_case = CalculateMatchUseCase(candidate_repo, job_repo, match_repo)
        dto = CalculateMatchDTO(candidate_id="candidate-1", job_id="job-1")

        with pytest.raises(JobNotActiveError):
            await use_case.execute(dto)

    @pytest.mark.asyncio
    async def test_with_therapist_assessment(self, repos):
        candidate_repo, job_repo, match_repo = repos
        candidate_repo.find_by_user_id = AsyncMock(return_value=_mock_candidate())
        job_repo.find_by_id = AsyncMock(return_value=_mock_job())

        use_case = CalculateMatchUseCase(candidate_repo, job_repo, match_repo)
        dto = CalculateMatchDTO(
            candidate_id="candidate-1",
            job_id="job-1",
            therapist_id="therapist-1",
            therapist_score=0.9,
            therapist_notes="Great fit",
        )

        result = await use_case.execute(dto)

        assert result.therapist_id == "therapist-1"
        assert result.therapist_score == pytest.approx(0.9, abs=0.01)

    @pytest.mark.asyncio
    async def test_updates_existing_match(self, repos):
        candidate_repo, job_repo, match_repo = repos
        candidate_repo.find_by_user_id = AsyncMock(return_value=_mock_candidate())
        job_repo.find_by_id = AsyncMock(return_value=_mock_job())
        existing_match = Match(candidate_id="candidate-1", job_id="job-1")
        match_repo.find_existing = AsyncMock(return_value=existing_match)
        match_repo.update = AsyncMock(side_effect=lambda m: m)

        use_case = CalculateMatchUseCase(candidate_repo, job_repo, match_repo)
        dto = CalculateMatchDTO(candidate_id="candidate-1", job_id="job-1")

        result = await use_case.execute(dto)

        match_repo.update.assert_called_once()
        match_repo.create.assert_not_called()
