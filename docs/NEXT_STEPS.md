# Proximos Pasos — DiversIA Eternals

**Ultima actualizacion:** 11 de marzo de 2026
**Estado actual:** v2.2.0-saas — produccion en app.diversia.click, 320 tests
**Branch principal:** `main`

---

## Estado Actual (10 Mar 2026)

### Que funciona en produccion (app.diversia.click)

- **4 microservicios** corriendo: auth, profile, matching, intelligence
- **PostgreSQL 16** con 4 schemas core
- **nginx gateway** con DNS dinamico, rate limiting, security headers
- **Ollama + Llama 3.2 3B** self-hosted (EU)
- **320 tests totales**, 0 failing
- **28/29 issues** del backlog resueltas
- **subscription-service** con 87 tests, early adopters, Stripe ready
- **Welcome email** al registrar usuario (shared email service)
- **SSL automatico** via Traefik/Let's Encrypt

### Completado (10 Mar 2026)

- [x] Docker Compose verificado end-to-end
- [x] Deploy a app.diversia.click via Dokploy
- [x] Health checks funcionan (/health)
- [x] nginx rutea correctamente
- [x] Registro + login funciona
- [x] SSL + HTTPS

---

## SIGUIENTE PASO: Optimizar + Monetizar

### 1. Build de frontend (optimizacion)
- [ ] Tailwind CSS como dependencia (no CDN)
- [ ] Alpine.js + Chart.js como vendor bundles
- [ ] Generar `app.min.css` con purge

### 2. Retirar Next.js legacy (Issue #63)
- [ ] Verificar que app.diversia.click cubre todas las funciones
- [ ] Desactivar Vercel
- [ ] Limpiar app/, prisma/, package.json del repo

### 3. Monitoring
- [ ] Logs centralizados (Dokploy ya tiene basico)
- [ ] Alertas por servicio caido

---

## Despues de Optimizar

### Beta
- [ ] 5-10 empresas inclusivas
- [ ] 20-50 candidatos neurodivergentes
- [ ] 5-10 terapeutas/especialistas
- [ ] Feedback loop

---

## Prioridad de Implementacion SaaS

### Fase 1: Subscriptions — COMPLETADO (11 Mar 2026)
- [x] subscription-service (:8005) — 87 tests
- [x] Planes empresa/candidato/terapeuta con logica de dominio
- [x] Early adopter: 25 empresas + 25 terapeutas, 3 meses gratis
- [x] 6 use cases: CreatePlan, ListPlans, Subscribe, Cancel, ChangePlan, GetSubscription
- [x] API REST + Docker Compose + nginx gateway
- [x] Welcome email al registrar (shared email service)
- [ ] Stripe checkout + webhooks en produccion
- [ ] Conectar pagos reales con Stripe

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

## Preguntas Estrategicas Resueltas

### Modelo de Negocio — DEFINIDO (ver ADR-005)
- [x] Revenue: **SaaS + Marketplace mixto**
- [x] Quien paga: **Empresas (49-399+ EUR/mes) + Terapeutas (29 EUR/mes). Candidatos gratis.**
- [x] Pasarela: **Stripe** (1.5% + 0.25 EUR/tx)
- [x] Early adopters: PRO gratis 6 meses (primeras 20 empresas, 50 terapeutas)
- [x] Breakeven estimado: Mes 7

### Pendientes
- [ ] Paises LATAM prioritarios?
- [ ] Certificaciones? (ISO 27001, SOC 2, ENS)

---

**Proxima accion inmediata:** Conectar Stripe checkout en produccion + Build Tailwind CSS + preparar beta con usuarios reales
