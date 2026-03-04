"""Unit tests for RegisterUseCase — mocked repository, no DB."""

from __future__ import annotations

from unittest.mock import AsyncMock

import pytest

from shared.domain import Email, UserRole

from app.application.dto.auth_dto import RegisterDTO
from app.application.use_cases.register import RegisterUseCase
from app.domain.entities.user import DuplicateEmailError, User
from app.domain.repositories.i_user_repository import IUserRepository


@pytest.fixture
def mock_user_repo() -> AsyncMock:
    repo = AsyncMock(spec=IUserRepository)
    repo.find_by_email.return_value = None
    repo.create.side_effect = lambda user: user  # Return the same user
    return repo


@pytest.fixture
def register_use_case(mock_user_repo: AsyncMock) -> RegisterUseCase:
    return RegisterUseCase(user_repo=mock_user_repo, jwt_secret="test-secret-key-1234567890")


class TestRegisterUseCase:
    async def test_successful_registration(self, register_use_case, mock_user_repo):
        dto = RegisterDTO(
            email="new@example.com",
            password="SecurePass1",
            name="New User",
            role="candidate",
        )
        result = await register_use_case.execute(dto)

        assert result.user.email == "new@example.com"
        assert result.user.role == "candidate"
        assert result.user.display_name == "New User"
        assert result.access_token
        assert result.token_type == "bearer"

        mock_user_repo.find_by_email.assert_called_once()
        mock_user_repo.create.assert_called_once()

    async def test_duplicate_email_raises(self, register_use_case, mock_user_repo):
        existing_user = User.create(
            email=Email("existing@example.com"),
            password="Pass1234",
            role=UserRole.CANDIDATE,
        )
        mock_user_repo.find_by_email.return_value = existing_user

        dto = RegisterDTO(
            email="existing@example.com",
            password="SecurePass1",
            name="User",
        )
        with pytest.raises(DuplicateEmailError, match="already registered"):
            await register_use_case.execute(dto)

    async def test_registers_company_role(self, register_use_case, mock_user_repo):
        dto = RegisterDTO(
            email="company@example.com",
            password="SecurePass1",
            name="Acme Corp",
            role="company",
        )
        result = await register_use_case.execute(dto)
        assert result.user.role == "company"

    async def test_registers_therapist_role(self, register_use_case, mock_user_repo):
        dto = RegisterDTO(
            email="therapist@example.com",
            password="SecurePass1",
            name="Dr. Smith",
            role="therapist",
        )
        result = await register_use_case.execute(dto)
        assert result.user.role == "therapist"

    async def test_jwt_token_is_valid(self, register_use_case, mock_user_repo):
        from shared.auth import decode_access_token

        dto = RegisterDTO(email="jwt@example.com", password="SecurePass1", name="JWT User")
        result = await register_use_case.execute(dto)

        payload = decode_access_token(
            result.access_token, secret="test-secret-key-1234567890"
        )
        assert payload.email == "jwt@example.com"
        assert payload.role == "candidate"
        assert not payload.is_expired
