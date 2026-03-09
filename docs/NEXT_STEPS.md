# Proximos Pasos — DiversIA Eternals

**Ultima actualizacion:** 9 de marzo de 2026
**Estado actual:** v2.0.0-microservices — profile-service operativo en :8002, 233 tests
**Branch activa:** `claude/review-issues-app-refactor-FZuy5`

---

## Estado Actual (9 Mar 2026)

### Que funciona

- **profile-service** (:8002): frontend Jinja2, auth SQLite, quiz 24D, games, jobs, matching, inclusivity
- **auth-service**: codigo + 48 tests (sin desplegar)
- **matching-service**: codigo + 53 tests (sin desplegar)
- **intelligence-service**: codigo + 36 tests (sin desplegar)
- **shared kernel**: rate limiter Redis-ready + 13 tests
- **233 tests totales**, 0 failing
- **28/29 issues** del backlog resueltas
- **Use cases GDPR**: ApplyToJob, ManageConsent, ExportData, DeleteAccount, VerifyTherapist
- **E2E tests**: 4 suites escritas (requieren servicios para ejecutar)
- **Backup scripts**: backup-postgres.sh + restore-postgres.sh

### Bloqueadores Historicos — TODOS RESUELTOS

| Bloqueador (Feb 2026) | Solucion |
|----------------------|----------|
| JSON File Storage | SQLAlchemy 2.0 + SQLite standalone |
| Arquitectura monolitica | 4 microservicios Python/FastAPI |
| NextAuth vs Auth0 | JWT custom en auth-service |
| LLM self-hosted | Ollama + Llama 3.2 3B |
| 0 tests | 233 tests passing |

---

## SIGUIENTE PASO: Docker Compose + Deploy

### 1. Verificar Docker Compose
- [ ] `docker compose up` arranca los 4 servicios + postgres + nginx
- [ ] Health checks funcionan (/health)
- [ ] nginx rutea correctamente
- [ ] Comunicacion inter-servicio funciona

### 2. Build de frontend
- [ ] Tailwind CSS como dependencia (no CDN)
- [ ] Alpine.js + Chart.js como vendor bundles
- [ ] Generar `app.min.css` con purge

### 3. Paginas de error
- [ ] 404, 500, 401
- [ ] Middleware FastAPI

### 4. Deploy a VPS
- [ ] Push a GitHub
- [ ] `docker compose up -d --build` en VPS
- [ ] SSL (Let's Encrypt) + app.diversia.click
- [ ] Variables de entorno en produccion

### 5. Validacion post-deploy
- [ ] Registro + login funciona
- [ ] Quiz + dashboard funciona
- [ ] Jobs + matching funciona
- [ ] GDPR (export + delete) funciona

### 6. Retirar Next.js (Issue #63)
- [ ] Verificar que app.diversia.click funciona al 100%
- [ ] Desactivar Vercel
- [ ] Limpiar app/, prisma/, package.json del repo

---

## Despues del Deploy

### Monitoring
- [ ] Logs centralizados
- [ ] Health check dashboard
- [ ] Alertas por servicio caido

### Beta
- [ ] 5-10 empresas inclusivas
- [ ] 20-50 candidatos neurodivergentes
- [ ] 5-10 terapeutas/especialistas
- [ ] Feedback loop

---

## Preguntas Estrategicas — RESUELTAS (9 Mar 2026)

### Modelo de Negocio — DEFINIDO (ver ADR-005)
- [x] Revenue: **SaaS + Marketplace mixto**
- [x] Quien paga: **Empresas (49-399+ EUR/mes) + Terapeutas (29 EUR/mes). Candidatos gratis.**
- [x] Pasarela: **Stripe** (1.5% + 0.25 EUR/tx)
- [x] Early adopters: PRO gratis 6 meses (primeras 20 empresas, 50 terapeutas)
- [x] Breakeven estimado: Mes 7

### Modelo de Datos SaaS — DEFINIDO (ver ADR-005)
- [x] 5 nuevos Bounded Contexts: subscriptions, learning, community, marketplace, analytics
- [x] 5 nuevos schemas PostgreSQL con 21 tablas totales
- [x] Migracion SQL creada: `services/migrations/20260309_001_create_saas_bounded_contexts.sql`
- [x] DDD-first: dominio modelado antes que tablas

### Compliance Internacional
- [ ] Paises LATAM prioritarios?
- [ ] Certificaciones? (ISO 27001, SOC 2, ENS)

---

## Prioridad de Implementacion (post-deploy)

### Fase 0: Deploy (inmediato)
- [ ] Docker Compose + deploy a app.diversia.click

### Fase 1: Subscriptions (Mes 1 post-deploy)
- [ ] subscription-service (:8005)
- [ ] Stripe checkout + webhooks
- [ ] Planes empresa (Free/Starter/Pro/Enterprise)
- [ ] Planes candidato (Free/Pro/Pro+)

### Fase 2: Analytics (Mes 2)
- [ ] analytics-service (:8009)
- [ ] Dashboard DEI para empresas
- [ ] Reportes ESG/CSRD
- [ ] Usage event tracking

### Fase 3: Learning (Mes 3)
- [ ] learning-service (:8006)
- [ ] Cursos adaptativos por perfil neurocognitivo
- [ ] Certificaciones verificables

### Fase 4: Community (Mes 4)
- [ ] community-service (:8007)
- [ ] Grupos tematicos + moderacion
- [ ] Eventos (webinars, workshops)

### Fase 5: Marketplace (Mes 5)
- [ ] marketplace-service (:8008)
- [ ] Directorio de proveedores
- [ ] Reservas + comisiones

---

**Proxima accion inmediata:** Verificar Docker Compose y preparar deploy a app.diversia.click
