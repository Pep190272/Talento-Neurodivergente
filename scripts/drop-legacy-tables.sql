-- ═══════════════════════════════════════════════════════════════════
-- DROP LEGACY TABLES — Elimina las tablas del schema public (Prisma/Next.js)
-- ═══════════════════════════════════════════════════════════════════
-- PRECAUCIÓN: Este script elimina TODAS las tablas del schema public.
-- Solo ejecutar después de confirmar que los microservicios Python están
-- funcionando correctamente con sus propios schemas (auth, profiles, matching, ai).
--
-- Uso:
--   docker exec -i diversia-db psql -U postgres diversia < scripts/drop-legacy-tables.sql
-- ═══════════════════════════════════════════════════════════════════

BEGIN;

-- Verificar que los schemas de microservicios existen antes de borrar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') THEN
        RAISE EXCEPTION 'Schema "auth" no existe. Ejecuta primero las migraciones de los microservicios.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'profiles') THEN
        RAISE EXCEPTION 'Schema "profiles" no existe. Ejecuta primero las migraciones de los microservicios.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'matching') THEN
        RAISE EXCEPTION 'Schema "matching" no existe. Ejecuta primero las migraciones de los microservicios.';
    END IF;
    RAISE NOTICE '✓ Schemas de microservicios verificados (auth, profiles, matching)';
END $$;

-- Drop todas las tablas del schema public (legacy Prisma)
-- Orden: primero las tablas con foreign keys, luego las principales
DROP TABLE IF EXISTS public."AuditLog" CASCADE;
DROP TABLE IF EXISTS public."Connection" CASCADE;
DROP TABLE IF EXISTS public."Matching" CASCADE;
DROP TABLE IF EXISTS public."Job" CASCADE;
DROP TABLE IF EXISTS public."Company" CASCADE;
DROP TABLE IF EXISTS public."Individual" CASCADE;
DROP TABLE IF EXISTS public."Therapist" CASCADE;
DROP TABLE IF EXISTS public."User" CASCADE;
DROP TABLE IF EXISTS public."_prisma_migrations" CASCADE;

-- Drop enums de Prisma si existen
DROP TYPE IF EXISTS public."UserType" CASCADE;
DROP TYPE IF EXISTS public."MatchingStatus" CASCADE;
DROP TYPE IF EXISTS public."ConnectionType" CASCADE;
DROP TYPE IF EXISTS public."ConnectionStatus" CASCADE;
DROP TYPE IF EXISTS public."JobStatus" CASCADE;
DROP TYPE IF EXISTS public."JobVisibility" CASCADE;
DROP TYPE IF EXISTS public."VerificationStatus" CASCADE;
DROP TYPE IF EXISTS public."ValidationStatus" CASCADE;
DROP TYPE IF EXISTS public."EventType" CASCADE;

COMMIT;

-- Verificar que no quedan tablas en public
DO $$
DECLARE
    remaining_count INTEGER;
BEGIN
    SELECT count(*) INTO remaining_count
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

    IF remaining_count > 0 THEN
        RAISE NOTICE '⚠ Quedan % tablas en public. Revisar manualmente.', remaining_count;
    ELSE
        RAISE NOTICE '✓ Schema public limpio. Todas las tablas legacy eliminadas.';
    END IF;
END $$;
