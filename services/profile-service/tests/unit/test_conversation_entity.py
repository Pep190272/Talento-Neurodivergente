"""Unit tests for Conversation entity."""

from datetime import datetime, timezone

import pytest

from app.domain.entities.conversation import (
    Conversation,
    ConversationError,
    ConversationNotFoundError,
)


class TestConversation:
    def test_create_conversation(self):
        conv = Conversation(
            participant_1_id="user-a",
            participant_2_id="user-b",
        )
        assert conv.participant_1_id == "user-a"
        assert conv.participant_2_id == "user-b"
        assert conv.last_message_preview == ""
        assert conv.last_message_at is None

    def test_canonical_order_enforced(self):
        """Participants should always be sorted: p1 < p2."""
        conv = Conversation(
            participant_1_id="user-z",
            participant_2_id="user-a",
        )
        assert conv.participant_1_id == "user-a"
        assert conv.participant_2_id == "user-z"

    def test_canonical_order_already_correct(self):
        conv = Conversation(
            participant_1_id="aaa",
            participant_2_id="zzz",
        )
        assert conv.participant_1_id == "aaa"
        assert conv.participant_2_id == "zzz"

    def test_involves_user(self):
        conv = Conversation(
            participant_1_id="user-a",
            participant_2_id="user-b",
        )
        assert conv.involves("user-a") is True
        assert conv.involves("user-b") is True
        assert conv.involves("user-c") is False

    def test_other_participant(self):
        conv = Conversation(
            participant_1_id="user-a",
            participant_2_id="user-b",
        )
        assert conv.other_participant("user-a") == "user-b"
        assert conv.other_participant("user-b") == "user-a"

    def test_other_participant_not_involved_raises(self):
        conv = Conversation(
            participant_1_id="user-a",
            participant_2_id="user-b",
        )
        with pytest.raises(ConversationError, match="not a participant"):
            conv.other_participant("user-c")

    def test_update_preview(self):
        conv = Conversation(
            participant_1_id="user-a",
            participant_2_id="user-b",
        )
        now = datetime.now(timezone.utc)
        conv.update_preview("Hello, this is a test message!", now)
        assert conv.last_message_preview == "Hello, this is a test message!"
        assert conv.last_message_at == now

    def test_update_preview_truncates_long_content(self):
        conv = Conversation(
            participant_1_id="user-a",
            participant_2_id="user-b",
        )
        long_content = "x" * 200
        now = datetime.now(timezone.utc)
        conv.update_preview(long_content, now)
        assert len(conv.last_message_preview) == 100

    def test_validate_participants_same_user_raises(self):
        with pytest.raises(ConversationError, match="yourself"):
            Conversation.validate_participants("user-a", "user-a")

    def test_validate_participants_empty_raises(self):
        with pytest.raises(ConversationError, match="Both participants"):
            Conversation.validate_participants("", "user-b")
        with pytest.raises(ConversationError, match="Both participants"):
            Conversation.validate_participants("user-a", "")

    def test_validate_participants_valid(self):
        # Should not raise
        Conversation.validate_participants("user-a", "user-b")

    def test_conversation_not_found_error_is_subclass(self):
        assert issubclass(ConversationNotFoundError, ConversationError)

    def test_conversation_has_id_and_timestamps(self):
        conv = Conversation(
            participant_1_id="user-a",
            participant_2_id="user-b",
        )
        assert conv.id  # auto-generated
        assert conv.created_at is not None
        assert conv.updated_at is not None
