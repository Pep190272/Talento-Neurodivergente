"""Repository port for Message entities."""

from __future__ import annotations

from abc import ABC, abstractmethod

from ..entities.message import Message


class IMessageRepository(ABC):

    @abstractmethod
    async def find_by_id(self, message_id: str) -> Message | None: ...

    @abstractmethod
    async def find_by_conversation(
        self, conversation_id: str, limit: int = 50, offset: int = 0
    ) -> list[Message]: ...

    @abstractmethod
    async def create(self, message: Message) -> Message: ...

    @abstractmethod
    async def update(self, message: Message) -> Message: ...

    @abstractmethod
    async def count_unread(self, conversation_id: str, user_id: str) -> int: ...

    @abstractmethod
    async def count_user_messages_since(
        self, user_id: str, since: str
    ) -> int: ...
