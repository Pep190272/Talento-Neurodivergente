"""Repository port for Match entities."""

from __future__ import annotations

from abc import ABC, abstractmethod

from ..entities.match import Match


class IMatchRepository(ABC):

    @abstractmethod
    async def create(self, match: Match) -> Match: ...

    @abstractmethod
    async def find_by_id(self, match_id: str) -> Match | None: ...

    @abstractmethod
    async def find_by_candidate(self, candidate_id: str, limit: int = 20) -> list[Match]: ...

    @abstractmethod
    async def find_by_job(self, job_id: str, limit: int = 20) -> list[Match]: ...

    @abstractmethod
    async def update(self, match: Match) -> Match: ...

    @abstractmethod
    async def find_existing(self, candidate_id: str, job_id: str) -> Match | None: ...
