"""Unit tests for RegisterTherapistUseCase."""

from __future__ import annotations

from unittest.mock import AsyncMock

import pytest

from app.application.dto.profile_dto import TherapistProfileDTO
from app.application.use_cases.register_therapist import (
    RegisterTherapistUseCase,
    TherapistAlreadyRegisteredError,
)
from app.domain.entities.therapist_profile import TherapistProfile


@pytest.fixture
def therapist_repo() -> AsyncMock:
    repo = AsyncMock()
    repo.find_by_user_id = AsyncMock(return_value=None)
    repo.create = AsyncMock(side_effect=lambda t: t)
    return repo


@pytest.fixture
def use_case(therapist_repo: AsyncMock) -> RegisterTherapistUseCase:
    return RegisterTherapistUseCase(therapist_repo)


class TestRegisterTherapist:
    async def test_successful_registration(self, use_case, therapist_repo):
        dto = TherapistProfileDTO(
            user_id="user-1",
            specialty="Neuropsychology",
            bio="Expert in ADHD",
            support_areas=["ADHD", "Autism"],
            license_number="PSY-12345",
        )
        result = await use_case.execute(dto)

        assert result.user_id == "user-1"
        assert result.specialty == "Neuropsychology"
        assert result.verification_status == "pending"
        assert "adhd" in result.support_areas
        assert "autism" in result.support_areas
        therapist_repo.create.assert_called_once()

    async def test_duplicate_registration_raises(self, use_case, therapist_repo):
        therapist_repo.find_by_user_id.return_value = TherapistProfile(user_id="user-1")

        dto = TherapistProfileDTO(
            user_id="user-1",
            specialty="Neuropsychology",
            bio="",
            support_areas=[],
        )

        with pytest.raises(TherapistAlreadyRegisteredError):
            await use_case.execute(dto)

        therapist_repo.create.assert_not_called()

    async def test_support_areas_normalized(self, use_case, therapist_repo):
        dto = TherapistProfileDTO(
            user_id="user-2",
            specialty="Clinical Psychology",
            bio="",
            support_areas=["ADHD Support", "Autism Coaching"],
        )
        result = await use_case.execute(dto)

        # TherapistProfile.add_support_area normalizes to lowercase
        assert "adhd support" in result.support_areas
        assert "autism coaching" in result.support_areas

    async def test_empty_support_areas(self, use_case, therapist_repo):
        dto = TherapistProfileDTO(
            user_id="user-3",
            specialty="Occupational Therapy",
            bio="Sensory integration specialist",
            support_areas=[],
        )
        result = await use_case.execute(dto)
        assert result.support_areas == []
