"""Profile API routes — wired to use cases via DI."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from shared.auth import TokenPayload

from ..deps import (
    get_create_profile_use_case,
    get_current_user,
    get_profile_repo,
    get_register_therapist_use_case,
    get_submit_quiz_use_case,
)
from ..schemas import (
    AssessmentResponse,
    CreateProfileRequest,
    ProfileResponse,
    QuizQuestionsListResponse,
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
