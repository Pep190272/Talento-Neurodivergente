-- ═══════════════════════════════════════════════════════════════════
-- CLEAN DEMO DATA — Elimina todos los datos demo de los microservicios
-- ═══════════════════════════════════════════════════════════════════
-- Solo elimina datos con emails @demo.diversia.click
-- NO toca datos reales de producción.
--
-- Uso:
--   docker exec -i diversia-db psql -U postgres diversia < scripts/clean-demo.sql
-- ═══════════════════════════════════════════════════════════════════

BEGIN;

-- 1. Matching schema (depende de IDs de candidates/jobs)
DELETE FROM matching.matches WHERE id LIKE 'demo_%';
DELETE FROM matching.candidates WHERE id LIKE 'demo_%';
DELETE FROM matching.jobs WHERE id LIKE 'demo_%';

-- 2. AI schema
DELETE FROM ai.reports WHERE id LIKE 'demo_%';

-- 3. Profiles schema
DELETE FROM profiles.assessments WHERE id LIKE 'demo_%';
DELETE FROM profiles.job_offers WHERE id LIKE 'demo_%';
DELETE FROM profiles.therapists WHERE id LIKE 'demo_%';
DELETE FROM profiles.game_scores WHERE id LIKE 'demo_%';
DELETE FROM profiles.profiles WHERE id LIKE 'demo_%';

-- 4. Auth schema (último, porque otros referencian user_id)
DELETE FROM auth.users WHERE email LIKE '%@demo.diversia.click';

COMMIT;

DO $$
BEGIN
    RAISE NOTICE '✓ Datos demo (@demo.diversia.click) eliminados de todos los schemas.';
END $$;
