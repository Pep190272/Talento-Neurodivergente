"""Unit tests for ApplyToJobUseCase."""

from unittest.mock import AsyncMock

import pytest

from app.application.use_cases.apply_to_job import (
    ApplyToJobDTO,
    ApplyToJobUseCase,
    ConsentRequiredError,
    ProfileNotActiveError,
)
from app.domain.entities.profile import (
    ProfileNotFoundError,
    ProfileStatus,
    UserProfile,
)
from shared.domain import NeuroVector24D, UserRole


def _active_profile() -> UserProfile:
    p = UserProfile(user_id="user-1", role=UserRole.CANDIDATE, display_name="Ana")
    p.status = ProfileStatus.ACTIVE
    p.neuro_vector = NeuroVector24D()
    return p


def _incomplete_profile() -> UserProfile:
    return UserProfile(user_id="user-1", role=UserRole.CANDIDATE)


@pytest.fixture
def profile_repo():
    repo = AsyncMock()
    repo.find_by_user_id = AsyncMock(return_value=_active_profile())
    return repo


class TestApplyToJobUseCase:
    @pytest.mark.asyncio
    async def test_successful_application(self, profile_repo):
        uc = ApplyToJobUseCase(profile_repo)
        dto = ApplyToJobDTO(
            user_id="user-1",
            job_id="job-123",
            consent_given=True,
            consent_text="I consent to share my profile",
        )
        result = await uc.execute(dto)

        assert result.user_id == "user-1"
        assert result.job_id == "job-123"
        assert result.status == "pending"
        assert result.consent_recorded is True
        assert result.applied_at is not None

    @pytest.mark.asyncio
    async def test_no_consent_raises(self, profile_repo):
        uc = ApplyToJobUseCase(profile_repo)
        dto = ApplyToJobDTO(user_id="user-1", job_id="job-123", consent_given=False)

        with pytest.raises(ConsentRequiredError):
            await uc.execute(dto)

    @pytest.mark.asyncio
    async def test_profile_not_found_raises(self, profile_repo):
        profile_repo.find_by_user_id = AsyncMock(return_value=None)
        uc = ApplyToJobUseCase(profile_repo)
        dto = ApplyToJobDTO(user_id="ghost", job_id="job-1", consent_given=True)

        with pytest.raises(ProfileNotFoundError):
            await uc.execute(dto)

    @pytest.mark.asyncio
    async def test_incomplete_profile_raises(self, profile_repo):
        profile_repo.find_by_user_id = AsyncMock(return_value=_incomplete_profile())
        uc = ApplyToJobUseCase(profile_repo)
        dto = ApplyToJobDTO(user_id="user-1", job_id="job-1", consent_given=True)

        with pytest.raises(ProfileNotActiveError):
            await uc.execute(dto)
