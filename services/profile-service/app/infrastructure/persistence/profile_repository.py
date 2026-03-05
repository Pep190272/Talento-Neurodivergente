"""SQLAlchemy implementation of IProfileRepository."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.profile import UserProfile
from app.domain.repositories.i_profile_repository import IProfileRepository
from .models import ProfileModel


class SQLAlchemyProfileRepository(IProfileRepository):

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def find_by_user_id(self, user_id: str) -> UserProfile | None:
        result = await self._session.execute(
            select(ProfileModel).where(ProfileModel.user_id == user_id)
        )
        model = result.scalar_one_or_none()
        return model.to_entity() if model else None

    async def find_by_id(self, profile_id: str) -> UserProfile | None:
        result = await self._session.execute(
            select(ProfileModel).where(ProfileModel.id == profile_id)
        )
        model = result.scalar_one_or_none()
        return model.to_entity() if model else None

    async def create(self, profile: UserProfile) -> UserProfile:
        model = ProfileModel.from_entity(profile)
        self._session.add(model)
        await self._session.flush()
        return model.to_entity()

    async def update(self, profile: UserProfile) -> UserProfile:
        result = await self._session.execute(
            select(ProfileModel).where(ProfileModel.id == profile.id)
        )
        model = result.scalar_one_or_none()
        if model is None:
            raise ValueError(f"Profile {profile.id} not found")

        model.display_name = profile.display_name
        model.bio = profile.bio
        model.status = profile.status.value
        model.onboarding_completed = profile.onboarding_completed
        model.updated_at = profile.updated_at

        if profile.neuro_vector:
            from shared.domain.value_objects import ALL_DIMENSIONS
            for dim in ALL_DIMENSIONS:
                setattr(model, dim, getattr(profile.neuro_vector, dim))

        await self._session.flush()
        return model.to_entity()
