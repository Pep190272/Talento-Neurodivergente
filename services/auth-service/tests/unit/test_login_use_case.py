"""Unit tests for LoginUseCase — mocked repository, no DB."""

from __future__ import annotations

from unittest.mock import AsyncMock

import pytest

from shared.domain import Email, UserRole, UserStatus

from app.application.dto.auth_dto import LoginDTO
from app.application.use_cases.login import LoginUseCase
from app.domain.entities.user import (
    InactiveUserError,
    InvalidCredentialsError,
    User,
)
from app.domain.repositories.i_user_repository import IUserRepository


@pytest.fixture
def existing_user() -> User:
    return User.create(
        email=Email("user@example.com"),
        password="SecurePass1",
        role=UserRole.CANDIDATE,
        display_name="Test User",
    )


@pytest.fixture
def mock_user_repo(existing_user: User) -> AsyncMock:
    repo = AsyncMock(spec=IUserRepository)
    repo.find_by_email.return_value = existing_user
    return repo


@pytest.fixture
def login_use_case(mock_user_repo: AsyncMock) -> LoginUseCase:
    return LoginUseCase(user_repo=mock_user_repo, jwt_secret="test-secret-key-1234567890")


class TestLoginUseCase:
    async def test_successful_login(self, login_use_case):
        dto = LoginDTO(email="user@example.com", password="SecurePass1")
        result = await login_use_case.execute(dto)

        assert result.user.email == "user@example.com"
        assert result.access_token
        assert result.token_type == "bearer"

    async def test_wrong_password_raises(self, login_use_case):
        dto = LoginDTO(email="user@example.com", password="WrongPass1")
        with pytest.raises(InvalidCredentialsError, match="Invalid email or password"):
            await login_use_case.execute(dto)

    async def test_nonexistent_email_raises(self, login_use_case, mock_user_repo):
        mock_user_repo.find_by_email.return_value = None
        dto = LoginDTO(email="ghost@example.com", password="SecurePass1")
        with pytest.raises(InvalidCredentialsError, match="Invalid email or password"):
            await login_use_case.execute(dto)

    async def test_inactive_user_raises(self, login_use_case, existing_user):
        existing_user.deactivate()
        dto = LoginDTO(email="user@example.com", password="SecurePass1")
        with pytest.raises(InactiveUserError, match="deactivated"):
            await login_use_case.execute(dto)

    async def test_jwt_contains_correct_claims(self, login_use_case):
        from shared.auth import decode_access_token

        dto = LoginDTO(email="user@example.com", password="SecurePass1")
        result = await login_use_case.execute(dto)

        payload = decode_access_token(
            result.access_token, secret="test-secret-key-1234567890"
        )
        assert payload.email == "user@example.com"
        assert payload.role == "candidate"
