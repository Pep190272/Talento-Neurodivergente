"""UC-002: Authenticate an existing user with email and password."""

from __future__ import annotations

from shared.auth import create_access_token
from shared.domain import Email

from app.application.dto.auth_dto import AuthResponseDTO, LoginDTO, UserResponseDTO
from app.domain.entities.user import (
    InactiveUserError,
    InvalidCredentialsError,
    User,
    UserNotFoundError,
)
from app.domain.repositories.i_user_repository import IUserRepository


class LoginUseCase:
    """
    Authenticate a user with email and password.

    Flow:
    1. Find user by email
    2. Verify password
    3. Check user is active
    4. Generate JWT access token
    5. Return user + token
    """

    def __init__(self, user_repo: IUserRepository, jwt_secret: str) -> None:
        self._user_repo = user_repo
        self._jwt_secret = jwt_secret

    async def execute(self, dto: LoginDTO) -> AuthResponseDTO:
        # 1. Find user — generic error message to prevent user enumeration
        email = Email(dto.email)
        user = await self._user_repo.find_by_email(email)
        if not user:
            raise InvalidCredentialsError("Invalid email or password")

        # 2. Verify password
        if not user.verify_password(dto.password):
            raise InvalidCredentialsError("Invalid email or password")

        # 3. Check active
        if not user.is_active():
            raise InactiveUserError("Account is deactivated")

        # 4. Generate token
        token = create_access_token(
            user_id=user.id,
            email=str(user.email),
            role=user.role.value,
            secret=self._jwt_secret,
        )

        # 5. Return
        return AuthResponseDTO(
            user=UserResponseDTO.from_entity(user),
            access_token=token,
        )
