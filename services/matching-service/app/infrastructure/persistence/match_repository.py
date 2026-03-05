"""SQLAlchemy implementation of IMatchRepository."""

from __future__ import annotations

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.match import Match
from app.domain.repositories.i_match_repository import IMatchRepository
from .models import MatchModel


class SQLAlchemyMatchRepository(IMatchRepository):

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, match: Match) -> Match:
        model = MatchModel.from_entity(match)
        self._session.add(model)
        await self._session.flush()
        return model.to_entity()

    async def find_by_id(self, match_id: str) -> Match | None:
        result = await self._session.execute(
            select(MatchModel).where(MatchModel.id == match_id)
        )
        model = result.scalar_one_or_none()
        return model.to_entity() if model else None

    async def find_by_candidate(self, candidate_id: str, limit: int = 20) -> list[Match]:
        result = await self._session.execute(
            select(MatchModel)
            .where(MatchModel.candidate_id == candidate_id)
            .order_by(MatchModel.score.desc())
            .limit(limit)
        )
        return [m.to_entity() for m in result.scalars()]

    async def find_by_job(self, job_id: str, limit: int = 20) -> list[Match]:
        result = await self._session.execute(
            select(MatchModel)
            .where(MatchModel.job_id == job_id)
            .order_by(MatchModel.score.desc())
            .limit(limit)
        )
        return [m.to_entity() for m in result.scalars()]

    async def update(self, match: Match) -> Match:
        result = await self._session.execute(
            select(MatchModel).where(MatchModel.id == match.id)
        )
        model = result.scalar_one_or_none()
        if model is None:
            raise ValueError(f"Match {match.id} not found")

        model.score = match.score.value
        model.breakdown = {
            "vector_score": match.breakdown.vector_score,
            "accommodation_score": match.breakdown.accommodation_score,
            "therapist_score": match.breakdown.therapist_score,
            "preferences_score": match.breakdown.preferences_score,
        }
        model.therapist_id = match.therapist_id
        model.status = match.status.value
        model.updated_at = match.updated_at
        await self._session.flush()
        return model.to_entity()

    async def find_existing(self, candidate_id: str, job_id: str) -> Match | None:
        result = await self._session.execute(
            select(MatchModel).where(
                and_(MatchModel.candidate_id == candidate_id, MatchModel.job_id == job_id)
            )
        )
        model = result.scalar_one_or_none()
        return model.to_entity() if model else None
