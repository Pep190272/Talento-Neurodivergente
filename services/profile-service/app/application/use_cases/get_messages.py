"""Use case: Get messages from a conversation (paginated)."""

from __future__ import annotations

from ..dto.message_dto import GetMessagesDTO, MessageResultDTO
from ...domain.entities.conversation import ConversationError, ConversationNotFoundError
from ...domain.entities.message import Message
from ...domain.repositories.i_conversation_repository import IConversationRepository
from ...domain.repositories.i_message_repository import IMessageRepository


class GetMessagesUseCase:
    def __init__(
        self,
        message_repo: IMessageRepository,
        conversation_repo: IConversationRepository,
    ) -> None:
        self._message_repo = message_repo
        self._conversation_repo = conversation_repo

    async def execute(self, dto: GetMessagesDTO) -> list[MessageResultDTO]:
        # 1. Verify conversation exists
        conversation = await self._conversation_repo.find_by_id(dto.conversation_id)
        if conversation is None:
            raise ConversationNotFoundError(
                f"Conversation '{dto.conversation_id}' not found"
            )

        # 2. Verify user is a participant
        if not conversation.involves(dto.user_id):
            raise ConversationError(
                "You are not a participant in this conversation"
            )

        # 3. Fetch messages (paginated)
        messages = await self._message_repo.find_by_conversation(
            dto.conversation_id, limit=dto.limit, offset=dto.offset
        )

        return [_to_dto(m) for m in messages]


def _to_dto(message: Message) -> MessageResultDTO:
    return MessageResultDTO(
        id=message.id,
        conversation_id=message.conversation_id,
        sender_id=message.sender_id,
        content=message.content,
        read_at=message.read_at.isoformat() if message.read_at else None,
        created_at=message.created_at.isoformat(),
    )
