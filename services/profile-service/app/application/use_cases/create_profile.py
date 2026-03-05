"""Use case: Create a new user profile during onboarding."""

from __future__ import annotations

from shared.domain import UserRole

from ..dto.profile_dto import CreateProfileDTO, ProfileResultDTO
from ...domain.entities.profile import ProfileError, UserProfile
from ...domain.repositories.i_profile_repository import IProfileRepository


class DuplicateProfileError(ProfileError):
    pass


class CreateProfileUseCase:
    def __init__(self, profile_repo: IProfileRepository) -> None:
        self._profile_repo = profile_repo

    async def execute(self, dto: CreateProfileDTO) -> ProfileResultDTO:
        existing = await self._profile_repo.find_by_user_id(dto.user_id)
        if existing:
            raise DuplicateProfileError(
                f"Profile already exists for user '{dto.user_id}'"
            )

        profile = UserProfile(
            user_id=dto.user_id,
            role=UserRole(dto.role),
            display_name=dto.display_name,
            bio=dto.bio,
        )

        saved = await self._profile_repo.create(profile)
        return self._to_dto(saved)

    @staticmethod
    def _to_dto(profile: UserProfile) -> ProfileResultDTO:
        return ProfileResultDTO(
            profile_id=profile.id,
            user_id=profile.user_id,
            role=profile.role.value,
            display_name=profile.display_name,
            bio=profile.bio,
            status=profile.status.value,
            has_neuro_vector=profile.is_assessment_complete(),
            onboarding_completed=profile.onboarding_completed,
        )
