"""SQLAlchemy implementation of job offer repository."""

from __future__ import annotations

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from .models import JobOfferModel, ProfileModel


class SQLAlchemyJobRepository:

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, model: JobOfferModel) -> JobOfferModel:
        self._session.add(model)
        await self._session.flush()
        return model

    async def find_by_id(self, job_id: str) -> JobOfferModel | None:
        result = await self._session.execute(
            select(JobOfferModel).where(JobOfferModel.id == job_id)
        )
        return result.scalar_one_or_none()

    async def find_active(self) -> list[JobOfferModel]:
        result = await self._session.execute(
            select(JobOfferModel)
            .where(JobOfferModel.status == "active")
            .order_by(JobOfferModel.created_at.desc())
        )
        return list(result.scalars().all())

    async def find_by_company(self, company_user_id: str) -> list[JobOfferModel]:
        result = await self._session.execute(
            select(JobOfferModel)
            .where(JobOfferModel.company_user_id == company_user_id)
            .order_by(JobOfferModel.created_at.desc())
        )
        return list(result.scalars().all())

    async def find_active_with_company_info(self) -> list[dict]:
        """Get active jobs joined with company profile info."""
        result = await self._session.execute(
            select(
                JobOfferModel,
                ProfileModel.display_name.label("company_name"),
                ProfileModel.bio.label("company_sector"),
            )
            .outerjoin(
                ProfileModel,
                JobOfferModel.company_user_id == ProfileModel.user_id,
            )
            .where(JobOfferModel.status == "active")
            .order_by(JobOfferModel.created_at.desc())
        )
        rows = []
        for job, company_name, company_sector in result.all():
            rows.append({
                "job": job,
                "company_name": company_name or "",
                "company_sector": company_sector or "",
            })
        return rows

    async def close(self, job_id: str, company_user_id: str) -> bool:
        job = await self.find_by_id(job_id)
        if job is None or job.company_user_id != company_user_id:
            return False
        job.status = "closed"
        await self._session.flush()
        return True
