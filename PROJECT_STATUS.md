# Project Status — DiversIA Eternals

> **Ultima actualizacion**: 20 de marzo de 2026
> **Version**: 2.8.0
> **Produccion**: https://app.diversia.click

---

## Estado General

**Todos los microservicios core estan desplegados y operativos en produccion.** La app corre en `app.diversia.click` sobre un VPS Hostinger (Paris, EU) via Dokploy con Docker Compose: 5 microservicios Python/FastAPI + PostgreSQL 16 + nginx gateway + Ollama. Superadmin dashboard funcional con seed data demo (14 empresas, 24 candidatos, 8 terapeutas, 33 ofertas, 55+ matchings). Dashboard V2 en desarrollo (6 despachos, issues #135-#140). Modelo de pago por exito (ADR-006) con baremo escalonado aprobado (8-15% segun rango salarial) y flujo superadmin para cobros via Stripe Checkout. 28 issues abiertas priorizadas.

---

## Branch Strategy

| Branch | Proposito | Estado |
|--------|-----------|--------|
| `main` | Codigo production-ready | Activo — app.diversia.click |
| `archive/pre-cleanup-20260122` | Backup historico | Archivo |

---

## Servicios — Estado Real

| Servicio | Puerto | Estado | Tests | DB |
|----------|--------|--------|-------|----|
| **auth-service** | :8001 | **Produccion** | 48 | PostgreSQL (schema: auth) |
| **profile-service** | :8002 | **Produccion** | 83 | PostgreSQL (schema: profiles) |
| **matching-service** | :8003 | **Produccion** | 53 | PostgreSQL (schema: matching) |
| **intelligence-service** | :8004 | **Produccion** | 36 | PostgreSQL (schema: ai) |
| **subscription-service** | :8005 | **Produccion** | 90 | PostgreSQL (schema: subscriptions) |
| **shared kernel** | — | Libreria compartida | 13 | — |
| **nginx gateway** | :8000 | **Produccion** | — | — |
| **PostgreSQL 16** | :5432 | **Produccion** | — | 4 schemas core + 5 SaaS |
| **Ollama** | :11434 | **Produccion** | — | Llama 3.2 3B |

### profile-service (frontend + backend)
- Frontend: 15 paginas Jinja2 + Alpine.js + Tailwind (CDN)
- Auth proxy: registro, login con JWT + bcrypt
- Perfiles neurodivergentes: CRUD + neuro-vector 24D
- Quiz neurocognitivo: 24 preguntas → vector 24D → radar chart
- Brain Suite: 3 juegos cognitivos con scoring
- Jobs: CRUD + analisis de inclusividad (LLM) + **25+ bias patterns** para deteccion de lenguaje discriminatorio
- Matching 24D: scoring trilateral con razones + **scoring diferencial de accommodations** (technical/soft/domain)
- **Ecosistema 360 Terapeutas**: conexiones trilaterales (Individual↔Company, Individual↔Therapist, Company↔Therapist) con privacy enforcement
- **Superadmin dashboard**: demo con seed data, vistas por actor, KPI cards
- Use cases: ApplyToJob, ManageConsent, ExportData, DeleteAccount, VerifyTherapist

### auth-service
- Registro y login con JWT + bcrypt
- Entidad User con value objects (Email, HashedPassword)
- Use cases: RegisterUser, LoginUser
- Welcome email + admin notification + early adopter email al registrar
- Early adopter slot tracking: `count_by_role` + endpoint `/early-adopter-slots`
- Alembic migrations (idempotentes)

### matching-service
- Matching trilateral 24D (candidato-empresa-terapeuta)
- TrilateralScorer: vector similarity 50%, accommodation fit 25%, therapist 15%, preferences 10%
- Use cases: CalculateMatch, BatchMatchForJob

### intelligence-service
- Reportes LLM via Ollama (Llama 3.2 3B self-hosted)
- Anonymization layer, prompt builder

---

## Tests

| Suite | Tests | Estado |
|-------|-------|--------|
| profile-service | 83 | Passing |
| matching-service | 53 | Passing |
| auth-service | 48 | Passing |
| intelligence-service | 36 | Passing |
| shared kernel | 13 | Passing |
| subscription-service | 90 | Passing |
| **Total pytest** | **323** | **0 failing** |
| | | |
| **JS/TS (Vitest)** | **285** | **0 failing (2 skipped)** |
| E2E (Playwright) | 6 suites | Requieren servicios corriendo |
| | | |
| **Total global** | **608+** | **0 failing** |

Tests E2E incluyen: homepage accessibility, registration flows, candidate/company/therapist flows, GDPR compliance.

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
| 8 | Docker Compose verificado + deploy a VPS | **Completado** (10 Mar) |
| 9 | Pricing page + Early Adopter tracking + production fixes | **Completado** (12 Mar) |
| 10 | ~~Stripe checkout + webhooks~~ | **Pausado (ADR-006: pago por exito)** |
| 10b | Tracking contrataciones + Stripe Invoicing | Pendiente |
| 11 | Inclusivity Engine + A11y + Tech Debt Cleanup | **Completado** (16 Mar) |
| 12 | Seed data expandida + superadmin dashboard | **Completado** (18-19 Mar) |
| 13 | Dashboard V2 (6 despachos #135-#140) | **En progreso** |
| 14 | Migrar secrets a Dokploy (#77) + Success Fee Stripe | Pendiente |
| 15 | Build Tailwind + monitoring | Pendiente |
| 16 | Beta con usuarios reales | Pendiente |

---

## Infraestructura y Costes

| Componente | Ubicacion | Coste | Estado |
|-----------|-----------|-------|--------|
| VPS Hostinger (2 CPU, 8GB RAM) | Paris, Francia (EU) | ~40 EUR/mes | **Produccion** |
| Frontend legacy | Vercel | 0 EUR (hobby) | Pendiente retirar |
| Dominio diversia.click | Hostinger | ~10 EUR/ano | Activo |
| Desarrollo IA | Claude Opus 4 (~12 sesiones) | ~100 EUR total | — |

**Coste mensual operativo: ~40 EUR/mes**

---

## Issues: 28 abiertas

### P0 (Criticas)
- **#40**: Fix inclusivity score siempre 100 (bug matching)
- **#77**: Migrar credenciales a Dokploy Secrets (seguridad)
- **#87**: Backups automatizados + log rotation (infra)
- **#88**: AI Transparency Log — EU AI Act (legal)

### P1 (Importantes)
- **#42**: Onboarding wizard candidatos
- **#43**: Persistir resultados de juegos
- **#44**: Persistir resultados de quiz
- **#45**: Job marketplace con filtros accommodations
- **#86**: Async Matching Dashboard (ticket view)

### Dashboard V2 (#135-#140)
- **#140**: WCAG AAA contrastes (independiente, primero)
- **#135**: Pestanas por actor en admin (independiente)
- **#136**: Graficos interactivos Chart.js (depende #135)
- **#137**: Hub matching trilateral (depende #135)
- **#138**: Chat privado entre actores (independiente)
- **#139**: Onboarding tour interactivo (depende #135, #136, #137)

### P2-P4 (Medio/bajo plazo)
- #53, #56, #57, #58, #59, #61, #62, #64, #67, #72, #76, #78, #79, #82

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

Modelo de negocio: **Pago por exito (ADR-006)**. Empresas acceden gratis y pagan success fee escalonado (8-15% segun rango salarial) solo al contratar. Candidatos y terapeutas gratis. Flujo de cobro via superadmin + Stripe Checkout.

### Funcionalidades recientes (17-20 Mar 2026)

- **Superadmin dashboard**: demo con seed data funcional, vistas por actor
- **Admin role support**: navbar, dashboard layout, translations
- **Seed data expandida**: 14 empresas (4 oficios manuales), 24 candidatos, 8 terapeutas, 33 ofertas, 55+ matchings
- **15 neurodivergencias**: TAG, Bipolar II, TEA nivel 2, diagnosticos duales (TDAH+Dislexia, TAG+TDAH)
- **CLAUDE.md nativo**: reemplaza documentacion legacy para Claude Code
- **Dashboard V2 planificado**: 6 despachos con specs detalladas (docs/DESPACHOS_DASHBOARD_V2.md)
- **Baremo success fee aprobado**: escalonado 8-15% con flujo superadmin (ADR-006 actualizado)

### Funcionalidades anteriores (15-16 Mar 2026)

- **Inclusivity Engine**: 25+ bias patterns, scoring diferencial accommodations (technical/soft/domain)
- **Ecosistema 360 Terapeutas**: conexiones trilaterales con privacy enforcement
- **Accesibilidad WCAG AA**: keyboard navigation, ARIA labels, color contrast (ratio 4.6:1)
- **Tech Debt eliminado**: 7,800+ lineas de codigo muerto, dependencias Vercel removidas
- **285 tests JS/TS** + 323 tests pytest = **608+ tests totales**

---

## Proximos Pasos (priorizados)

1. **Dashboard V2** (#135-#140) — demo funcional e interactiva para captar empresas
2. **Migrar secrets a Dokploy** (#77) — prerequisito para Stripe keys
3. **Success Fee con Stripe** — SuccessFeePayment + Checkout Session + webhook + baremo automatico
4. **Fix inclusivity score** (#40) — bug P0, reproducible con seed data
5. **Backups automatizados** (#87) — infra critica
6. Build Tailwind CSS (reemplazar CDN)
7. Beta con usuarios reales (25 empresas, 50 candidatos, 10 terapeutas)
8. ~~Retirar frontend legacy Next.js (Vercel)~~ **EN PROGRESO** — dependencias Vercel ya eliminadas
