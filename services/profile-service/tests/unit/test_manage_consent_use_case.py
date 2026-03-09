"""Unit tests for ManageConsentUseCase."""

from unittest.mock import AsyncMock

import pytest

from app.application.use_cases.manage_consent import (
    ConsentDTO,
    ConsentType,
    InvalidConsentTypeError,
    ManageConsentUseCase,
)
from app.domain.entities.profile import ProfileNotFoundError, UserProfile
from shared.domain import UserRole


@pytest.fixture
def profile_repo():
    repo = AsyncMock()
    profile = UserProfile(user_id="user-1", role=UserRole.CANDIDATE, display_name="Ana")
    repo.find_by_user_id = AsyncMock(return_value=profile)
    return repo


class TestManageConsentUseCase:
    @pytest.mark.asyncio
    async def test_grant_consent(self, profile_repo):
        uc = ManageConsentUseCase(profile_repo)
        dto = ConsentDTO(
            user_id="user-1",
            consent_type="matching",
            action="grant",
            purpose="Include me in job matching",
        )
        result = await uc.execute(dto)

        assert result.user_id == "user-1"
        assert result.consent_type == "matching"
        assert result.granted is True

    @pytest.mark.asyncio
    async def test_revoke_consent(self, profile_repo):
        uc = ManageConsentUseCase(profile_repo)
        # First grant
        await uc.execute(ConsentDTO(user_id="user-1", consent_type="matching", action="grant"))
        # Then revoke
        result = await uc.execute(ConsentDTO(user_id="user-1", consent_type="matching", action="revoke"))

        assert result.granted is False

    @pytest.mark.asyncio
    async def test_get_status_defaults_false(self, profile_repo):
        uc = ManageConsentUseCase(profile_repo)
        status = await uc.get_status("user-1")

        assert status.user_id == "user-1"
        # All consents default to False (opt-in, GDPR compliant)
        for consent_type in ConsentType:
            assert status.consents[consent_type.value] is False

    @pytest.mark.asyncio
    async def test_has_consent_after_grant(self, profile_repo):
        uc = ManageConsentUseCase(profile_repo)
        await uc.execute(ConsentDTO(user_id="user-1", consent_type="ai_processing", action="grant"))

        assert await uc.has_consent("user-1", "ai_processing") is True
        assert await uc.has_consent("user-1", "marketing") is False

    @pytest.mark.asyncio
    async def test_invalid_consent_type_raises(self, profile_repo):
        uc = ManageConsentUseCase(profile_repo)
        dto = ConsentDTO(user_id="user-1", consent_type="invalid_type", action="grant")

        with pytest.raises(InvalidConsentTypeError):
            await uc.execute(dto)

    @pytest.mark.asyncio
    async def test_profile_not_found_raises(self, profile_repo):
        profile_repo.find_by_user_id = AsyncMock(return_value=None)
        uc = ManageConsentUseCase(profile_repo)
        dto = ConsentDTO(user_id="ghost", consent_type="matching", action="grant")

        with pytest.raises(ProfileNotFoundError):
            await uc.execute(dto)

    @pytest.mark.asyncio
    async def test_invalid_action_raises(self, profile_repo):
        uc = ManageConsentUseCase(profile_repo)
        dto = ConsentDTO(user_id="user-1", consent_type="matching", action="invalid")

        with pytest.raises(ValueError):
            await uc.execute(dto)
