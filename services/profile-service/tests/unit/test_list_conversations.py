"""Unit tests for ListConversationsUseCase."""

from datetime import datetime, timezone

from unittest.mock import AsyncMock

import pytest

from app.application.use_cases.list_conversations import ListConversationsUseCase
from app.domain.entities.conversation import Conversation


@pytest.fixture
def conversations():
    now = datetime.now(timezone.utc)
    earlier = datetime(2025, 1, 1, tzinfo=timezone.utc)
    return [
        Conversation(
            id="conv-1",
            participant_1_id="user-a",
            participant_2_id="user-b",
            last_message_preview="Hello!",
            last_message_at=now,
            created_at=earlier,
            updated_at=now,
        ),
        Conversation(
            id="conv-2",
            participant_1_id="user-a",
            participant_2_id="user-c",
            last_message_preview="Hi there",
            last_message_at=None,
            created_at=earlier,
            updated_at=earlier,
        ),
    ]


@pytest.fixture
def conversation_repo(conversations):
    repo = AsyncMock()
    repo.find_by_user = AsyncMock(return_value=conversations)
    return repo


@pytest.fixture
def message_repo():
    repo = AsyncMock()
    repo.count_unread = AsyncMock(return_value=3)
    return repo


class TestListConversationsUseCase:
    @pytest.mark.asyncio
    async def test_list_conversations_returns_all(self, conversation_repo, message_repo):
        use_case = ListConversationsUseCase(conversation_repo, message_repo)
        result = await use_case.execute("user-a")

        assert len(result) == 2
        conversation_repo.find_by_user.assert_called_once_with("user-a")

    @pytest.mark.asyncio
    async def test_list_conversations_includes_unread_count(
        self, conversation_repo, message_repo
    ):
        use_case = ListConversationsUseCase(conversation_repo, message_repo)
        result = await use_case.execute("user-a")

        assert all(r.unread_count == 3 for r in result)
        assert message_repo.count_unread.call_count == 2

    @pytest.mark.asyncio
    async def test_list_conversations_empty(self, message_repo):
        conv_repo = AsyncMock()
        conv_repo.find_by_user = AsyncMock(return_value=[])

        use_case = ListConversationsUseCase(conv_repo, message_repo)
        result = await use_case.execute("user-a")

        assert result == []

    @pytest.mark.asyncio
    async def test_list_conversations_sorted_by_last_message(
        self, conversation_repo, message_repo
    ):
        use_case = ListConversationsUseCase(conversation_repo, message_repo)
        result = await use_case.execute("user-a")

        # First should have last_message_at (most recent), second should not
        assert result[0].last_message_at is not None
        assert result[1].last_message_at is None

    @pytest.mark.asyncio
    async def test_list_conversations_dto_fields(self, conversation_repo, message_repo):
        use_case = ListConversationsUseCase(conversation_repo, message_repo)
        result = await use_case.execute("user-a")

        dto = result[0]
        assert dto.id == "conv-1"
        assert dto.participant_1_id == "user-a"
        assert dto.participant_2_id == "user-b"
        assert dto.last_message_preview == "Hello!"
        assert dto.unread_count == 3
        assert dto.created_at is not None
