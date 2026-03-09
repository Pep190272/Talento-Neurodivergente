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

-- Grant usage to default user
GRANT ALL ON SCHEMA auth TO diversia;
GRANT ALL ON SCHEMA profiles TO diversia;
GRANT ALL ON SCHEMA matching TO diversia;
GRANT ALL ON SCHEMA ai TO diversia;
GRANT ALL ON SCHEMA subscriptions TO diversia;
GRANT ALL ON SCHEMA learning TO diversia;
GRANT ALL ON SCHEMA community TO diversia;
GRANT ALL ON SCHEMA marketplace TO diversia;
GRANT ALL ON SCHEMA analytics TO diversia;
