"""Use case: List conversations for the current user."""

from __future__ import annotations

from ..dto.message_dto import ConversationResultDTO
from ...domain.entities.conversation import Conversation
from ...domain.repositories.i_conversation_repository import IConversationRepository
from ...domain.repositories.i_message_repository import IMessageRepository


class ListConversationsUseCase:
    def __init__(
        self,
        conversation_repo: IConversationRepository,
        message_repo: IMessageRepository,
    ) -> None:
        self._conversation_repo = conversation_repo
        self._message_repo = message_repo

    async def execute(self, user_id: str) -> list[ConversationResultDTO]:
        conversations = await self._conversation_repo.find_by_user(user_id)

        results = []
        for conv in conversations:
            unread = await self._message_repo.count_unread(conv.id, user_id)
            results.append(
                _to_dto(conv, unread)
            )

        # Sort by last_message_at descending (most recent first)
        results.sort(
            key=lambda c: c.last_message_at or c.created_at,
            reverse=True,
        )
        return results


def _to_dto(conv: Conversation, unread_count: int) -> ConversationResultDTO:
    return ConversationResultDTO(
        id=conv.id,
        participant_1_id=conv.participant_1_id,
        participant_2_id=conv.participant_2_id,
        last_message_preview=conv.last_message_preview,
        last_message_at=conv.last_message_at.isoformat() if conv.last_message_at else None,
        unread_count=unread_count,
        created_at=conv.created_at.isoformat(),
    )
