"""SQLAlchemy implementation of ICandidateRepository."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.candidate_profile import CandidateProfile
from app.domain.repositories.i_candidate_repository import ICandidateRepository
from .models import CandidateModel


class SQLAlchemyCandidateRepository(ICandidateRepository):

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def find_by_user_id(self, user_id: str) -> CandidateProfile | None:
        result = await self._session.execute(
            select(CandidateModel).where(CandidateModel.user_id == user_id)
        )
        model = result.scalar_one_or_none()
        return model.to_entity() if model else None

    async def find_matchable(self, limit: int = 100) -> list[CandidateProfile]:
        result = await self._session.execute(
            select(CandidateModel)
            .where(CandidateModel.assessment_completed == True)
            .limit(limit)
        )
        return [m.to_entity() for m in result.scalars()]

    async def upsert(self, profile: CandidateProfile) -> CandidateProfile:
        result = await self._session.execute(
            select(CandidateModel).where(CandidateModel.user_id == profile.user_id)
        )
        existing = result.scalar_one_or_none()

        if existing:
            from shared.domain.value_objects import ALL_DIMENSIONS
            existing.neuro_vector = {dim: getattr(profile.neuro_vector, dim) for dim in ALL_DIMENSIONS}
            existing.accommodations = [{"name": a.name} for a in profile.accommodations_needed]
            existing.assessment_completed = profile.assessment_completed
            existing.updated_at = profile.updated_at
            await self._session.flush()
            return existing.to_entity()

        model = CandidateModel.from_entity(profile)
        self._session.add(model)
        await self._session.flush()
        return model.to_entity()
