# ROADMAP — DiversIA (app.diversia.click)

**Fecha de inicio:** 10 de febrero de 2026
**Ultima actualizacion:** 9 de marzo de 2026
**Estado:** Desarrollo local — profile-service operativo en :8002

---

## Principios de trabajo

1. **Todo el desarrollo es local** hasta tener la app completa y funcional
2. **No se pushea a GitHub** hasta preparar el deploy a VPS
3. **El repo de GitHub mantiene la app Node.js** funcional en produccion (Vercel)
4. **El dominio objetivo es `app.diversia.click`** — subdominio del VPS existente

---

## Estado actual del proyecto (9 marzo 2026)

### Que funciona (desarrollo local)

| Componente | Estado | Tests |
|-----------|--------|-------|
| **profile-service** (:8002) | Operativo — frontend, auth, quiz, games, jobs, matching | 83 passing |
| **auth-service** (codigo) | Listo — register, login, JWT, bcrypt | 48 passing |
| **matching-service** (codigo) | Listo — scoring trilateral 24D, batch matching | 53 passing |
| **intelligence-service** (codigo) | Listo — reports LLM, anonymizer, prompt builder | 36 passing |
| **shared kernel** | Listo — value objects, auth, rate limiter | 13 passing |
| **Frontend (Jinja2)** | 14 paginas funcionales, Alpine.js + Tailwind CDN | Sin tests |
| **SQLite standalone** | Funcional — auth_proxy + profiles_local sin PostgreSQL | — |
| **Docker Compose** | Definido — 4 servicios + postgres + nginx (5 mas planificados) | Sin verificar |

**Total: 233 tests, 0 failing**

### Que NO funciona (lo que falta)

- Docker Compose no verificado (4 servicios core juntos)
- Build de Tailwind CSS (usa CDN — no valido para produccion)
- Paginas de error (404, 500)
- Deploy a VPS (app.diversia.click)
- Beta con usuarios reales

---

## Arquitectura (estado real)

### Desarrollo (lo que corre HOY)

```
  profile-service (:8002)     Ollama (:11434)
  ┌───────────────────────┐   ┌──────────────┐
  │ Frontend (14 paginas) │   │ Llama 3.2 3B │
  │ Auth (SQLite)         │──▶│ Self-hosted   │
  │ Profiles, Quiz, Games │   └──────────────┘
  │ Jobs, Matching 24D    │
  └───────────┬───────────┘
              │
        SQLite (local)
```

### Produccion (objetivo, NO desplegado)

```
                    nginx gateway (:80)
                         |
        +----------------+----------------+----------------+
        |                |                |                |
  auth-service     profile-service  matching-service  intelligence-service
    (:8001)           (:8002)          (:8003)            (:8004)
        |                |                |                |
        +----------------+----------------+----------------+
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

## FASE ACTUAL — Verificar y desplegar

### Paso 1: Docker Compose end-to-end
- [ ] `docker compose up` arranca los 4 servicios core + postgres + nginx
- [ ] Health checks funcionan (/health en cada servicio)
- [ ] nginx rutea correctamente a cada servicio
- [ ] Seed data se carga en primera ejecucion

### Paso 2: Build de frontend
- [ ] Instalar Tailwind CSS como dependencia (no CDN)
- [ ] Build pipeline (postcss + purge)
- [ ] Alpine.js + Chart.js como vendor bundles locales

### Paso 3: Paginas de error
- [ ] 404.html, 500.html, 401.html
- [ ] Middleware FastAPI para servir estas paginas

### Paso 4: Deploy a VPS
- [ ] Push a GitHub
- [ ] SSH al VPS
- [ ] `docker compose up -d --build`
- [ ] Configurar app.diversia.click + SSL (Let's Encrypt)
- [ ] Verificar flujos completos

### Paso 5: Beta
- [ ] 5-10 empresas inclusivas
- [ ] 20-50 candidatos neurodivergentes
- [ ] 5-10 terapeutas/especialistas

---

## Costes

| Concepto | Coste | Notas |
|----------|-------|-------|
| VPS Hostinger (2 CPU, 8GB RAM) | ~40 EUR/mes | Paris EU, PostgreSQL + Ollama + servicios |
| Frontend legacy (Vercel) | 0 EUR | Hobby plan, se retirara |
| Dominio diversia.click | ~10 EUR/ano | Hostinger |
| Desarrollo IA (Claude Opus 4) | ~80 EUR total | ~10 sesiones, ~800k tokens |
| **Total mensual** | **~40 EUR/mes** | Sin contar desarrollo |

---

## Historial de versiones

| Version | Fecha | Descripcion |
|---------|-------|-------------|
| v0.x | Feb 2026 | Monolito Next.js — Sprints 1-5 |
| v1.0.0 | 26 Feb | Monolito production-ready (272 tests, OWASP audit) |
| v2.0.0-dev | 4-9 Mar | Microservicios Python/FastAPI (233 tests, 14 paginas) |
| v2.1.0-saas | 9 Mar | Expansion SaaS: 5 bounded contexts, modelo de negocio (ADR-005) |
| **v2.0.0** | **TBD** | **Deploy a app.diversia.click** |

---

## Referencia rapida: como ejecutar

### Desarrollo local (standalone)

```bash
cd services/profile-service
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8002
# Abre http://localhost:8002
```

### Tests

```bash
cd services/auth-service && python -m pytest tests/ -q         # 48 tests
cd services/profile-service && python -m pytest tests/ -q      # 83 tests
cd services/matching-service && python -m pytest tests/ -q     # 53 tests
cd services/intelligence-service && python -m pytest tests/ -q # 36 tests
cd services/shared && python -m pytest tests/ -q               # 13 tests
# Total: 233 tests, 0 failing
```

### Docker (cuando este verificado)

```bash
cd services
docker compose up --build
# Abre http://localhost (nginx)
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
<summary>Sesiones 6-11 (Mar 2026) — Microservicios Python</summary>

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

</details>
