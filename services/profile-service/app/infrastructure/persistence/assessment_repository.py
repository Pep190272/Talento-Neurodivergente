"""SQLAlchemy implementation of IAssessmentRepository."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.assessment import Assessment, AssessmentStatus
from app.domain.repositories.i_assessment_repository import IAssessmentRepository
from .models import AssessmentModel


class SQLAlchemyAssessmentRepository(IAssessmentRepository):

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def find_by_id(self, assessment_id: str) -> Assessment | None:
        result = await self._session.execute(
            select(AssessmentModel).where(AssessmentModel.id == assessment_id)
        )
        model = result.scalar_one_or_none()
        return model.to_entity() if model else None

    async def find_active_by_user(self, user_id: str) -> Assessment | None:
        result = await self._session.execute(
            select(AssessmentModel).where(
                AssessmentModel.user_id == user_id,
                AssessmentModel.status == AssessmentStatus.IN_PROGRESS.value,
            )
        )
        model = result.scalar_one_or_none()
        return model.to_entity() if model else None

    async def create(self, assessment: Assessment) -> Assessment:
        model = AssessmentModel.from_entity(assessment)
        self._session.add(model)
        await self._session.flush()
        return model.to_entity()

    async def update(self, assessment: Assessment) -> Assessment:
        result = await self._session.execute(
            select(AssessmentModel).where(AssessmentModel.id == assessment.id)
        )
        model = result.scalar_one_or_none()
        if model is None:
            raise ValueError(f"Assessment {assessment.id} not found")

        from shared.domain.value_objects import ALL_DIMENSIONS

        model.status = assessment.status.value
        model.answers = [
            {"question_id": a.question_id, "dimension": a.dimension, "value": a.value}
            for a in assessment.answers
        ]
        model.completed_at = assessment.completed_at
        model.updated_at = assessment.updated_at

        if assessment.result_vector:
            model.result_vector = {
                dim: getattr(assessment.result_vector, dim)
                for dim in ALL_DIMENSIONS
            }

        await self._session.flush()
        return model.to_entity()
