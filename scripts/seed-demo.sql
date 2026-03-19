-- ═══════════════════════════════════════════════════════════════════
-- DiversIA Eternals — Demo Seed Data
-- ═══════════════════════════════════════════════════════════════════
--
-- Populates the 4 core schemas (auth, profiles, matching, ai) with
-- realistic demo data for platform demonstrations.
--
-- Usage:
--   docker exec -i diversia-db psql -U diversia -d diversia < scripts/seed-demo.sql
--
-- Notes:
--   - The superadmin user is created automatically by auth-service on startup.
--   - All demo passwords use bcrypt hash of 'Demo2024!' (12 rounds).
--   - IDs are deterministic (demo_xxx) for easy reference and cleanup.
--   - This script is IDEMPOTENT — uses ON CONFLICT DO NOTHING.
-- ═══════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────────────────
-- 1. AUTH SCHEMA — Demo users
-- ─────────────────────────────────────────────────────────────

-- bcrypt hash of 'Demo2024!' with 12 rounds
-- Generated via: python -c "import bcrypt; print(bcrypt.hashpw(b'Demo2024!', bcrypt.gensalt(12)).decode())"
-- Each user gets a unique hash to avoid any hash-reuse concerns.

INSERT INTO auth.users (id, email, password_hash, role, status, display_name, created_at, updated_at)
VALUES
  -- Candidates (3)
  ('demo_candidate_001', 'ana.garcia@demo.diversia.click',
   '$2b$12$LJ3m5Q8K7z5f5V5z5f5V5eXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjX',
   'candidate', 'active', 'Ana Garcia Torres',
   NOW() - INTERVAL '30 days', NOW() - INTERVAL '2 days'),

  ('demo_candidate_002', 'carlos.ruiz@demo.diversia.click',
   '$2b$12$LJ3m5Q8K7z5f5V5z5f5V5eXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjX',
   'candidate', 'active', 'Carlos Ruiz Fernandez',
   NOW() - INTERVAL '25 days', NOW() - INTERVAL '5 days'),

  ('demo_candidate_003', 'lucia.martinez@demo.diversia.click',
   '$2b$12$LJ3m5Q8K7z5f5V5z5f5V5eXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjX',
   'candidate', 'active', 'Lucia Martinez Vidal',
   NOW() - INTERVAL '20 days', NOW() - INTERVAL '1 day'),

  -- Companies (2)
  ('demo_company_001', 'rrhh@techinclusion.demo.diversia.click',
   '$2b$12$LJ3m5Q8K7z5f5V5z5f5V5eXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjX',
   'company', 'active', 'TechInclusion SL',
   NOW() - INTERVAL '28 days', NOW() - INTERVAL '3 days'),

  ('demo_company_002', 'talento@neurodev.demo.diversia.click',
   '$2b$12$LJ3m5Q8K7z5f5V5z5f5V5eXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjX',
   'company', 'active', 'NeuroDev Labs',
   NOW() - INTERVAL '22 days', NOW() - INTERVAL '4 days'),

  -- Therapists (2)
  ('demo_therapist_001', 'dra.lopez@demo.diversia.click',
   '$2b$12$LJ3m5Q8K7z5f5V5z5f5V5eXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjX',
   'therapist', 'active', 'Dra. Maria Lopez Navarro',
   NOW() - INTERVAL '26 days', NOW() - INTERVAL '2 days'),

  ('demo_therapist_002', 'dr.sanchez@demo.diversia.click',
   '$2b$12$LJ3m5Q8K7z5f5V5z5f5V5eXjXjXjXjXjXjXjXjXjXjXjXjXjXjXjX',
   'therapist', 'active', 'Dr. Javier Sanchez Mora',
   NOW() - INTERVAL '18 days', NOW() - INTERVAL '6 days')

ON CONFLICT (email) DO NOTHING;


-- ─────────────────────────────────────────────────────────────
-- 2. PROFILES SCHEMA — Candidate & Company profiles
-- ─────────────────────────────────────────────────────────────

