"""Unit tests for Message entity."""

from datetime import datetime, timezone

import pytest

from app.domain.entities.message import (
    MAX_MESSAGE_LENGTH,
    Message,
    MessageError,
    MessageNotFoundError,
)


class TestMessage:
    def test_create_message(self):
        msg = Message(
            conversation_id="conv-1",
            sender_id="user-a",
            content="Hello!",
        )
        assert msg.conversation_id == "conv-1"
        assert msg.sender_id == "user-a"
        assert msg.content == "Hello!"
        assert msg.read_at is None

    def test_content_is_sanitized(self):
        msg = Message(
            conversation_id="conv-1",
            sender_id="user-a",
            content="<script>alert('xss')</script>Hello",
        )
        assert "<script>" not in msg.content
        assert "&lt;script&gt;" in msg.content or "alert" in msg.content

    def test_html_tags_stripped(self):
        msg = Message(
            conversation_id="conv-1",
            sender_id="user-a",
            content="<b>bold</b> and <i>italic</i>",
        )
        assert "<b>" not in msg.content
        assert "<i>" not in msg.content

    def test_validate_empty_content_raises(self):
        msg = Message(
            conversation_id="conv-1",
            sender_id="user-a",
            content="",
        )
        with pytest.raises(MessageError, match="cannot be empty"):
            msg.validate()

    def test_validate_whitespace_only_raises(self):
        msg = Message(
            conversation_id="conv-1",
            sender_id="user-a",
            content="   ",
        )
        with pytest.raises(MessageError, match="cannot be empty"):
            msg.validate()

    def test_validate_too_long_raises(self):
        msg = Message(
            conversation_id="conv-1",
            sender_id="user-a",
            content="x" * (MAX_MESSAGE_LENGTH + 1),
        )
        with pytest.raises(MessageError, match="exceeds maximum length"):
            msg.validate()

    def test_validate_no_conversation_id_raises(self):
        msg = Message(
            conversation_id="",
            sender_id="user-a",
            content="Hello",
        )
        with pytest.raises(MessageError, match="Conversation ID"):
            msg.validate()

    def test_validate_no_sender_id_raises(self):
        msg = Message(
            conversation_id="conv-1",
            sender_id="",
            content="Hello",
        )
        with pytest.raises(MessageError, match="Sender ID"):
            msg.validate()

    def test_validate_valid_message(self):
        msg = Message(
            conversation_id="conv-1",
            sender_id="user-a",
            content="Hello!",
        )
        # Should not raise
        msg.validate()

    def test_mark_as_read(self):
        msg = Message(
            conversation_id="conv-1",
            sender_id="user-a",
            content="Hello!",
        )
        assert msg.is_read() is False
        msg.mark_as_read()
        assert msg.is_read() is True
        assert msg.read_at is not None

    def test_mark_as_read_idempotent(self):
        msg = Message(
            conversation_id="conv-1",
            sender_id="user-a",
            content="Hello!",
        )
        msg.mark_as_read()
        first_read_at = msg.read_at
        msg.mark_as_read()
        # Should not update the timestamp on second call
        assert msg.read_at == first_read_at

    def test_is_from(self):
        msg = Message(
            conversation_id="conv-1",
            sender_id="user-a",
            content="Hello!",
        )
        assert msg.is_from("user-a") is True
        assert msg.is_from("user-b") is False

    def test_message_not_found_error_is_subclass(self):
        assert issubclass(MessageNotFoundError, MessageError)

    def test_message_has_id_and_timestamps(self):
        msg = Message(
            conversation_id="conv-1",
            sender_id="user-a",
            content="Hello!",
        )
        assert msg.id  # auto-generated
        assert msg.created_at is not None
        assert msg.updated_at is not None

    def test_content_whitespace_trimmed(self):
        msg = Message(
            conversation_id="conv-1",
            sender_id="user-a",
            content="  Hello world  ",
        )
        assert msg.content == "Hello world"
