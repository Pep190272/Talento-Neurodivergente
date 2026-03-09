"""Unit tests for DeleteAccountUseCase."""

from unittest.mock import AsyncMock

import pytest

from app.application.use_cases.delete_account import (
    DeleteAccountDTO,
    DeleteAccountUseCase,
    DeletionNotConfirmedError,
)
from app.domain.entities.profile import (
    ProfileNotFoundError,
    ProfileStatus,
    UserProfile,
)
from app.domain.entities.assessment import Assessment
from shared.domain import NeuroVector24D, UserRole


def _active_profile() -> UserProfile:
    p = UserProfile(user_id="user-1", role=UserRole.CANDIDATE, display_name="Ana")
    p.status = ProfileStatus.ACTIVE
    p.neuro_vector = NeuroVector24D()
    return p


@pytest.fixture
def profile_repo():
    repo = AsyncMock()
    repo.find_by_user_id = AsyncMock(return_value=_active_profile())
    repo.update = AsyncMock(side_effect=lambda p: p)
    return repo


@pytest.fixture
def assessment_repo():
    repo = AsyncMock()
    repo.find_active_by_user = AsyncMock(return_value=Assessment(user_id="user-1"))
    return repo


class TestDeleteAccountUseCase:
    @pytest.mark.asyncio
    async def test_successful_deletion(self, profile_repo, assessment_repo):
        uc = DeleteAccountUseCase(profile_repo, assessment_repo)
        dto = DeleteAccountDTO(user_id="user-1", confirmation=True, reason="Moving abroad")
        result = await uc.execute(dto)

        assert result.user_id == "user-1"
        assert result.status == "deleted"
        assert "profile_data" in result.data_deleted
        assert "neuro_vector_24d" in result.data_deleted
        assert "Art. 17" in result.gdpr_articles
        assert "retained" in result.retention_note.lower()
        profile_repo.update.assert_called_once()

    @pytest.mark.asyncio
    async def test_no_confirmation_raises(self, profile_repo, assessment_repo):
        uc = DeleteAccountUseCase(profile_repo, assessment_repo)
        dto = DeleteAccountDTO(user_id="user-1", confirmation=False)

        with pytest.raises(DeletionNotConfirmedError):
            await uc.execute(dto)

    @pytest.mark.asyncio
    async def test_profile_not_found_raises(self, profile_repo, assessment_repo):
        profile_repo.find_by_user_id = AsyncMock(return_value=None)
        uc = DeleteAccountUseCase(profile_repo, assessment_repo)
        dto = DeleteAccountDTO(user_id="ghost", confirmation=True)

        with pytest.raises(ProfileNotFoundError):
            await uc.execute(dto)

    @pytest.mark.asyncio
    async def test_deletion_without_assessment(self, profile_repo, assessment_repo):
        assessment_repo.find_active_by_user = AsyncMock(return_value=None)
        uc = DeleteAccountUseCase(profile_repo, assessment_repo)
        dto = DeleteAccountDTO(user_id="user-1", confirmation=True)
        result = await uc.execute(dto)

        assert "assessment_answers" not in result.data_deleted
        assert "profile_data" in result.data_deleted
