"""Repository port for Conversation entities."""

from __future__ import annotations

from abc import ABC, abstractmethod

from ..entities.conversation import Conversation


class IConversationRepository(ABC):

    @abstractmethod
    async def find_by_id(self, conversation_id: str) -> Conversation | None: ...

    @abstractmethod
    async def find_by_participants(
        self, user_a: str, user_b: str
    ) -> Conversation | None: ...

    @abstractmethod
    async def find_by_user(self, user_id: str) -> list[Conversation]: ...

    @abstractmethod
    async def create(self, conversation: Conversation) -> Conversation: ...

    @abstractmethod
    async def update(self, conversation: Conversation) -> Conversation: ...
