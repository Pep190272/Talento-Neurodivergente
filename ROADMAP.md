# ROADMAP — DiversIA (app.diversia.click)

**Fecha de inicio:** 10 de febrero de 2026
**Ultima actualizacion:** 20 de marzo de 2026
**Estado:** Produccion — app.diversia.click operativa

---

## Principios de trabajo

1. **Produccion primero**: la app corre en `app.diversia.click` via Dokploy
2. **Iteracion rapida**: deploy continuo desde GitHub → Dokploy
3. **El dominio principal es `app.diversia.click`** — VPS Hostinger (Paris, EU)

---

## Estado actual del proyecto (20 marzo 2026)

### Que funciona en produccion (app.diversia.click)

| Componente | Estado | Tests |
|-----------|--------|-------|
| **auth-service** (:8001) | Operativo — register, login, JWT, bcrypt, welcome email, superadmin bootstrap | 48 passing |
| **profile-service** (:8002) | Operativo — frontend, auth, quiz, games, jobs, matching, admin dashboard | 83 passing |
| **matching-service** (:8003) | Operativo — scoring trilateral 24D, batch matching | 53 passing |
| **intelligence-service** (:8004) | Operativo — reports LLM, anonymizer, prompt builder | 36 passing |
| **subscription-service** (:8005) | Operativo — planes, suscripciones, BillingCycle.ON_SUCCESS, early adopters | 90 passing |
| **shared kernel** | Libreria — value objects, auth, rate limiter, email service | 13 passing |
| **nginx gateway** (:8000) | Operativo — routing, rate limiting, security headers | — |
| **PostgreSQL 16** (:5432) | Operativo — 4 schemas core + subscriptions | — |
| **Ollama** (:11434) | Operativo — Llama 3.2 3B self-hosted | — |
| **Frontend (Jinja2)** | 15 paginas, Alpine.js + Tailwind CDN | — |
| **Seed data** | 14 empresas, 24 candidatos, 8 terapeutas, 33 ofertas, 55+ matchings | — |

**Total: 323 tests pytest + 285 tests JS/TS = 608+ tests, 0 failing**

### Que falta (priorizado)

