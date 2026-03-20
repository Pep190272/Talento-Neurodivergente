"""DTOs for messaging use cases."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime


@dataclass(frozen=True)
class CreateConversationDTO:
    current_user_id: str
    other_user_id: str


@dataclass(frozen=True)
class SendMessageDTO:
    conversation_id: str
    sender_id: str
    content: str


@dataclass(frozen=True)
class GetMessagesDTO:
    conversation_id: str
    user_id: str
    limit: int = 50
    offset: int = 0


@dataclass(frozen=True)
class MarkReadDTO:
    message_id: str
    user_id: str


@dataclass(frozen=True)
class ConversationResultDTO:
    id: str
    participant_1_id: str
    participant_2_id: str
    last_message_preview: str
    last_message_at: str | None
    unread_count: int
    created_at: str


@dataclass(frozen=True)
class MessageResultDTO:
    id: str
    conversation_id: str
    sender_id: str
    content: str
    read_at: str | None
    created_at: str
