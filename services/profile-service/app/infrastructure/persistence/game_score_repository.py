"""SQLAlchemy implementation of game score repository."""

from __future__ import annotations

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from .models import GameScoreModel


class SQLAlchemyGameScoreRepository:

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def save(self, model: GameScoreModel) -> GameScoreModel:
        self._session.add(model)
        await self._session.flush()
        return model

    async def get_best_scores(self, user_id: str) -> dict[str, dict]:
        """Get best score and play count per game for a user."""
        result = await self._session.execute(
            select(
                GameScoreModel.game,
                func.max(GameScoreModel.score).label("best_score"),
                func.count().label("plays"),
            )
            .where(GameScoreModel.user_id == user_id)
            .group_by(GameScoreModel.game)
        )
        return {
            row.game: {"best": row.best_score, "plays": row.plays}
            for row in result.all()
        }
