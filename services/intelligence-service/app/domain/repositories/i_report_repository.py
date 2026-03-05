"""Repository port for TalentReport entities."""

from __future__ import annotations

from abc import ABC, abstractmethod

from ..entities.talent_report import TalentReport


class IReportRepository(ABC):

    @abstractmethod
    async def create(self, report: TalentReport) -> TalentReport: ...

    @abstractmethod
    async def find_by_id(self, report_id: str) -> TalentReport | None: ...

    @abstractmethod
    async def find_by_candidate(self, candidate_id: str, limit: int = 10) -> list[TalentReport]: ...

    @abstractmethod
    async def update(self, report: TalentReport) -> TalentReport: ...
