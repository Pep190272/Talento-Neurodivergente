"""Unit tests for User domain entity — no IO, no DB, no framework."""

import pytest

from shared.domain import Email, UserRole, UserStatus

from app.domain.entities.user import (
    DomainError,
    User,
)


class TestUserCreate:
    def test_creates_user_with_hashed_password(self):
        user = User.create(
            email=Email("test@example.com"),
            password="SecurePass1",
            role=UserRole.CANDIDATE,
            display_name="Test User",
        )
        assert str(user.email) == "test@example.com"
        assert user.role == UserRole.CANDIDATE
        assert user.status == UserStatus.ACTIVE
        assert user.display_name == "Test User"
        assert user.password_hash != "SecurePass1"
        assert user.password_hash.startswith("$2b$")

    def test_creates_user_with_default_display_name(self):
        user = User.create(
            email=Email("user@test.com"),
            password="SecurePass1",
            role=UserRole.COMPANY,
        )
        assert user.display_name == "user@test.com"

    def test_creates_user_with_unique_id(self):
        user1 = User.create(email=Email("a@b.com"), password="Pass1234", role=UserRole.CANDIDATE)
        user2 = User.create(email=Email("c@d.com"), password="Pass1234", role=UserRole.CANDIDATE)
        assert user1.id != user2.id


class TestUserVerifyPassword:
    def test_correct_password_returns_true(self):
        user = User.create(
            email=Email("test@example.com"),
            password="SecurePass1",
            role=UserRole.CANDIDATE,
        )
        assert user.verify_password("SecurePass1") is True

    def test_wrong_password_returns_false(self):
        user = User.create(
            email=Email("test@example.com"),
            password="SecurePass1",
            role=UserRole.CANDIDATE,
        )
        assert user.verify_password("WrongPassword1") is False

    def test_empty_password_returns_false(self):
        user = User.create(
            email=Email("test@example.com"),
            password="SecurePass1",
            role=UserRole.CANDIDATE,
        )
        assert user.verify_password("") is False


class TestUserStatus:
    def test_new_user_is_active(self):
        user = User.create(
            email=Email("test@example.com"),
            password="SecurePass1",
            role=UserRole.CANDIDATE,
        )
        assert user.is_active() is True

    def test_deactivate_user(self):
        user = User.create(
            email=Email("test@example.com"),
            password="SecurePass1",
            role=UserRole.CANDIDATE,
        )
        user.deactivate()
        assert user.is_active() is False
        assert user.status == UserStatus.INACTIVE

    def test_cannot_deactivate_deleted_user(self):
        user = User.create(
            email=Email("test@example.com"),
            password="SecurePass1",
            role=UserRole.CANDIDATE,
        )
        user.delete()
        with pytest.raises(DomainError, match="Cannot deactivate a deleted user"):
            user.deactivate()

    def test_delete_user(self):
        user = User.create(
            email=Email("test@example.com"),
            password="SecurePass1",
            role=UserRole.CANDIDATE,
        )
        user.delete()
        assert user.status == UserStatus.DELETED
        assert user.is_active() is False


class TestUserEquality:
    def test_users_with_same_id_are_equal(self):
        user1 = User(id="abc123", email=Email("a@b.com"))
        user2 = User(id="abc123", email=Email("different@email.com"))
        assert user1 == user2

    def test_users_with_different_id_are_not_equal(self):
        user1 = User(id="abc123", email=Email("a@b.com"))
        user2 = User(id="xyz789", email=Email("a@b.com"))
        assert user1 != user2
