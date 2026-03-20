# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [2.8.0] - 2026-03-19

### Sesion 2026-03-18/19 — Superadmin Dashboard, Admin Role, CLAUDE.md Nativo

#### Added
- **Superadmin dashboard** con demo seed data: vistas por actor (candidato, empresa, terapeuta) con datos reales del seed
- **Admin role support**: navbar con opciones admin, dashboard layout adaptado, translations
- **Superadmin bootstrap endpoint**: creacion automatica del superadmin al iniciar auth-service
- **CLAUDE.md nativo**: reemplaza documentacion legacy como sistema de contexto para Claude Code
- **6 agent briefs** para Dashboard V2 overhaul (docs/DESPACHOS_DASHBOARD_V2.md): tabs por actor, graficos interactivos, hub matching, chat, onboarding tour, WCAG AAA
- **Issues #135-#140** creadas para Dashboard V2 con dependencias entre despachos

#### Fixed
- **Superadmin login**: CORS fix, schema mismatch, middleware redirect corregidos
- **Auth redirect**: individual users redirigen correctamente a /dashboard/individual

#### Changed
- Documentacion legacy reemplazada por CLAUDE.md como fuente de verdad

---

## [2.7.0] - 2026-03-18

### Sesion 2026-03-18 — Expansion de Datos Seed: Oficios Manuales y Neurodivergencias Ampliadas

#### Added
- **4 nuevas empresas de oficios manuales**:
  - Construcciones Puente Verde (Sevilla): albañil, peón de obra, pintor/a, carpintero/a, aprendiz lampista, solador/a — 6 ofertas
  - AutoTaller NeuroMotor (Zaragoza): mecánico/a, electricista auto, aprendiz mecánica, chapista/pintor vehículos — 4 ofertas
  - Viveros del Sol (Málaga): jardinero/a, peón agrícola, florista — 3 ofertas
  - Obrador Artesano Manos Diversas (Granada): ceramista, ebanista, restaurador/a — 3 ofertas
- **Cocina Inclusiva ampliada** con 3 nuevos puestos: ayudante de cocina, cocinero/a de línea, profesional de office (friegaplatos)
- **8 nuevos candidatos neurodivergentes** especializados en trabajo manual:
  - Fernando Rueda (TDAH + Dislexia) — albañil/solador
  - Adrián Campos (TEA) — viverista/jardinero botánico
  - Rosa Molina (Tourette) — cocinera de línea
  - Óscar Prieto (TEA nivel 2) — mecánico de taller
  - Marina Gil (TDAH) — pintora de obra
  - Héctor Blanco (Dislexia) — ebanista/carpintero artesanal
  - Carmen Sáez (TAG + TDAH) — ceramista/alfarera
  - Tomás Guerrero (Bipolar tipo II) — peón agrícola/jardinero
- **2 nuevos terapeutas**:
  - Lda. Lucía Ramos — Terapeuta Ocupacional especializada en adaptación de oficios manuales e integración sensorial
  - Dr. Rafael Torres — EMDR y trauma en personas neurodivergentes (burnout, bipolaridad, ansiedad)
- **25+ nuevos matchings** para oficios manuales (scores 55-97)
- **15 nuevas conexiones de terapia** para nuevos candidatos
- **7 nuevas conexiones de consulting** para nuevas empresas con terapeutas especializados
- **Nuevas neurodivergencias representadas**: TAG (Ansiedad Generalizada), Trastorno Bipolar tipo II, TEA nivel 2, diagnósticos duales TDAH+Dislexia y TAG+TDAH

#### Changed
- **Total empresas**: 10 → 14 (4 sectores manuales nuevos)
- **Total ofertas de empleo**: 22 → 33 (roles de entrada: peón, ayudante, aprendiz)
- **Total candidatos**: 16 → 24 (énfasis en trabajo manual y diagnósticos duales)
- **Total terapeutas**: 6 → 8 (Terapia Ocupacional + EMDR)
- **Total matchings**: ~30 → 55+ (cobertura oficios manuales)
- **Total conexiones**: ~27 → 49+ (terapia + consulting ampliadas)
- **Neurodivergencias cubiertas**: 11 → 15 tipos distintos

#### Security
- Todos los datos seed mantienen dominio `@seed.diversia.com` — NUNCA se mezclan con datos reales de producción
- Reforzado mensaje de advertencia en resumen del seeder sobre separación seed/producción

