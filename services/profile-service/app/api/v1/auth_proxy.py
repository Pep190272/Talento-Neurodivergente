"""Local auth — standalone register/login using SQLite for development.

In production, the gateway routes /api/v1/auth/* to auth-service.
In local dev, this module handles auth directly so you only need ONE process.
"""

from __future__ import annotations

import hashlib
import os
import sqlite3
import uuid
from pathlib import Path

from fastapi import APIRouter, Request, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr

from shared.auth import create_access_token
from shared.config import JWTSettings

router = APIRouter(prefix="/api/v1/auth", tags=["auth-local"])

_jwt = JWTSettings()
_JWT_SECRET = _jwt.JWT_SECRET or "dev-secret-change-in-production"

# SQLite for local dev — file in project root, gitignored
_DB_PATH = Path(__file__).resolve().parents[3] / "local_auth.db"


def _get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(str(_DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            display_name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'candidate',
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    return conn


def _hash_password(password: str) -> str:
    salt = os.urandom(16)
    h = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100_000)
    return salt.hex() + ":" + h.hex()


def _verify_password(password: str, stored: str) -> bool:
    salt_hex, hash_hex = stored.split(":")
    salt = bytes.fromhex(salt_hex)
    h = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100_000)
    return h.hex() == hash_hex


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "candidate"


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/register")
async def register(body: RegisterRequest) -> JSONResponse:
    if len(body.password) < 8:
        return JSONResponse(status_code=400, content={"detail": "La contrasena debe tener al menos 8 caracteres"})
    if body.role not in ("candidate", "company", "therapist"):
        return JSONResponse(status_code=400, content={"detail": "Rol no valido"})

    db = _get_db()
    existing = db.execute("SELECT id FROM users WHERE email = ?", (body.email,)).fetchone()
    if existing:
        db.close()
        return JSONResponse(status_code=409, content={"detail": "Ya existe una cuenta con este email"})

    user_id = str(uuid.uuid4())
    db.execute(
        "INSERT INTO users (id, email, display_name, role, password_hash) VALUES (?, ?, ?, ?, ?)",
        (user_id, body.email, body.name, body.role, _hash_password(body.password)),
    )
    db.commit()
    db.close()

    token = create_access_token(
        user_id=user_id, email=body.email, role=body.role,
        secret=_JWT_SECRET,
    )

    return JSONResponse(content={
        "access_token": token,
        "user": {"id": user_id, "email": body.email, "display_name": body.name, "role": body.role},
    })


@router.post("/login")
async def login(body: LoginRequest) -> JSONResponse:
    db = _get_db()
    row = db.execute("SELECT * FROM users WHERE email = ?", (body.email,)).fetchone()
    db.close()

    if not row or not _verify_password(body.password, row["password_hash"]):
        return JSONResponse(status_code=401, content={"detail": "Email o contrasena incorrectos"})

    token = create_access_token(
        user_id=row["id"], email=row["email"], role=row["role"],
        secret=_JWT_SECRET,
    )

    return JSONResponse(content={
        "access_token": token,
        "user": {"id": row["id"], "email": row["email"], "display_name": row["display_name"], "role": row["role"]},
    })


@router.get("/me")
async def me(request: Request) -> JSONResponse:
    from shared.auth import decode_access_token

    token = None
    auth_header = request.headers.get("authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[7:]
    if not token:
        token = request.cookies.get("access_token")
    if not token:
        return JSONResponse(status_code=401, content={"detail": "No autenticado"})

    try:
        payload = decode_access_token(token, secret=_JWT_SECRET)
    except Exception:
        return JSONResponse(status_code=401, content={"detail": "Token invalido"})

    db = _get_db()
    row = db.execute("SELECT * FROM users WHERE id = ?", (payload.sub,)).fetchone()
    db.close()

    if not row:
        return JSONResponse(status_code=404, content={"detail": "Usuario no encontrado"})

    return JSONResponse(content={
        "id": row["id"], "email": row["email"],
        "display_name": row["display_name"], "role": row["role"],
    })


@router.post("/logout")
async def logout() -> JSONResponse:
    return JSONResponse(content={"detail": "Sesion cerrada"})
