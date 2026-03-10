-- Initialize PostgreSQL schemas for each microservice
-- This runs automatically on first container start
-- Updated: 2026-03-09 — Added 5 new bounded contexts

-- ─────────────────────────────────────────────────────────────
-- Existing bounded contexts (v1)
-- ─────────────────────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS profiles;
CREATE SCHEMA IF NOT EXISTS matching;
CREATE SCHEMA IF NOT EXISTS ai;

-- ─────────────────────────────────────────────────────────────
-- New bounded contexts (v2 — SaaS expansion)
-- ─────────────────────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS subscriptions;
CREATE SCHEMA IF NOT EXISTS learning;
CREATE SCHEMA IF NOT EXISTS community;
CREATE SCHEMA IF NOT EXISTS marketplace;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Grant usage to the database owner (works with any POSTGRES_USER)
-- The user who creates the DB is the superuser, so GRANTs are automatic.
-- These are kept as safety net for non-superuser setups.
DO $$
BEGIN
    EXECUTE format('GRANT ALL ON SCHEMA auth TO %I', current_user);
    EXECUTE format('GRANT ALL ON SCHEMA profiles TO %I', current_user);
    EXECUTE format('GRANT ALL ON SCHEMA matching TO %I', current_user);
    EXECUTE format('GRANT ALL ON SCHEMA ai TO %I', current_user);
    EXECUTE format('GRANT ALL ON SCHEMA subscriptions TO %I', current_user);
    EXECUTE format('GRANT ALL ON SCHEMA learning TO %I', current_user);
    EXECUTE format('GRANT ALL ON SCHEMA community TO %I', current_user);
    EXECUTE format('GRANT ALL ON SCHEMA marketplace TO %I', current_user);
    EXECUTE format('GRANT ALL ON SCHEMA analytics TO %I', current_user);
END
$$;
