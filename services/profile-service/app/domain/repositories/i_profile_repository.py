"""Repository port for UserProfile entities."""

from __future__ import annotations

from abc import ABC, abstractmethod

from ..entities.profile import UserProfile


class IProfileRepository(ABC):

    @abstractmethod
    async def find_by_user_id(self, user_id: str) -> UserProfile | None: ...

    @abstractmethod
    async def find_by_id(self, profile_id: str) -> UserProfile | None: ...

    @abstractmethod
    async def create(self, profile: UserProfile) -> UserProfile: ...

    @abstractmethod
    async def update(self, profile: UserProfile) -> UserProfile: ...
