# Proximos Pasos — DiversIA Eternals

**Ultima actualizacion:** 12 de marzo de 2026
**Estado actual:** v2.3.0 — produccion en app.diversia.click, 320 tests
**Branch principal:** `main`

---

## Estado Actual (12 Mar 2026)

### Que funciona en produccion (app.diversia.click)

- **5 microservicios** corriendo: auth, profile, matching, intelligence, subscription
- **PostgreSQL 16** con 4 schemas core + subscriptions
- **nginx gateway** con DNS dinamico, rate limiting, security headers
- **Ollama + Llama 3.2 3B** self-hosted (EU)
- **320 tests totales**, 0 failing
- **28/29 issues** del backlog resueltas
- **subscription-service** con 87 tests, early adopters, Stripe ready
- **Welcome email + admin notification + early adopter email** al registrar
- **Pagina de precios** (`/pricing`) con modelo pago por exito y tracking de Early Adopter slots
- **Early adopter slot tracking**: endpoint API + verificacion automatica al registrar
- **Auto-creacion de perfil** al registrarse (fix empresas/terapeutas)
- **SSL automatico** via Traefik/Let's Encrypt

### Completado (12 Mar 2026)

- [x] Docker Compose verificado end-to-end
- [x] Deploy a app.diversia.click via Dokploy
- [x] Health checks funcionan (/health)
- [x] nginx rutea correctamente
- [x] Registro + login + auto-perfil funciona
- [x] SSL + HTTPS
- [x] Emails en produccion (SMTP configurado)
- [x] Pagina de precios con Early Adopter slots en vivo
- [x] CI fix: DATABASE_URL para prisma generate

---

## SIGUIENTE PASO: Beta con usuarios reales + Optimizar

### 1. ~~Stripe checkout + webhooks en produccion~~ — PAUSADO (ADR-006)

> **Motivo:** Migracion a modelo de pago por exito (success fee). Las empresas acceden gratis y pagan solo al contratar. No se requiere Stripe Checkout Session ni suscripciones recurrentes. Cuando haya volumen de contrataciones (estimado: mes 6+), se integrara Stripe Invoicing para facturacion puntual.

- ~~Crear productos y precios en Stripe Dashboard~~
- ~~Implementar Stripe Checkout Session en subscription-service~~
- ~~Configurar Stripe webhooks~~
- ~~Conectar flujo: pricing page → checkout → webhook → activar suscripcion en BD~~

**Nuevo plan de facturacion (cuando proceda):**
- [ ] Implementar tracking de contrataciones exitosas en la plataforma
- [ ] Integrar Stripe Invoicing para emitir facturas por success fee
- [ ] Configurar webhooks de facturacion (invoice.paid, invoice.overdue)
- [ ] Dashboard de facturacion para empresas

### 2. Build de frontend (optimizacion)
- [ ] Tailwind CSS como dependencia (no CDN)
- [ ] Alpine.js + Chart.js como vendor bundles
- [ ] Generar `app.min.css` con purge

### 3. Retirar Next.js legacy (Issue #63)
- [ ] Verificar que app.diversia.click cubre todas las funciones
- [ ] Desactivar Vercel
- [ ] Limpiar app/, prisma/, package.json del repo

### 4. Monitoring
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

### Fase 1: Subscriptions — COMPLETADO + MODELO ACTUALIZADO (11-14 Mar 2026)
- [x] subscription-service (:8005) — 87 tests
- [x] Planes empresa/candidato/terapeuta con logica de dominio
- [x] Early adopter: 25 empresas + 25 terapeutas
- [x] 6 use cases: CreatePlan, ListPlans, Subscribe, Cancel, ChangePlan, GetSubscription
- [x] API REST + Docker Compose + nginx gateway
- [x] Welcome email + admin notification + early adopter email al registrar
- [x] Pagina de precios (`/pricing`) con tracking de slots en vivo
- [x] Endpoint `GET /api/v1/auth/early-adopter-slots`
- [x] Verificacion de plazas antes de enviar email Early Adopter
- ~~Stripe checkout + webhooks en produccion~~ **PAUSADO (ADR-006: pago por exito)**
- ~~Conectar pagos reales con Stripe~~ **PAUSADO (ADR-006: pago por exito)**
- [x] **Actualizar pagina /pricing para reflejar modelo pago por exito**
- [ ] **Implementar tracking de contrataciones exitosas**

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

### Modelo de Negocio — ACTUALIZADO (ver ADR-006)
- [x] Revenue: **Pago por exito (success fee al contratar)** ← antes SaaS fijo
- [x] Quien paga: **Empresas, solo al contratar (10-15% salario bruto anual). Candidatos y terapeutas gratis.**
- [x] Pasarela: **Stripe Invoicing** (cuando haya volumen) — checkout pausado
- [x] Early adopters: 50% descuento en success fee (primeras 25 empresas, primeras 5 contrataciones)
- [x] Breakeven estimado: Mes 9-12

### Pendientes
- [ ] Paises LATAM prioritarios?
- [ ] Certificaciones? (ISO 27001, SOC 2, ENS)

---

**Proxima accion inmediata:** Atraer empresas a la plataforma (acceso gratis) → conseguir primera contratacion exitosa → validar modelo pago por exito
