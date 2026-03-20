"""Use case: Mark a message as read."""

from __future__ import annotations

from ..dto.message_dto import MarkReadDTO, MessageResultDTO
from ...domain.entities.conversation import ConversationError
from ...domain.entities.message import Message, MessageNotFoundError
from ...domain.repositories.i_conversation_repository import IConversationRepository
from ...domain.repositories.i_message_repository import IMessageRepository


class MarkMessageReadUseCase:
    def __init__(
        self,
        message_repo: IMessageRepository,
        conversation_repo: IConversationRepository,
    ) -> None:
        self._message_repo = message_repo
        self._conversation_repo = conversation_repo

    async def execute(self, dto: MarkReadDTO) -> MessageResultDTO:
        # 1. Find the message
        message = await self._message_repo.find_by_id(dto.message_id)
        if message is None:
            raise MessageNotFoundError(
                f"Message '{dto.message_id}' not found"
            )

        # 2. Verify user is a participant in the conversation
        conversation = await self._conversation_repo.find_by_id(
            message.conversation_id
        )
        if conversation is None or not conversation.involves(dto.user_id):
            raise ConversationError(
                "You are not a participant in this conversation"
            )

        # 3. Only the recipient can mark as read (not the sender)
        if message.is_from(dto.user_id):
            raise ConversationError(
                "Cannot mark your own message as read"
            )

        # 4. Mark as read
        message.mark_as_read()
        saved = await self._message_repo.update(message)

        return MessageResultDTO(
            id=saved.id,
            conversation_id=saved.conversation_id,
            sender_id=saved.sender_id,
            content=saved.content,
            read_at=saved.read_at.isoformat() if saved.read_at else None,
            created_at=saved.created_at.isoformat(),
        )
