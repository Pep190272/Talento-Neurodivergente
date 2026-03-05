"""JWT utilities shared across all services for token creation and verification."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

import jwt


@dataclass(frozen=True)
class TokenPayload:
    """Decoded JWT payload."""

    sub: str  # User ID
    email: str
    role: str  # candidate | company | therapist | admin
    iat: datetime
    exp: datetime

    @property
    def is_expired(self) -> bool:
        return datetime.now(timezone.utc) > self.exp


def create_access_token(
    *,
    user_id: str,
    email: str,
    role: str,
    secret: str,
    algorithm: str = "HS256",
    expires_minutes: int = 43200,  # 30 days
) -> str:
    """Create a signed JWT access token."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "iat": now,
        "exp": now + timedelta(minutes=expires_minutes),
    }
    return jwt.encode(payload, secret, algorithm=algorithm)


def decode_access_token(
    token: str,
    *,
    secret: str,
    algorithm: str = "HS256",
) -> TokenPayload:
    """
    Decode and verify a JWT access token.

    Raises:
        jwt.ExpiredSignatureError: Token has expired
        jwt.InvalidTokenError: Token is malformed or invalid
    """
    data = jwt.decode(token, secret, algorithms=[algorithm])
    return TokenPayload(
        sub=data["sub"],
        email=data["email"],
        role=data["role"],
        iat=datetime.fromtimestamp(data["iat"], tz=timezone.utc),
        exp=datetime.fromtimestamp(data["exp"], tz=timezone.utc),
    )
