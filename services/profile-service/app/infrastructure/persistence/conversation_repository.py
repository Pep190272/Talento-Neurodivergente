"""SQLAlchemy implementation of IConversationRepository."""

from __future__ import annotations

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.conversation import Conversation
from app.domain.repositories.i_conversation_repository import IConversationRepository
from .message_model import ConversationModel


class SQLAlchemyConversationRepository(IConversationRepository):

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def find_by_id(self, conversation_id: str) -> Conversation | None:
        result = await self._session.execute(
            select(ConversationModel).where(ConversationModel.id == conversation_id)
        )
        model = result.scalar_one_or_none()
        return model.to_entity() if model else None

    async def find_by_participants(
        self, user_a: str, user_b: str
    ) -> Conversation | None:
        # Ensure canonical order
        p1, p2 = sorted([user_a, user_b])
        result = await self._session.execute(
            select(ConversationModel).where(
                ConversationModel.participant_1_id == p1,
                ConversationModel.participant_2_id == p2,
            )
        )
        model = result.scalar_one_or_none()
        return model.to_entity() if model else None

    async def find_by_user(self, user_id: str) -> list[Conversation]:
        result = await self._session.execute(
            select(ConversationModel)
            .where(
                or_(
                    ConversationModel.participant_1_id == user_id,
                    ConversationModel.participant_2_id == user_id,
                )
            )
            .order_by(ConversationModel.updated_at.desc())
        )
        models = result.scalars().all()
        return [m.to_entity() for m in models]

    async def create(self, conversation: Conversation) -> Conversation:
        model = ConversationModel.from_entity(conversation)
        self._session.add(model)
        await self._session.flush()
        return model.to_entity()

    async def update(self, conversation: Conversation) -> Conversation:
        result = await self._session.execute(
            select(ConversationModel).where(
                ConversationModel.id == conversation.id
            )
        )
        model = result.scalar_one_or_none()
        if model is None:
            raise ValueError(f"Conversation {conversation.id} not found")

        model.last_message_preview = conversation.last_message_preview
        model.last_message_at = conversation.last_message_at
        model.updated_at = conversation.updated_at
        await self._session.flush()
        return model.to_entity()
