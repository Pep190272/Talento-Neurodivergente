"""Message entity — a single message within a conversation."""

from __future__ import annotations

import html
import re
from dataclasses import dataclass
from datetime import datetime, timezone

from shared.domain import BaseEntity

MAX_MESSAGE_LENGTH = 5000


@dataclass(eq=False)
class Message(BaseEntity):
    """
    A message sent by a user within a conversation.

    Content is sanitized to prevent XSS attacks.
    Messages can be marked as read with a timestamp.
    """

    conversation_id: str = ""
    sender_id: str = ""
    content: str = ""
    read_at: datetime | None = None

    def __post_init__(self) -> None:
        if self.content:
            self.content = self._sanitize(self.content)

    @staticmethod
    def _sanitize(text: str) -> str:
        """Sanitize message content to prevent XSS."""
        sanitized = html.escape(text.strip())
        # Remove any remaining HTML-like patterns
        sanitized = re.sub(r"<[^>]*>", "", sanitized)
        return sanitized

    def validate(self) -> None:
        """Validate message before sending."""
        if not self.conversation_id:
            raise MessageError("Conversation ID is required")
        if not self.sender_id:
            raise MessageError("Sender ID is required")
        if not self.content or not self.content.strip():
            raise MessageError("Message content cannot be empty")
        if len(self.content) > MAX_MESSAGE_LENGTH:
            raise MessageError(
                f"Message content exceeds maximum length of {MAX_MESSAGE_LENGTH} characters"
            )

    def mark_as_read(self) -> None:
        """Mark the message as read."""
        if self.read_at is None:
            self.read_at = datetime.now(timezone.utc)
            self.touch()

    def is_read(self) -> bool:
        return self.read_at is not None

    def is_from(self, user_id: str) -> bool:
        return self.sender_id == user_id


class MessageError(Exception):
    pass


class MessageNotFoundError(MessageError):
    pass
