"""Unit tests for CreateProfileUseCase."""

from unittest.mock import AsyncMock

import pytest

from app.application.dto.profile_dto import CreateProfileDTO
from app.application.use_cases.create_profile import (
    CreateProfileUseCase,
    DuplicateProfileError,
)
from app.domain.entities.profile import ProfileStatus, UserProfile


@pytest.fixture
def profile_repo():
    repo = AsyncMock()
    repo.find_by_user_id = AsyncMock(return_value=None)
    repo.create = AsyncMock(side_effect=lambda p: p)
    return repo


class TestCreateProfileUseCase:
    @pytest.mark.asyncio
    async def test_successful_creation(self, profile_repo):
        use_case = CreateProfileUseCase(profile_repo)
        dto = CreateProfileDTO(
            user_id="user-1", role="candidate", display_name="Ana"
        )
        result = await use_case.execute(dto)

        assert result.user_id == "user-1"
        assert result.role == "candidate"
        assert result.display_name == "Ana"
        assert result.status == "incomplete"
        assert not result.has_neuro_vector
        profile_repo.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_duplicate_profile_raises(self, profile_repo):
        profile_repo.find_by_user_id = AsyncMock(
            return_value=UserProfile(user_id="user-1")
        )
        use_case = CreateProfileUseCase(profile_repo)
        dto = CreateProfileDTO(user_id="user-1", role="candidate")

        with pytest.raises(DuplicateProfileError):
            await use_case.execute(dto)

    @pytest.mark.asyncio
    async def test_create_company_profile(self, profile_repo):
        use_case = CreateProfileUseCase(profile_repo)
        dto = CreateProfileDTO(user_id="user-2", role="company", display_name="Corp")
        result = await use_case.execute(dto)
        assert result.role == "company"

    @pytest.mark.asyncio
    async def test_create_therapist_profile(self, profile_repo):
        use_case = CreateProfileUseCase(profile_repo)
        dto = CreateProfileDTO(user_id="user-3", role="therapist")
        result = await use_case.execute(dto)
        assert result.role == "therapist"
