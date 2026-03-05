"""Repository port for TherapistProfile entities."""

from __future__ import annotations

from abc import ABC, abstractmethod

from ..entities.therapist_profile import TherapistProfile


class ITherapistRepository(ABC):

    @abstractmethod
    async def find_by_user_id(self, user_id: str) -> TherapistProfile | None: ...

    @abstractmethod
    async def create(self, profile: TherapistProfile) -> TherapistProfile: ...

    @abstractmethod
    async def update(self, profile: TherapistProfile) -> TherapistProfile: ...

    @abstractmethod
    async def find_pending_verification(self) -> list[TherapistProfile]: ...
