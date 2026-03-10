"""UC: Verify therapist professional credentials (admin-only)."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from enum import Enum

from ...domain.entities.therapist_profile import TherapistProfile, VerificationStatus
from ...domain.repositories.i_therapist_repository import ITherapistRepository


class VerificationDecision(str, Enum):
    APPROVE = "approve"
    REJECT = "reject"


@dataclass(frozen=True)
class VerifyTherapistDTO:
    therapist_user_id: str
    admin_user_id: str
    decision: str  # "approve" or "reject"
    notes: str = ""  # Admin notes about the decision


@dataclass(frozen=True)
class VerificationResultDTO:
    therapist_user_id: str
    verification_status: str
    verified_by: str
    decision_notes: str
    verified_at: str


class TherapistNotFoundError(Exception):
    pass


class InvalidDecisionError(Exception):
    pass


class AlreadyVerifiedError(Exception):
    pass


class VerifyTherapistUseCase:
    """
    Admin verifies therapist professional credentials.

    Flow:
    1. Find therapist profile (must exist and be pending)
    2. Apply admin decision (approve/reject)
    3. Record verification metadata
    4. Return result

    Business rules:
    - Only pending therapists can be verified
    - Verified therapists can endorse candidates in matching
    - Rejected therapists can reapply with updated credentials
    """

    def __init__(self, therapist_repo: ITherapistRepository) -> None:
        self._therapist_repo = therapist_repo

    async def execute(self, dto: VerifyTherapistDTO) -> VerificationResultDTO:
        # 1. Validate decision
        try:
            decision = VerificationDecision(dto.decision)
        except ValueError:
            raise InvalidDecisionError(
                f"Invalid decision '{dto.decision}'. Must be 'approve' or 'reject'"
            )

        # 2. Find therapist
        therapist = await self._therapist_repo.find_by_user_id(dto.therapist_user_id)
        if therapist is None:
            raise TherapistNotFoundError(
                f"Therapist profile not found for user '{dto.therapist_user_id}'"
            )

        # 3. Check not already verified
        if therapist.verification_status == VerificationStatus.VERIFIED:
            raise AlreadyVerifiedError(
                f"Therapist '{dto.therapist_user_id}' is already verified"
            )

        # 4. Apply decision
        if decision == VerificationDecision.APPROVE:
            therapist.verify()
        else:
            therapist.reject()

        await self._therapist_repo.update(therapist)

        now = datetime.now(timezone.utc)
        return VerificationResultDTO(
            therapist_user_id=dto.therapist_user_id,
            verification_status=therapist.verification_status,
            verified_by=dto.admin_user_id,
            decision_notes=dto.notes,
            verified_at=now.isoformat(),
        )

    async def list_pending(self) -> list[dict]:
        """List all therapists pending verification."""
        pending = await self._therapist_repo.find_pending_verification()
        return [
            {
                "user_id": t.user_id,
                "specialty": t.specialty,
                "license_number": t.license_number,
                "support_areas": t.support_areas,
                "status": t.verification_status,
            }
            for t in pending
        ]
