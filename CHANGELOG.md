# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [2.1.0-saas] - 2026-03-09

### Sesion 2026-03-09 PM — Expansion SaaS: modelo de negocio + bounded contexts

#### Added
- **ADR-005**: modelo de negocio SaaS + Marketplace (Stripe), planes empresa/candidato/terapeuta
- **5 bounded contexts**: subscriptions, learning, community, marketplace, analytics
- **21 tablas SQL** en migracion `services/migrations/20260309_001_create_saas_bounded_contexts.sql`
- **5 schemas PostgreSQL** nuevos en `init-schemas.sql`

#### Architecture
- Bounded contexts: 4 → 9
- Modelo de negocio: Empresas (49-399+ EUR/mes), Candidatos B2C (0-19.99 EUR), Terapeutas (0-29 EUR)

---

## [2.0.0-microservices] - 2026-03-09

### Sesion 2026-03-08/09 — Issues backlog, use cases, infraestructura

#### Added
- **5 use cases GDPR** en profile-service: ApplyToJob, ManageConsent, ExportData, DeleteAccount, VerifyTherapist
- **Rate limiter Redis-ready** en shared kernel: sliding window con sorted sets + fallback in-memory
- **Backup/restore scripts**: backup-postgres.sh (pg_dump, rotacion, S3/B2) + restore-postgres.sh
- **4 suites E2E tests**: candidate flow, company flow, therapist flow, GDPR compliance
- **14 APIs nuevas** en el monolito Next.js: bias detection, transparency, therapist catalog, consent dashboard, pipeline, match contest
- **Skills taxonomy** (70+ skills, O*NET/ESCO), **accommodations catalog** (30+ JAN/NICE)
- **3 documentos tecnicos**: cognitive-domains-mapping, neuro-vector-clinical-standards, cognitive-domain-framework
- Eliminado storage.js legacy, error handler centralizado

#### Metricas
- Tests: **233** (83 profile + 53 matching + 48 auth + 36 intelligence + 13 shared)
- Issues resueltas: **28 de 29**
- Use cases nuevos: 5 (GDPR compliant)
- E2E test suites: 4 (listos para ejecutar con servicios desplegados)

---

### Sesion 2026-03-07 — Brain Suite + Matching 24D

#### Added
- 3 juegos cognitivos (Pattern Matrix, Memory Grid, Reaction Time)
- Inclusivity assessment para empresas (18 preguntas, 6 categorias)
- Job CRUD con analisis de inclusividad via LLM
- Matching 24D con scoring trilateral y razones
- 14 paginas frontend Jinja2

---

### Sesion 2026-03-06 — Frontend Jinja2

#### Added
- 12 paginas HTML con Alpine.js + Tailwind CSS (CDN)
- Auth standalone (SQLite) — registro, login sin PostgreSQL
- Quiz neurocognitivo 24D con radar chart (Chart.js)
- Dashboards candidato/empresa/terapeuta

#### Changed
- Documentacion actualizada: README, PROJECT_STATUS, ROADMAP, NEXT_STEPS, .env.example

---

### Sesion 2026-03-05 — profile-service + intelligence-service

#### Added
- **profile-service**: Evaluacion neurocognitiva, quiz normalization, CRUD perfiles
- **intelligence-service**: LLM talent reports, anonymization layer, prompt builder
- **SQLAlchemy ORM + DI wiring** para profile-service e intelligence-service
- **Alembic migrations** para auth-service
- **OWASP hardening**: CORS env-aware, rate limiting por servicio, seed data

---

### Sesion 2026-03-04 — Arquitectura y scaffolding

**Decision estrategica**: Migrar de monolito Next.js a microservicios Python/FastAPI con Clean Architecture (4 core + 5 SaaS planificados).

#### Added
- Estructura monorepo `services/` con Clean Architecture
- Shared kernel: BaseEntity, NeuroVector24D (24 dims), Email, Score, JWT utils
- Docker Compose: PostgreSQL 16, Ollama, auth-service, profile-service, nginx
- **auth-service**: domain, use cases, API — 48 tests
- **matching-service**: TrilateralScorer 24D, batch matching — 42 tests
- ADR-003 (migracion Python/FastAPI), ADR-004 (microservicios)

---

## [1.0.0] - 2026-02-26

### Production-Ready Monolith
- 272 tests passing, 0 failing
- PostgreSQL + Prisma migracion completa
- Security audit OWASP (7 vulnerabilidades corregidas)
- E2E tests con Playwright (25+ tests)
- LLM self-hosted (Ollama/Llama 3.2 3B)
- GDPR compliance ~90%
- Deployment ready (Vercel + VPS)

---

## [0.6.0-security] - 2026-01-18

### Sistema de Seguridad
- Encriptacion AES-256-GCM para datos medicos
- NextAuth.js v5 (login, bcrypt, JWT sessions)
- Rate limiting (sliding window)
- Validacion Zod (5 schemas)
- Security headers (X-Frame-Options, CSP, HSTS)
- 21 tests de seguridad

---

## [0.5.0-masterclass] - 2026-01-17

### Draft Mode Feature (TDD)
- draft-manager.js con 8 tests
- localStorage mock funcional
- Sanitizacion PII, expiracion 7 dias

---

## [0.4.0-pragmatic] - 2026-01-16

### Enfoque Pragmatico
- Agent.md v2.0.0
- Fix: findUserByEmail no detectaba duplicados
- Refactorizacion estructura plana

---

## Tipos de Cambios

- **Added** - Nuevas features
- **Changed** - Cambios en funcionalidad existente
- **Removed** - Features removidas
- **Fixed** - Bug fixes

---

**Mantenido por:** Equipo Diversia + Claude Opus 4
