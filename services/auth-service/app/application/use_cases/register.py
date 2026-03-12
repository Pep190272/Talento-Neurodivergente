"""UC-001: Register a new user (candidate, company, or therapist)."""

from __future__ import annotations

import logging

from shared.auth import create_access_token
from shared.domain import Email, UserRole
from shared.email_service import (
    EmailConfig,
    build_admin_notification_email,
    build_early_adopter_email,
    build_welcome_email,
    send_email,
)

from app.application.dto.auth_dto import AuthResponseDTO, RegisterDTO, UserResponseDTO
from app.domain.entities.user import DuplicateEmailError, User
from app.domain.repositories.i_user_repository import IUserRepository

logger = logging.getLogger(__name__)

# Admin email for registration notifications
ADMIN_NOTIFICATION_EMAIL = "diversiaeternals@gmail.com"

# Early adopter limits
EARLY_ADOPTER_COMPANY_LIMIT = 25
EARLY_ADOPTER_THERAPIST_LIMIT = 25
EARLY_ADOPTER_FREE_MONTHS = 3


class RegisterUseCase:
    """
    Register a new user with email, password, name, and role.

    Flow:
    1. Validate email uniqueness
    2. Create User entity (password hashed in domain)
    3. Persist user
    4. Generate JWT access token
    5. Send welcome email (best-effort, never blocks registration)
    6. Send admin notification email (best-effort)
    7. Send early adopter email for companies/therapists (best-effort)
    8. Return user + token

    Transaction boundary is managed by the caller (API layer or infra).
    """

    def __init__(
        self,
        user_repo: IUserRepository,
        jwt_secret: str,
        email_config: EmailConfig | None = None,
    ) -> None:
        self._user_repo = user_repo
        self._jwt_secret = jwt_secret
        self._email_config = email_config or EmailConfig()

    async def execute(self, dto: RegisterDTO) -> AuthResponseDTO:
        # 1. Check for existing user
        email = Email(dto.email)
        existing = await self._user_repo.find_by_email(email)
        if existing:
            raise DuplicateEmailError(f"Email {dto.email} is already registered")

        # 2. Create user entity (password hashed internally)
        role = UserRole(dto.role)
        user = User.create(
            email=email,
            password=dto.password,
            role=role,
            display_name=dto.name,
        )

        # 3. Persist
        user = await self._user_repo.create(user)

        # 4. Generate token
        token = create_access_token(
            user_id=user.id,
            email=str(user.email),
            role=user.role.value,
            secret=self._jwt_secret,
        )

        user_email = str(user.email)
        user_name = user.display_name or user_email
        user_role = user.role.value

        # 5. Send welcome email (best-effort)
        await self._send_welcome_email(to=user_email, name=user_name, role=user_role)

        # 6. Send admin notification (best-effort)
        await self._send_admin_notification(
            user_name=user_name, user_email=user_email, user_role=user_role,
        )

        # 7. Send early adopter email for companies/therapists (best-effort)
        # Only send if the user is within the early adopter limit
        if user_role in ("company", "therapist"):
            remaining = await self._get_early_adopter_remaining(user_role)
            if remaining > 0:
                await self._send_early_adopter_email(
                    to=user_email, name=user_name, role=user_role,
                )

        # 8. Return
        return AuthResponseDTO(
            user=UserResponseDTO.from_entity(user),
            access_token=token,
        )

    async def _send_welcome_email(self, *, to: str, name: str, role: str) -> None:
        """Send welcome email. Never raises — registration must not fail due to email."""
        try:
            subject, html_body, text_body = build_welcome_email(
                user_name=name, user_role=role,
            )
            await send_email(
                config=self._email_config,
                to=to,
                subject=subject,
                html_body=html_body,
                text_body=text_body,
            )
        except Exception:
            logger.exception("Unexpected error sending welcome email to %s", to)

    async def _send_admin_notification(
        self, *, user_name: str, user_email: str, user_role: str,
    ) -> None:
        """Notify admin about a new registration. Never raises."""
        try:
            subject, html_body, text_body = build_admin_notification_email(
                user_name=user_name, user_email=user_email, user_role=user_role,
            )
            await send_email(
                config=self._email_config,
                to=ADMIN_NOTIFICATION_EMAIL,
                subject=subject,
                html_body=html_body,
                text_body=text_body,
            )
        except Exception:
            logger.exception("Unexpected error sending admin notification for %s", user_email)

    async def _get_early_adopter_remaining(self, role: str) -> int:
        """Return how many early adopter slots remain for the given role."""
        try:
            count = await self._user_repo.count_by_role(role)
            limit = (
                EARLY_ADOPTER_COMPANY_LIMIT if role == "company"
                else EARLY_ADOPTER_THERAPIST_LIMIT
            )
            return max(0, limit - count)
        except Exception:
            logger.exception("Error checking early adopter slots for role %s", role)
            return 0

    async def _send_early_adopter_email(
        self, *, to: str, name: str, role: str,
    ) -> None:
        """Send early adopter welcome email with free plan info. Never raises."""
        try:
            subject, html_body, text_body = build_early_adopter_email(
                user_name=name,
                user_role=role,
                free_months=EARLY_ADOPTER_FREE_MONTHS,
            )
            await send_email(
                config=self._email_config,
                to=to,
                subject=subject,
                html_body=html_body,
                text_body=text_body,
            )
        except Exception:
            logger.exception("Unexpected error sending early adopter email to %s", to)
