"""User profile entity in the profile bounded context."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum

from shared.domain import BaseEntity, NeuroVector24D, UserRole


class ProfileStatus(str, Enum):
    INCOMPLETE = "incomplete"
    ASSESSMENT_PENDING = "assessment_pending"
    ACTIVE = "active"
    INACTIVE = "inactive"


@dataclass(eq=False)
class UserProfile(BaseEntity):
    """
    Core user profile — holds personal data, role, and neuro-vector.

    The neuro_vector is populated after completing the assessment quiz.
    Profiles progress: incomplete → assessment_pending → active.
    """

    user_id: str = ""
    role: UserRole = UserRole.CANDIDATE
    display_name: str = ""
    bio: str = ""
    status: ProfileStatus = ProfileStatus.INCOMPLETE
    neuro_vector: NeuroVector24D | None = None
    onboarding_completed: bool = False

    def complete_onboarding(self) -> None:
        """Mark onboarding as done and move to assessment_pending."""
        self.onboarding_completed = True
        if self.status == ProfileStatus.INCOMPLETE:
            self.status = ProfileStatus.ASSESSMENT_PENDING
        self.touch()

    def set_neuro_vector(self, vector: NeuroVector24D) -> None:
        """Set the neuro-vector from a completed assessment."""
        self.neuro_vector = vector
        if self.status in (ProfileStatus.INCOMPLETE, ProfileStatus.ASSESSMENT_PENDING):
            self.status = ProfileStatus.ACTIVE
        self.touch()

    def is_assessment_complete(self) -> bool:
        return self.neuro_vector is not None

    def is_active(self) -> bool:
        return self.status == ProfileStatus.ACTIVE

    def deactivate(self) -> None:
        self.status = ProfileStatus.INACTIVE
        self.touch()


class ProfileError(Exception):
    pass


class ProfileNotFoundError(ProfileError):
    pass