---

## [2.6.0] - 2026-03-16

### Sesion 2026-03-15/16 — Inclusivity Engine, 360 Ecosystem, A11y, Tech Debt Cleanup

#### Added
- **Inclusivity Engine mejorado**: scoring diferencial de accommodations con categorizacion de skills (technical/soft/domain), accommodations sugeridas por rol, warning generico si >80% son soft skills
- **Deteccion de lenguaje discriminatorio**: 25+ bias patterns extraidos en modulo compartido (`app/lib/bias-patterns.ts`), integrado en flujo de creacion de ofertas (antes: 8 patrones, ahora: 25+), DRY entre API route y `companies.ts`
- **Ecosistema 360 Terapeutas**: nuevo servicio de conexiones (`connections.service.ts`) con modelo trilateral (Individual↔Company, Individual↔Therapist, Company↔Therapist), privacy enforcement (empresas NUNCA ven conexiones de terapia), ciclo de vida de conexiones (create, query, revoke)
- **E2E tests**: homepage accessibility (keyboard nav, ARIA, focus, contrast), chat modal behavior, registration flows, role selection (`homepage.spec.ts`, `registration.spec.ts`)
- **Tests nuevos**: `bias-patterns.test.ts`, `connections.service.test.ts` — 285 tests JS/TS (era 245), 2 skipped (era 5)
- **Logger centralizado** (`app/lib/logger.ts`): modulo de logging estructurado
- **Email service** (`app/lib/email.ts`): servicio de email para Next.js app
- **Rate limiter TypeScript** (`app/lib/rate-limiter.ts`): reescrito de JS a TS con tipos
- **Encryption TypeScript** (`app/lib/encryption.ts`): migrado de JS a TS (46 lineas vs 93)

