"""Messages API routes — private chat between platform actors."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from shared.auth import TokenPayload

from ..deps import get_current_user
from app.application.dto.message_dto import (
    CreateConversationDTO,
    GetMessagesDTO,
    MarkReadDTO,
    SendMessageDTO,
)
from app.application.use_cases.send_message import (
    RateLimitExceededError,
    SendMessageUseCase,
)
from app.application.use_cases.list_conversations import ListConversationsUseCase
from app.application.use_cases.get_messages import GetMessagesUseCase
from app.application.use_cases.mark_message_read import MarkMessageReadUseCase
from app.domain.entities.conversation import (
    Conversation,
    ConversationError,
    ConversationNotFoundError,
)
from app.domain.entities.message import MessageError, MessageNotFoundError
from app.infrastructure.database import get_session
from app.infrastructure.persistence.conversation_repository import (
    SQLAlchemyConversationRepository,
)
from app.infrastructure.persistence.message_repository import (
    SQLAlchemyMessageRepository,
)

from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/api/v1/profiles/conversations", tags=["messages"])


# ── Pydantic Schemas ────────────────────────────────────────────


class CreateConversationRequest(BaseModel):
    other_user_id: str = Field(..., min_length=1, max_length=25)


class SendMessageRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)


class ConversationResponse(BaseModel):
    id: str
    participant_1_id: str
    participant_2_id: str
    last_message_preview: str = ""
    last_message_at: str | None = None
    unread_count: int = 0
    created_at: str


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    content: str
    read_at: str | None = None
    created_at: str


# ── Dependency Providers ────────────────────────────────────────


async def _get_conversation_repo(
    session: AsyncSession = Depends(get_session),
) -> SQLAlchemyConversationRepository:
    return SQLAlchemyConversationRepository(session)


async def _get_message_repo(
    session: AsyncSession = Depends(get_session),
) -> SQLAlchemyMessageRepository:
    return SQLAlchemyMessageRepository(session)


async def _get_send_message_use_case(
    message_repo: SQLAlchemyMessageRepository = Depends(_get_message_repo),
    conversation_repo: SQLAlchemyConversationRepository = Depends(_get_conversation_repo),
) -> SendMessageUseCase:
    return SendMessageUseCase(message_repo, conversation_repo)


async def _get_list_conversations_use_case(
    conversation_repo: SQLAlchemyConversationRepository = Depends(_get_conversation_repo),
    message_repo: SQLAlchemyMessageRepository = Depends(_get_message_repo),
) -> ListConversationsUseCase:
    return ListConversationsUseCase(conversation_repo, message_repo)


async def _get_get_messages_use_case(
    message_repo: SQLAlchemyMessageRepository = Depends(_get_message_repo),
    conversation_repo: SQLAlchemyConversationRepository = Depends(_get_conversation_repo),
) -> GetMessagesUseCase:
    return GetMessagesUseCase(message_repo, conversation_repo)


async def _get_mark_read_use_case(
    message_repo: SQLAlchemyMessageRepository = Depends(_get_message_repo),
    conversation_repo: SQLAlchemyConversationRepository = Depends(_get_conversation_repo),
) -> MarkMessageReadUseCase:
    return MarkMessageReadUseCase(message_repo, conversation_repo)


# ── Endpoints ────────────────────────────────────────────────────


@router.post(
    "",
    response_model=ConversationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_or_get_conversation(
    body: CreateConversationRequest,
    current_user: TokenPayload = Depends(get_current_user),
    conversation_repo: SQLAlchemyConversationRepository = Depends(_get_conversation_repo),
) -> ConversationResponse:
    """Create a new conversation or return existing one between two users."""
    try:
        Conversation.validate_participants(current_user.sub, body.other_user_id)
    except ConversationError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Check if conversation already exists
    existing = await conversation_repo.find_by_participants(
        current_user.sub, body.other_user_id
    )
    if existing:
        return ConversationResponse(
            id=existing.id,
            participant_1_id=existing.participant_1_id,
            participant_2_id=existing.participant_2_id,
            last_message_preview=existing.last_message_preview,
            last_message_at=existing.last_message_at.isoformat() if existing.last_message_at else None,
            unread_count=0,
            created_at=existing.created_at.isoformat(),
        )

    # Create new conversation
    conv = Conversation(
        participant_1_id=current_user.sub,
        participant_2_id=body.other_user_id,
    )
    saved = await conversation_repo.create(conv)
    return ConversationResponse(
        id=saved.id,
        participant_1_id=saved.participant_1_id,
        participant_2_id=saved.participant_2_id,
        last_message_preview="",
        last_message_at=None,
        unread_count=0,
        created_at=saved.created_at.isoformat(),
    )


@router.get("", response_model=list[ConversationResponse])
async def list_conversations(
    current_user: TokenPayload = Depends(get_current_user),
    use_case: ListConversationsUseCase = Depends(_get_list_conversations_use_case),
) -> list[ConversationResponse]:
    """List all conversations for the current user."""
    results = await use_case.execute(current_user.sub)
    return [ConversationResponse(**r.__dict__) for r in results]


@router.get("/{conversation_id}/messages", response_model=list[MessageResponse])
async def get_messages(
    conversation_id: str,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: TokenPayload = Depends(get_current_user),
    use_case: GetMessagesUseCase = Depends(_get_get_messages_use_case),
) -> list[MessageResponse]:
    """Get messages from a conversation (paginated)."""
    try:
        results = await use_case.execute(
            GetMessagesDTO(
                conversation_id=conversation_id,
                user_id=current_user.sub,
                limit=limit,
                offset=offset,
            )
        )
    except ConversationNotFoundError:
        raise HTTPException(status_code=404, detail="Conversation not found")
    except ConversationError as e:
        raise HTTPException(status_code=403, detail=str(e))

    return [MessageResponse(**r.__dict__) for r in results]


@router.post(
    "/{conversation_id}/messages",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def send_message(
    conversation_id: str,
    body: SendMessageRequest,
    current_user: TokenPayload = Depends(get_current_user),
    use_case: SendMessageUseCase = Depends(_get_send_message_use_case),
) -> MessageResponse:
    """Send a message in a conversation."""
    try:
        result = await use_case.execute(
            SendMessageDTO(
                conversation_id=conversation_id,
                sender_id=current_user.sub,
                content=body.content,
            )
        )
    except ConversationNotFoundError:
        raise HTTPException(status_code=404, detail="Conversation not found")
    except ConversationError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except RateLimitExceededError:
        raise HTTPException(status_code=429, detail="Rate limit exceeded: max 50 messages per hour")
    except MessageError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return MessageResponse(**result.__dict__)


@router.patch("/messages/{message_id}/read", response_model=MessageResponse)
async def mark_message_read(
    message_id: str,
    current_user: TokenPayload = Depends(get_current_user),
    use_case: MarkMessageReadUseCase = Depends(_get_mark_read_use_case),
) -> MessageResponse:
    """Mark a message as read."""
    try:
        result = await use_case.execute(
            MarkReadDTO(message_id=message_id, user_id=current_user.sub)
        )
    except MessageNotFoundError:
        raise HTTPException(status_code=404, detail="Message not found")
    except ConversationError as e:
        raise HTTPException(status_code=403, detail=str(e))

    return MessageResponse(**result.__dict__)
