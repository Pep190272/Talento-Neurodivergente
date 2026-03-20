# Proximos Pasos — DiversIA Eternals

**Ultima actualizacion:** 20 de marzo de 2026
**Estado actual:** v2.8.0 — produccion en app.diversia.click, 608+ tests (323 pytest + 285 JS/TS)
**Branch principal:** `main`

---

## Estado Actual (20 Mar 2026)

### Que funciona en produccion (app.diversia.click)

- **5 microservicios** corriendo: auth, profile, matching, intelligence, subscription
- **Superadmin dashboard** con seed data demo funcional (14 empresas, 24 candidatos, 8 terapeutas)
- **PostgreSQL 16** con 4 schemas core + subscriptions
- **nginx gateway** con DNS dinamico, rate limiting, security headers
- **Ollama + Llama 3.2 3B** self-hosted (EU)
- **608+ tests totales** (323 pytest + 285 JS/TS), 0 failing
- **subscription-service** con 90 tests, early adopters, modelo pago por exito
- **Pagina de precios** (`/pricing`) con modelo pago por exito y tracking de Early Adopter slots
- **Seed data**: 33 ofertas, 55+ matchings, 15 neurodivergencias representadas
- **SSL automatico** via Traefik/Let's Encrypt

### Completado (17-19 Mar 2026)

- [x] Superadmin dashboard con demo seed data
- [x] Admin role support: navbar, dashboard layout, translations
- [x] Superadmin bootstrap endpoint + login fixes
- [x] Seed data expandida: oficios manuales, diagnosticos duales, nuevos terapeutas
- [x] CLAUDE.md como sistema nativo para Claude Code
- [x] 6 agent briefs para Dashboard V2 (docs/DESPACHOS_DASHBOARD_V2.md)
- [x] Baremo success fee escalonado aprobado (8-15%, ADR-006 actualizado)

---

## SIGUIENTE PASO: Dashboard V2 + Stripe Success Fee + Beta

### 1. Dashboard V2 (issues #135-#140)
- [ ] Despacho 6: WCAG AAA contrastes (#140) — independiente, ejecutar primero
- [ ] Despacho 1: Pestanas por actor (#135) — independiente
- [ ] Despacho 2: Graficos interactivos Chart.js (#136) — depende #135
- [ ] Despacho 3: Hub matching trilateral (#137) — depende #135
- [ ] Despacho 4: Chat privado (#138) — independiente, backend+frontend
- [ ] Despacho 5: Onboarding tour (#139) — depende #135, #136, #137

### 2. Migrar secrets a Dokploy (#77) — PREREQUISITO STRIPE
- [ ] Mover POSTGRES_PASSWORD y demas credenciales a Dokploy Environment Variables
- [ ] Preparar variables para STRIPE_SECRET_KEY y STRIPE_WEBHOOK_SECRET

### 3. Success Fee con Stripe (implementacion ADR-006)

**Baremo escalonado aprobado:**
| Rango salarial | Fee |
|---------------|-----|
| Hasta 20K | 8% |
| 20-35K | 10% |
| 35-50K | 12% |
| 50-80K | 14% |
| +80K | 15% |

**Implementacion:**
- [ ] Entidad SuccessFeePayment (draft → pending → paid → failed) en subscription-service
- [ ] Calculo automatico del fee segun baremo y salario del puesto
- [ ] Stripe Checkout Session (mode=payment) + webhook verificado
- [ ] Flujo superadmin: revisar → aprobar → generar cobro → empresa paga
- [ ] Endpoint POST /api/v1/subscriptions/success-fees
- [ ] Endpoint POST /api/v1/subscriptions/success-fees/{id}/checkout
- [ ] Webhook POST /api/v1/subscriptions/webhooks/stripe
- [ ] Tests unitarios (entidad, transiciones) + integracion (endpoints, webhook mock)

### 2. Build de frontend (optimizacion)
- [ ] Tailwind CSS como dependencia (no CDN)
- [ ] Alpine.js + Chart.js como vendor bundles
- [ ] Generar `app.min.css` con purge

### 3. Retirar Next.js legacy (Issue #63) — EN PROGRESO
- [x] Dependencias Vercel eliminadas (@vercel/speed-insights)
- [x] 7,800+ lineas de codigo muerto eliminadas (candidates/, company/, draft-manager, etc.)
- [ ] Verificar que app.diversia.click cubre todas las funciones
- [ ] Desactivar Vercel
- [ ] Limpiar app/, prisma/, package.json del repo completamente

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

### Fase 1: Subscriptions + Success Fee — COMPLETADO parcialmente
- [x] subscription-service (:8005) — 90 tests
- [x] Planes empresa/candidato/terapeuta con logica de dominio
- [x] Early adopter: 25 empresas + 25 terapeutas
- [x] Backend alineado con ADR-006: BillingCycle.ON_SUCCESS, limites 25/25, feature flag
- [x] Pagina de precios actualizada para modelo pago por exito
- [ ] **SuccessFeePayment** (entidad + baremo escalonado + Stripe Checkout) ← PROXIMO
- [ ] **Dashboard de facturacion** para superadmin

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

---

## Sesiones recientes

### Sesion 20 (20 Mar 2026) — Revision roadmap + planificacion Stripe
- Revision completa de 28 issues abiertas y conflictos potenciales
- Decision: flujo superadmin para success fee (seguridad + legal)
- Baremo escalonado aprobado: 8% (hasta 20K) → 15% (+80K)
- ADR-006 actualizado con baremo y flujo superadmin
- Documentacion completa sincronizada

### Sesion 19 (18-19 Mar 2026) — Superadmin + Dashboard V2 briefs
- Superadmin dashboard con seed data demo
- Admin role, bootstrap, CORS fixes
- CLAUDE.md nativo, 6 agent briefs Dashboard V2

### Sesion 18 (18 Mar 2026) — Seed data expandida
- 4 empresas oficios manuales, 8 candidatos, 2 terapeutas
- 33 ofertas, 55+ matchings, 15 neurodivergencias
