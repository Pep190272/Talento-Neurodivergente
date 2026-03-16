"""Pydantic request/response schemas for the auth API."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    """POST /api/v1/auth/register request body."""

    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    name: str = Field(min_length=2, max_length=100)
    role: str = Field(default="candidate", pattern="^(candidate|company|therapist)$")

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class LoginRequest(BaseModel):
    """POST /api/v1/auth/login request body."""

    email: EmailStr
    password: str = Field(min_length=1)


class UserResponse(BaseModel):
    """User data in API responses (no sensitive fields)."""

    id: str
    email: str
    role: str
    display_name: str
    status: str
    created_at: datetime


class AuthResponse(BaseModel):
    """Response for register/login — includes JWT token."""

    user: UserResponse
    access_token: str
    token_type: str = "bearer"


class ForgotPasswordRequest(BaseModel):
    """POST /api/v1/auth/forgot-password request body."""

    email: EmailStr


class MessageResponse(BaseModel):
    """Generic message response."""

    message: str


class ErrorResponse(BaseModel):
    """Standard error response."""

    error: str
    message: str
