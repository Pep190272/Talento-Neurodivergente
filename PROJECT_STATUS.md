# Project Status — DiversIA Eternals

> **Ultima actualizacion**: 9 de marzo de 2026
> **Version**: 2.0.0-microservices
> **Maintainer**: GACE Architecture + Claude Opus 4

---

## Estado General

**profile-service es el unico servicio operativo.** Corre en el puerto :8002 con SQLite standalone — no requiere PostgreSQL, Docker ni nginx. Los otros 3 microservicios core (auth, matching, intelligence) existen como codigo con tests pero no estan desplegados. Ademas, 5 nuevos bounded contexts SaaS estan disenados con migracion SQL lista (subscriptions, learning, community, marketplace, analytics — ver ADR-005). El frontend legacy Next.js sigue en Vercel.

---

## Branch Strategy

| Branch | Proposito | Estado |
|--------|-----------|--------|
| `main` | Codigo production-ready (monolito v1.0.0) | Activo (Vercel) |
| `claude/review-issues-app-refactor-FZuy5` | Migracion v2.0.0 microservicios | En progreso |
| `archive/pre-cleanup-20260122` | Backup historico | Archivo |

---

## Servicios — Estado Real

| Servicio | Puerto | Estado | Tests | DB |
|----------|--------|--------|-------|----|
| **profile-service** | :8002 | **Operativo** (desarrollo local) | 83 | SQLite |
| **auth-service** | :8001 | Codigo listo, NO desplegado | 48 | — |
| **matching-service** | :8003 | Codigo listo, NO desplegado | 53 | — |
| **intelligence-service** | :8004 | Codigo listo, NO desplegado | 36 | — |
| **shared kernel** | — | Libreria compartida | 13 | — |
| nginx gateway | :80 | NO desplegado | — | — |
| PostgreSQL 16 | :5432 | Configurado en Docker Compose, NO en uso | — | — |

### profile-service (lo que funciona)
- Frontend: 14 paginas Jinja2 + Alpine.js + Tailwind (CDN)
- Auth proxy: registro, login con JWT + bcrypt via SQLite standalone
- Perfiles neurodivergentes: CRUD + neuro-vector 24D
- Quiz neurocognitivo: 24 preguntas → vector 24D → radar chart
- Brain Suite: 3 juegos cognitivos con scoring
- Jobs: CRUD + analisis de inclusividad (LLM)
- Matching 24D: scoring trilateral con razones
- Use cases: ApplyToJob, ManageConsent, ExportData, DeleteAccount, VerifyTherapist

### auth-service (codigo listo)
- Registro y login con JWT + bcrypt
- Entidad User con value objects (Email, HashedPassword)
- Use cases: RegisterUser, LoginUser
- 48 tests

### matching-service (codigo listo)
- Matching trilateral 24D (candidato-empresa-terapeuta)
- TrilateralScorer: vector similarity 50%, accommodation fit 25%, therapist 15%, preferences 10%
- Use cases: CalculateMatch, BatchMatchForJob
- 53 tests

### intelligence-service (codigo listo)
- Reportes LLM via Ollama
- Anonymization layer, prompt builder
- 36 tests

---

## Tests

| Suite | Tests | Estado |
|-------|-------|--------|
| profile-service | 83 | Passing |
| matching-service | 53 | Passing |
| auth-service | 48 | Passing |
| intelligence-service | 36 | Passing |
| shared kernel | 13 | Passing |
| **Total pytest** | **233** | **0 failing** |

E2E tests escritos (4 suites) — requieren servicios desplegados.

---

## Fases de Desarrollo

| Fase | Descripcion | Estado |
|------|------------|--------|
| 0 | Scaffolding: estructura, Docker Compose, shared kernel | Completado |
| 1 | auth-service + matching-service | Completado |
| 2 | profile-service + intelligence-service | Completado |
| 3 | Persistencia: SQLAlchemy, Alembic, DI wiring | Completado |
| 4 | OWASP hardening, rate limiting, seed data | Completado |
| 5 | Frontend Jinja2 (14 paginas) + auth standalone SQLite | Completado |
| 6 | Brain Suite + matching 24D + inclusivity + jobs | Completado |
| 7 | Use cases GDPR + rate limiter Redis + backup scripts | Completado |
| 8 | Verificar Docker Compose + deploy a VPS | **Pendiente** |
| 9 | Build Tailwind + paginas error + monitoring | **Pendiente** |
| 10 | Beta con usuarios reales | **Pendiente** |

---

## Infraestructura y Costes

| Componente | Ubicacion | Coste | Estado |
|-----------|-----------|-------|--------|
| VPS Hostinger (2 CPU, 8GB RAM) | Paris, Francia (EU) | ~40 EUR/mes | Ollama corriendo |
| Frontend legacy | Vercel | 0 EUR (hobby) | En produccion |
| Dominio diversia.click | Hostinger | ~10 EUR/ano | Activo |
| Desarrollo IA | Claude Opus 4 (~10 sesiones) | ~80 EUR total | — |

**Coste mensual operativo: ~40 EUR/mes**

---

## Issues: 28 de 29 resueltas

Unica pendiente: #78 (Llama 3.1 8B) — descartada, Llama 3.2:3b se mantiene.

---

## Expansion SaaS (ADR-005, 9 Mar 2026)

5 bounded contexts nuevos con 21 tablas SQL (migracion lista, sin aplicar):

| Schema | Servicio futuro | Puerto | Tablas |
|--------|----------------|--------|--------|
| subscriptions | subscription-service | :8005 | plans, subscriptions, invoices |
| learning | learning-service | :8006 | courses, modules, lessons, enrollments, lesson_progress, certificates |
| community | community-service | :8007 | groups, posts, comments, memberships, events |
| marketplace | marketplace-service | :8008 | providers, services, bookings, reviews |
| analytics | analytics-service | :8009 | metric_snapshots, dei_reports, usage_events |

Modelo de negocio: SaaS mixto con Stripe. Empresas pagan (49-399+ EUR/mes), candidatos gratis.

---

## Proximos Pasos

1. Verificar Docker Compose end-to-end
2. Build Tailwind CSS (reemplazar CDN)
3. Deploy a app.diversia.click
4. Fase 1 post-deploy: subscription-service + Stripe
5. Beta con usuarios reales

---

**Nota**: Next.js legacy sigue en Vercel hasta que Jinja2 este desplegado en app.diversia.click.
