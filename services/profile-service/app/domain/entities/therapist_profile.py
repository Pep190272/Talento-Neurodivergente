"""Therapist profile entity — professional verification data."""

from __future__ import annotations

from dataclasses import dataclass, field

from shared.domain import BaseEntity


class VerificationStatus:
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"


@dataclass(eq=False)
class TherapistProfile(BaseEntity):
    """
    Extended profile for therapist role.

    Therapists must be verified by an admin before they can
    endorse candidates in the matching process.
    """

    user_id: str = ""
    specialty: str = ""
    bio: str = ""
    support_areas: list[str] = field(default_factory=list)
    license_number: str = ""
    verification_status: str = VerificationStatus.PENDING

    def is_verified(self) -> bool:
        return self.verification_status == VerificationStatus.VERIFIED

    def verify(self) -> None:
        self.verification_status = VerificationStatus.VERIFIED
        self.touch()

    def reject(self) -> None:
        self.verification_status = VerificationStatus.REJECTED
        self.touch()

    def add_support_area(self, area: str) -> None:
        normalized = area.strip().lower()
        if normalized and normalized not in self.support_areas:
            self.support_areas.append(normalized)
            self.touch()
