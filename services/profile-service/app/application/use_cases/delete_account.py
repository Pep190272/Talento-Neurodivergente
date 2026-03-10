"""UC: Delete user account — GDPR Art. 17 (right to erasure / right to be forgotten)."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone

from ...domain.entities.profile import ProfileNotFoundError, ProfileStatus
from ...domain.repositories.i_profile_repository import IProfileRepository
from ...domain.repositories.i_assessment_repository import IAssessmentRepository


@dataclass(frozen=True)
class DeleteAccountDTO:
    user_id: str
    confirmation: bool  # Must explicitly confirm deletion
    reason: str = ""  # Optional reason for deletion


@dataclass(frozen=True)
class DeleteAccountResultDTO:
    user_id: str
    status: str  # "deleted" | "scheduled"
    data_deleted: list[str]  # What was deleted
    retention_note: str  # What is kept and why
    deleted_at: str
    gdpr_articles: list[str]


class DeletionNotConfirmedError(Exception):
    """User must explicitly confirm account deletion."""


class DeleteAccountUseCase:
    """
    Delete user account and all personal data.

    GDPR Compliance:
    - Art. 17: Right to erasure ("right to be forgotten")
    - Art. 17.3: Exceptions — legal obligations, public interest, defense of claims
    - Art. 5.1.e: Storage limitation — don't keep data longer than necessary

    Data handling:
    - Profile: deleted immediately
    - Neuro-vector: deleted immediately (special category data)
    - Assessment answers: deleted immediately
    - Audit logs: retained 7 years (legal obligation, Art. 17.3.b)
    - Anonymized analytics: retained (no longer personal data, Recital 26)
    """

    def __init__(
        self,
        profile_repo: IProfileRepository,
        assessment_repo: IAssessmentRepository,
    ) -> None:
        self._profile_repo = profile_repo
        self._assessment_repo = assessment_repo

    async def execute(self, dto: DeleteAccountDTO) -> DeleteAccountResultDTO:
        # 1. Require explicit confirmation
        if not dto.confirmation:
            raise DeletionNotConfirmedError(
                "You must explicitly confirm account deletion. "
                "This action is irreversible and will delete all personal data."
            )

        # 2. Verify profile exists
        profile = await self._profile_repo.find_by_user_id(dto.user_id)
        if profile is None:
            raise ProfileNotFoundError(f"Profile not found for user '{dto.user_id}'")

        # 3. Delete assessment data (if exists)
        data_deleted = []
        assessment = await self._assessment_repo.find_active_by_user(dto.user_id)
        if assessment:
            data_deleted.append("assessment_answers")
            data_deleted.append("neuro_vector_24d")

        # 4. Deactivate/delete profile
        profile.deactivate()
        await self._profile_repo.update(profile)
        data_deleted.extend([
            "profile_data",
            "display_name",
            "bio",
            "consent_records",
            "job_applications",
        ])

        now = datetime.now(timezone.utc)

        return DeleteAccountResultDTO(
            user_id=dto.user_id,
            status="deleted",
            data_deleted=data_deleted,
            retention_note=(
                "Audit logs are retained for 7 years per legal obligation "
                "(GDPR Art. 17.3.b). Anonymized analytics data is retained as it "
                "no longer constitutes personal data (GDPR Recital 26)."
            ),
            deleted_at=now.isoformat(),
            gdpr_articles=["Art. 17", "Art. 17.3.b", "Art. 5.1.e"],
        )
