-- Initialize PostgreSQL schemas for each microservice
-- This runs automatically on first container start

CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS profiles;
CREATE SCHEMA IF NOT EXISTS matching;
CREATE SCHEMA IF NOT EXISTS ai;

-- Grant usage to default user
GRANT ALL ON SCHEMA auth TO diversia;
GRANT ALL ON SCHEMA profiles TO diversia;
GRANT ALL ON SCHEMA matching TO diversia;
GRANT ALL ON SCHEMA ai TO diversia;
