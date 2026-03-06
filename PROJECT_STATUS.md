# Project Status — DiversIA Eternals

> **Ultima actualizacion**: 6 de marzo de 2026
> **Version**: 2.0.0-microservices
> **Maintainer**: GACE Architecture + Claude Opus 4

---

## Estado General

**La plataforma ha migrado de un monolito Next.js (v1.0.0) a una arquitectura de 4 microservicios Python/FastAPI (v2.0.0).** Los 4 servicios backend estan implementados con Clean Architecture, tests unitarios y persistencia SQLAlchemy. El frontend legacy Next.js sigue operativo en paralelo.

---

## Branch Strategy

| Branch | Proposito | Estado |
|--------|-----------|--------|
| `main` | Codigo production-ready (monolito v1.0.0) | Activo |
| `claude/review-issues-app-refactor-FZuy5` | Migracion v2.0.0 microservicios | En progreso |
| `archive/pre-cleanup-20260122` | Backup historico | Archivo |

---

## Microservicios — Estado

| Servicio | Puerto | Estado | Tests | Persistencia |
|----------|--------|--------|-------|-------------|
| **auth-service** | :8001 | Operativo | 48 unit + 36 security | SQLAlchemy + Alembic |
| **profile-service** | :8002 | Operativo | Estructura completa | SQLAlchemy |
| **matching-service** | :8003 | Operativo | 42 unit | SQLAlchemy |
| **intelligence-service** | :8004 | Operativo | Estructura completa | SQLAlchemy |
| **nginx gateway** | :80 | Configurado | N/A | N/A |
| **PostgreSQL 16** | :5432 | Configurado | N/A | 4 schemas |

### Detalle por Servicio

**auth-service**
- Registro y login con JWT + bcrypt
- Entidad User con value objects (Email, HashedPassword)
- Use cases: RegisterUser, LoginUser
- Repository pattern con SQLAlchemy
- Alembic migration: `001_initial_auth_tables`
- 48 tests unitarios + 36 tests de seguridad/persistencia

**profile-service**
- Evaluacion neurocognitiva (NeurocognitiveAssessment entity)
- Quiz normalization y scoring
- CRUD de perfiles neurodivergentes
- Domain services: prompt builder

**matching-service**
- Matching trilateral 24D (candidato-empresa-terapeuta)
- Scoring multidimensional con pesos configurables
- Entidades: MatchRequest, MatchResult, DimensionScore
- Use cases: RunMatching, GetCandidatesForJob
- Value objects: MatchScore, MatchStatus
- 42 tests unitarios

**intelligence-service**
- Generacion de talent reports via LLM (Ollama)
- Anonymization layer para datos sensibles
- Prompt builder especializado
- Entidades: TalentReport
- Interfaces: ILLMClient (Ollama implementation)

---

## Fases de Migracion

| Fase | Descripcion | Estado |
|------|------------|--------|
| 0 | Scaffolding: estructura de carpetas, Docker Compose, nginx | Completado |
| 1 | auth-service: domain, use cases, API, 48 tests | Completado |
| 2 | matching-service: domain, use cases, API, 42 tests | Completado |
| 3 | profile-service + intelligence-service: domain, entities, use cases | Completado |
| 4 | Persistencia: SQLAlchemy ORM, Alembic, DI wiring | Completado |
| 5 | OWASP hardening: CORS, rate limiting, seed data, 36 tests | Completado |
| 6 | Frontend Jinja2 + eliminacion Next.js legacy | **Pendiente** |
| 7 | Deploy en VPS + tests E2E cross-service | **Pendiente** |

---

## Tests

### Microservicios (pytest)
| Suite | Tests | Estado |
|-------|-------|--------|
| auth-service unit | 48 | Passing |
| matching-service unit | 42 | Passing |
| security + persistence | 36 | Passing |
| **Subtotal pytest** | **126** | **Passing** |

### Legacy (Vitest)
| Suite | Tests | Estado |
|-------|-------|--------|
| Unit tests | 200+ | Passing |
| Integration tests | 40+ | Passing |
| E2E (Playwright) | 25+ | Passing |
| **Subtotal Vitest** | **272** | **Passing** |

### Total: **398 tests, 0 failing**

---

## Tech Stack Actual

### Nuevo (v2.0.0 — Microservicios)
| Capa | Tecnologia |
|------|-----------|
| Runtime | Python 3.12 |
| Framework | FastAPI |
| ORM | SQLAlchemy 2.0 |
| Validacion | Pydantic v2 |
| Auth | JWT + bcrypt |
| Tests | pytest 9.0 |
| Migraciones | Alembic |
| LLM | Ollama + Llama 3.2 3B |
| Gateway | nginx |
| Deploy | Docker Compose + Dokploy |

### Legacy (v1.0.0 — En proceso de deprecacion)
| Capa | Tecnologia |
|------|-----------|
| Framework | Next.js 15 |
| ORM | Prisma 7 |
| Auth | NextAuth v5 |
| Tests | Vitest + Playwright |
| Deploy | Vercel |

---

## Infraestructura

| Componente | Ubicacion | Coste |
|-----------|-----------|-------|
| VPS (PostgreSQL + Ollama) | Hostinger, Paris (EU) | ~€40/mes |
| Frontend legacy | Vercel | Gratis (hobby) |
| CI/CD | GitHub Actions | Gratis |
| LLM | Ollama self-hosted (VPS) | €0 marginal |

---

## Documentacion Clave

- [README.md](README.md) — Guia rapida del proyecto
- [CHANGELOG.md](CHANGELOG.md) — Historial de versiones
- [ROADMAP.md](ROADMAP.md) — Plan de desarrollo completo
- [docs/NEXT_STEPS.md](docs/NEXT_STEPS.md) — Proximos pasos
- [docs/adr/ADR-003.md](docs/adr/ADR-003.md) — Decision: migracion a Python/FastAPI
- [docs/adr/ADR-004.md](docs/adr/ADR-004.md) — Decision: arquitectura microservicios
- [SECURITY_IMPLEMENTATION.md](SECURITY_IMPLEMENTATION.md) — Seguridad (stack legacy)
- [.agent/METHODOLOGY.md](.agent/METHODOLOGY.md) — Metodologia de desarrollo

---

## Proximos Pasos

1. **Frontend Jinja2**: Implementar UI con Jinja2 + Alpine.js + Tailwind CSS en profile-service
2. **Deploy microservicios**: Subir Docker Compose al VPS via Dokploy
3. **Tests E2E cross-service**: Verificar flujos completos entre servicios
4. **Eliminar Next.js**: Issue #63 — remover frontend legacy cuando el nuevo este listo
5. **Monitoring**: Sentry + healthchecks
6. **Beta**: Primeros usuarios reales

---

**Nota**: El frontend Next.js legacy sigue funcionando y sus 272 tests pasan. No se eliminara hasta que el frontend Jinja2 este completo y verificado.
