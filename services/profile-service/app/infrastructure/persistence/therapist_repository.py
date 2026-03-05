"""SQLAlchemy implementation of ITherapistRepository."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.therapist_profile import TherapistProfile, VerificationStatus
from app.domain.repositories.i_therapist_repository import ITherapistRepository
from .models import TherapistModel


class SQLAlchemyTherapistRepository(ITherapistRepository):

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def find_by_user_id(self, user_id: str) -> TherapistProfile | None:
        result = await self._session.execute(
            select(TherapistModel).where(TherapistModel.user_id == user_id)
        )
        model = result.scalar_one_or_none()
        return model.to_entity() if model else None

    async def create(self, profile: TherapistProfile) -> TherapistProfile:
        model = TherapistModel.from_entity(profile)
        self._session.add(model)
        await self._session.flush()
        return model.to_entity()

    async def update(self, profile: TherapistProfile) -> TherapistProfile:
        result = await self._session.execute(
            select(TherapistModel).where(TherapistModel.id == profile.id)
        )
        model = result.scalar_one_or_none()
        if model is None:
            raise ValueError(f"Therapist {profile.id} not found")

        model.specialty = profile.specialty
        model.bio = profile.bio
        model.support_areas = profile.support_areas
        model.license_number = profile.license_number
        model.verification_status = profile.verification_status
        model.updated_at = profile.updated_at

        await self._session.flush()
        return model.to_entity()

    async def find_pending_verification(self) -> list[TherapistProfile]:
        result = await self._session.execute(
            select(TherapistModel).where(
                TherapistModel.verification_status == VerificationStatus.PENDING
            )
        )
        return [m.to_entity() for m in result.scalars()]
