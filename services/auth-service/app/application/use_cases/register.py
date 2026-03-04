"""UC-001: Register a new user (candidate, company, or therapist)."""

from __future__ import annotations

from shared.auth import create_access_token
from shared.domain import Email, UserRole

from app.application.dto.auth_dto import AuthResponseDTO, RegisterDTO, UserResponseDTO
from app.domain.entities.user import DuplicateEmailError, User
from app.domain.repositories.i_user_repository import IUserRepository


class RegisterUseCase:
    """
    Register a new user with email, password, name, and role.

    Flow:
    1. Validate email uniqueness
    2. Create User entity (password hashed in domain)
    3. Persist user
    4. Generate JWT access token
    5. Return user + token

    Transaction boundary is managed by the caller (API layer or infra).
    """

    def __init__(self, user_repo: IUserRepository, jwt_secret: str) -> None:
        self._user_repo = user_repo
        self._jwt_secret = jwt_secret

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

        # 5. Return
        return AuthResponseDTO(
            user=UserResponseDTO.from_entity(user),
            access_token=token,
        )
