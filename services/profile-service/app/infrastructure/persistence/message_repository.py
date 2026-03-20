"""SQLAlchemy implementation of IMessageRepository."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.message import Message
from app.domain.repositories.i_message_repository import IMessageRepository
from .message_model import MessageModel


class SQLAlchemyMessageRepository(IMessageRepository):

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def find_by_id(self, message_id: str) -> Message | None:
        result = await self._session.execute(
            select(MessageModel).where(MessageModel.id == message_id)
        )
        model = result.scalar_one_or_none()
        return model.to_entity() if model else None

    async def find_by_conversation(
        self, conversation_id: str, limit: int = 50, offset: int = 0
    ) -> list[Message]:
        result = await self._session.execute(
            select(MessageModel)
            .where(MessageModel.conversation_id == conversation_id)
            .order_by(MessageModel.created_at.asc())
            .limit(limit)
            .offset(offset)
        )
        models = result.scalars().all()
        return [m.to_entity() for m in models]

    async def create(self, message: Message) -> Message:
        model = MessageModel.from_entity(message)
        self._session.add(model)
        await self._session.flush()
        return model.to_entity()

    async def update(self, message: Message) -> Message:
        result = await self._session.execute(
            select(MessageModel).where(MessageModel.id == message.id)
        )
        model = result.scalar_one_or_none()
        if model is None:
            raise ValueError(f"Message {message.id} not found")

        model.read_at = message.read_at
        model.updated_at = message.updated_at
        await self._session.flush()
        return model.to_entity()

    async def count_unread(self, conversation_id: str, user_id: str) -> int:
        result = await self._session.execute(
            select(func.count(MessageModel.id)).where(
                and_(
                    MessageModel.conversation_id == conversation_id,
                    MessageModel.sender_id != user_id,
                    MessageModel.read_at.is_(None),
                )
            )
        )
        return result.scalar_one()

    async def count_user_messages_since(
        self, user_id: str, since: str
    ) -> int:
        since_dt = datetime.fromisoformat(since)
        result = await self._session.execute(
            select(func.count(MessageModel.id)).where(
                and_(
                    MessageModel.sender_id == user_id,
                    MessageModel.created_at >= since_dt,
                )
            )
        )
        return result.scalar_one()
