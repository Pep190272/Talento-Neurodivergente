"""UC-001: Register a new user (candidate, company, or therapist)."""

from __future__ import annotations

import logging

from shared.auth import create_access_token
from shared.domain import Email, UserRole
from shared.email_service import EmailConfig, build_welcome_email, send_email

from app.application.dto.auth_dto import AuthResponseDTO, RegisterDTO, UserResponseDTO
from app.domain.entities.user import DuplicateEmailError, User
from app.domain.repositories.i_user_repository import IUserRepository

logger = logging.getLogger(__name__)


class RegisterUseCase:
    """
    Register a new user with email, password, name, and role.

    Flow:
    1. Validate email uniqueness
    2. Create User entity (password hashed in domain)
    3. Persist user
    4. Generate JWT access token
    5. Send welcome email (best-effort, never blocks registration)
    6. Return user + token

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

        # 5. Send welcome email (best-effort)
        await self._send_welcome_email(
            to=str(user.email),
            name=user.display_name or str(user.email),
            role=user.role.value,
        )

        # 6. Return
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
