"""Repository port for Job entities."""

from __future__ import annotations

from abc import ABC, abstractmethod

from ..entities.job import Job


class IJobRepository(ABC):

    @abstractmethod
    async def find_by_id(self, job_id: str) -> Job | None: ...

    @abstractmethod
    async def find_active_jobs(self, limit: int = 100) -> list[Job]: ...

    @abstractmethod
    async def create(self, job: Job) -> Job: ...

    @abstractmethod
    async def update(self, job: Job) -> Job: ...
