"""20 neurodivergent archetypes with NeuroVector24D profiles.

Each archetype represents a common neurodivergent strengths pattern.
Vectors are normalized 0.0-1.0. Higher = stronger in that dimension.
These are non-pathologizing, strengths-based profiles for seeding
the matching system with realistic test data.

Usage:
    from shared.seed_archetypes import ARCHETYPES
    for archetype in ARCHETYPES:
        vector = NeuroVector24D(**archetype["vector"])
"""

ARCHETYPES: list[dict] = [
    # --- ADHD variants ---
    {
        "name": "ADHD Creative Spark",
        "description": "High creativity, rapid idea generation, thrives in dynamic environments",
        "diagnoses": ["ADHD-Combined"],
        "vector": {
            "attention": 0.35, "memory": 0.50, "processing_speed": 0.75,
            "pattern_recognition": 0.70, "creative_thinking": 0.95, "analytical_thinking": 0.55,
            "verbal_reasoning": 0.70, "spatial_reasoning": 0.65,
            "communication_style": 0.80, "teamwork": 0.65, "leadership": 0.60,
            "conflict_resolution": 0.45,
            "task_switching": 0.85, "deadline_management": 0.30, "autonomy": 0.80,
            "structure_need": 0.25, "sensory_sensitivity": 0.55, "stress_tolerance": 0.50,
            "domain_expertise": 0.50, "learning_speed": 0.80, "problem_solving": 0.75,
            "detail_orientation": 0.30, "abstract_thinking": 0.85, "technical_depth": 0.45,
        },
    },
    {
        "name": "ADHD Hyperfocus Engineer",
        "description": "Deep technical focus in bursts, excellent problem-solver under pressure",
        "diagnoses": ["ADHD-Inattentive"],
        "vector": {
            "attention": 0.40, "memory": 0.55, "processing_speed": 0.80,
            "pattern_recognition": 0.85, "creative_thinking": 0.70, "analytical_thinking": 0.80,
            "verbal_reasoning": 0.50, "spatial_reasoning": 0.75,
            "communication_style": 0.45, "teamwork": 0.50, "leadership": 0.40,
            "conflict_resolution": 0.35,
            "task_switching": 0.70, "deadline_management": 0.35, "autonomy": 0.90,
            "structure_need": 0.30, "sensory_sensitivity": 0.60, "stress_tolerance": 0.55,
            "domain_expertise": 0.75, "learning_speed": 0.85, "problem_solving": 0.90,
            "detail_orientation": 0.45, "abstract_thinking": 0.80, "technical_depth": 0.85,
        },
    },
    {
        "name": "ADHD Social Connector",
        "description": "Energetic communicator, natural networker, excels in people-facing roles",
        "diagnoses": ["ADHD-Hyperactive"],
        "vector": {
            "attention": 0.30, "memory": 0.45, "processing_speed": 0.85,
            "pattern_recognition": 0.55, "creative_thinking": 0.75, "analytical_thinking": 0.40,
            "verbal_reasoning": 0.85, "spatial_reasoning": 0.40,
            "communication_style": 0.95, "teamwork": 0.85, "leadership": 0.80,
            "conflict_resolution": 0.60,
            "task_switching": 0.90, "deadline_management": 0.25, "autonomy": 0.70,
            "structure_need": 0.20, "sensory_sensitivity": 0.40, "stress_tolerance": 0.65,
            "domain_expertise": 0.40, "learning_speed": 0.75, "problem_solving": 0.55,
            "detail_orientation": 0.25, "abstract_thinking": 0.60, "technical_depth": 0.30,
        },
    },

    # --- Autism variants ---
    {
        "name": "Autistic Systems Thinker",
        "description": "Exceptional at finding patterns in complex systems, systematic approach",
        "diagnoses": ["ASD Level 1"],
        "vector": {
            "attention": 0.85, "memory": 0.80, "processing_speed": 0.55,
            "pattern_recognition": 0.95, "creative_thinking": 0.60, "analytical_thinking": 0.95,
            "verbal_reasoning": 0.55, "spatial_reasoning": 0.80,
            "communication_style": 0.30, "teamwork": 0.35, "leadership": 0.25,
            "conflict_resolution": 0.25,
            "task_switching": 0.25, "deadline_management": 0.80, "autonomy": 0.85,
            "structure_need": 0.90, "sensory_sensitivity": 0.80, "stress_tolerance": 0.40,
            "domain_expertise": 0.90, "learning_speed": 0.70, "problem_solving": 0.85,
            "detail_orientation": 0.95, "abstract_thinking": 0.80, "technical_depth": 0.95,
        },
    },
    {
        "name": "Autistic Detail Master",
        "description": "Exceptional eye for detail, accuracy-focused, quality assurance natural",
        "diagnoses": ["ASD Level 1"],
        "vector": {
            "attention": 0.90, "memory": 0.85, "processing_speed": 0.50,
            "pattern_recognition": 0.85, "creative_thinking": 0.45, "analytical_thinking": 0.90,
            "verbal_reasoning": 0.50, "spatial_reasoning": 0.70,
            "communication_style": 0.25, "teamwork": 0.30, "leadership": 0.20,
            "conflict_resolution": 0.20,
            "task_switching": 0.20, "deadline_management": 0.85, "autonomy": 0.80,
            "structure_need": 0.95, "sensory_sensitivity": 0.85, "stress_tolerance": 0.35,
            "domain_expertise": 0.85, "learning_speed": 0.65, "problem_solving": 0.80,
            "detail_orientation": 0.98, "abstract_thinking": 0.70, "technical_depth": 0.90,
        },
    },
    {
        "name": "Autistic Creative Visual",
        "description": "Visual-spatial genius, exceptional artistic/design ability",
        "diagnoses": ["ASD Level 1"],
        "vector": {
            "attention": 0.75, "memory": 0.70, "processing_speed": 0.45,
            "pattern_recognition": 0.90, "creative_thinking": 0.95, "analytical_thinking": 0.60,
            "verbal_reasoning": 0.35, "spatial_reasoning": 0.98,
            "communication_style": 0.25, "teamwork": 0.30, "leadership": 0.20,
            "conflict_resolution": 0.25,
            "task_switching": 0.30, "deadline_management": 0.65, "autonomy": 0.90,
            "structure_need": 0.75, "sensory_sensitivity": 0.90, "stress_tolerance": 0.40,
            "domain_expertise": 0.80, "learning_speed": 0.70, "problem_solving": 0.75,
            "detail_orientation": 0.90, "abstract_thinking": 0.85, "technical_depth": 0.70,
        },
    },
    {
        "name": "Autistic Data Analyst",
        "description": "Loves working with data, exceptional memory for facts and figures",
        "diagnoses": ["ASD Level 1"],
        "vector": {
            "attention": 0.90, "memory": 0.95, "processing_speed": 0.60,
            "pattern_recognition": 0.95, "creative_thinking": 0.35, "analytical_thinking": 0.95,
            "verbal_reasoning": 0.45, "spatial_reasoning": 0.65,
            "communication_style": 0.30, "teamwork": 0.25, "leadership": 0.15,
            "conflict_resolution": 0.20,
            "task_switching": 0.20, "deadline_management": 0.90, "autonomy": 0.85,
            "structure_need": 0.95, "sensory_sensitivity": 0.75, "stress_tolerance": 0.45,
            "domain_expertise": 0.90, "learning_speed": 0.75, "problem_solving": 0.85,
            "detail_orientation": 0.95, "abstract_thinking": 0.75, "technical_depth": 0.90,
        },
    },

    # --- Dyslexia variants ---
    {
        "name": "Dyslexic Big-Picture Strategist",
        "description": "Exceptional at seeing the big picture, strong narrative and spatial thinking",
        "diagnoses": ["Dyslexia"],
        "vector": {
            "attention": 0.60, "memory": 0.50, "processing_speed": 0.45,
            "pattern_recognition": 0.80, "creative_thinking": 0.90, "analytical_thinking": 0.65,
            "verbal_reasoning": 0.75, "spatial_reasoning": 0.90,
            "communication_style": 0.80, "teamwork": 0.75, "leadership": 0.85,
            "conflict_resolution": 0.70,
            "task_switching": 0.60, "deadline_management": 0.50, "autonomy": 0.75,
            "structure_need": 0.40, "sensory_sensitivity": 0.35, "stress_tolerance": 0.70,
            "domain_expertise": 0.55, "learning_speed": 0.50, "problem_solving": 0.85,
            "detail_orientation": 0.30, "abstract_thinking": 0.90, "technical_depth": 0.40,
        },
    },
    {
        "name": "Dyslexic Entrepreneur",
        "description": "Risk-taker with strong intuition, excels at novel problem-solving",
        "diagnoses": ["Dyslexia"],
        "vector": {
            "attention": 0.55, "memory": 0.45, "processing_speed": 0.50,
            "pattern_recognition": 0.75, "creative_thinking": 0.90, "analytical_thinking": 0.55,
            "verbal_reasoning": 0.80, "spatial_reasoning": 0.85,
            "communication_style": 0.85, "teamwork": 0.70, "leadership": 0.90,
            "conflict_resolution": 0.65,
            "task_switching": 0.70, "deadline_management": 0.45, "autonomy": 0.90,
            "structure_need": 0.30, "sensory_sensitivity": 0.30, "stress_tolerance": 0.75,
            "domain_expertise": 0.50, "learning_speed": 0.55, "problem_solving": 0.85,
            "detail_orientation": 0.25, "abstract_thinking": 0.85, "technical_depth": 0.35,
        },
    },

    # --- Dyscalculia ---
    {
        "name": "Dyscalculic Communicator",
        "description": "Strong verbal and written communication, empathetic, people-oriented",
        "diagnoses": ["Dyscalculia"],
        "vector": {
            "attention": 0.65, "memory": 0.60, "processing_speed": 0.50,
            "pattern_recognition": 0.45, "creative_thinking": 0.70, "analytical_thinking": 0.35,
            "verbal_reasoning": 0.90, "spatial_reasoning": 0.40,
            "communication_style": 0.95, "teamwork": 0.85, "leadership": 0.70,
            "conflict_resolution": 0.80,
            "task_switching": 0.60, "deadline_management": 0.55, "autonomy": 0.60,
            "structure_need": 0.50, "sensory_sensitivity": 0.35, "stress_tolerance": 0.70,
            "domain_expertise": 0.50, "learning_speed": 0.55, "problem_solving": 0.50,
            "detail_orientation": 0.55, "abstract_thinking": 0.55, "technical_depth": 0.30,
        },
    },

    # --- Dyspraxia ---
    {
        "name": "Dyspraxic Strategic Planner",
        "description": "Excellent at verbal reasoning and planning, strong conceptual thinker",
        "diagnoses": ["Dyspraxia/DCD"],
        "vector": {
            "attention": 0.65, "memory": 0.70, "processing_speed": 0.40,
            "pattern_recognition": 0.65, "creative_thinking": 0.75, "analytical_thinking": 0.80,
            "verbal_reasoning": 0.85, "spatial_reasoning": 0.35,
            "communication_style": 0.70, "teamwork": 0.65, "leadership": 0.70,
            "conflict_resolution": 0.60,
            "task_switching": 0.45, "deadline_management": 0.60, "autonomy": 0.70,
            "structure_need": 0.65, "sensory_sensitivity": 0.50, "stress_tolerance": 0.55,
            "domain_expertise": 0.60, "learning_speed": 0.60, "problem_solving": 0.75,
            "detail_orientation": 0.50, "abstract_thinking": 0.80, "technical_depth": 0.55,
        },
    },

    # --- Tourette's ---
    {
        "name": "Tourette's Focus Fighter",
        "description": "Developed exceptional focus and resilience through tic management",
        "diagnoses": ["Tourette Syndrome"],
        "vector": {
            "attention": 0.70, "memory": 0.65, "processing_speed": 0.60,
            "pattern_recognition": 0.60, "creative_thinking": 0.65, "analytical_thinking": 0.65,
            "verbal_reasoning": 0.70, "spatial_reasoning": 0.55,
            "communication_style": 0.60, "teamwork": 0.55, "leadership": 0.50,
            "conflict_resolution": 0.55,
            "task_switching": 0.55, "deadline_management": 0.65, "autonomy": 0.70,
            "structure_need": 0.60, "sensory_sensitivity": 0.70, "stress_tolerance": 0.75,
            "domain_expertise": 0.60, "learning_speed": 0.65, "problem_solving": 0.65,
            "detail_orientation": 0.60, "abstract_thinking": 0.60, "technical_depth": 0.60,
        },
    },

    # --- Combined / dual diagnosis ---
    {
        "name": "ADHD+Autism Tech Innovator",
        "description": "Pattern-seeing with rapid ideation, thrives with structured autonomy",
        "diagnoses": ["ADHD-Combined", "ASD Level 1"],
        "vector": {
            "attention": 0.50, "memory": 0.65, "processing_speed": 0.70,
            "pattern_recognition": 0.90, "creative_thinking": 0.85, "analytical_thinking": 0.85,
            "verbal_reasoning": 0.45, "spatial_reasoning": 0.80,
            "communication_style": 0.35, "teamwork": 0.30, "leadership": 0.35,
            "conflict_resolution": 0.25,
            "task_switching": 0.55, "deadline_management": 0.50, "autonomy": 0.90,
            "structure_need": 0.70, "sensory_sensitivity": 0.80, "stress_tolerance": 0.40,
            "domain_expertise": 0.85, "learning_speed": 0.80, "problem_solving": 0.90,
            "detail_orientation": 0.70, "abstract_thinking": 0.90, "technical_depth": 0.85,
        },
    },
    {
        "name": "ADHD+Dyslexia Creative Director",
        "description": "Visual thinker with boundless energy, natural creative leader",
        "diagnoses": ["ADHD-Combined", "Dyslexia"],
        "vector": {
            "attention": 0.30, "memory": 0.40, "processing_speed": 0.70,
            "pattern_recognition": 0.75, "creative_thinking": 0.95, "analytical_thinking": 0.45,
            "verbal_reasoning": 0.65, "spatial_reasoning": 0.90,
            "communication_style": 0.85, "teamwork": 0.70, "leadership": 0.85,
            "conflict_resolution": 0.55,
            "task_switching": 0.80, "deadline_management": 0.25, "autonomy": 0.85,
            "structure_need": 0.25, "sensory_sensitivity": 0.45, "stress_tolerance": 0.60,
            "domain_expertise": 0.50, "learning_speed": 0.65, "problem_solving": 0.75,
            "detail_orientation": 0.25, "abstract_thinking": 0.85, "technical_depth": 0.35,
        },
    },
    {
        "name": "Autism+Dyspraxia Researcher",
        "description": "Deep academic focus, exceptional written communication, methodical",
        "diagnoses": ["ASD Level 1", "Dyspraxia/DCD"],
        "vector": {
            "attention": 0.85, "memory": 0.85, "processing_speed": 0.40,
            "pattern_recognition": 0.85, "creative_thinking": 0.50, "analytical_thinking": 0.90,
            "verbal_reasoning": 0.80, "spatial_reasoning": 0.30,
            "communication_style": 0.35, "teamwork": 0.25, "leadership": 0.20,
            "conflict_resolution": 0.25,
            "task_switching": 0.20, "deadline_management": 0.75, "autonomy": 0.90,
            "structure_need": 0.90, "sensory_sensitivity": 0.80, "stress_tolerance": 0.35,
            "domain_expertise": 0.95, "learning_speed": 0.60, "problem_solving": 0.80,
            "detail_orientation": 0.90, "abstract_thinking": 0.85, "technical_depth": 0.90,
        },
    },

    # --- Sensory processing ---
    {
        "name": "Sensory-Sensitive Designer",
        "description": "Heightened sensory awareness enables exceptional UX/UI design intuition",
        "diagnoses": ["SPD"],
        "vector": {
            "attention": 0.70, "memory": 0.60, "processing_speed": 0.50,
            "pattern_recognition": 0.80, "creative_thinking": 0.90, "analytical_thinking": 0.55,
            "verbal_reasoning": 0.50, "spatial_reasoning": 0.90,
            "communication_style": 0.45, "teamwork": 0.40, "leadership": 0.30,
            "conflict_resolution": 0.35,
            "task_switching": 0.35, "deadline_management": 0.60, "autonomy": 0.85,
            "structure_need": 0.70, "sensory_sensitivity": 0.95, "stress_tolerance": 0.30,
            "domain_expertise": 0.70, "learning_speed": 0.65, "problem_solving": 0.70,
            "detail_orientation": 0.85, "abstract_thinking": 0.75, "technical_depth": 0.55,
        },
    },

    # --- Giftedness / 2e ---
    {
        "name": "Twice-Exceptional Polymath",
        "description": "Gifted + LD, excels in rapid learning with uneven skill profile",
        "diagnoses": ["ADHD-Inattentive", "Giftedness"],
        "vector": {
            "attention": 0.45, "memory": 0.80, "processing_speed": 0.85,
            "pattern_recognition": 0.90, "creative_thinking": 0.90, "analytical_thinking": 0.85,
            "verbal_reasoning": 0.80, "spatial_reasoning": 0.80,
            "communication_style": 0.60, "teamwork": 0.45, "leadership": 0.55,
            "conflict_resolution": 0.40,
            "task_switching": 0.75, "deadline_management": 0.35, "autonomy": 0.90,
            "structure_need": 0.30, "sensory_sensitivity": 0.65, "stress_tolerance": 0.45,
            "domain_expertise": 0.70, "learning_speed": 0.95, "problem_solving": 0.90,
            "detail_orientation": 0.40, "abstract_thinking": 0.95, "technical_depth": 0.75,
        },
    },

    # --- Anxiety / executive function ---
    {
        "name": "Anxious Perfectionist",
        "description": "High attention to detail driven by anxiety, produces exceptionally thorough work",
        "diagnoses": ["GAD", "ADHD-Inattentive"],
        "vector": {
            "attention": 0.80, "memory": 0.70, "processing_speed": 0.45,
            "pattern_recognition": 0.65, "creative_thinking": 0.50, "analytical_thinking": 0.75,
            "verbal_reasoning": 0.65, "spatial_reasoning": 0.55,
            "communication_style": 0.40, "teamwork": 0.45, "leadership": 0.25,
            "conflict_resolution": 0.30,
            "task_switching": 0.30, "deadline_management": 0.70, "autonomy": 0.55,
            "structure_need": 0.85, "sensory_sensitivity": 0.70, "stress_tolerance": 0.25,
            "domain_expertise": 0.70, "learning_speed": 0.60, "problem_solving": 0.65,
            "detail_orientation": 0.95, "abstract_thinking": 0.55, "technical_depth": 0.70,
        },
    },

    # --- OCD spectrum ---
    {
        "name": "OCD Quality Guardian",
        "description": "Natural quality controller, exceptional at process adherence and standards",
        "diagnoses": ["OCD"],
        "vector": {
            "attention": 0.90, "memory": 0.75, "processing_speed": 0.50,
            "pattern_recognition": 0.70, "creative_thinking": 0.40, "analytical_thinking": 0.80,
            "verbal_reasoning": 0.60, "spatial_reasoning": 0.55,
            "communication_style": 0.45, "teamwork": 0.50, "leadership": 0.35,
            "conflict_resolution": 0.35,
            "task_switching": 0.25, "deadline_management": 0.90, "autonomy": 0.60,
            "structure_need": 0.95, "sensory_sensitivity": 0.65, "stress_tolerance": 0.35,
            "domain_expertise": 0.75, "learning_speed": 0.55, "problem_solving": 0.70,
            "detail_orientation": 0.98, "abstract_thinking": 0.50, "technical_depth": 0.75,
        },
    },

    # --- Balanced neurodivergent ---
    {
        "name": "Neurodivergent Generalist",
        "description": "Mild neurodivergent traits across multiple areas, highly adaptable",
        "diagnoses": ["ADHD-Inattentive"],
        "vector": {
            "attention": 0.55, "memory": 0.60, "processing_speed": 0.60,
            "pattern_recognition": 0.65, "creative_thinking": 0.70, "analytical_thinking": 0.60,
            "verbal_reasoning": 0.65, "spatial_reasoning": 0.60,
            "communication_style": 0.65, "teamwork": 0.65, "leadership": 0.55,
            "conflict_resolution": 0.55,
            "task_switching": 0.60, "deadline_management": 0.50, "autonomy": 0.70,
            "structure_need": 0.50, "sensory_sensitivity": 0.50, "stress_tolerance": 0.60,
            "domain_expertise": 0.55, "learning_speed": 0.70, "problem_solving": 0.65,
            "detail_orientation": 0.50, "abstract_thinking": 0.65, "technical_depth": 0.55,
        },
    },
]
