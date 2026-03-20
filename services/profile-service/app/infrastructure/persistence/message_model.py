"""SQLAlchemy ORM models for conversations and messages."""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.domain.entities.conversation import Conversation
from app.domain.entities.message import Message
from .models import Base


class ConversationModel(Base):
    __tablename__ = "conversations"
    __table_args__ = (
        UniqueConstraint("participant_1_id", "participant_2_id", name="uq_conversation_participants"),
        {"schema": "profiles"},
    )

    id: Mapped[str] = mapped_column(String(25), primary_key=True)
    participant_1_id: Mapped[str] = mapped_column(String(25), nullable=False, index=True)
    participant_2_id: Mapped[str] = mapped_column(String(25), nullable=False, index=True)
    last_message_preview: Mapped[str] = mapped_column(Text, nullable=False, default="")
    last_message_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    def to_entity(self) -> Conversation:
        return Conversation(
            id=self.id,
            participant_1_id=self.participant_1_id,
            participant_2_id=self.participant_2_id,
            last_message_preview=self.last_message_preview or "",
            last_message_at=self.last_message_at,
            created_at=self.created_at,
            updated_at=self.updated_at,
        )

    @classmethod
    def from_entity(cls, conv: Conversation) -> ConversationModel:
        return cls(
            id=conv.id,
            participant_1_id=conv.participant_1_id,
            participant_2_id=conv.participant_2_id,
            last_message_preview=conv.last_message_preview,
            last_message_at=conv.last_message_at,
            created_at=conv.created_at,
            updated_at=conv.updated_at,
        )


class MessageModel(Base):
    __tablename__ = "messages"
    __table_args__ = (
        Index("idx_messages_conversation", "conversation_id", "created_at"),
        {"schema": "profiles"},
    )

    id: Mapped[str] = mapped_column(String(25), primary_key=True)
    conversation_id: Mapped[str] = mapped_column(
        String(25),
        ForeignKey("profiles.conversations.id"),
        nullable=False,
    )
    sender_id: Mapped[str] = mapped_column(String(25), nullable=False, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    read_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    def to_entity(self) -> Message:
        return Message(
            id=self.id,
            conversation_id=self.conversation_id,
            sender_id=self.sender_id,
            content=self.content,
            read_at=self.read_at,
            created_at=self.created_at,
            updated_at=self.updated_at,
        )

    @classmethod
    def from_entity(cls, msg: Message) -> MessageModel:
        return cls(
            id=msg.id,
            conversation_id=msg.conversation_id,
            sender_id=msg.sender_id,
            content=msg.content,
            read_at=msg.read_at,
            created_at=msg.created_at,
            updated_at=msg.updated_at,
        )
