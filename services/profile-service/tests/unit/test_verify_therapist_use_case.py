"""Unit tests for VerifyTherapistUseCase."""

from unittest.mock import AsyncMock

import pytest

from app.application.use_cases.verify_therapist import (
    AlreadyVerifiedError,
    InvalidDecisionError,
    TherapistNotFoundError,
    VerifyTherapistDTO,
    VerifyTherapistUseCase,
)
from app.domain.entities.therapist_profile import TherapistProfile, VerificationStatus


def _pending_therapist() -> TherapistProfile:
    return TherapistProfile(
        user_id="therapist-1",
        specialty="ADHD",
        license_number="PSY-12345",
        support_areas=["adhd", "autism"],
        verification_status=VerificationStatus.PENDING,
    )


def _verified_therapist() -> TherapistProfile:
    t = _pending_therapist()
    t.verification_status = VerificationStatus.VERIFIED
    return t


@pytest.fixture
def therapist_repo():
    repo = AsyncMock()
    repo.find_by_user_id = AsyncMock(return_value=_pending_therapist())
    repo.update = AsyncMock(side_effect=lambda t: t)
    repo.find_pending_verification = AsyncMock(return_value=[_pending_therapist()])
    return repo


class TestVerifyTherapistUseCase:
    @pytest.mark.asyncio
    async def test_approve_therapist(self, therapist_repo):
        uc = VerifyTherapistUseCase(therapist_repo)
        dto = VerifyTherapistDTO(
            therapist_user_id="therapist-1",
            admin_user_id="admin-1",
            decision="approve",
            notes="Credentials verified via PSY registry",
        )
        result = await uc.execute(dto)

        assert result.verification_status == VerificationStatus.VERIFIED
        assert result.verified_by == "admin-1"
        assert result.decision_notes == "Credentials verified via PSY registry"
        therapist_repo.update.assert_called_once()

    @pytest.mark.asyncio
    async def test_reject_therapist(self, therapist_repo):
        uc = VerifyTherapistUseCase(therapist_repo)
        dto = VerifyTherapistDTO(
            therapist_user_id="therapist-1",
            admin_user_id="admin-1",
            decision="reject",
            notes="License expired",
        )
        result = await uc.execute(dto)

        assert result.verification_status == VerificationStatus.REJECTED

    @pytest.mark.asyncio
    async def test_therapist_not_found_raises(self, therapist_repo):
        therapist_repo.find_by_user_id = AsyncMock(return_value=None)
        uc = VerifyTherapistUseCase(therapist_repo)
        dto = VerifyTherapistDTO(
            therapist_user_id="ghost",
            admin_user_id="admin-1",
            decision="approve",
        )

        with pytest.raises(TherapistNotFoundError):
            await uc.execute(dto)

    @pytest.mark.asyncio
    async def test_already_verified_raises(self, therapist_repo):
        therapist_repo.find_by_user_id = AsyncMock(return_value=_verified_therapist())
        uc = VerifyTherapistUseCase(therapist_repo)
        dto = VerifyTherapistDTO(
            therapist_user_id="therapist-1",
            admin_user_id="admin-1",
            decision="approve",
        )

        with pytest.raises(AlreadyVerifiedError):
            await uc.execute(dto)

    @pytest.mark.asyncio
    async def test_invalid_decision_raises(self, therapist_repo):
        uc = VerifyTherapistUseCase(therapist_repo)
        dto = VerifyTherapistDTO(
            therapist_user_id="therapist-1",
            admin_user_id="admin-1",
            decision="maybe",
        )

        with pytest.raises(InvalidDecisionError):
            await uc.execute(dto)

    @pytest.mark.asyncio
    async def test_list_pending(self, therapist_repo):
        uc = VerifyTherapistUseCase(therapist_repo)
        pending = await uc.list_pending()

        assert len(pending) == 1
        assert pending[0]["user_id"] == "therapist-1"
        assert pending[0]["status"] == VerificationStatus.PENDING
