"""Use case: Register therapist professional profile."""

from __future__ import annotations

from ..dto.profile_dto import TherapistProfileDTO, TherapistResultDTO
from ...domain.entities.therapist_profile import TherapistProfile
from ...domain.repositories.i_therapist_repository import ITherapistRepository


class TherapistAlreadyRegisteredError(Exception):
    pass


class RegisterTherapistUseCase:
    def __init__(self, therapist_repo: ITherapistRepository) -> None:
        self._therapist_repo = therapist_repo

    async def execute(self, dto: TherapistProfileDTO) -> TherapistResultDTO:
        existing = await self._therapist_repo.find_by_user_id(dto.user_id)
        if existing:
            raise TherapistAlreadyRegisteredError(
                f"Therapist profile already exists for user '{dto.user_id}'"
            )

        profile = TherapistProfile(
            user_id=dto.user_id,
            specialty=dto.specialty,
            bio=dto.bio,
            license_number=dto.license_number,
        )
        for area in dto.support_areas:
            profile.add_support_area(area)

        saved = await self._therapist_repo.create(profile)

        return TherapistResultDTO(
            profile_id=saved.id,
            user_id=saved.user_id,
            specialty=saved.specialty,
            bio=saved.bio,
            support_areas=saved.support_areas,
            verification_status=saved.verification_status,
        )
