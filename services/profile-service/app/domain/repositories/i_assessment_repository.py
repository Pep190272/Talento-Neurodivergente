"""Repository port for Assessment entities."""

from __future__ import annotations

from abc import ABC, abstractmethod

from ..entities.assessment import Assessment


class IAssessmentRepository(ABC):

    @abstractmethod
    async def find_by_id(self, assessment_id: str) -> Assessment | None: ...

    @abstractmethod
    async def find_active_by_user(self, user_id: str) -> Assessment | None: ...

    @abstractmethod
    async def create(self, assessment: Assessment) -> Assessment: ...

    @abstractmethod
    async def update(self, assessment: Assessment) -> Assessment: ...
