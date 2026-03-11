# ROADMAP — DiversIA (app.diversia.click)

**Fecha de inicio:** 10 de febrero de 2026
**Ultima actualizacion:** 11 de marzo de 2026
**Estado:** Produccion — app.diversia.click operativa

---

## Principios de trabajo

1. **Produccion primero**: la app corre en `app.diversia.click` via Dokploy
2. **Iteracion rapida**: deploy continuo desde GitHub → Dokploy
3. **El dominio principal es `app.diversia.click`** — VPS Hostinger (Paris, EU)

---

## Estado actual del proyecto (11 marzo 2026)

### Que funciona en produccion (app.diversia.click)

| Componente | Estado | Tests |
|-----------|--------|-------|
| **auth-service** (:8001) | Operativo — register, login, JWT, bcrypt, welcome email | 48 passing |
| **profile-service** (:8002) | Operativo — frontend, auth, quiz, games, jobs, matching | 83 passing |
| **matching-service** (:8003) | Operativo — scoring trilateral 24D, batch matching | 53 passing |
| **intelligence-service** (:8004) | Operativo — reports LLM, anonymizer, prompt builder | 36 passing |
| **subscription-service** (:8005) | Operativo — planes, suscripciones, facturacion, early adopters | 87 passing |
| **shared kernel** | Libreria — value objects, auth, rate limiter, email service | 13 passing |
| **nginx gateway** (:8000) | Operativo — routing, rate limiting, security headers | — |
| **PostgreSQL 16** (:5432) | Operativo — 4 schemas core + subscriptions | — |
| **Ollama** (:11434) | Operativo — Llama 3.2 3B self-hosted | — |
| **Frontend (Jinja2)** | 14 paginas, Alpine.js + Tailwind CDN | — |

**Total: 320 tests, 0 failing**

### Que falta

- Build de Tailwind CSS (usa CDN — funcional pero no optimo)
- Stripe webhooks y checkout en produccion
- Beta con usuarios reales
- Retirar frontend legacy Next.js (Vercel)

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
> Ver `docs/adr/ADR-005.md` y `services/migrations/20260309_001_create_saas_bounded_contexts.sql`.

---

## FASE ACTUAL — Post-deploy

### Completado (10 Mar 2026)
- [x] Docker Compose arranca los 4 servicios core + postgres + nginx + ollama
- [x] Health checks funcionan (/health en cada servicio)
- [x] nginx rutea correctamente a cada servicio
- [x] Deploy a app.diversia.click via Dokploy
- [x] SSL (Let's Encrypt via Traefik)
- [x] DNS dinamico en nginx (resolver 127.0.0.11)

### Pendiente: Build de frontend
- [ ] Instalar Tailwind CSS como dependencia (no CDN)
- [ ] Build pipeline (postcss + purge)
- [ ] Alpine.js + Chart.js como vendor bundles locales

### Completado: Fase 1 SaaS — subscription-service (11 Mar 2026)
- [x] subscription-service con TDD (87 tests)
- [x] Entidades de dominio: Plan, Subscription, Invoice
- [x] 6 use cases: CreatePlan, ListPlans, Subscribe, CancelSubscription, ChangePlan, GetSubscription
- [x] Early adopter logic: primeras 25 empresas + 25 terapeutas, 3 meses gratis
- [x] API REST FastAPI con validacion Pydantic
- [x] Docker Compose + nginx gateway integration
- [x] Configuracion Stripe (secret + publishable keys)
- [x] Servicio compartido de email (aiosmtplib async)
- [x] Welcome email al registrar usuario/empresa
- [ ] Stripe webhooks en produccion
- [ ] Checkout flow en produccion

### Pendiente: Beta
- [ ] 5-10 empresas inclusivas
- [ ] 20-50 candidatos neurodivergentes
- [ ] 5-10 terapeutas/especialistas

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

</details>
