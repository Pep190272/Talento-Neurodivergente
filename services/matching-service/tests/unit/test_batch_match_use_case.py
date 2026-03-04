"""Unit tests for BatchMatchForJobUseCase."""

from __future__ import annotations

from unittest.mock import AsyncMock

import pytest

from shared.domain import NeuroVector24D

from app.application.use_cases.batch_match import BatchMatchForJobUseCase
from app.domain.entities.candidate_profile import CandidateProfile
from app.domain.entities.job import Accommodation, Job, JobStatus, Preferences


def _make_candidate(user_id: str, attention: float = 0.8) -> CandidateProfile:
    return CandidateProfile(
        user_id=user_id,
        neuro_vector=NeuroVector24D(attention=attention, memory=0.7),
        accommodations_needed=[Accommodation(name="quiet space")],
        preferences=Preferences(),
        assessment_completed=True,
    )


def _make_job(title: str = "Dev") -> Job:
    job = Job(
        company_id="company-1",
        title=title,
        ideal_vector=NeuroVector24D(attention=0.9, memory=0.8),
        accommodations_offered=[Accommodation(name="quiet space")],
        preferences=Preferences(),
    )
    job.activate()
    return job


@pytest.fixture
def candidate_repo() -> AsyncMock:
    return AsyncMock()


@pytest.fixture
def job_repo() -> AsyncMock:
    return AsyncMock()


@pytest.fixture
def match_repo() -> AsyncMock:
    repo = AsyncMock()
    repo.create = AsyncMock(side_effect=lambda m: m)
    return repo


@pytest.fixture
def use_case(candidate_repo, job_repo, match_repo) -> BatchMatchForJobUseCase:
    return BatchMatchForJobUseCase(candidate_repo, job_repo, match_repo)


class TestBatchMatch:
    async def test_no_job_returns_empty(self, use_case, job_repo):
        job_repo.find_by_id.return_value = None
        results = await use_case.execute("nonexistent")
        assert results == []

    async def test_inactive_job_returns_empty(self, use_case, job_repo):
        job = Job(company_id="c1", title="Closed")
        job_repo.find_by_id.return_value = job
        results = await use_case.execute(job.id)
        assert results == []

    async def test_matches_all_candidates(self, use_case, candidate_repo, job_repo, match_repo):
        candidates = [_make_candidate(f"user-{i}") for i in range(3)]
        candidate_repo.find_matchable.return_value = candidates
        job_repo.find_by_id.return_value = _make_job()

        results = await use_case.execute("job-1")

        assert len(results) == 3
        assert match_repo.create.call_count == 3

    async def test_results_sorted_by_score(self, use_case, candidate_repo, job_repo, match_repo):
        candidates = [
            _make_candidate("user-low", attention=0.1),
            _make_candidate("user-high", attention=0.95),
            _make_candidate("user-mid", attention=0.5),
        ]
        candidate_repo.find_matchable.return_value = candidates
        job_repo.find_by_id.return_value = _make_job()

        results = await use_case.execute("job-1")

        scores = [r.total_score for r in results]
        assert scores == sorted(scores, reverse=True)

    async def test_empty_candidate_pool(self, use_case, candidate_repo, job_repo):
        candidate_repo.find_matchable.return_value = []
        job_repo.find_by_id.return_value = _make_job()

        results = await use_case.execute("job-1")
        assert results == []