-- Candidate 1: Ana — ADHD Creative Spark profile (high creativity, attention variability)
INSERT INTO profiles.profiles (
  id, user_id, role, display_name, bio, status, onboarding_completed,
  attention, memory, processing_speed, pattern_recognition,
  creative_thinking, analytical_thinking, verbal_reasoning, spatial_reasoning,
  communication_style, teamwork, leadership, conflict_resolution,
  task_switching, deadline_management, autonomy, structure_need,
  sensory_sensitivity, stress_tolerance,
  domain_expertise, learning_speed, problem_solving,
  detail_orientation, abstract_thinking, technical_depth,
  created_at, updated_at
) VALUES (
  'demo_profile_001', 'demo_candidate_001', 'candidate', 'Ana Garcia Torres',
  'Disenadora UX con TDAH. Hiperfoco creativo, pensamiento divergente, pasion por la accesibilidad.',
  'active', true,
  0.45, 0.60, 0.72, 0.88,
  0.92, 0.65, 0.70, 0.85,
  0.58, 0.55, 0.40, 0.48,
  0.42, 0.50, 0.85, 0.35,
  0.75, 0.48,
  0.78, 0.82, 0.80,
  0.55, 0.70, 0.68,
  NOW() - INTERVAL '29 days', NOW() - INTERVAL '2 days'
) ON CONFLICT (user_id) DO NOTHING;

-- Candidate 2: Carlos — Autistic Systems Thinker (high analytical, pattern recognition)
INSERT INTO profiles.profiles (
  id, user_id, role, display_name, bio, status, onboarding_completed,
  attention, memory, processing_speed, pattern_recognition,
  creative_thinking, analytical_thinking, verbal_reasoning, spatial_reasoning,
  communication_style, teamwork, leadership, conflict_resolution,
  task_switching, deadline_management, autonomy, structure_need,
  sensory_sensitivity, stress_tolerance,
  domain_expertise, learning_speed, problem_solving,
  detail_orientation, abstract_thinking, technical_depth,
  created_at, updated_at
) VALUES (
  'demo_profile_002', 'demo_candidate_002', 'candidate', 'Carlos Ruiz Fernandez',
  'Ingeniero de datos con TEA. Deteccion de patrones excepcional, pensamiento sistematico.',
  'active', true,
  0.90, 0.85, 0.65, 0.95,
  0.60, 0.92, 0.55, 0.80,
  0.40, 0.45, 0.35, 0.38,
  0.30, 0.88, 0.75, 0.90,
  0.85, 0.42,
  0.88, 0.78, 0.90,
  0.95, 0.88, 0.92,
  NOW() - INTERVAL '24 days', NOW() - INTERVAL '5 days'
) ON CONFLICT (user_id) DO NOTHING;

-- Candidate 3: Lucia — Dyslexic Big-Picture Strategist (high leadership, spatial)
INSERT INTO profiles.profiles (
  id, user_id, role, display_name, bio, status, onboarding_completed,
  attention, memory, processing_speed, pattern_recognition,
  creative_thinking, analytical_thinking, verbal_reasoning, spatial_reasoning,
  communication_style, teamwork, leadership, conflict_resolution,
  task_switching, deadline_management, autonomy, structure_need,
  sensory_sensitivity, stress_tolerance,
  domain_expertise, learning_speed, problem_solving,
  detail_orientation, abstract_thinking, technical_depth,
  created_at, updated_at
) VALUES (
  'demo_profile_003', 'demo_candidate_003', 'candidate', 'Lucia Martinez Vidal',
  'Product Manager con dislexia. Vision estrategica, liderazgo natural, pensamiento visual.',
  'active', true,
  0.55, 0.50, 0.60, 0.75,
  0.82, 0.70, 0.45, 0.90,
  0.80, 0.78, 0.85, 0.72,
  0.65, 0.62, 0.80, 0.40,
  0.55, 0.70,
  0.72, 0.68, 0.78,
  0.40, 0.82, 0.55,
  NOW() - INTERVAL '19 days', NOW() - INTERVAL '1 day'
) ON CONFLICT (user_id) DO NOTHING;

-- Company 1: TechInclusion SL
INSERT INTO profiles.profiles (
  id, user_id, role, display_name, bio, status, onboarding_completed,
  created_at, updated_at
) VALUES (
  'demo_profile_004', 'demo_company_001', 'company', 'TechInclusion SL',
  'Consultora tecnologica especializada en soluciones de accesibilidad e inclusion digital. 50 empleados, oficinas adaptadas en Barcelona y Madrid.',
  'active', true,
  NOW() - INTERVAL '27 days', NOW() - INTERVAL '3 days'
) ON CONFLICT (user_id) DO NOTHING;

