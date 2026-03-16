# Project Status — DiversIA Eternals

> **Ultima actualizacion**: 16 de marzo de 2026
> **Version**: 2.6.0
> **Produccion**: https://app.diversia.click

---

## Estado General

**Todos los microservicios core estan desplegados y operativos en produccion.** La app corre en `app.diversia.click` sobre un VPS Hostinger (Paris, EU) via Dokploy con Docker Compose: 5 microservicios Python/FastAPI + PostgreSQL 16 + nginx gateway + Ollama. 5 bounded contexts SaaS adicionales estan disenados con migracion SQL lista (subscriptions, learning, community, marketplace, analytics — ver ADR-005). Pagina de precios publicada con tracking de Early Adopter slots. Inclusivity Engine mejorado con 25+ bias patterns, ecosistema 360 terapeutas, y accesibilidad WCAG AA. Deuda tecnica eliminada: 7,800+ lineas de codigo muerto removidas, dependencias Vercel eliminadas. El frontend legacy Next.js se ha desacoplado completamente (dependencias removidas).

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
| **subscription-service** | :8005 | **Produccion** | 87 | PostgreSQL (schema: subscriptions) |
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
| 12 | Build Tailwind + monitoring | Pendiente |
| 13 | Beta con usuarios reales | Pendiente |

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

## Issues: 30 de 31 resueltas

Unica pendiente: #78 (Llama 3.1 8B) — descartada, Llama 3.2:3b se mantiene.

### Resueltas recientemente (16 Mar 2026)
- **#114**: chore: technical debt cleanup — 7,800+ lineas de codigo muerto eliminadas, dependencias Vercel removidas
- **#111**: refactor(backend): deprecar constantes EARLY_ADOPTER_*, unificar limites 25/25, BillingCycle.ON_SUCCESS, feature flag SUCCESS_BASED_MODEL_ENABLED
- **#112**: docs: actualizar ADR-006 y documentacion para coherencia con pago por exito

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

Modelo de negocio: **Pago por exito (ADR-006)**. Empresas acceden gratis y pagan success fee (10-15% salario) solo al contratar. Candidatos y terapeutas gratis.

### Funcionalidades recientes (16 Mar 2026)

- **Inclusivity Engine**: 25+ bias patterns para deteccion de lenguaje discriminatorio, scoring diferencial de accommodations (technical/soft/domain)
- **Ecosistema 360 Terapeutas**: conexiones trilaterales con privacy enforcement
- **Accesibilidad WCAG AA**: keyboard navigation, ARIA labels, color contrast (ratio 4.6:1), screen reader support
- **Tech Debt eliminado**: 7,800+ lineas de codigo muerto, dependencias Vercel removidas, vulnerabilidades hono resueltas
- **E2E tests nuevos**: homepage accessibility, registration flows
- **285 tests JS/TS** (era 245) + 323 tests pytest = **608+ tests totales**

### Funcionalidades anteriores (12-14 Mar 2026)

- **Pagina de precios** (`/pricing`): 3 tarjetas (candidato gratis, empresa pago por exito, terapeuta gratis), FAQ, banner Early Adopter, flujo de pago por exito
- **Early adopter slot tracking**: endpoint API + verificacion al registrar
- **Auto-creacion de perfil** al registrarse (fix: empresas no aparecian en BD)
- **Emails en produccion**: welcome + admin notification + early adopter
- **Fix acentos/ñ** en pagina para-terapeutas
- **Fix CI**: DATABASE_URL para prisma generate

---

## Proximos Pasos

1. ~~Stripe checkout + webhooks en produccion~~ **PAUSADO (ADR-006: pago por exito)**
2. **Atraer empresas** (acceso gratis) + conseguir primera contratacion exitosa
3. **Tracking de contrataciones** + Stripe Invoicing para success fees
4. Build Tailwind CSS (reemplazar CDN)
5. Beta con usuarios reales
6. ~~Retirar frontend legacy Next.js (Vercel)~~ **EN PROGRESO** — dependencias Vercel ya eliminadas

---

**Nota**: Next.js legacy sigue en Vercel hasta que se retire oficialmente.
