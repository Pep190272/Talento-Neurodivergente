"""UC: Manage user consents — GDPR Art. 6, 7, 17."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum

from ...domain.entities.profile import ProfileNotFoundError
from ...domain.repositories.i_profile_repository import IProfileRepository


class ConsentType(str, Enum):
    PROFILE_SHARING = "profile_sharing"  # Share profile with employers
    MATCHING = "matching"  # Include in matching algorithm
    AI_PROCESSING = "ai_processing"  # AI-based scoring (EU AI Act Art. 13)
    THERAPIST_ACCESS = "therapist_access"  # Allow therapist to view profile
    ANALYTICS = "analytics"  # Anonymized analytics
    MARKETING = "marketing"  # Marketing communications


class ConsentAction(str, Enum):
    GRANT = "grant"
    REVOKE = "revoke"


@dataclass(frozen=True)
class ConsentDTO:
    user_id: str
    consent_type: str
    action: str  # "grant" or "revoke"
    purpose: str = ""  # GDPR Art. 13 — purpose of processing


@dataclass(frozen=True)
class ConsentStatusDTO:
    user_id: str
    consents: dict[str, bool]
    last_updated: str


@dataclass(frozen=True)
class ConsentRecordDTO:
    consent_id: str
    user_id: str
    consent_type: str
    granted: bool
    purpose: str
    timestamp: str


class InvalidConsentTypeError(Exception):
    pass


class ManageConsentUseCase:
    """
    Manage granular user consents per GDPR Art. 6, 7.

    Features:
    - Grant/revoke individual consent types
    - Query current consent status
    - Audit trail of consent changes (GDPR Art. 5.1.a transparency)
    - Revocation must be as easy as granting (GDPR Art. 7.3)
    """

    # Default consent state — all off (opt-in, not opt-out)
    DEFAULT_CONSENTS = {ct.value: False for ct in ConsentType}

    def __init__(self, profile_repo: IProfileRepository) -> None:
        self._profile_repo = profile_repo
        # In-memory consent store (production: database table)
        self._consents: dict[str, dict[str, bool]] = {}
        self._history: list[ConsentRecordDTO] = []

    async def execute(self, dto: ConsentDTO) -> ConsentRecordDTO:
        """Grant or revoke a specific consent."""
        # Validate profile exists
        profile = await self._profile_repo.find_by_user_id(dto.user_id)
        if profile is None:
            raise ProfileNotFoundError(f"Profile not found for user '{dto.user_id}'")

        # Validate consent type
        try:
            consent_type = ConsentType(dto.consent_type)
        except ValueError:
            valid = [ct.value for ct in ConsentType]
            raise InvalidConsentTypeError(
                f"Invalid consent type '{dto.consent_type}'. Valid: {valid}"
            )

        # Validate action
        try:
            action = ConsentAction(dto.action)
        except ValueError:
            raise ValueError(f"Invalid action '{dto.action}'. Must be 'grant' or 'revoke'")

        # Apply consent change
        granted = action == ConsentAction.GRANT
        if dto.user_id not in self._consents:
            self._consents[dto.user_id] = dict(self.DEFAULT_CONSENTS)
        self._consents[dto.user_id][consent_type.value] = granted

        # Create audit record
        import uuid
        now = datetime.now(timezone.utc)
        record = ConsentRecordDTO(
            consent_id=str(uuid.uuid4()).replace("-", "")[:25],
            user_id=dto.user_id,
            consent_type=consent_type.value,
            granted=granted,
            purpose=dto.purpose or f"User {'granted' if granted else 'revoked'} {consent_type.value}",
            timestamp=now.isoformat(),
        )
        self._history.append(record)
        return record

    async def get_status(self, user_id: str) -> ConsentStatusDTO:
        """Get current consent status for a user."""
        profile = await self._profile_repo.find_by_user_id(user_id)
        if profile is None:
            raise ProfileNotFoundError(f"Profile not found for user '{user_id}'")

        consents = self._consents.get(user_id, dict(self.DEFAULT_CONSENTS))
        now = datetime.now(timezone.utc)

        return ConsentStatusDTO(
            user_id=user_id,
            consents=consents,
            last_updated=now.isoformat(),
        )

    async def has_consent(self, user_id: str, consent_type: str) -> bool:
        """Check if a user has granted a specific consent."""
        consents = self._consents.get(user_id, self.DEFAULT_CONSENTS)
        return consents.get(consent_type, False)