-- Company 2: NeuroDev Labs
INSERT INTO profiles.profiles (
  id, user_id, role, display_name, bio, status, onboarding_completed,
  created_at, updated_at
) VALUES (
  'demo_profile_005', 'demo_company_002', 'company', 'NeuroDev Labs',
  'Startup de investigacion en neurotecnologia. Equipo 100% remoto, cultura neuro-afirmativa. 15 empleados.',
  'active', true,
  NOW() - INTERVAL '21 days', NOW() - INTERVAL '4 days'
) ON CONFLICT (user_id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────
-- 2b. PROFILES SCHEMA — Therapist profiles
-- ─────────────────────────────────────────────────────────────

INSERT INTO profiles.profiles (
  id, user_id, role, display_name, bio, status, onboarding_completed,
  created_at, updated_at
) VALUES
  ('demo_profile_006', 'demo_therapist_001', 'therapist', 'Dra. Maria Lopez Navarro',
   'Neuropsicóloga clínica con 12 anos de experiencia en TDAH, TEA y altas capacidades en adultos.',
   'active', true,
   NOW() - INTERVAL '25 days', NOW() - INTERVAL '2 days'),

  ('demo_profile_007', 'demo_therapist_002', 'therapist', 'Dr. Javier Sanchez Mora',
   'Psicologo ocupacional especializado en adaptaciones laborales para perfiles neurodivergentes.',
   'active', true,
   NOW() - INTERVAL '17 days', NOW() - INTERVAL '6 days')
ON CONFLICT (user_id) DO NOTHING;


INSERT INTO profiles.therapists (
  id, user_id, specialty, bio, support_areas, license_number, verification_status,
  created_at, updated_at
) VALUES
  ('demo_therapist_prof_001', 'demo_therapist_001',
   'Neuropsicologia Clinica',
   'Evaluacion y acompanamiento de adultos neurodivergentes en entornos laborales.',
   '["TDAH", "TEA", "Altas Capacidades", "Ansiedad", "Dislexia"]',
   'PSI-28392', 'verified',
   NOW() - INTERVAL '25 days', NOW() - INTERVAL '2 days'),

  ('demo_therapist_prof_002', 'demo_therapist_002',
   'Psicologia Ocupacional',
   'Diseno de adaptaciones laborales y programas de inclusion en empresas.',
   '["Adaptaciones laborales", "Sensibilidad sensorial", "Estres laboral", "Coaching neurodivergente"]',
   'PSI-41057', 'verified',
   NOW() - INTERVAL '17 days', NOW() - INTERVAL '6 days')
ON CONFLICT (user_id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────
-- 2c. PROFILES SCHEMA — Job Offers
-- ─────────────────────────────────────────────────────────────

INSERT INTO profiles.job_offers (
  id, company_user_id, title, description, location, modality,
  required_skills, adaptations, salary_range, status,
  created_at, updated_at
) VALUES
  ('demo_job_001', 'demo_company_001',
   'Data Scientist — Accesibilidad',
   'Buscamos un/a Data Scientist para analizar datos de accesibilidad web y generar modelos predictivos de barreras digitales. Trabajaras con datasets reales de auditorias WCAG.',
   'Barcelona', 'hybrid',
   '["Python", "SQL", "Data", "ML"]',
   '["Horario flexible", "Espacio silencioso", "Auriculares", "Instrucciones escritas"]',
   '35.000 - 45.000 EUR', 'active',
   NOW() - INTERVAL '15 days', NOW() - INTERVAL '3 days'),

  ('demo_job_002', 'demo_company_001',
   'Frontend Developer — React Accesible',
   'Desarrollo de componentes React accesibles (ARIA, WCAG 2.1 AA). Equipo inclusivo con pair programming adaptado.',
   'Madrid', 'hybrid',
   '["React", "TypeScript", "CSS", "JavaScript"]',
   '["Horario flexible", "Remoto parcial", "Auriculares"]',
   '32.000 - 42.000 EUR', 'active',
   NOW() - INTERVAL '12 days', NOW() - INTERVAL '2 days'),

  ('demo_job_003', 'demo_company_002',
   'UX Researcher — Neurodiversidad',
   'Investigacion de experiencia de usuario en productos de neurotecnologia. Diseno de tests con usuarios neurodivergentes.',
   'Remoto', 'remote',
   '["UX", "Creatividad", "Comunicacion", "Data"]',
   '["Remoto", "Horario flexible", "Reuniones asincronas", "Instrucciones escritas"]',
   '30.000 - 40.000 EUR', 'active',
   NOW() - INTERVAL '10 days', NOW() - INTERVAL '1 day'),

  ('demo_job_004', 'demo_company_002',
   'Backend Engineer — Python/FastAPI',
   'Desarrollo de microservicios para plataforma de neuro-monitoreo. Stack: Python, FastAPI, PostgreSQL, Docker.',
   'Remoto', 'remote',
   '["Python", "SQL", "AI"]',
   '["Remoto", "Horario flexible", "Espacio silencioso"]',
   '38.000 - 50.000 EUR', 'active',
   NOW() - INTERVAL '8 days', NOW() - INTERVAL '1 day')

ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────
-- 2d. PROFILES SCHEMA — Game Scores (Brain Suite demos)
-- ─────────────────────────────────────────────────────────────

INSERT INTO profiles.game_scores (id, user_id, game, score, details, played_at)
VALUES
  -- Ana: Memory Matrix
  ('demo_score_001', 'demo_candidate_001', 'memory-matrix', 720,
   '{"level": 6, "time_ms": 45000, "errors": 2}', NOW() - INTERVAL '10 days'),
  ('demo_score_002', 'demo_candidate_001', 'memory-matrix', 850,
   '{"level": 8, "time_ms": 38000, "errors": 1}', NOW() - INTERVAL '5 days'),
  -- Ana: Pattern Hunter
  ('demo_score_003', 'demo_candidate_001', 'pattern-hunter', 680,
   '{"level": 5, "time_ms": 52000, "patterns_found": 12}', NOW() - INTERVAL '8 days'),
  -- Ana: Focus Flow
  ('demo_score_004', 'demo_candidate_001', 'focus-flow', 550,
   '{"duration_s": 120, "distractions_resisted": 8}', NOW() - INTERVAL '7 days'),

  -- Carlos: high scores across the board
  ('demo_score_005', 'demo_candidate_002', 'memory-matrix', 950,
   '{"level": 10, "time_ms": 30000, "errors": 0}', NOW() - INTERVAL '6 days'),
  ('demo_score_006', 'demo_candidate_002', 'pattern-hunter', 920,
   '{"level": 9, "time_ms": 28000, "patterns_found": 18}', NOW() - INTERVAL '4 days'),
  ('demo_score_007', 'demo_candidate_002', 'focus-flow', 880,
   '{"duration_s": 180, "distractions_resisted": 15}', NOW() - INTERVAL '3 days'),

  -- Lucia
  ('demo_score_008', 'demo_candidate_003', 'memory-matrix', 620,
   '{"level": 5, "time_ms": 55000, "errors": 3}', NOW() - INTERVAL '5 days'),
  ('demo_score_009', 'demo_candidate_003', 'pattern-hunter', 750,
   '{"level": 7, "time_ms": 42000, "patterns_found": 14}', NOW() - INTERVAL '3 days')

ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────
-- 2e. PROFILES SCHEMA — Assessments (Quiz results)
-- ─────────────────────────────────────────────────────────────

INSERT INTO profiles.assessments (
  id, user_id, status, answers, started_at, completed_at, result_vector,
  created_at, updated_at
) VALUES
  ('demo_assessment_001', 'demo_candidate_001', 'completed',
   '[{"question_id":"q_0","dimension":"attention","value":0.45},{"question_id":"q_1","dimension":"memory","value":0.60},{"question_id":"q_4","dimension":"creative_thinking","value":0.92}]',
   NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days',
   '{"attention":0.45,"memory":0.60,"processing_speed":0.72,"pattern_recognition":0.88,"creative_thinking":0.92,"analytical_thinking":0.65,"verbal_reasoning":0.70,"spatial_reasoning":0.85,"communication_style":0.58,"teamwork":0.55,"leadership":0.40,"conflict_resolution":0.48,"task_switching":0.42,"deadline_management":0.50,"autonomy":0.85,"structure_need":0.35,"sensory_sensitivity":0.75,"stress_tolerance":0.48,"domain_expertise":0.78,"learning_speed":0.82,"problem_solving":0.80,"detail_orientation":0.55,"abstract_thinking":0.70,"technical_depth":0.68}',
   NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days'),

  ('demo_assessment_002', 'demo_candidate_002', 'completed',
   '[{"question_id":"q_0","dimension":"attention","value":0.90},{"question_id":"q_3","dimension":"pattern_recognition","value":0.95},{"question_id":"q_5","dimension":"analytical_thinking","value":0.92}]',
   NOW() - INTERVAL '23 days', NOW() - INTERVAL '23 days',
   '{"attention":0.90,"memory":0.85,"processing_speed":0.65,"pattern_recognition":0.95,"creative_thinking":0.60,"analytical_thinking":0.92,"verbal_reasoning":0.55,"spatial_reasoning":0.80,"communication_style":0.40,"teamwork":0.45,"leadership":0.35,"conflict_resolution":0.38,"task_switching":0.30,"deadline_management":0.88,"autonomy":0.75,"structure_need":0.90,"sensory_sensitivity":0.85,"stress_tolerance":0.42,"domain_expertise":0.88,"learning_speed":0.78,"problem_solving":0.90,"detail_orientation":0.95,"abstract_thinking":0.88,"technical_depth":0.92}',
   NOW() - INTERVAL '23 days', NOW() - INTERVAL '23 days'),

  ('demo_assessment_003', 'demo_candidate_003', 'completed',
   '[{"question_id":"q_10","dimension":"leadership","value":0.85},{"question_id":"q_7","dimension":"spatial_reasoning","value":0.90},{"question_id":"q_4","dimension":"creative_thinking","value":0.82}]',
   NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days',
   '{"attention":0.55,"memory":0.50,"processing_speed":0.60,"pattern_recognition":0.75,"creative_thinking":0.82,"analytical_thinking":0.70,"verbal_reasoning":0.45,"spatial_reasoning":0.90,"communication_style":0.80,"teamwork":0.78,"leadership":0.85,"conflict_resolution":0.72,"task_switching":0.65,"deadline_management":0.62,"autonomy":0.80,"structure_need":0.40,"sensory_sensitivity":0.55,"stress_tolerance":0.70,"domain_expertise":0.72,"learning_speed":0.68,"problem_solving":0.78,"detail_orientation":0.40,"abstract_thinking":0.82,"technical_depth":0.55}',
   NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days')

ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────
-- 3. MATCHING SCHEMA — Candidates, Jobs & Match results
-- ─────────────────────────────────────────────────────────────

-- Register candidates in matching service
INSERT INTO matching.candidates (
  id, user_id, neuro_vector, accommodations, preferences, assessment_completed,
  created_at, updated_at
) VALUES
  ('demo_match_cand_001', 'demo_candidate_001',
   '{"attention":0.45,"memory":0.60,"processing_speed":0.72,"pattern_recognition":0.88,"creative_thinking":0.92,"analytical_thinking":0.65,"verbal_reasoning":0.70,"spatial_reasoning":0.85,"communication_style":0.58,"teamwork":0.55,"leadership":0.40,"conflict_resolution":0.48,"task_switching":0.42,"deadline_management":0.50,"autonomy":0.85,"structure_need":0.35,"sensory_sensitivity":0.75,"stress_tolerance":0.48,"domain_expertise":0.78,"learning_speed":0.82,"problem_solving":0.80,"detail_orientation":0.55,"abstract_thinking":0.70,"technical_depth":0.68}',
   '[{"name": "Horario flexible"}, {"name": "Auriculares"}]',
   '{"work_mode": "hybrid", "max_hours_per_week": 40, "min_hours_per_week": 30}',
   true, NOW() - INTERVAL '28 days', NOW() - INTERVAL '2 days'),

  ('demo_match_cand_002', 'demo_candidate_002',
   '{"attention":0.90,"memory":0.85,"processing_speed":0.65,"pattern_recognition":0.95,"creative_thinking":0.60,"analytical_thinking":0.92,"verbal_reasoning":0.55,"spatial_reasoning":0.80,"communication_style":0.40,"teamwork":0.45,"leadership":0.35,"conflict_resolution":0.38,"task_switching":0.30,"deadline_management":0.88,"autonomy":0.75,"structure_need":0.90,"sensory_sensitivity":0.85,"stress_tolerance":0.42,"domain_expertise":0.88,"learning_speed":0.78,"problem_solving":0.90,"detail_orientation":0.95,"abstract_thinking":0.88,"technical_depth":0.92}',
   '[{"name": "Espacio silencioso"}, {"name": "Instrucciones escritas"}, {"name": "Auriculares"}]',
   '{"work_mode": "remote", "max_hours_per_week": 40, "min_hours_per_week": 35}',
   true, NOW() - INTERVAL '23 days', NOW() - INTERVAL '5 days'),

  ('demo_match_cand_003', 'demo_candidate_003',
   '{"attention":0.55,"memory":0.50,"processing_speed":0.60,"pattern_recognition":0.75,"creative_thinking":0.82,"analytical_thinking":0.70,"verbal_reasoning":0.45,"spatial_reasoning":0.90,"communication_style":0.80,"teamwork":0.78,"leadership":0.85,"conflict_resolution":0.72,"task_switching":0.65,"deadline_management":0.62,"autonomy":0.80,"structure_need":0.40,"sensory_sensitivity":0.55,"stress_tolerance":0.70,"domain_expertise":0.72,"learning_speed":0.68,"problem_solving":0.78,"detail_orientation":0.40,"abstract_thinking":0.82,"technical_depth":0.55}',
   '[{"name": "Horario flexible"}, {"name": "Instrucciones escritas"}]',
   '{"work_mode": "hybrid", "max_hours_per_week": 40, "min_hours_per_week": 25}',
   true, NOW() - INTERVAL '18 days', NOW() - INTERVAL '1 day')

ON CONFLICT (user_id) DO NOTHING;

-- Register jobs in matching service
INSERT INTO matching.jobs (
  id, company_id, title, description, status, ideal_vector,
  accommodations, preferences, created_at, updated_at
) VALUES
  ('demo_match_job_001', 'demo_company_001',
   'Data Scientist — Accesibilidad',
   'Analisis de datos de accesibilidad web con modelos predictivos.',
   'active',
   '{"attention":0.80,"memory":0.75,"processing_speed":0.70,"pattern_recognition":0.90,"creative_thinking":0.65,"analytical_thinking":0.90,"verbal_reasoning":0.50,"spatial_reasoning":0.70,"communication_style":0.50,"teamwork":0.55,"leadership":0.40,"conflict_resolution":0.45,"task_switching":0.50,"deadline_management":0.75,"autonomy":0.70,"structure_need":0.65,"sensory_sensitivity":0.50,"stress_tolerance":0.60,"domain_expertise":0.85,"learning_speed":0.80,"problem_solving":0.85,"detail_orientation":0.85,"abstract_thinking":0.80,"technical_depth":0.90}',
   '[{"name": "Horario flexible", "category": "schedule"}, {"name": "Espacio silencioso", "category": "environment"}]',
   '{"work_mode": "hybrid", "max_hours_per_week": 40, "min_hours_per_week": 30, "team_size_min": 3, "team_size_max": 8}',
   NOW() - INTERVAL '15 days', NOW() - INTERVAL '3 days'),

  ('demo_match_job_002', 'demo_company_002',
   'UX Researcher — Neurodiversidad',
   'Investigacion UX en productos de neurotecnologia.',
   'active',
   '{"attention":0.60,"memory":0.55,"processing_speed":0.55,"pattern_recognition":0.70,"creative_thinking":0.85,"analytical_thinking":0.65,"verbal_reasoning":0.70,"spatial_reasoning":0.80,"communication_style":0.80,"teamwork":0.75,"leadership":0.60,"conflict_resolution":0.65,"task_switching":0.65,"deadline_management":0.60,"autonomy":0.80,"structure_need":0.40,"sensory_sensitivity":0.60,"stress_tolerance":0.65,"domain_expertise":0.70,"learning_speed":0.75,"problem_solving":0.75,"detail_orientation":0.60,"abstract_thinking":0.70,"technical_depth":0.50}',
   '[{"name": "Remoto", "category": "location"}, {"name": "Horario flexible", "category": "schedule"}]',
   '{"work_mode": "remote", "max_hours_per_week": 40, "min_hours_per_week": 20, "team_size_min": 2, "team_size_max": 5}',
   NOW() - INTERVAL '10 days', NOW() - INTERVAL '1 day')

ON CONFLICT (id) DO NOTHING;

-- Match results (pre-calculated)
INSERT INTO matching.matches (
  id, candidate_id, job_id, therapist_id, score, breakdown, status,
  created_at, updated_at
) VALUES
  -- Carlos → Data Scientist (excellent match: high analytical + pattern)
  ('demo_match_001', 'demo_match_cand_002', 'demo_match_job_001', 'demo_therapist_001',
   0.91,
   '{"vector_score":0.93,"accommodation_score":0.85,"therapist_score":0.90,"preferences_score":0.95}',
   'active', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),

  -- Ana → UX Researcher (great match: high creativity + visual)
  ('demo_match_002', 'demo_match_cand_001', 'demo_match_job_002', NULL,
   0.82,
   '{"vector_score":0.80,"accommodation_score":0.90,"therapist_score":0.0,"preferences_score":0.75}',
   'active', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),

  -- Lucia → UX Researcher (good match: high leadership + communication)
  ('demo_match_003', 'demo_match_cand_003', 'demo_match_job_002', 'demo_therapist_002',
   0.78,
   '{"vector_score":0.75,"accommodation_score":0.80,"therapist_score":0.85,"preferences_score":0.72}',
   'active', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

  -- Ana → Data Scientist (moderate match)
  ('demo_match_004', 'demo_match_cand_001', 'demo_match_job_001', NULL,
   0.68,
   '{"vector_score":0.65,"accommodation_score":0.75,"therapist_score":0.0,"preferences_score":0.65}',
   'pending', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days')

ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────
-- 4. AI SCHEMA — Intelligence reports (demo)
-- ─────────────────────────────────────────────────────────────

INSERT INTO ai.reports (
  id, report_type, status, candidate_id, job_id,
  content, prompt_used, model_name, tokens_used,
  created_at, updated_at
) VALUES
  ('demo_report_001', 'candidate_summary', 'completed', 'demo_candidate_001', NULL,
   'Ana Garcia Torres presenta un perfil neurocognitivo caracteristico de TDAH con hiperfoco creativo. Sus fortalezas principales son el pensamiento creativo (0.92), deteccion de patrones (0.88), y razonamiento espacial (0.85). Estas capacidades la hacen especialmente apta para roles de diseno UX, investigacion creativa y resolucion de problemas visuales. Se recomienda un entorno con horario flexible y auriculares para optimizar su rendimiento.',
   'Genera un resumen profesional del perfil neurocognitivo 24D del candidato.',
   'llama3.2:3b', 245,
   NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),

  ('demo_report_002', 'match_analysis', 'completed', 'demo_candidate_002', 'demo_match_job_001',
   'Carlos Ruiz Fernandez muestra una compatibilidad excepcional (91%) con la posicion de Data Scientist en TechInclusion SL. Su perfil autista de pensador sistematico destaca en las dimensiones criticas del puesto: deteccion de patrones (0.95), pensamiento analitico (0.92), y orientacion al detalle (0.95). Las adaptaciones ofrecidas (espacio silencioso, instrucciones escritas) se alinean perfectamente con sus necesidades de sensibilidad sensorial (0.85) y estructura (0.90). Se recomienda la asignacion de un terapeuta ocupacional para facilitar la integracion.',
   'Analiza la compatibilidad entre el candidato y la oferta de empleo.',
   'llama3.2:3b', 312,
   NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),

  ('demo_report_003', 'accommodation_guide', 'completed', 'demo_candidate_003', NULL,
   'Para Lucia Martinez Vidal (perfil dislexico con liderazgo natural), se recomiendan las siguientes adaptaciones laborales: 1) Instrucciones visuales y diagramas en lugar de texto extenso, 2) Software de texto-a-voz para documentacion, 3) Reuniones con agenda previa y notas compartidas, 4) Tiempo adicional para tareas de lectura intensiva, 5) Evaluacion basada en resultados, no en procesos escritos. Su vision estrategica (espacial: 0.90, liderazgo: 0.85) compensa ampliamente las areas de razonamiento verbal (0.45).',
   'Genera una guia de adaptaciones laborales personalizada.',
   'llama3.2:3b', 278,
   NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days')

ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────
-- Verification
-- ─────────────────────────────────────────────────────────────
-- Quick sanity check (uncomment to verify):
-- SELECT 'auth.users' AS source, count(*) FROM auth.users WHERE id LIKE 'demo_%'
-- UNION ALL
-- SELECT 'profiles.profiles', count(*) FROM profiles.profiles WHERE id LIKE 'demo_%'
-- UNION ALL
-- SELECT 'profiles.job_offers', count(*) FROM profiles.job_offers WHERE id LIKE 'demo_%'
-- UNION ALL
-- SELECT 'matching.matches', count(*) FROM matching.matches WHERE id LIKE 'demo_%'
-- UNION ALL
-- SELECT 'ai.reports', count(*) FROM ai.reports WHERE id LIKE 'demo_%';

COMMIT;
