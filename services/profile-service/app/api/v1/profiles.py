"""Profile API routes — wired to use cases via DI."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse

from shared.auth import TokenPayload
from shared.domain.value_objects import ALL_DIMENSIONS

from ..deps import (
    get_create_profile_use_case,
    get_current_user,
    get_game_score_repo,
    get_job_repo,
    get_profile_repo,
    get_register_therapist_use_case,
    get_submit_quiz_use_case,
)
from ..schemas import (
    AssessmentResponse,
    CreateJobRequest,
    CreateProfileRequest,
    JobOfferResponse,
    MatchedJobResponse,
    ProfileResponse,
    QuizQuestionsListResponse,
    SaveGameScoreRequest,
    SubmitInclusivityRequest,
    SubmitQuizRequest,
    TherapistRegisterRequest,
    TherapistResponse,
)
from app.application.dto.profile_dto import (
    CreateProfileDTO,
    QuizAnswerDTO,
    SubmitQuizDTO,
    TherapistProfileDTO,
)
from app.application.use_cases.create_profile import CreateProfileUseCase, DuplicateProfileError
from app.application.use_cases.submit_quiz import SubmitQuizUseCase
from app.application.use_cases.register_therapist import (
    RegisterTherapistUseCase,
    TherapistAlreadyRegisteredError,
)
from app.domain.entities.profile import ProfileError, ProfileNotFoundError
from app.infrastructure.persistence.profile_repository import SQLAlchemyProfileRepository
from app.infrastructure.persistence.job_repository import SQLAlchemyJobRepository
from app.infrastructure.persistence.game_score_repository import SQLAlchemyGameScoreRepository
from app.infrastructure.persistence.models import JobOfferModel, GameScoreModel

router = APIRouter(prefix="/api/v1/profiles", tags=["profiles"])


@router.post("/", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_profile(
    body: CreateProfileRequest,
    current_user: TokenPayload = Depends(get_current_user),
    use_case: CreateProfileUseCase = Depends(get_create_profile_use_case),
) -> ProfileResponse:
    """Create a user profile during onboarding."""
    try:
        result = await use_case.execute(
            CreateProfileDTO(
                user_id=current_user.sub,
                role=body.role,
                display_name=body.display_name,
                bio=body.bio,
            )
        )
    except DuplicateProfileError:
        raise HTTPException(status_code=409, detail="Profile already exists")
    except ProfileError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return ProfileResponse(**result.__dict__)


@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(
    current_user: TokenPayload = Depends(get_current_user),
    profile_repo: SQLAlchemyProfileRepository = Depends(get_profile_repo),
) -> ProfileResponse:
    """Get current user's profile."""
    profile = await profile_repo.find_by_user_id(current_user.sub)
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")

    return ProfileResponse(
        profile_id=profile.id,
        user_id=profile.user_id,
        role=profile.role.value,
        display_name=profile.display_name,
        bio=profile.bio,
        status=profile.status.value,
        has_neuro_vector=profile.is_assessment_complete(),
        onboarding_completed=profile.onboarding_completed,
    )


