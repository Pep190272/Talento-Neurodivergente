# Proximos Pasos — DiversIA Eternals

**Ultima actualizacion:** 6 de marzo de 2026
**Estado actual:** v2.0.0-microservices — 4 servicios implementados, frontend pendiente
**Version:** v2.0.0-microservices
**Branch activa:** `claude/review-issues-app-refactor-FZuy5`

---

## Estado Actual (6 Mar 2026)

### Completado en sesiones 4-7 Mar

- auth-service: registro, login, JWT, 48 tests, Alembic migrations
- matching-service: matching trilateral 24D, scoring, 42 tests
- profile-service: evaluacion neurocognitiva, quiz normalization
- intelligence-service: LLM reports, anonymization, prompt builder
- SQLAlchemy ORM + DI wiring para todos los servicios
- OWASP hardening: CORS env-aware, rate limiting, seed data, 36 tests
- Docker Compose + nginx gateway configurados
- Documentacion completa actualizada

### Bloqueadores Historicos — RESUELTOS

| Bloqueador (Feb 2026) | Estado (Mar 2026) | Solucion |
|----------------------|-------------------|----------|
| JSON File Storage | RESUELTO | PostgreSQL 16 + SQLAlchemy 2.0 |
| Arquitectura monolitica | RESUELTO | 4 microservicios Python/FastAPI |
| TypeScript parcial | RESUELTO | Migrado a Python con type hints + Pydantic v2 |
| NextAuth vs Auth0 | RESUELTO | JWT custom en auth-service |
| LLM self-hosted | RESUELTO | Ollama + Llama 3.2 3B en VPS EU |

---

## SIGUIENTE PASO: Fase 6 — Frontend Jinja2

### Objetivo
Implementar el frontend dentro de profile-service usando Jinja2 + Alpine.js + Tailwind CSS, reemplazando el frontend Next.js legacy.

### Tareas

#### 6.1 Setup Jinja2 en profile-service
- [ ] Instalar `jinja2` y `python-multipart` en profile-service
- [ ] Configurar `Jinja2Templates` en FastAPI
- [ ] Crear estructura `templates/` y `static/`
- [ ] Tailwind CSS build pipeline

#### 6.2 Paginas Publicas
- [ ] Landing page (home)
- [ ] Login y registro
- [ ] Informacion (about, privacy policy)

#### 6.3 Dashboard Candidato
- [ ] Perfil neurodivergente (vista y edicion)
- [ ] Quiz/evaluacion neurocognitiva
- [ ] Matches y estado
- [ ] Consentimientos activos (GDPR)

#### 6.4 Dashboard Empresa
- [ ] Gestion de jobs
- [ ] Pipeline de candidatos
- [ ] Analisis de inclusividad (LLM)

#### 6.5 Dashboard Terapeuta
- [ ] Gestion de pacientes
- [ ] Reportes y evaluaciones

#### 6.6 Eliminacion de Next.js (Issue #63)
- [ ] Verificar que todas las funcionalidades estan cubiertas
- [ ] Eliminar `app/`, `prisma/`, `package.json`, `next.config.js`
- [ ] Actualizar Docker Compose para servir solo microservicios
- [ ] Redirigir dominio de Vercel al VPS

---

## Despues del Frontend: Fase 7

### 7.1 Deploy en VPS
- [ ] Subir Docker Compose al VPS via Dokploy
- [ ] Configurar SSL/TLS (Let's Encrypt)
- [ ] Variables de entorno en produccion
- [ ] Healthchecks para cada servicio

### 7.2 Tests E2E Cross-Service
- [ ] Flujo completo: registro → login → perfil → matching
- [ ] Flujo empresa: login → crear job → ver candidatos → analisis LLM
- [ ] Flujo consent: accept/reject/revoke entre actores
- [ ] GDPR: export data, delete account

### 7.3 Monitoring y Observabilidad
- [ ] Sentry para error tracking
- [ ] Healthcheck endpoints (`/health`)
- [ ] Structured logging (JSON)
- [ ] Backup automatizado PostgreSQL (cron → S3/Backblaze)

### 7.4 Beta con Usuarios Reales
- [ ] 5-10 empresas inclusivas
- [ ] 20-50 candidatos neurodivergentes
- [ ] 5-10 terapeutas/especialistas
- [ ] Feedback loop y iteracion

---

## Preguntas Estrategicas (siguen abiertas)

> Estas preguntas fueron planteadas en febrero y siguen pendientes de respuesta del founder.

### Modelo de Negocio
- [ ] Modelo de revenue? (SaaS / Marketplace / Mixto / Freemium)
- [ ] Quien paga? (Empresas / Individuos / Terapeutas)
- [ ] Comision por contratacion o solo subscripcion?

### Compliance Internacional
- [ ] Paises LATAM prioritarios?
- [ ] Certificaciones necesarias? (ISO 27001, SOC 2, ENS)

### Equipo
- [ ] Capacidad DevOps?
- [ ] Proyeccion usuarios 12 meses?
- [ ] Estado inversion $400K?

---

## Referencias

- [ROADMAP.md](../ROADMAP.md) — Plan de desarrollo completo
- [PROJECT_STATUS.md](../PROJECT_STATUS.md) — Estado actual del proyecto
- [CHANGELOG.md](../CHANGELOG.md) — Historial de versiones
- [docs/adr/ADR-003.md](adr/ADR-003.md) — Migracion a Python/FastAPI
- [docs/adr/ADR-004.md](adr/ADR-004.md) — Arquitectura microservicios
- [Issue #63](https://github.com/Pep190272/Talento-Neurodivergente/issues/63) — Eliminar Next.js

---

**Proxima accion inmediata:** Implementar Jinja2 templates en profile-service
