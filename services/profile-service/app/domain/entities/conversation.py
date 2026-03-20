"""Conversation entity — private chat between two platform actors."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone

from shared.domain import BaseEntity


@dataclass(eq=False)
class Conversation(BaseEntity):
    """
    A private conversation between two users.

    Participants are stored in a canonical order (sorted) to ensure
    uniqueness: a conversation between A and B is the same as B and A.
    """

    participant_1_id: str = ""
    participant_2_id: str = ""
    last_message_preview: str = ""
    last_message_at: datetime | None = None
    unread_count: int = 0

    def __post_init__(self) -> None:
        if self.participant_1_id and self.participant_2_id:
            self._ensure_canonical_order()

    def _ensure_canonical_order(self) -> None:
        """Ensure participant_1_id < participant_2_id for uniqueness."""
        if self.participant_1_id > self.participant_2_id:
            self.participant_1_id, self.participant_2_id = (
                self.participant_2_id,
                self.participant_1_id,
            )

    def involves(self, user_id: str) -> bool:
        """Check if a user is a participant in this conversation."""
        return user_id in (self.participant_1_id, self.participant_2_id)

    def other_participant(self, user_id: str) -> str:
        """Get the other participant's ID."""
        if not self.involves(user_id):
            raise ConversationError(
                f"User '{user_id}' is not a participant in this conversation"
            )
        if user_id == self.participant_1_id:
            return self.participant_2_id
        return self.participant_1_id

    def update_preview(self, content: str, sent_at: datetime) -> None:
        """Update the last message preview and timestamp."""
        self.last_message_preview = content[:100]
        self.last_message_at = sent_at
        self.touch()

    @staticmethod
    def validate_participants(user_a: str, user_b: str) -> None:
        """Validate that a conversation can be created between two users."""
        if not user_a or not user_b:
            raise ConversationError("Both participants must be specified")
        if user_a == user_b:
            raise ConversationError("Cannot create a conversation with yourself")


class ConversationError(Exception):
    pass


class ConversationNotFoundError(ConversationError):
    pass
