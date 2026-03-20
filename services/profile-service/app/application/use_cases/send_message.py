"""Use case: Send a message in a conversation."""

from __future__ import annotations

from datetime import datetime, timezone

from ..dto.message_dto import MessageResultDTO, SendMessageDTO
from ...domain.entities.conversation import ConversationError, ConversationNotFoundError
from ...domain.entities.message import Message, MessageError
from ...domain.repositories.i_conversation_repository import IConversationRepository
from ...domain.repositories.i_message_repository import IMessageRepository

RATE_LIMIT_PER_HOUR = 50


class RateLimitExceededError(MessageError):
    pass


class SendMessageUseCase:
    def __init__(
        self,
        message_repo: IMessageRepository,
        conversation_repo: IConversationRepository,
    ) -> None:
        self._message_repo = message_repo
        self._conversation_repo = conversation_repo

    async def execute(self, dto: SendMessageDTO) -> MessageResultDTO:
        # 1. Verify conversation exists
        conversation = await self._conversation_repo.find_by_id(dto.conversation_id)
        if conversation is None:
            raise ConversationNotFoundError(
                f"Conversation '{dto.conversation_id}' not found"
            )

        # 2. Verify sender is a participant
        if not conversation.involves(dto.sender_id):
            raise ConversationError(
                "You are not a participant in this conversation"
            )

        # 3. Rate limiting: max RATE_LIMIT_PER_HOUR messages per hour
        one_hour_ago = datetime.now(timezone.utc).replace(microsecond=0)
        one_hour_ago = one_hour_ago.isoformat()
        recent_count = await self._message_repo.count_user_messages_since(
            dto.sender_id, one_hour_ago
        )
        if recent_count >= RATE_LIMIT_PER_HOUR:
            raise RateLimitExceededError(
                f"Rate limit exceeded: max {RATE_LIMIT_PER_HOUR} messages per hour"
            )

        # 4. Create and validate message
        message = Message(
            conversation_id=dto.conversation_id,
            sender_id=dto.sender_id,
            content=dto.content,
        )
        message.validate()

        # 5. Persist
        saved = await self._message_repo.create(message)

        # 6. Update conversation preview
        conversation.update_preview(saved.content, saved.created_at)
        await self._conversation_repo.update(conversation)

        return _to_dto(saved)


def _to_dto(message: Message) -> MessageResultDTO:
    return MessageResultDTO(
        id=message.id,
        conversation_id=message.conversation_id,
        sender_id=message.sender_id,
        content=message.content,
        read_at=message.read_at.isoformat() if message.read_at else None,
        created_at=message.created_at.isoformat(),
    )