#### Changed
- **Accesibilidad (WCAG AA)**: boton AI assistant semantico con `aria-label`/`aria-expanded`, chat overlay con `role="dialog"` + `aria-modal` + Escape key, `aria-live="polite"` para status, labels en inputs, `aria-hidden` en iconos decorativos, contraste de color corregido (#94A3B8 → #64748B, ratio 4.6:1), clase `sr-only` para screen readers
- **Hero component refactorizado**: GetStarted extraido como componente independiente con accesibilidad mejorada
- **Schemas migrados a TypeScript**: `schemas.js` → `schemas.ts`

#### Removed
- **Dependencias Vercel eliminadas**: `@vercel/speed-insights` removido — la app corre exclusivamente en VPS
- **Vulnerabilidades de seguridad corregidas**: `hono` y `@hono/node-server` resueltas
- **Codigo legacy eliminado** (#114): 7,800+ lineas de codigo muerto removidas
  - `app/candidates/` (Candidates.js, CSS, page) — 2,373 lineas
  - `app/company/` (analytics, settings, training, navigation, layout, page, CSS) — 5,379 lineas
  - `app/lib/draft-manager.js` (252 lineas), `app/lib/llm.js` (192 lineas), `app/lib/rate-limiter.js` (135 lineas), `app/lib/encryption.js` (93 lineas)
  - `tests/unit/features/draft-mode.test.js` (282 lineas)
  - Debug logs, alias no usados, utils.js limpiado

#### Fixed
- **3 tests LLM corregidos**: timeout, validacion Zod, health check — 14/14 passing, 0 skipped
- **`onKeyPress` deprecado** reemplazado por `onKeyDown`
- **Logger en audits**: `console.error` directo en lugar de logger para compatibilidad de tests

---

## [2.5.0] - 2026-03-14

### Sesion 2026-03-14 — Backend alineado con ADR-006 (Issues #111, #112)

#### Added
- **BillingCycle.ON_SUCCESS**: Nuevo ciclo de facturacion para modelo pago por exito (ADR-006)
- **SUCCESS_BASED_MODEL_ENABLED**: Feature flag en subscription-service config
- **3 tests nuevos**: BillingCycle.ON_SUCCESS en plan, subscription y subscribe use case (323 total)

#### Changed
- **Email Early Adopter**: Copy actualizado — empresas ven "50% descuento en success fee", terapeutas ven "acceso premium gratuito" (antes: "X meses gratis")
- **Limites Early Adopter unificados**: subscription-service alineado a 25/25 (antes: 20/50 vs auth-service 25/25)
- **Constantes EARLY_ADOPTER_* marcadas deprecated** en auth-service, subscription-service y config (con nota ADR-006, remocion en v3.0)
- **docker-compose.yml**: Variable SUCCESS_BASED_MODEL_ENABLED anadida al subscription-service

---

## [2.4.0-docs] - 2026-03-14

### Sesion 2026-03-14 — ADR-006: Migracion a modelo pago por exito (Issue #112)

#### Added
- **ADR-006**: Migracion de modelo SaaS suscripcion fija a pago por exito (success fee). Empresas acceden gratis y pagan 10-15% del salario bruto anual solo al contratar exitosamente via DiversIA.

#### Changed
- **DECISIONES_ARQUITECTURA_PENDIENTES.md**: Tablas de pricing actualizadas para reflejar modelo pago por exito. Decisiones 2-7 y 9 actualizadas.
- **NEXT_STEPS.md**: Stripe checkout marcado como pausado. Nuevo plan: tracking de contrataciones + Stripe Invoicing. Modelo de negocio actualizado.
- **ROADMAP.md**: Stripe checkout pausado. Nuevos pendientes: tracking contrataciones, actualizar /pricing. Version 2.4.0-docs anadida.
- **PROJECT_STATUS.md**: Modelo de negocio actualizado a pago por exito. Fase 10 (Stripe) pausada.
- **ONE_PAGER_BUSINESS_ANGEL.md**: Revenue streams actualizados (success fee como modelo primario, candidatos/terapeutas gratis, LTV/CAC 30x).
- **EMAIL_BUSINESS_ANGEL_TEMPLATE.md**: Referencias a pricing actualizadas (pago por exito en lugar de SaaS €200-500/mes).

---

## [2.3.0] - 2026-03-12

### Sesion 2026-03-12 — Pricing page, Early Adopter tracking, production fixes

#### Added
- **Pagina de precios** (`/pricing`): 3 planes (Candidato gratis, Empresa PRO 99€/79€ anual, Terapeuta PRO 59€/49€ anual), toggle mensual/anual, FAQ accordion, banner Early Adopter
- **Early adopter slot tracking**: endpoint `GET /api/v1/auth/early-adopter-slots`, metodo `count_by_role` en repositorio de usuarios
- **Verificacion de plazas** al registrar: solo envia email Early Adopter si quedan plazas disponibles (limite 25 por rol)
- **Auto-creacion de perfil** al registrarse y al entrar al dashboard (fix: empresas/terapeutas no aparecian en BD)
- **Link "Precios"** en navbar (desktop + movil)

#### Fixed
- **Emails en produccion**: variables SMTP anadidas a docker-compose.prod.yml (welcome + admin notification + early adopter)
- **Acentos/ñ** en pagina para-terapeutas: Acompana→Acompaña, numero→número, busqueda→búsqueda, etc.
- **CI Build**: `DATABASE_URL` dummy proporcionado a `prisma generate` en GitHub Actions
- **Pricing toggle**: eliminado `x-init` redundante, fallback text en spans, `lucide.createIcons()` protegido

#### Infrastructure
- Variables SMTP (6) anadidas al auth-service en docker-compose.prod.yml
- CI workflow optimizado: `DATABASE_URL` a nivel de job `build`

---

## [2.0.0] - 2026-03-10

### Sesion 2026-03-10 — Deploy a produccion app.diversia.click

#### Added
- **docker-compose.prod.yml**: configuracion de produccion para Dokploy
- **Red `internal`** explicita para comunicacion entre servicios
- **DNS dinamico en nginx**: `resolver 127.0.0.11 valid=10s` + variables `set $upstream`
- **CSP actualizado**: `unsafe-eval` para Alpine.js reactive expressions

#### Fixed
- 6 fixes de build: URL-encode credenciales, psycopg2-binary, PYTHONPATH, defaults env, migraciones idempotentes, email-validator
- 6 fixes de red: Traefik labels, dokploy-network, CSP, red default, red interna, DNS caching nginx

#### Deployment
- **app.diversia.click operativa** — 4 microservicios + PostgreSQL + nginx + Ollama
- VPS Hostinger (Paris, EU) via Dokploy
- SSL automatico via Traefik/Let's Encrypt

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

**Mantenido por:** Equipo Diversia + Claude Opus 4.6
