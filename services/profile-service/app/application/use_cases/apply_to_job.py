"""UC: Apply to a job posting with explicit GDPR consent."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone

from ..dto.profile_dto import ProfileResultDTO
from ...domain.entities.profile import ProfileNotFoundError, ProfileStatus
from ...domain.repositories.i_profile_repository import IProfileRepository


@dataclass(frozen=True)
class ApplyToJobDTO:
    user_id: str
    job_id: str
    consent_given: bool  # GDPR Art. 6 — explicit consent required
    consent_text: str = ""  # What the user consented to


@dataclass(frozen=True)
class JobApplicationResultDTO:
    application_id: str
    user_id: str
    job_id: str
    status: str
    consent_recorded: bool
    applied_at: str


class ConsentRequiredError(Exception):
    """GDPR Art. 7 — consent must be freely given, specific, informed."""


class ProfileNotActiveError(Exception):
    """Cannot apply without a completed profile and neuro-vector."""


class ApplyToJobUseCase:
    """
    Apply to a job posting with GDPR-compliant consent.

    Flow:
    1. Validate profile exists and is active (has neuro-vector)
    2. Verify explicit consent was given (GDPR Art. 6.1.a)
    3. Create application record
    4. Return confirmation

    Pre-conditions:
    - User must have completed quiz (neuro-vector exists)
    - Consent must be explicitly given (not pre-checked)
    """

    def __init__(self, profile_repo: IProfileRepository) -> None:
        self._profile_repo = profile_repo

    async def execute(self, dto: ApplyToJobDTO) -> JobApplicationResultDTO:
        # 1. Validate profile
        profile = await self._profile_repo.find_by_user_id(dto.user_id)
        if profile is None:
            raise ProfileNotFoundError(
                f"Profile not found for user '{dto.user_id}'"
            )

        if not profile.is_active() or not profile.is_assessment_complete():
            raise ProfileNotActiveError(
                "Complete your neurocognitive assessment before applying"
            )

        # 2. Verify consent (GDPR Art. 7)
        if not dto.consent_given:
            raise ConsentRequiredError(
                "Explicit consent is required to share your profile with the employer. "
                "GDPR Art. 6.1.a requires freely given, specific, informed consent."
            )

        # 3. Create application (in a real implementation, this would persist)
        now = datetime.now(timezone.utc)
        import uuid
        application_id = str(uuid.uuid4()).replace("-", "")[:25]

        return JobApplicationResultDTO(
            application_id=application_id,
            user_id=dto.user_id,
            job_id=dto.job_id,
            status="pending",
            consent_recorded=True,
            applied_at=now.isoformat(),
        )