@router.post("/quiz", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
async def submit_quiz(
    body: SubmitQuizRequest,
    current_user: TokenPayload = Depends(get_current_user),
    use_case: SubmitQuizUseCase = Depends(get_submit_quiz_use_case),
) -> AssessmentResponse:
    """Submit neurocognitive quiz answers and calculate neuro-vector."""
    try:
        result = await use_case.execute(
            SubmitQuizDTO(
                user_id=current_user.sub,
                answers=[
                    QuizAnswerDTO(
                        question_id=a.question_id,
                        dimension=a.dimension,
                        value=a.value,
                    )
                    for a in body.answers
                ],
            )
        )
    except ProfileNotFoundError:
        raise HTTPException(status_code=404, detail="Profile not found — complete onboarding first")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return AssessmentResponse(**result.__dict__)


@router.get("/quiz/questions", response_model=QuizQuestionsListResponse)
async def get_quiz_questions() -> QuizQuestionsListResponse:
    """Return the 24-dimension neurocognitive quiz questions.

    Public endpoint — no auth required. Questions are deterministic
    and mapped 1:1 to NeuroVector24D dimensions.
    """
    from shared.domain.value_objects import (
        ALL_DIMENSIONS,
        COGNITIVE_DIMS,
        SOCIAL_DIMS,
        WORK_DIMS,
        TECHNICAL_DIMS,
    )

    QUESTION_TEXTS = {
        "attention": ("Puedo mantener la concentración en una tarea durante periodos largos", "I can sustain focus on a task for long periods"),
        "memory": ("Recuerdo bien información que he aprendido recientemente", "I remember recently learned information well"),
        "processing_speed": ("Proceso información y tomo decisiones rápidamente", "I process information and make decisions quickly"),
        "pattern_recognition": ("Detecto patrones y conexiones que otros no ven", "I detect patterns and connections others miss"),
        "creative_thinking": ("Genero ideas originales y soluciones creativas", "I generate original ideas and creative solutions"),
        "analytical_thinking": ("Analizo problemas complejos de forma metódica", "I analyze complex problems methodically"),
        "verbal_reasoning": ("Me expreso bien verbalmente y comprendo textos complejos", "I express myself well verbally and understand complex texts"),
        "spatial_reasoning": ("Proceso bien información visual como gráficos y diagramas", "I process visual information like charts and diagrams well"),
        "communication_style": ("Me comunico de forma clara y entiendo a los demás", "I communicate clearly and understand others"),
        "teamwork": ("Trabajo bien en equipo y colaboro activamente", "I work well in teams and actively collaborate"),
        "leadership": ("Tomo la iniciativa y guío a otros cuando es necesario", "I take initiative and guide others when needed"),
        "conflict_resolution": ("Resuelvo desacuerdos de forma constructiva", "I resolve disagreements constructively"),
        "task_switching": ("Me adapto bien cuando cambian los planes o tareas", "I adapt well when plans or tasks change"),
        "deadline_management": ("Gestiono bien los plazos y entregas", "I manage deadlines and deliverables well"),
        "autonomy": ("Trabajo mejor cuando tengo libertad para decidir cómo hacer las cosas", "I work best when I have freedom to decide how to do things"),
        "structure_need": ("Necesito instrucciones claras y estructura para ser productivo", "I need clear instructions and structure to be productive"),
        "sensory_sensitivity": ("Soy sensible a estímulos sensoriales (ruidos, luces, texturas)", "I am sensitive to sensory stimuli (noise, lights, textures)"),
        "stress_tolerance": ("Gestiono bien mis emociones en situaciones de estrés", "I manage my emotions well in stressful situations"),
        "domain_expertise": ("Tengo conocimiento profundo en mi área de especialización", "I have deep knowledge in my area of expertise"),
        "learning_speed": ("Aprendo nuevos conceptos y habilidades rápidamente", "I learn new concepts and skills quickly"),
        "problem_solving": ("Encuentro soluciones efectivas a problemas difíciles", "I find effective solutions to difficult problems"),
        "detail_orientation": ("Presto atención a los detalles y soy minucioso", "I pay attention to details and am thorough"),
        "abstract_thinking": ("Comprendo bien conceptos abstractos y teóricos", "I understand abstract and theoretical concepts well"),
        "technical_depth": ("Disfruto profundizando en temas técnicos complejos", "I enjoy diving deep into complex technical topics"),
    }

    def _category_for(dim: str) -> str:
        if dim in COGNITIVE_DIMS:
            return "cognitive"
        if dim in SOCIAL_DIMS:
            return "social"
        if dim in WORK_DIMS:
            return "work"
        return "technical"

    questions = [
        {
            "question_id": f"q_{i}",
            "dimension": dim,
            "category": _category_for(dim),
            "text_es": QUESTION_TEXTS[dim][0],
            "text_en": QUESTION_TEXTS[dim][1],
        }
        for i, dim in enumerate(ALL_DIMENSIONS)
    ]

    return QuizQuestionsListResponse(
        total=len(questions),
        dimensions=24,
        questions=questions,
    )


@router.post("/therapist", response_model=TherapistResponse, status_code=status.HTTP_201_CREATED)
async def register_therapist(
    body: TherapistRegisterRequest,
    current_user: TokenPayload = Depends(get_current_user),
    use_case: RegisterTherapistUseCase = Depends(get_register_therapist_use_case),
) -> TherapistResponse:
    """Register therapist professional profile (requires admin verification)."""
    try:
        result = await use_case.execute(
            TherapistProfileDTO(
                user_id=current_user.sub,
                specialty=body.specialty,
                bio=body.bio,
                support_areas=body.support_areas,
                license_number=body.license_number,
            )
        )
    except TherapistAlreadyRegisteredError:
        raise HTTPException(status_code=409, detail="Therapist profile already registered")

    return TherapistResponse(**result.__dict__)


# ═══════════════════════════════════════════════════════════════════
# Job Offers CRUD
# ═══════════════════════════════════════════════════════════════════


def _gen_id() -> str:
    return uuid.uuid4().hex[:25]


@router.post("/jobs", response_model=JobOfferResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    body: CreateJobRequest,
    current_user: TokenPayload = Depends(get_current_user),
    job_repo: SQLAlchemyJobRepository = Depends(get_job_repo),
) -> JobOfferResponse:
    """Create a job offer (company role only)."""
    if current_user.role != "company":
        raise HTTPException(status_code=403, detail="Solo empresas pueden publicar ofertas")

    now = datetime.now(timezone.utc)
    model = JobOfferModel(
        id=_gen_id(),
        company_user_id=current_user.sub,
        title=body.title,
        description=body.description,
        location=body.location,
        modality=body.modality,
        required_skills=body.required_skills,
        adaptations=body.adaptations,
        salary_range=body.salary_range,
        status="active",
        created_at=now,
        updated_at=now,
    )
    await job_repo.create(model)
    return _job_model_to_response(model)


@router.get("/jobs", response_model=list[JobOfferResponse])
async def get_jobs(
    current_user: TokenPayload = Depends(get_current_user),
    job_repo: SQLAlchemyJobRepository = Depends(get_job_repo),
) -> list[JobOfferResponse]:
    """List jobs: company sees own jobs, others see all active."""
    if current_user.role == "company":
        jobs = await job_repo.find_by_company(current_user.sub)
    else:
        jobs = await job_repo.find_active()
    return [_job_model_to_response(j) for j in jobs]


@router.delete("/jobs/{job_id}")
async def delete_job(
    job_id: str,
    current_user: TokenPayload = Depends(get_current_user),
    job_repo: SQLAlchemyJobRepository = Depends(get_job_repo),
) -> JSONResponse:
    """Close a job offer (soft delete, company owner only)."""
    closed = await job_repo.close(job_id, current_user.sub)
    if not closed:
        raise HTTPException(status_code=404, detail="Oferta no encontrada")
    return JSONResponse(content={"status": "ok", "id": job_id})


@router.get("/jobs/matched", response_model=list[MatchedJobResponse])
async def get_matched_jobs(
    current_user: TokenPayload = Depends(get_current_user),
    profile_repo: SQLAlchemyProfileRepository = Depends(get_profile_repo),
    job_repo: SQLAlchemyJobRepository = Depends(get_job_repo),
) -> list[MatchedJobResponse]:
    """Get active jobs with compatibility scores for the current candidate."""
    profile = await profile_repo.find_by_user_id(current_user.sub)
    neuro_vector: dict[str, float] = {}
    if profile and profile.neuro_vector:
        neuro_vector = {dim: getattr(profile.neuro_vector, dim) for dim in ALL_DIMENSIONS}

    rows = await job_repo.find_active_with_company_info()
    results = []
    for row in rows:
        job: JobOfferModel = row["job"]
        match = _calculate_match_score(neuro_vector, job)
        results.append(MatchedJobResponse(
            id=job.id,
            title=job.title,
            description=job.description,
            location=job.location,
            modality=job.modality,
            required_skills=job.required_skills if isinstance(job.required_skills, list) else [],
            adaptations=job.adaptations if isinstance(job.adaptations, list) else [],
            salary_range=job.salary_range,
            company_name=row["company_name"],
            company_sector=row["company_sector"],
            match_score=match["score"],
            match_pct=match["pct"],
            match_reasons=match["reasons"],
        ))

    results.sort(key=lambda x: x.match_score, reverse=True)
    return results


def _job_model_to_response(model: JobOfferModel) -> JobOfferResponse:
    return JobOfferResponse(
        id=model.id,
        company_user_id=model.company_user_id,
        title=model.title,
        description=model.description,
        location=model.location,
        modality=model.modality,
        required_skills=model.required_skills if isinstance(model.required_skills, list) else [],
        adaptations=model.adaptations if isinstance(model.adaptations, list) else [],
        salary_range=model.salary_range,
        status=model.status,
    )


# ═══════════════════════════════════════════════════════════════════
# Game Scores (Brain Suite)
# ═══════════════════════════════════════════════════════════════════


@router.post("/games/score")
async def save_game_score(
    body: SaveGameScoreRequest,
    current_user: TokenPayload = Depends(get_current_user),
    game_repo: SQLAlchemyGameScoreRepository = Depends(get_game_score_repo),
) -> JSONResponse:
    """Save a Brain Suite game score."""
    model = GameScoreModel(
        id=_gen_id(),
        user_id=current_user.sub,
        game=body.game,
        score=body.score,
        details=body.details,
        played_at=datetime.now(timezone.utc),
    )
    await game_repo.save(model)
    return JSONResponse(content={"status": "ok", "game": body.game, "score": body.score})


@router.get("/games/scores")
async def get_game_scores(
    current_user: TokenPayload = Depends(get_current_user),
    game_repo: SQLAlchemyGameScoreRepository = Depends(get_game_score_repo),
) -> JSONResponse:
    """Get best scores per game for the current user."""
    scores = await game_repo.get_best_scores(current_user.sub)
    return JSONResponse(content=scores)


# ═══════════════════════════════════════════════════════════════════
# Inclusivity Score (Company self-assessment)
# ═══════════════════════════════════════════════════════════════════


@router.post("/inclusivity")
async def submit_inclusivity(
    body: SubmitInclusivityRequest,
    current_user: TokenPayload = Depends(get_current_user),
    profile_repo: SQLAlchemyProfileRepository = Depends(get_profile_repo),
) -> JSONResponse:
    """Submit company inclusivity self-assessment. Stores result in profile bio field as JSON."""
    profile = await profile_repo.find_by_user_id(current_user.sub)
    if profile is None:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")

    cat_scores: dict[str, list[float]] = {}
    for a in body.answers:
        cat_scores.setdefault(a.category, []).append(a.value)

    inclusivity: dict[str, float] = {
        cat: round(sum(vals) / len(vals), 3) for cat, vals in cat_scores.items()
    }
    all_vals = [v for vals in cat_scores.values() for v in vals]
    inclusivity["overall"] = round(sum(all_vals) / len(all_vals), 3) if all_vals else 0

    return JSONResponse(content=inclusivity)


# ═══════════════════════════════════════════════════════════════════
# Local matching score (simplified — full trilateral in matching-service)
# ═══════════════════════════════════════════════════════════════════


_SKILL_DIMENSION_MAP: dict[str, list[tuple[str, float]]] = {
    "python": [("processing_speed", 0.3), ("analytical_thinking", 0.4), ("pattern_recognition", 0.3)],
    "javascript": [("processing_speed", 0.3), ("analytical_thinking", 0.3), ("spatial_reasoning", 0.4)],
    "react": [("spatial_reasoning", 0.4), ("task_switching", 0.3), ("creative_thinking", 0.3)],
    "typescript": [("detail_orientation", 0.4), ("analytical_thinking", 0.3), ("attention", 0.3)],
    "sql": [("memory", 0.3), ("analytical_thinking", 0.4), ("attention", 0.3)],
    "css": [("spatial_reasoning", 0.4), ("creative_thinking", 0.3), ("attention", 0.3)],
    "data": [("pattern_recognition", 0.4), ("detail_orientation", 0.3), ("memory", 0.3)],
    "ai": [("creative_thinking", 0.3), ("pattern_recognition", 0.4), ("analytical_thinking", 0.3)],
    "ml": [("pattern_recognition", 0.4), ("detail_orientation", 0.3), ("analytical_thinking", 0.3)],
    "equipo": [("teamwork", 0.4), ("communication_style", 0.3), ("conflict_resolution", 0.3)],
    "comunicacion": [("communication_style", 0.5), ("teamwork", 0.3), ("stress_tolerance", 0.2)],
    "liderazgo": [("leadership", 0.4), ("communication_style", 0.3), ("stress_tolerance", 0.3)],
    "creatividad": [("creative_thinking", 0.5), ("pattern_recognition", 0.3), ("abstract_thinking", 0.2)],
    "organizacion": [("deadline_management", 0.4), ("attention", 0.3), ("memory", 0.3)],
}

_ADAPTATION_BOOST: dict[str, list[tuple[str, float]]] = {
    "horario flexible": [("deadline_management", 0.1), ("stress_tolerance", 0.1)],
    "espacio silencioso": [("sensory_sensitivity", 0.15), ("attention", 0.1)],
    "remoto": [("autonomy", 0.1), ("sensory_sensitivity", 0.1), ("stress_tolerance", 0.1)],
    "auriculares": [("sensory_sensitivity", 0.15), ("attention", 0.1)],
    "instrucciones escritas": [("memory", 0.1), ("structure_need", 0.1)],
}


def _calculate_match_score(neuro_vector: dict[str, float], job: JobOfferModel) -> dict:
    if not neuro_vector:
        return {"score": 0, "pct": 0, "reasons": ["Completa el quiz para ver tu compatibilidad"]}

    skills = job.required_skills if isinstance(job.required_skills, list) else []
    adaptations = job.adaptations if isinstance(job.adaptations, list) else []

    dim_weights: dict[str, float] = {}
    for skill in skills:
        key = skill.lower().strip()
        mappings = _SKILL_DIMENSION_MAP.get(key, [])
        if not mappings:
            for map_key, map_dims in _SKILL_DIMENSION_MAP.items():
                if map_key in key or key in map_key:
                    mappings = map_dims
                    break
        for dim, weight in mappings:
            dim_weights[dim] = dim_weights.get(dim, 0) + weight

    if not dim_weights:
        for dim in neuro_vector:
            dim_weights[dim] = 1.0

    total_score = 0.0
    total_weight = 0.0
    for dim, weight in dim_weights.items():
        val = float(neuro_vector.get(dim, 0.5))
        total_score += val * weight
        total_weight += weight

    base_score = (total_score / total_weight) if total_weight > 0 else 0.5

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

    reasons = []
    sorted_dims = sorted(dim_weights.items(), key=lambda x: float(neuro_vector.get(x[0], 0)) * x[1], reverse=True)
    dim_labels = {
        "attention": "atencion sostenida", "memory": "memoria de trabajo",
        "processing_speed": "velocidad de proceso", "pattern_recognition": "deteccion de patrones",
        "creative_thinking": "pensamiento creativo", "analytical_thinking": "pensamiento analitico",
        "communication_style": "comunicacion", "teamwork": "colaboracion",
        "leadership": "liderazgo", "sensory_sensitivity": "sensibilidad sensorial",
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
