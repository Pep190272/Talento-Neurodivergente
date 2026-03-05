"""SQLAlchemy implementation of IJobRepository."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.job import Job, JobStatus
from app.domain.repositories.i_job_repository import IJobRepository
from .models import JobModel


class SQLAlchemyJobRepository(IJobRepository):

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def find_by_id(self, job_id: str) -> Job | None:
        result = await self._session.execute(
            select(JobModel).where(JobModel.id == job_id)
        )
        model = result.scalar_one_or_none()
        return model.to_entity() if model else None

    async def find_active_jobs(self, limit: int = 100) -> list[Job]:
        result = await self._session.execute(
            select(JobModel)
            .where(JobModel.status == JobStatus.ACTIVE.value)
            .limit(limit)
        )
        return [m.to_entity() for m in result.scalars()]

    async def create(self, job: Job) -> Job:
        model = JobModel.from_entity(job)
        self._session.add(model)
        await self._session.flush()
        return model.to_entity()

    async def update(self, job: Job) -> Job:
        result = await self._session.execute(
            select(JobModel).where(JobModel.id == job.id)
        )
        model = result.scalar_one_or_none()
        if model is None:
            raise ValueError(f"Job {job.id} not found")

        from shared.domain.value_objects import ALL_DIMENSIONS
        model.title = job.title
        model.description = job.description
        model.status = job.status.value
        model.ideal_vector = {dim: getattr(job.ideal_vector, dim) for dim in ALL_DIMENSIONS}
        model.accommodations = [{"name": a.name, "category": a.category} for a in job.accommodations_offered]
        model.preferences = {
            "work_mode": job.preferences.work_mode.value,
            "max_hours_per_week": job.preferences.max_hours_per_week,
            "min_hours_per_week": job.preferences.min_hours_per_week,
            "team_size_min": job.preferences.team_size_min,
            "team_size_max": job.preferences.team_size_max,
        }
        model.updated_at = job.updated_at
        await self._session.flush()
        return model.to_entity()
