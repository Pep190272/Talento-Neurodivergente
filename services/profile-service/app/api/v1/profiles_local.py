"""Local profile storage — standalone CRUD using SQLite for development.

In production, profiles are stored in PostgreSQL via the profiles router.
In local dev, this module handles profiles directly in SQLite.
"""

from __future__ import annotations

import json
import sqlite3
from pathlib import Path

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from shared.auth import decode_access_token

from app.config import ProfileServiceSettings

router = APIRouter(prefix="/api/v1/profiles", tags=["profiles-local"])

_settings = ProfileServiceSettings()
_JWT_SECRET = _settings.jwt_secret
_DB_PATH = Path(__file__).resolve().parents[3] / "local_auth.db"


def _get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(str(_DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("""
        CREATE TABLE IF NOT EXISTS profiles (
            user_id TEXT PRIMARY KEY,
            display_name TEXT NOT NULL,
            role TEXT NOT NULL,
            bio TEXT DEFAULT '',
            location TEXT DEFAULT '',
            sector TEXT DEFAULT '',
            specialty TEXT DEFAULT '',
            license_number TEXT DEFAULT '',
            support_areas TEXT DEFAULT '[]',
            neuro_vector TEXT DEFAULT '',
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS game_scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            game TEXT NOT NULL,
            score INTEGER NOT NULL,
            details TEXT DEFAULT '{}',
            played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    return conn


def _get_user_from_request(request: Request):
    """Extract user from JWT token."""
    token = None
    auth_header = request.headers.get("authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[7:]
    if not token:
        token = request.cookies.get("access_token")
    if not token:
        return None
    try:
        return decode_access_token(token, secret=_JWT_SECRET)
    except Exception:
        return None


class ProfileRequest(BaseModel):
    display_name: str
    role: str = "candidate"
    bio: str = ""
    location: str = ""
    sector: str = ""


class TherapistRequest(BaseModel):
    specialty: str
    bio: str = ""
    license_number: str = ""
    support_areas: list[str] = []


class GameScoreRequest(BaseModel):
    game: str
    score: int
    details: dict = {}


class QuizRequest(BaseModel):
    answers: list[dict]


@router.post("/")
async def create_profile(body: ProfileRequest, request: Request) -> JSONResponse:
    user = _get_user_from_request(request)
    if not user:
        return JSONResponse(status_code=401, content={"detail": "No autenticado"})

    db = _get_db()
    existing = db.execute("SELECT user_id FROM profiles WHERE user_id = ?", (user.sub,)).fetchone()
    if existing:
        # Update existing profile
        db.execute(
            "UPDATE profiles SET display_name=?, bio=?, location=?, sector=? WHERE user_id=?",
            (body.display_name, body.bio, body.location, body.sector, user.sub),
        )
    else:
        db.execute(
            "INSERT INTO profiles (user_id, display_name, role, bio, location, sector) VALUES (?, ?, ?, ?, ?, ?)",
            (user.sub, body.display_name, user.role, body.bio, body.location, body.sector),
        )
    db.commit()

    row = db.execute("SELECT * FROM profiles WHERE user_id = ?", (user.sub,)).fetchone()
    db.close()
    return JSONResponse(content=_row_to_dict(row))


@router.post("/therapist")
async def create_therapist(body: TherapistRequest, request: Request) -> JSONResponse:
    user = _get_user_from_request(request)
    if not user:
        return JSONResponse(status_code=401, content={"detail": "No autenticado"})

    db = _get_db()
    existing = db.execute("SELECT user_id FROM profiles WHERE user_id = ?", (user.sub,)).fetchone()
    if existing:
        db.execute(
            "UPDATE profiles SET specialty=?, bio=?, license_number=?, support_areas=? WHERE user_id=?",
            (body.specialty, body.bio, body.license_number, json.dumps(body.support_areas), user.sub),
        )
    else:
        db.execute(
            "INSERT INTO profiles (user_id, display_name, role, specialty, bio, license_number, support_areas) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (user.sub, user.email, "therapist", body.specialty, body.bio, body.license_number, json.dumps(body.support_areas)),
        )
    db.commit()

    row = db.execute("SELECT * FROM profiles WHERE user_id = ?", (user.sub,)).fetchone()
    db.close()
    return JSONResponse(content=_row_to_dict(row))


@router.post("/quiz")
async def submit_quiz(body: QuizRequest, request: Request) -> JSONResponse:
    user = _get_user_from_request(request)
    if not user:
        return JSONResponse(status_code=401, content={"detail": "No autenticado"})

    # Calculate neuro_vector: average scores per dimension
    dim_scores: dict[str, list[float]] = {}
    for a in body.answers:
        dim = a.get("dimension", "")
        val = a.get("value", 0.5)
        dim_scores.setdefault(dim, []).append(val)

    neuro_vector = {dim: round(sum(vals) / len(vals), 3) for dim, vals in dim_scores.items()}

    db = _get_db()
    existing = db.execute("SELECT user_id FROM profiles WHERE user_id = ?", (user.sub,)).fetchone()
    vec_json = json.dumps(neuro_vector)
    if existing:
        db.execute("UPDATE profiles SET neuro_vector=? WHERE user_id=?", (vec_json, user.sub))
    else:
        db.execute(
            "INSERT INTO profiles (user_id, display_name, role, neuro_vector) VALUES (?, ?, ?, ?)",
            (user.sub, user.email, user.role, vec_json),
        )
    db.commit()

    row = db.execute("SELECT * FROM profiles WHERE user_id = ?", (user.sub,)).fetchone()
    db.close()
    return JSONResponse(content=_row_to_dict(row))


@router.get("/me")
async def get_my_profile(request: Request) -> JSONResponse:
    user = _get_user_from_request(request)
    if not user:
        return JSONResponse(status_code=401, content={"detail": "No autenticado"})

    db = _get_db()
    row = db.execute("SELECT * FROM profiles WHERE user_id = ?", (user.sub,)).fetchone()
    db.close()

    if not row:
        return JSONResponse(status_code=404, content={"detail": "Perfil no encontrado"})

    return JSONResponse(content=_row_to_dict(row))


@router.post("/games/score")
async def save_game_score(body: GameScoreRequest, request: Request) -> JSONResponse:
    user = _get_user_from_request(request)
    if not user:
        return JSONResponse(status_code=401, content={"detail": "No autenticado"})

    db = _get_db()
    db.execute(
        "INSERT INTO game_scores (user_id, game, score, details) VALUES (?, ?, ?, ?)",
        (user.sub, body.game, body.score, json.dumps(body.details)),
    )
    db.commit()
    db.close()
    return JSONResponse(content={"status": "ok", "game": body.game, "score": body.score})


@router.get("/games/scores")
async def get_game_scores(request: Request) -> JSONResponse:
    user = _get_user_from_request(request)
    if not user:
        return JSONResponse(status_code=401, content={"detail": "No autenticado"})

    db = _get_db()
    rows = db.execute(
        "SELECT game, MAX(score) as best_score, COUNT(*) as plays FROM game_scores WHERE user_id = ? GROUP BY game",
        (user.sub,),
    ).fetchall()
    db.close()
    scores = {r["game"]: {"best": r["best_score"], "plays": r["plays"]} for r in rows}
    return JSONResponse(content=scores)


def _row_to_dict(row) -> dict:
    d = dict(row)
    for key in ("support_areas", "neuro_vector"):
        if d.get(key) and isinstance(d[key], str):
            try:
                d[key] = json.loads(d[key])
            except (json.JSONDecodeError, TypeError):
                d[key] = [] if key == "support_areas" else None
    return d
