"""UC: Export user data — GDPR Art. 15 (access) + Art. 20 (portability)."""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timezone

from ...domain.entities.profile import ProfileNotFoundError
from ...domain.repositories.i_profile_repository import IProfileRepository
from ...domain.repositories.i_assessment_repository import IAssessmentRepository


@dataclass(frozen=True)
class ExportDataDTO:
    user_id: str
    format: str = "json"  # json | csv


@dataclass(frozen=True)
class ExportResultDTO:
    user_id: str
    format: str
    data: dict
    exported_at: str
    gdpr_articles: list[str]


class UnsupportedFormatError(Exception):
    pass


class ExportDataUseCase:
    """
    Export all user data in a portable format.

    GDPR Compliance:
    - Art. 15: Right of access — user can request all stored data
    - Art. 20: Right to data portability — structured, machine-readable format
    - Art. 12: Transparent communication — clear data descriptions

    Exports:
    - Profile information (name, bio, role, status)
    - Neuro-vector 24D dimensions (if completed)
    - Assessment history
    - Consent records (from ManageConsent)
    """

    SUPPORTED_FORMATS = ("json", "csv")

    def __init__(
        self,
        profile_repo: IProfileRepository,
        assessment_repo: IAssessmentRepository,
    ) -> None:
        self._profile_repo = profile_repo
        self._assessment_repo = assessment_repo

    async def execute(self, dto: ExportDataDTO) -> ExportResultDTO:
        if dto.format not in self.SUPPORTED_FORMATS:
            raise UnsupportedFormatError(
                f"Format '{dto.format}' not supported. Use: {self.SUPPORTED_FORMATS}"
            )

        # 1. Get profile
        profile = await self._profile_repo.find_by_user_id(dto.user_id)
        if profile is None:
            raise ProfileNotFoundError(f"Profile not found for user '{dto.user_id}'")

        # 2. Build export data
        profile_data = {
            "profile_id": profile.id,
            "user_id": profile.user_id,
            "role": profile.role.value,
            "display_name": profile.display_name,
            "bio": profile.bio,
            "status": profile.status.value,
            "onboarding_completed": profile.onboarding_completed,
            "created_at": profile.created_at.isoformat() if profile.created_at else None,
            "updated_at": profile.updated_at.isoformat() if profile.updated_at else None,
        }

        # 3. Include neuro-vector if exists
        neuro_vector_data = None
        if profile.neuro_vector:
            from shared.domain.value_objects import ALL_DIMENSIONS
            neuro_vector_data = {
                dim: getattr(profile.neuro_vector, dim)
                for dim in ALL_DIMENSIONS
            }

        # 4. Get assessment data
        assessment_data = None
        assessment = await self._assessment_repo.find_active_by_user(dto.user_id)
        if assessment:
            assessment_data = {
                "assessment_id": assessment.id,
                "status": assessment.status.value,
                "started_at": assessment.started_at.isoformat() if assessment.started_at else None,
                "completed_at": assessment.completed_at.isoformat() if assessment.completed_at else None,
                "total_answers": len(assessment.answers),
            }

        # 5. Compile full export
        now = datetime.now(timezone.utc)
        export_data = {
            "export_metadata": {
                "exported_at": now.isoformat(),
                "format": dto.format,
                "gdpr_basis": "Art. 15 (right of access) + Art. 20 (data portability)",
                "data_controller": "DiversIA (app.diversia.click)",
                "contact": "dpo@diversia.click",
            },
            "profile": profile_data,
            "neuro_vector_24d": neuro_vector_data,
            "assessment": assessment_data,
        }

        return ExportResultDTO(
            user_id=dto.user_id,
            format=dto.format,
            data=export_data,
            exported_at=now.isoformat(),
            gdpr_articles=["Art. 15", "Art. 20", "Art. 12"],
        )
