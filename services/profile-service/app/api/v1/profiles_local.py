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
            inclusivity_score TEXT DEFAULT '',
            company_size TEXT DEFAULT '',
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    # Migrate: add columns that may be missing from older DBs
    for col, default in [
        ("inclusivity_score", "''"),
        ("company_size", "''"),
    ]:
        try:
            conn.execute(f"ALTER TABLE profiles ADD COLUMN {col} TEXT DEFAULT {default}")
        except sqlite3.OperationalError:
            pass  # column already exists
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
    conn.execute("""
        CREATE TABLE IF NOT EXISTS job_offers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company_user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            location TEXT DEFAULT '',
            modality TEXT DEFAULT 'remote',
            required_skills TEXT DEFAULT '[]',
            adaptations TEXT DEFAULT '[]',
            salary_range TEXT DEFAULT '',
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    company_size: str = ""


class TherapistRequest(BaseModel):
    specialty: str
    bio: str = ""
    license_number: str = ""
    support_areas: list[str] = []


class InclusivityRequest(BaseModel):
    answers: list[dict]


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
            "UPDATE profiles SET display_name=?, bio=?, location=?, sector=?, company_size=? WHERE user_id=?",
            (body.display_name, body.bio, body.location, body.sector, body.company_size, user.sub),
        )
    else:
        db.execute(
            "INSERT INTO profiles (user_id, display_name, role, bio, location, sector, company_size) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (user.sub, body.display_name, user.role, body.bio, body.location, body.sector, body.company_size),
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


@router.post("/inclusivity")
async def submit_inclusivity(body: InclusivityRequest, request: Request) -> JSONResponse:
    user = _get_user_from_request(request)
    if not user:
        return JSONResponse(status_code=401, content={"detail": "No autenticado"})

    # Calculate inclusivity scores per category
    cat_scores: dict[str, list[float]] = {}
    for a in body.answers:
        cat = a.get("category", "")
        val = a.get("value", 0.5)
        cat_scores.setdefault(cat, []).append(val)

    inclusivity_score = {cat: round(sum(vals) / len(vals), 3) for cat, vals in cat_scores.items()}
    # Overall score
    all_vals = [v for vals in cat_scores.values() for v in vals]
    inclusivity_score["overall"] = round(sum(all_vals) / len(all_vals), 3) if all_vals else 0

    db = _get_db()
    score_json = json.dumps(inclusivity_score)
    existing = db.execute("SELECT user_id FROM profiles WHERE user_id = ?", (user.sub,)).fetchone()
    if existing:
        db.execute("UPDATE profiles SET inclusivity_score=? WHERE user_id=?", (score_json, user.sub))
    else:
        db.execute(
            "INSERT INTO profiles (user_id, display_name, role, inclusivity_score) VALUES (?, ?, ?, ?)",
            (user.sub, user.email, user.role, score_json),
        )
    db.commit()

    row = db.execute("SELECT * FROM profiles WHERE user_id = ?", (user.sub,)).fetchone()
    db.close()
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


# ==================== MATCHING ====================

# Maps skills/keywords to relevant 24D dimensions with weights
_SKILL_DIMENSION_MAP: dict[str, list[tuple[str, float]]] = {
    # Technical skills → processing + executive
    "python": [("processing_speed", 0.3), ("executive_planning", 0.4), ("creativity_pattern", 0.3)],
    "javascript": [("processing_speed", 0.3), ("executive_planning", 0.3), ("processing_visual", 0.4)],
    "react": [("processing_visual", 0.4), ("executive_flexibility", 0.3), ("creativity_innovation", 0.3)],
    "typescript": [("processing_accuracy", 0.4), ("executive_planning", 0.3), ("attention_sustained", 0.3)],
    "sql": [("memory_working", 0.3), ("executive_planning", 0.4), ("attention_sustained", 0.3)],
    "css": [("processing_visual", 0.4), ("creativity_divergent", 0.3), ("attention_selective", 0.3)],
    "data": [("creativity_pattern", 0.4), ("processing_accuracy", 0.3), ("memory_working", 0.3)],
    "ai": [("creativity_innovation", 0.3), ("creativity_pattern", 0.4), ("executive_planning", 0.3)],
    "ml": [("creativity_pattern", 0.4), ("processing_accuracy", 0.3), ("executive_planning", 0.3)],
    # Soft skills → social + emotional
    "equipo": [("social_collaboration", 0.4), ("social_communication", 0.3), ("emotional_awareness", 0.3)],
    "trabajo en equipo": [("social_collaboration", 0.4), ("social_communication", 0.3), ("emotional_awareness", 0.3)],
    "comunicacion": [("social_communication", 0.5), ("social_empathy", 0.3), ("emotional_regulation", 0.2)],
    "liderazgo": [("executive_planning", 0.3), ("social_communication", 0.3), ("emotional_regulation", 0.4)],
    "creatividad": [("creativity_divergent", 0.4), ("creativity_innovation", 0.4), ("creativity_pattern", 0.2)],
    "organizacion": [("executive_planning", 0.5), ("attention_sustained", 0.3), ("memory_working", 0.2)],
    "atencion al detalle": [("attention_selective", 0.4), ("processing_accuracy", 0.4), ("attention_sustained", 0.2)],
    "resolucion de problemas": [("executive_flexibility", 0.3), ("creativity_pattern", 0.4), ("executive_planning", 0.3)],
}

# Adaptations boost compatibility (company offers accommodations)
_ADAPTATION_BOOST: dict[str, list[tuple[str, float]]] = {
    "horario flexible": [("executive_planning", 0.1), ("emotional_regulation", 0.1)],
    "espacio silencioso": [("sensory_auditory", 0.15), ("attention_sustained", 0.1)],
    "remoto": [("sensory_visual", 0.05), ("sensory_auditory", 0.1), ("emotional_regulation", 0.1)],
    "100% remoto": [("sensory_visual", 0.05), ("sensory_auditory", 0.1), ("emotional_regulation", 0.1)],
    "auriculares": [("sensory_auditory", 0.15), ("attention_selective", 0.1)],
    "instrucciones escritas": [("memory_working", 0.1), ("attention_selective", 0.1)],
    "fidget toys": [("sensory_tactile", 0.1), ("attention_sustained", 0.1)],
}


def _calculate_match_score(neuro_vector: dict, job: dict) -> dict:
    """Calculate compatibility between a candidate's 24D profile and a job."""
    if not neuro_vector:
        return {"score": 0, "reasons": ["Completa el quiz para ver tu compatibilidad"]}

    skills = job.get("required_skills", [])
    adaptations = job.get("adaptations", [])
    if isinstance(skills, str):
        try:
            skills = json.loads(skills)
        except Exception:
            skills = []
    if isinstance(adaptations, str):
        try:
            adaptations = json.loads(adaptations)
        except Exception:
            adaptations = []

    # Calculate weighted dimension scores for this job
    dim_weights: dict[str, float] = {}
    dim_totals: dict[str, float] = {}

    for skill in skills:
        key = skill.lower().strip()
        mappings = _SKILL_DIMENSION_MAP.get(key, [])
        # Also try partial matches
        if not mappings:
            for map_key, map_dims in _SKILL_DIMENSION_MAP.items():
                if map_key in key or key in map_key:
                    mappings = map_dims
                    break
        for dim, weight in mappings:
            dim_weights[dim] = dim_weights.get(dim, 0) + weight
            dim_totals[dim] = dim_totals.get(dim, 0) + 1

    # If no skill mappings found, use a balanced default
    if not dim_weights:
        for dim in neuro_vector:
            dim_weights[dim] = 1.0
            dim_totals[dim] = 1

    # Calculate base score from candidate's dimensions
    total_score = 0.0
    total_weight = 0.0
    for dim, weight in dim_weights.items():
        val = float(neuro_vector.get(dim, 0.5))
        total_score += val * weight
        total_weight += weight

    base_score = (total_score / total_weight) if total_weight > 0 else 0.5

    # Adaptation boost (company accommodates → higher compatibility)
    boost = 0.0
    for adaptation in adaptations:
        key = adaptation.lower().strip()
        mappings = _ADAPTATION_BOOST.get(key, [])
        if not mappings:
            for map_key, map_dims in _ADAPTATION_BOOST.items():
                if map_key in key or key in map_key:
                    mappings = map_dims
                    break
        for dim, b in mappings:
            boost += b * float(neuro_vector.get(dim, 0.5))

    final_score = min(1.0, base_score + boost * 0.3)

    # Generate reasons
    reasons = []
    sorted_dims = sorted(dim_weights.items(), key=lambda x: float(neuro_vector.get(x[0], 0)) * x[1], reverse=True)
    dim_labels = {
        "attention_sustained": "atencion sostenida", "attention_selective": "atencion selectiva",
        "memory_working": "memoria de trabajo", "processing_speed": "velocidad de proceso",
        "processing_accuracy": "precision", "processing_visual": "proceso visual",
        "executive_planning": "planificacion", "executive_flexibility": "flexibilidad cognitiva",
        "social_collaboration": "colaboracion", "social_communication": "comunicacion",
        "creativity_divergent": "pensamiento divergente", "creativity_pattern": "deteccion de patrones",
        "creativity_innovation": "innovacion", "emotional_regulation": "regulacion emocional",
        "sensory_auditory": "sensibilidad auditiva", "sensory_visual": "sensibilidad visual",
    }
    for dim, _ in sorted_dims[:3]:
        label = dim_labels.get(dim, dim.replace("_", " "))
        val = float(neuro_vector.get(dim, 0))
        if val >= 0.7:
            reasons.append(f"Tu {label} es una fortaleza clave para este puesto")
        elif val >= 0.5:
            reasons.append(f"Tu {label} se alinea bien con los requisitos")

    if adaptations:
        reasons.append(f"La empresa ofrece {len(adaptations)} adaptacion(es)")

    return {"score": round(final_score, 3), "pct": round(final_score * 100), "reasons": reasons}


@router.get("/jobs/matched")
async def get_matched_jobs(request: Request) -> JSONResponse:
    """Get all active jobs with compatibility scores for the current candidate."""
    user = _get_user_from_request(request)
    if not user:
        return JSONResponse(status_code=401, content={"detail": "No autenticado"})

    db = _get_db()
    # Get candidate's neuro_vector
    profile = db.execute("SELECT neuro_vector FROM profiles WHERE user_id = ?", (user.sub,)).fetchone()
    neuro_vector = {}
    if profile and profile["neuro_vector"]:
        try:
            nv = profile["neuro_vector"]
            neuro_vector = json.loads(nv) if isinstance(nv, str) else nv
        except Exception:
            pass

    # Get all active jobs with company info
    rows = db.execute("""
        SELECT j.*, p.display_name as company_name, p.sector as company_sector,
               p.inclusivity_score as company_inclusivity
        FROM job_offers j
        LEFT JOIN profiles p ON j.company_user_id = p.user_id
        WHERE j.status = 'active'
        ORDER BY j.created_at DESC
    """).fetchall()
    db.close()

    results = []
    for row in rows:
        job = _job_to_dict(dict(row))
        match = _calculate_match_score(neuro_vector, job)
        job["match"] = match
        # Parse company inclusivity
        inc = job.pop("company_inclusivity", None)
        if inc and isinstance(inc, str):
            try:
                inc = json.loads(inc)
            except Exception:
                inc = None
        job["company_inclusivity"] = inc
        results.append(job)

    # Sort by match score descending
    results.sort(key=lambda x: x["match"]["score"], reverse=True)
    return JSONResponse(content=results)


# ==================== JOB OFFERS ====================

class JobOfferRequest(BaseModel):
    title: str
    description: str = ""
    location: str = ""
    modality: str = "remote"
    required_skills: list[str] = []
    adaptations: list[str] = []
    salary_range: str = ""


@router.post("/jobs")
async def create_job(body: JobOfferRequest, request: Request) -> JSONResponse:
    user = _get_user_from_request(request)
    if not user:
        return JSONResponse(status_code=401, content={"detail": "No autenticado"})
    if user.role != "company":
        return JSONResponse(status_code=403, content={"detail": "Solo empresas pueden publicar ofertas"})

    db = _get_db()
    cursor = db.execute(
        """INSERT INTO job_offers (company_user_id, title, description, location, modality,
           required_skills, adaptations, salary_range)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (user.sub, body.title, body.description, body.location, body.modality,
         json.dumps(body.required_skills), json.dumps(body.adaptations), body.salary_range),
    )
    job_id = cursor.lastrowid
    db.commit()
    row = db.execute("SELECT * FROM job_offers WHERE id = ?", (job_id,)).fetchone()
    db.close()
    return JSONResponse(content=_job_to_dict(row))


@router.get("/jobs")
async def get_my_jobs(request: Request) -> JSONResponse:
    user = _get_user_from_request(request)
    if not user:
        return JSONResponse(status_code=401, content={"detail": "No autenticado"})

    db = _get_db()
    if user.role == "company":
        rows = db.execute(
            "SELECT * FROM job_offers WHERE company_user_id = ? ORDER BY created_at DESC", (user.sub,)
        ).fetchall()
    else:
        # Candidates and therapists see all active offers
        rows = db.execute(
            "SELECT * FROM job_offers WHERE status = 'active' ORDER BY created_at DESC"
        ).fetchall()
    db.close()
    return JSONResponse(content=[_job_to_dict(r) for r in rows])


@router.delete("/jobs/{job_id}")
async def delete_job(job_id: int, request: Request) -> JSONResponse:
    user = _get_user_from_request(request)
    if not user:
        return JSONResponse(status_code=401, content={"detail": "No autenticado"})

    db = _get_db()
    row = db.execute("SELECT * FROM job_offers WHERE id = ? AND company_user_id = ?", (job_id, user.sub)).fetchone()
    if not row:
        db.close()
        return JSONResponse(status_code=404, content={"detail": "Oferta no encontrada"})

    db.execute("UPDATE job_offers SET status = 'closed' WHERE id = ?", (job_id,))
    db.commit()
    db.close()
    return JSONResponse(content={"status": "ok", "id": job_id})


def _job_to_dict(row) -> dict:
    d = dict(row)
    for key in ("required_skills", "adaptations"):
        if d.get(key) and isinstance(d[key], str):
            try:
                d[key] = json.loads(d[key])
            except (json.JSONDecodeError, TypeError):
                d[key] = []
    return d


def _row_to_dict(row) -> dict:
    d = dict(row)
    for key in ("support_areas", "neuro_vector", "inclusivity_score"):
        if d.get(key) and isinstance(d[key], str):
            try:
                d[key] = json.loads(d[key])
            except (json.JSONDecodeError, TypeError):
                d[key] = [] if key == "support_areas" else None
    return d
