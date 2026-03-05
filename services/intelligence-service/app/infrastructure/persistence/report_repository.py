"""SQLAlchemy implementation of IReportRepository."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.talent_report import TalentReport
from app.domain.repositories.i_report_repository import IReportRepository
from .models import ReportModel


class SQLAlchemyReportRepository(IReportRepository):

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, report: TalentReport) -> TalentReport:
        model = ReportModel.from_entity(report)
        self._session.add(model)
        await self._session.flush()
        return model.to_entity()

    async def find_by_id(self, report_id: str) -> TalentReport | None:
        result = await self._session.execute(
            select(ReportModel).where(ReportModel.id == report_id)
        )
        model = result.scalar_one_or_none()
        return model.to_entity() if model else None

    async def find_by_candidate(self, candidate_id: str, limit: int = 10) -> list[TalentReport]:
        result = await self._session.execute(
            select(ReportModel)
            .where(ReportModel.candidate_id == candidate_id)
            .order_by(ReportModel.created_at.desc())
            .limit(limit)
        )
        return [m.to_entity() for m in result.scalars()]

    async def update(self, report: TalentReport) -> TalentReport:
        result = await self._session.execute(
            select(ReportModel).where(ReportModel.id == report.id)
        )
        model = result.scalar_one_or_none()
        if model is None:
            raise ValueError(f"Report {report.id} not found")

        model.status = report.status.value
        model.content = report.content
        model.prompt_used = report.prompt_used
        model.model_name = report.model_name
        model.tokens_used = report.tokens_used
        model.updated_at = report.updated_at
        await self._session.flush()
        return model.to_entity()