1. **Success Fee con Stripe** — Implementar flujo de pago por exito (SuccessFeePayment + Checkout + webhook). Baremo escalonado por rango salarial (8-15%). Flujo: superadmin aprueba → Checkout Session → webhook marca pagado.
2. **Dashboard V2** — 6 despachos: tabs por actor, graficos interactivos, hub matching, chat, onboarding tour, WCAG AAA (issues #135-#140)
3. **Migrar secrets a Dokploy** (#77) — credenciales fuera de docker-compose.yml antes de integrar Stripe
4. **Fix inclusivity score siempre 100** (#40) — bug P0 en matching
5. **Backups automatizados + log rotation** (#87)
6. Build de Tailwind CSS (reemplazar CDN)
7. Beta con usuarios reales
8. ~~Retirar frontend legacy Next.js (Vercel)~~ **EN PROGRESO** — dependencias Vercel eliminadas

---

## Arquitectura (produccion)

```
Internet → Traefik (Dokploy) → nginx gateway (:8000)
                                      |
                    +---------+---------+---------+
                    |         |         |         |
              auth-service  profile  matching  intelligence
                (:8001)    (:8002)   (:8003)    (:8004)
                    |         |         |         |
                    +---------+---------+---------+
                              |
                        PostgreSQL 16
                  (schemas: auth, profiles, matching, ai)
                  + 5 schemas SaaS: subscriptions, learning,
                    community, marketplace, analytics
```

> **Expansion SaaS (ADR-005):** 5 nuevos bounded contexts disenados con 21 tablas.
> Servicios: subscription(:8005), learning(:8006), community(:8007), marketplace(:8008), analytics(:8009).
> **Modelo de negocio actualizado (ADR-006):** Pago por exito (success fee al contratar) en lugar de suscripcion SaaS fija.
> Ver `docs/adr/ADR-005.md`, `docs/adr/ADR-006.md` y `services/migrations/20260309_001_create_saas_bounded_contexts.sql`.

---

## FASE ACTUAL — Post-deploy

### Completado (10 Mar 2026)
- [x] Docker Compose arranca los 4 servicios core + postgres + nginx + ollama
- [x] Health checks funcionan (/health en cada servicio)
- [x] nginx rutea correctamente a cada servicio
- [x] Deploy a app.diversia.click via Dokploy
- [x] SSL (Let's Encrypt via Traefik)
- [x] DNS dinamico en nginx (resolver 127.0.0.11)

### Completado: Superadmin + Seed Data Expandida (17-19 Mar 2026)
- [x] Superadmin dashboard con demo seed data
- [x] Admin role support: navbar, dashboard layout, translations
- [x] Superadmin bootstrap endpoint + login fix (CORS, schema, redirect)
- [x] Seed data expandida: 14 empresas (4 oficios manuales), 24 candidatos, 8 terapeutas, 33 ofertas, 55+ matchings
- [x] 6 agent briefs para Dashboard V2 overhaul (docs/DESPACHOS_DASHBOARD_V2.md)
- [x] CLAUDE.md como sistema nativo (reemplaza docs legacy)
- [x] 15 neurodivergencias representadas (TAG, Bipolar II, TEA nivel 2, diagnosticos duales)

### En progreso: Dashboard V2 (issues #135-#140)
- [ ] Despacho 6: UX/UI contrastes WCAG AAA (#140)
- [ ] Despacho 1: Sistema de pestanas por actor (#135)
- [ ] Despacho 2: Graficos interactivos Chart.js (#136)
- [ ] Despacho 3: Hub de matching trilateral (#137)
- [ ] Despacho 4: Chat privado entre actores (#138)
- [ ] Despacho 5: Guia interactiva onboarding (#139)

### Pendiente: Success Fee con Stripe (ADR-006 implementacion)
- [ ] Migrar secrets a Dokploy (#77) — prerequisito
- [ ] Entidad SuccessFeePayment (draft → pending → paid → failed)
- [ ] Baremo escalonado automatico por rango salarial (8-15%)
- [ ] Stripe Checkout Session (mode=payment) + webhook verificado
- [ ] Flujo: superadmin aprueba contratacion → genera cobro → empresa paga
- [ ] Tests unitarios + integracion

### Pendiente: Build de frontend
- [ ] Instalar Tailwind CSS como dependencia (no CDN)
- [ ] Build pipeline (postcss + purge)
- [ ] Alpine.js + Chart.js como vendor bundles locales

### Completado: Fase 1 SaaS — subscription-service (11 Mar 2026) + Modelo actualizado (14 Mar)
- [x] subscription-service con TDD (87 tests)
- [x] Entidades de dominio: Plan, Subscription, Invoice
- [x] 6 use cases: CreatePlan, ListPlans, Subscribe, CancelSubscription, ChangePlan, GetSubscription
- [x] Early adopter logic: primeras 25 empresas + 25 terapeutas
- [x] API REST FastAPI con validacion Pydantic
- [x] Docker Compose + nginx gateway integration
- [x] Configuracion Stripe (secret + publishable keys)
- [x] Servicio compartido de email (aiosmtplib async)
- [x] Welcome email al registrar usuario/empresa
- ~~Stripe checkout + webhooks en produccion~~ **PAUSADO (ADR-006: pago por exito)**
- ~~Conectar pagos reales con Stripe~~ **PAUSADO (ADR-006: pago por exito)**
- [ ] **Implementar tracking de contrataciones exitosas**
- [ ] **Integrar Stripe Invoicing para success fees (cuando haya volumen)**

### Completado: Pagina de precios + Early Adopter tracking (12 Mar 2026)
- [x] Pagina de precios (`/pricing`) con 3 planes: Candidato (gratis), Empresa PRO (99€/79€ anual), Terapeuta PRO (59€/49€ anual)
- [x] Toggle mensual/anual, FAQ accordion, banner Early Adopter
- [x] Endpoint `GET /api/v1/auth/early-adopter-slots` — devuelve plazas restantes
- [x] Tracking de slots por rol en auth-service (count_by_role)
- [x] Registro verifica plazas disponibles antes de enviar email Early Adopter
- [x] Link "Precios" en navbar (desktop + movil)
- [x] Fix acentos/ñ en pagina para-terapeutas
- [x] Fix CI: DATABASE_URL para prisma generate en GitHub Actions
- [x] Auto-creacion de perfil al registrarse y al entrar al dashboard
- [x] Variables SMTP en docker-compose.prod.yml para emails en produccion

### Completado: Inclusivity Engine + A11y + Tech Debt Cleanup (15-16 Mar 2026)
- [x] **Inclusivity Engine mejorado**: 25+ bias patterns, scoring diferencial accommodations (technical/soft/domain)
- [x] **Deteccion de lenguaje discriminatorio**: modulo compartido `bias-patterns.ts`, integrado en job creation
- [x] **Ecosistema 360 Terapeutas**: conexiones trilaterales con privacy enforcement (companies NEVER see therapy connections)
- [x] **Accesibilidad WCAG AA**: keyboard nav, ARIA labels/roles, color contrast 4.6:1, screen reader support, Escape key
- [x] **Tech Debt eliminado**: 7,800+ lineas codigo muerto, dependencias Vercel removidas, vulnerabilidades hono resueltas
- [x] **3 tests LLM corregidos**: 14/14 passing, 0 skipped
- [x] **E2E tests nuevos**: homepage accessibility, registration flows
- [x] **285 tests JS/TS** (era 245, +40 nuevos)

### Pendiente: Beta (modelo pago por exito — ADR-006)
- [ ] 25 empresas registradas y publicando ofertas (acceso gratis)
- [ ] 20-50 candidatos neurodivergentes
- [ ] 5-10 terapeutas/especialistas
- [ ] Primera contratacion exitosa via DiversIA (validar modelo)
- [ ] Success fee cobrado via Stripe (validar flujo de pago)

---

## Costes

| Concepto | Coste | Notas |
|----------|-------|-------|
| VPS Hostinger (2 CPU, 8GB RAM) | ~40 EUR/mes | Paris EU, todo corre aqui |
| Frontend legacy (Vercel) | 0 EUR | Hobby plan, se retirara |
| Dominio diversia.click | ~10 EUR/ano | Hostinger |
| Desarrollo IA (Claude Opus 4) | ~100 EUR total | ~12 sesiones |
| **Total mensual** | **~40 EUR/mes** | Sin contar desarrollo |

---

## Historial de versiones

| Version | Fecha | Descripcion |
|---------|-------|-------------|
| v0.x | Feb 2026 | Monolito Next.js — Sprints 1-5 |
| v1.0.0 | 26 Feb | Monolito production-ready (272 tests, OWASP audit) |
| v2.0.0-dev | 4-9 Mar | Microservicios Python/FastAPI (233 tests, 14 paginas) |
| v2.1.0-saas | 9 Mar | Expansion SaaS: 5 bounded contexts, modelo de negocio (ADR-005) |
| **v2.0.0** | **10 Mar** | **Deploy a app.diversia.click — produccion** |
| **v2.2.0-saas** | **11 Mar** | **subscription-service + welcome email (87 tests, Stripe ready)** |
| **v2.3.0** | **12 Mar** | **Pricing page, early adopter tracking, auto-profile, email fix, CI fix** |
| **v2.4.0-docs** | **14 Mar** | **ADR-006: Migracion a modelo pago por exito. Stripe checkout pausado.** |
| **v2.5.0** | **14 Mar** | **Backend alineado con ADR-006: BillingCycle.ON_SUCCESS, feature flags, constantes deprecadas** |
| **v2.6.0** | **16 Mar** | **Inclusivity Engine, 360 Ecosystem, A11y WCAG AA, Tech Debt cleanup (-7,800 LOC)** |
| **v2.7.0** | **18 Mar** | **Seed data expandida: oficios manuales, 24 candidatos, 15 neurodivergencias** |
| **v2.8.0** | **19 Mar** | **Superadmin dashboard, admin role, CLAUDE.md nativo, Dashboard V2 briefs** |

---

## Referencia rapida: como ejecutar

### Desarrollo local (standalone)

```bash
cd services/profile-service
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8002
# Abre http://localhost:8002
```

### Produccion (Docker Compose)

```bash
cd services
docker compose -f docker-compose.prod.yml up --build
# Acceder via http://localhost:8000 (nginx)
```

### Tests

```bash
cd services/auth-service && python -m pytest tests/ -q            # 48 tests
cd services/profile-service && python -m pytest tests/ -q         # 83 tests
cd services/matching-service && python -m pytest tests/ -q        # 53 tests
cd services/intelligence-service && python -m pytest tests/ -q    # 36 tests
cd services/subscription-service && python -m pytest tests/ -q    # 87 tests
cd services/shared && python -m pytest tests/ -q                  # 13 tests
# Total: 320 tests, 0 failing
```

---

## Sesiones de desarrollo

<details>
<summary>Sesiones 1-5 (Feb 2026) — Monolito Next.js</summary>

### Sprint 1: Fundaciones (10-21 Feb)
- Migracion JSON → PostgreSQL (Prisma)
- 191 tests, build exitoso

### Sprint 2: Tests (22 Feb)
- 272 tests, 0 failed
- Branch protection, CI/CD

### Sprint 3: Arquitectura (22-25 Feb)
- Service + Repository layer extraidos

### Sprint 4: LLM y Compliance (25 Feb)
- Ollama + Llama 3.2 3B self-hosted
- GDPR ~90%

### Sprint 5: Seguridad y Deploy (26 Feb)
- OWASP audit: 7 vulnerabilidades corregidas
- Playwright E2E: 25+ tests
- Vercel deploy funcional

</details>

<details>
<summary>Sesiones 6-12 (Mar 2026) — Microservicios Python</summary>

### Sesion 6 (4 Mar): Scaffolding + auth + matching
- 4 servicios Python/FastAPI core, Docker Compose, nginx
- auth-service: 48 tests, matching-service: 42 tests

### Sesion 7 (5-6 Mar): profile + intelligence + persistencia
- profile-service + intelligence-service implementados
- SQLAlchemy ORM, Alembic, OWASP hardening

### Sesiones 8-9 (6-7 Mar): Frontend Jinja2
- 12 paginas HTML con Alpine.js + Tailwind
- Auth standalone (SQLite), quiz 24D, radar chart

### Sesion 10 (7 Mar): Brain Suite + Matching 24D
- 3 juegos cognitivos, inclusivity assessment
- Job CRUD, matching 24D con scoring + razones
- 14 paginas, 194 tests

### Sesion 11 (8-9 Mar): Issues backlog + use cases + infra
- 28 de 29 issues resueltas
- 5 use cases GDPR: ApplyToJob, ManageConsent, ExportData, DeleteAccount, VerifyTherapist
- Rate limiter Redis-ready con fallback in-memory
- Backup/restore scripts PostgreSQL
- 4 suites E2E tests
- 233 tests totales

### Sesion 12 (9 Mar PM): Expansion SaaS + modelo de negocio
- ADR-005: modelo de negocio SaaS + Marketplace, Stripe
- 5 bounded contexts nuevos: subscriptions, learning, community, marketplace, analytics
- 21 tablas SQL, 5 schemas PostgreSQL
- Planes: Empresa (49-399 EUR), Candidato B2C (0-19.99 EUR), Terapeuta (0-29 EUR)

### Sesion 13 (10 Mar): Deploy a produccion
- Docker Compose produccion para Dokploy
- 12 fixes iterativos (build + networking)
- nginx DNS dinamico (resolver 127.0.0.11 + variables)
- Red interna explicita + dokploy-network para gateway
- **app.diversia.click operativa**

### Sesion 14 (11 Mar): subscription-service + welcome email
- **subscription-service completo** con TDD: 87 tests
  - Entidades: Plan (con limites y precios), Subscription (ciclo de vida), Invoice
  - Value objects: Money, PlanLimits, BillingCycle
  - 6 use cases: CreatePlan, ListPlans, Subscribe, CancelSubscription, ChangePlan, GetSubscription
  - Early adopter: primeras 25 empresas + 25 terapeutas reciben 3 meses gratis
  - API REST FastAPI con schemas Pydantic
  - In-memory repositories (Stripe adapter preparado)
- **Servicio compartido de email** (shared/email_service.py)
  - aiosmtplib async, template HTML con branding DiversIA
  - Best-effort: nunca bloquea el registro si SMTP falla
- **Welcome email** al registrar usuario
  - Integrado en auth-service register use case
  - Template HTML responsive con branding
- **Integracion infraestructura**
  - subscription-service en docker-compose (dev + prod)
  - nginx gateway con ruta /api/v1/subscriptions
  - Variables Stripe + SMTP en .env.example
- **320 tests totales** (233 anteriores + 87 nuevos)

### Sesion 15 (12 Mar): Pricing page + Early Adopter tracking + production fixes
- **Pagina de precios** (`/pricing`): 3 planes con toggle mensual/anual, FAQ, Early Adopter banner
- **Early adopter slot tracking**: endpoint `/api/v1/auth/early-adopter-slots`, `count_by_role` en repositorio
- **Registro verifica plazas** antes de enviar email Early Adopter
- **Auto-creacion de perfil** al registrarse y al entrar al dashboard (fix empresa no aparecia en BD)
- **Emails en produccion**: SMTP env vars en docker-compose.prod.yml
- **Fix acentos/ñ** en pagina para-terapeutas
- **Fix CI**: DATABASE_URL para `prisma generate` en GitHub Actions
- Link "Precios" en navbar (desktop + movil)

### Sesion 16 (14 Mar): ADR-006 + Backend alignment
- **ADR-006**: Migracion a modelo pago por exito (success fee)
- **Backend alineado**: BillingCycle.ON_SUCCESS, constantes deprecadas, limites 25/25, feature flag
- **Pricing page actualizada** para reflejar modelo pago por exito
- **Documentacion completa** actualizada: ROADMAP, NEXT_STEPS, PROJECT_STATUS, ONE_PAGER, EMAIL_TEMPLATE

### Sesion 17 (15-16 Mar): Inclusivity Engine + A11y + Tech Debt Cleanup
- **Inclusivity Engine mejorado**: 25+ bias patterns (modulo compartido `bias-patterns.ts`), scoring diferencial accommodations (technical/soft/domain), warning generico >80% soft skills
- **Ecosistema 360 Terapeutas**: `connections.service.ts` — modelo trilateral (Individual↔Company, Individual↔Therapist, Company↔Therapist), privacy enforcement, ciclo de vida conexiones
- **Accesibilidad WCAG AA**: boton AI semantico, chat dialog con ARIA, aria-live, Escape key, contraste 4.6:1, sr-only, autoFocus
- **Tech Debt eliminado** (#114): 7,800+ lineas codigo muerto (candidates/, company/, draft-manager, llm.js, rate-limiter.js, encryption.js)
- **Dependencias Vercel eliminadas**: @vercel/speed-insights removido
- **Vulnerabilidades resueltas**: hono + @hono/node-server
- **3 tests LLM corregidos**: timeout, Zod validation, health check
- **E2E tests**: homepage accessibility, registration flows
- **285 tests JS/TS** (era 245), 2 skipped (era 5)

### Sesion 18 (18 Mar): Seed data expandida — oficios manuales
- 4 nuevas empresas de oficios manuales (construccion, taller mecanico, viveros, obrador artesano)
- 8 nuevos candidatos (trabajo manual, diagnosticos duales TDAH+Dislexia, TAG+TDAH, Bipolar II)
- 2 nuevos terapeutas (Terapia Ocupacional + EMDR)
- 33 ofertas (+11), 55+ matchings (+25), 49+ conexiones (+22)
- 15 neurodivergencias representadas (era 11)

### Sesion 19 (18-19 Mar): Superadmin + Dashboard V2 briefs
- Superadmin dashboard con seed data demo funcional
- Admin role support: Navbar, layout, translations
- Superadmin bootstrap endpoint + login fixes (CORS, schema, redirect)
- CLAUDE.md como sistema nativo para Claude Code (reemplaza docs legacy)
- 6 agent briefs detallados para Dashboard V2 overhaul (docs/DESPACHOS_DASHBOARD_V2.md)
- Issues #135-#140 creadas con dependencias entre despachos

### Sesion 20 (20 Mar): Revision roadmap + planificacion Stripe success fee
- Revision completa de 28 issues abiertas
- Analisis de conflictos entre instruccion Stripe y issues existentes
- Decision: flujo superadmin para success fee (seguridad, legal, admin)
- Baremo escalonado aprobado: 8% (hasta 20K) / 10% (20-35K) / 12% (35-50K) / 14% (50-80K) / 15% (+80K)
- Plan: migrar secrets (#77) → implementar SuccessFeePayment → Dashboard V2 en paralelo

</details>
