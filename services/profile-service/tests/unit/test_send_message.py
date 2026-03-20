"""Unit tests for SendMessageUseCase."""

from unittest.mock import AsyncMock

import pytest

from app.application.dto.message_dto import SendMessageDTO
from app.application.use_cases.send_message import (
    RATE_LIMIT_PER_HOUR,
    RateLimitExceededError,
    SendMessageUseCase,
)
from app.domain.entities.conversation import Conversation, ConversationError, ConversationNotFoundError
from app.domain.entities.message import MessageError


@pytest.fixture
def conversation():
    return Conversation(
        id="conv-1",
        participant_1_id="user-a",
        participant_2_id="user-b",
    )


@pytest.fixture
def message_repo():
    repo = AsyncMock()
    repo.count_user_messages_since = AsyncMock(return_value=0)
    repo.create = AsyncMock(side_effect=lambda m: m)
    return repo


@pytest.fixture
def conversation_repo(conversation):
    repo = AsyncMock()
    repo.find_by_id = AsyncMock(return_value=conversation)
    repo.update = AsyncMock(side_effect=lambda c: c)
    return repo


class TestSendMessageUseCase:
    @pytest.mark.asyncio
    async def test_send_message_success(self, message_repo, conversation_repo):
        use_case = SendMessageUseCase(message_repo, conversation_repo)
        dto = SendMessageDTO(
            conversation_id="conv-1",
            sender_id="user-a",
            content="Hello!",
        )
        result = await use_case.execute(dto)

        assert result.conversation_id == "conv-1"
        assert result.sender_id == "user-a"
        assert result.content == "Hello!"
        message_repo.create.assert_called_once()
        conversation_repo.update.assert_called_once()

    @pytest.mark.asyncio
    async def test_send_message_conversation_not_found(self, message_repo):
        conv_repo = AsyncMock()
        conv_repo.find_by_id = AsyncMock(return_value=None)

        use_case = SendMessageUseCase(message_repo, conv_repo)
        dto = SendMessageDTO(
            conversation_id="nonexistent",
            sender_id="user-a",
            content="Hello!",
        )

        with pytest.raises(ConversationNotFoundError):
            await use_case.execute(dto)

    @pytest.mark.asyncio
    async def test_send_message_not_participant(self, message_repo, conversation_repo):
        use_case = SendMessageUseCase(message_repo, conversation_repo)
        dto = SendMessageDTO(
            conversation_id="conv-1",
            sender_id="user-c",  # not a participant
            content="Hello!",
        )

        with pytest.raises(ConversationError, match="not a participant"):
            await use_case.execute(dto)

    @pytest.mark.asyncio
    async def test_send_message_rate_limit_exceeded(self, message_repo, conversation_repo):
        message_repo.count_user_messages_since = AsyncMock(
            return_value=RATE_LIMIT_PER_HOUR
        )

        use_case = SendMessageUseCase(message_repo, conversation_repo)
        dto = SendMessageDTO(
            conversation_id="conv-1",
            sender_id="user-a",
            content="Hello!",
        )

        with pytest.raises(RateLimitExceededError):
            await use_case.execute(dto)

    @pytest.mark.asyncio
    async def test_send_message_empty_content(self, message_repo, conversation_repo):
        use_case = SendMessageUseCase(message_repo, conversation_repo)
        dto = SendMessageDTO(
            conversation_id="conv-1",
            sender_id="user-a",
            content="",
        )

        with pytest.raises(MessageError, match="cannot be empty"):
            await use_case.execute(dto)

    @pytest.mark.asyncio
    async def test_send_message_updates_conversation_preview(
        self, message_repo, conversation_repo, conversation
    ):
        use_case = SendMessageUseCase(message_repo, conversation_repo)
        dto = SendMessageDTO(
            conversation_id="conv-1",
            sender_id="user-a",
            content="Hello world!",
        )

        await use_case.execute(dto)

        # Verify conversation was updated with preview
        conversation_repo.update.assert_called_once()
        updated_conv = conversation_repo.update.call_args[0][0]
        assert updated_conv.last_message_preview == "Hello world!"
