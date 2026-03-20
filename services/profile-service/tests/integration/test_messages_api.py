"""Integration tests for messages API endpoints.

These tests use FastAPI's TestClient with dependency overrides
to mock the database layer while testing the full HTTP stack.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from app.api.deps import get_current_user
from app.main import app
from app.domain.entities.conversation import Conversation
from app.domain.entities.message import Message
from app.infrastructure.persistence.conversation_repository import (
    SQLAlchemyConversationRepository,
)
from app.infrastructure.persistence.message_repository import (
    SQLAlchemyMessageRepository,
)
from app.api.v1.messages import (
    _get_conversation_repo,
    _get_message_repo,
)

# ── Fixtures ────────────────────────────────────────────────────

NOW = datetime.now(timezone.utc)


@dataclass
class FakeTokenPayload:
    """Lightweight token payload for tests (avoids importing shared.auth)."""
    sub: str
    email: str
    role: str
    iat: datetime
    exp: datetime

    @property
    def is_expired(self) -> bool:
        return datetime.now(timezone.utc) > self.exp


FAKE_USER = FakeTokenPayload(
    sub="user-aaa",
    email="test@example.com",
    role="candidate",
    iat=NOW,
    exp=datetime(2099, 1, 1, tzinfo=timezone.utc),
)

FAKE_USER_B = FakeTokenPayload(
    sub="user-bbb",
    email="b@example.com",
    role="candidate",
    iat=NOW,
    exp=datetime(2099, 1, 1, tzinfo=timezone.utc),
)


def _fake_conversation() -> Conversation:
    return Conversation(
        id="conv-test-1",
        participant_1_id="user-aaa",
        participant_2_id="user-bbb",
        last_message_preview="Hello!",
        last_message_at=NOW,
        created_at=NOW,
        updated_at=NOW,
    )


def _fake_message() -> Message:
    return Message(
        id="msg-test-1",
        conversation_id="conv-test-1",
        sender_id="user-aaa",
        content="Hello!",
        created_at=NOW,
        updated_at=NOW,
    )


@pytest.fixture
def mock_conversation_repo():
    repo = AsyncMock(spec=SQLAlchemyConversationRepository)
    repo.find_by_id = AsyncMock(return_value=_fake_conversation())
    repo.find_by_participants = AsyncMock(return_value=None)
    repo.find_by_user = AsyncMock(return_value=[_fake_conversation()])
    repo.create = AsyncMock(side_effect=lambda c: c)
    repo.update = AsyncMock(side_effect=lambda c: c)
    return repo


@pytest.fixture
def mock_message_repo():
    repo = AsyncMock(spec=SQLAlchemyMessageRepository)
    repo.find_by_id = AsyncMock(return_value=_fake_message())
    repo.find_by_conversation = AsyncMock(return_value=[_fake_message()])
    repo.create = AsyncMock(side_effect=lambda m: m)
    repo.update = AsyncMock(side_effect=lambda m: m)
    repo.count_unread = AsyncMock(return_value=2)
    repo.count_user_messages_since = AsyncMock(return_value=0)
    return repo


@pytest.fixture
def client(mock_conversation_repo, mock_message_repo):
    """Create a test client with mocked dependencies."""
    app.dependency_overrides[get_current_user] = lambda: FAKE_USER
    app.dependency_overrides[_get_conversation_repo] = lambda: mock_conversation_repo
    app.dependency_overrides[_get_message_repo] = lambda: mock_message_repo

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()


# ── Tests ────────────────────────────────────────────────────────


class TestCreateConversation:
    def test_create_conversation_success(self, client, mock_conversation_repo):
        response = client.post(
            "/api/v1/profiles/conversations",
            json={"other_user_id": "user-bbb"},
        )
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["participant_1_id"] in ("user-aaa", "user-bbb")
        assert data["participant_2_id"] in ("user-aaa", "user-bbb")

    def test_create_conversation_returns_existing(self, client, mock_conversation_repo):
        mock_conversation_repo.find_by_participants = AsyncMock(
            return_value=_fake_conversation()
        )
        response = client.post(
            "/api/v1/profiles/conversations",
            json={"other_user_id": "user-bbb"},
        )
        assert response.status_code == 201
        assert response.json()["id"] == "conv-test-1"
        mock_conversation_repo.create.assert_not_called()

    def test_create_conversation_with_self_fails(self, client):
        response = client.post(
            "/api/v1/profiles/conversations",
            json={"other_user_id": "user-aaa"},  # same as current user
        )
        assert response.status_code == 400


class TestListConversations:
    def test_list_conversations_success(self, client):
        response = client.get("/api/v1/profiles/conversations")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1


class TestGetMessages:
    def test_get_messages_success(self, client):
        response = client.get("/api/v1/profiles/conversations/conv-test-1/messages")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]["content"] == "Hello!"

    def test_get_messages_conversation_not_found(self, client, mock_conversation_repo):
        mock_conversation_repo.find_by_id = AsyncMock(return_value=None)
        response = client.get("/api/v1/profiles/conversations/nonexistent/messages")
        assert response.status_code == 404


class TestSendMessage:
    def test_send_message_success(self, client):
        response = client.post(
            "/api/v1/profiles/conversations/conv-test-1/messages",
            json={"content": "Hello there!"},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["content"] == "Hello there!"
        assert data["sender_id"] == "user-aaa"

    def test_send_message_empty_content_fails(self, client):
        response = client.post(
            "/api/v1/profiles/conversations/conv-test-1/messages",
            json={"content": ""},
        )
        assert response.status_code == 422  # Pydantic validation


class TestMarkMessageRead:
    def test_mark_read_success(self, client, mock_message_repo):
        # Message sent by user-bbb, read by user-aaa (current user)
        msg = Message(
            id="msg-from-b",
            conversation_id="conv-test-1",
            sender_id="user-bbb",
            content="Hi!",
            created_at=NOW,
            updated_at=NOW,
        )
        mock_message_repo.find_by_id = AsyncMock(return_value=msg)
        mock_message_repo.update = AsyncMock(side_effect=lambda m: m)

        response = client.patch(
            "/api/v1/profiles/conversations/messages/msg-from-b/read"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["read_at"] is not None

    def test_mark_own_message_read_fails(self, client, mock_message_repo):
        # Message sent by user-aaa (current user) — cannot mark own as read
        msg = Message(
            id="msg-own",
            conversation_id="conv-test-1",
            sender_id="user-aaa",
            content="My message",
            created_at=NOW,
            updated_at=NOW,
        )
        mock_message_repo.find_by_id = AsyncMock(return_value=msg)

        response = client.patch(
            "/api/v1/profiles/conversations/messages/msg-own/read"
        )
        assert response.status_code == 403
