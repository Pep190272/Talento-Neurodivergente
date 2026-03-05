"""Repository port for CandidateProfile in matching context."""

from __future__ import annotations

from abc import ABC, abstractmethod

from ..entities.candidate_profile import CandidateProfile


class ICandidateRepository(ABC):

    @abstractmethod
    async def find_by_user_id(self, user_id: str) -> CandidateProfile | None: ...

    @abstractmethod
    async def find_matchable(self, limit: int = 100) -> list[CandidateProfile]: ...

    @abstractmethod
    async def upsert(self, profile: CandidateProfile) -> CandidateProfile: ...
