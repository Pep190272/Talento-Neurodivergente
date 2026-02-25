# Próximos Pasos - DiversIA Eternals

**Última actualización:** 10 de febrero de 2026
**Estado actual:** Post-consultoría estratégica - Redefiniendo arquitectura
**Versión:** v1.1.0
**Branch activa:** `feat/auth-admin-ecosystem`

---

## 📍 Estado Actual (10 Feb 2026)

### ✅ Completado Hoy
- ✅ **Auditoría completa del proyecto** → [docs/AUDITORIA_PROYECTO_2026-02-10.md](AUDITORIA_PROYECTO_2026-02-10.md)
- ✅ **Limpieza técnica:** Eliminados 76 archivos `tmpclaude-*`
- ✅ **Build arreglado:** Exports faltantes + params await + TypeScript errors
- ✅ **Roadmap estratégico creado:** [ROADMAP.md](../ROADMAP.md)
- ✅ **Consultoría iniciada:** 5 fases de preguntas estratégicas

### 🚨 Bloqueadores Críticos Identificados

| Bloqueador | Impacto | Prioridad |
|-----------|---------|-----------|
| **JSON File Storage** | No escalable, race conditions, sin transacciones | 🔴 **#1 CRÍTICO** |
| **Arquitectura monolítica** | Dificulta múltiples frontends futuros | 🟡 #2 Alta |
| **TypeScript parcial** | Sin type safety en lógica crítica | 🟡 #3 Alta |
| **LLM self-hosted (Ollama)** | Resuelto: upgrade Gemma 2B → Llama 3.2 3B | ✅ Resuelto |
| **NextAuth vs. Auth0** | Compliance integrado en Auth0 | 🟢 #5 Media |

---

## 🎯 PREGUNTAS ESTRATÉGICAS PENDIENTES

> **Acción requerida:** Responder estas preguntas para definir arquitectura objetivo

### 📊 Modelo de Negocio (Prioridad #1)
- [ ] ¿Modelo de revenue? (SaaS / Marketplace / Mixto / Freemium)
- [ ] ¿Quién paga? (Empresas / Individuos / Terapeutas)
- [ ] ¿Cliente principal? (Grandes empresas / Pymes / Startups)
- [ ] ¿Comisión por contratación o solo subscripción?

### 🌍 Compliance y Jurisdicciones
- [ ] ¿Países LATAM prioritarios? (México, Argentina, Colombia, Chile...)
- [ ] ¿Almacenar diagnósticos médicos explícitos? (TDAH, Autismo) o solo perfiles de fortalezas
- [ ] ¿Terapeutas empleados o independientes?
- [ ] ¿Certificaciones necesarias? (ISO 27001, SOC 2, ENS, HIPAA)

### 🏗️ Arquitectura y Escalabilidad
- [ ] ¿Múltiples frontends previstos? (App móvil, widget embebible)
- [ ] ¿Capacidad DevOps? (Solo tú / Equipo pequeño / Equipo grande)
- [ ] ¿Proyección usuarios 12 meses? (Individuos / Empresas / Terapeutas)
- [ ] ¿Estado inversión $400K?

**Ver detalles completos:** [ROADMAP.md - Fase de Consultoría](../ROADMAP.md#fase-de-consultoría-actual)

---

## 🚀 PLAN DE ACCIÓN INMEDIATO

### Sprint 1: Fundaciones Críticas (1 semana) — **BLOQUEANTE**

#### 1.1 Migración JSON → PostgreSQL 🔴 **PRIORIDAD #1**

**Estado:** ❌ No iniciado
**Bloqueador:** Todo desarrollo posterior depende de esto
**Estimación:** 2-3 días

**Tareas:**
- [ ] **Setup PostgreSQL** (Docker en VPS vía Dockploy-Compose - ya disponible)
- [ ] **Ejecutar primera migración Prisma:**
  ```bash
  npx prisma migrate dev --name init
  ```
- [ ] **Migrar módulos uno por uno:**
  - [ ] `app/lib/individuals.js` (25KB) → usar Prisma Client
  - [ ] `app/lib/companies.js` (18KB) → usar Prisma Client
  - [ ] `app/lib/therapists.js` (25KB) → usar Prisma Client
  - [ ] `app/lib/matching.js` (15KB) → usar Prisma Client
  - [ ] `app/lib/consent.js` (21KB) → usar Prisma Client
- [ ] **Mantener tests pasando en cada paso**
- [ ] **Eliminar `app/lib/storage.js` (13KB)** al finalizar
- [ ] **Backup final de JSON files antes de eliminar `data/`**

**Criterios de éxito:**
- ✅ Todos los módulos usan Prisma
- ✅ Tests pasando al 100%
- ✅ Build exitoso
- ✅ No más race conditions

---

#### 1.2 Migración JavaScript → TypeScript (Progresiva)

**Estado:** ❌ No iniciado
**Estrategia:** Archivo por archivo conforme se edita
**Estimación:** 2-3 semanas (paralelo a desarrollo)

**Regla de oro:** "Si editas un `.js`, conviértelo a `.ts` en el mismo commit"

**Prioridad de migración:**
1. **Crítico primero:** `app/lib/*.js` (lógica de negocio sensible)
2. **APIs después:** `app/api/**/route.js` → `.ts`
3. **Componentes finalmente:** `app/components/**/*.jsx` → `.tsx`

**Tareas iniciales:**
- [ ] Migrar `app/lib/matching.js` → `.ts` (core business)
- [ ] Migrar `app/lib/consent.js` → `.ts` (GDPR crítico)
- [ ] Migrar `app/lib/individuals.js` → `.ts` (datos sensibles)
- [ ] Migrar API routes más usadas (matching, individuals)
- [ ] Quitar `typescript.ignoreBuildErrors` cuando esté >80% migrado

**Beneficios:**
- ✅ Type safety en datos médicos sensibles
- ✅ Prisma genera tipos automáticamente
- ✅ Autocomplete y refactors seguros

---

#### 1.3 Setup CI/CD Básico

**Estado:** ❌ No configurado
**Estimación:** 1 día

**GitHub Actions workflow:**
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - run: npm run build
```

**Tareas:**
- [ ] Crear workflow de CI (tests + build)
- [ ] Configurar protección de branch `main`
- [ ] Agregar badge de CI a README
- [ ] Setup Dependabot (ya detectó 4 vulnerabilidades)

---

### Sprint 2: Arquitectura y Separación de Capas (2 semanas)

#### 2.1 Definir Arquitectura Objetivo (Pendiente de preguntas)

**Opciones en evaluación:**

**Opción A: Monolito Next.js (actual)**
```
Next.js App Router
├── Frontend (React components)
├── API Routes (gateway)
└── Business Logic (app/lib/)
    └── Prisma (data access)
```

**✅ Pros:** Simple, todo en un repo, deploy único
**❌ Contras:** Dificulta app móvil futura, escalabilidad limitada

---

**Opción B: Backend Separado (recomendado si múltiples frontends)**
```
Frontend (Next.js)          Backend API (NestJS/Fastify)
     │                              │
     └──── REST/GraphQL ────────────┤
                                    ├── Service Layer
                                    └── Prisma (PostgreSQL)
```

**✅ Pros:** Múltiples frontends (web, móvil, widget), escalable
**❌ Contras:** Más complejo, dos deploys, CORS

**Decisión pendiente:** Responder pregunta #7 del ROADMAP (múltiples frontends)

---

#### 2.2 Extraer Business Logic a Service Layer

**Independiente de la decisión A vs B, necesitamos esto:**

```
app/lib/
├── services/              # NEW - Business logic puro
│   ├── matching.service.ts
│   ├── consent.service.ts
│   ├── profiles.service.ts
│   └── notifications.service.ts
├── repositories/          # NEW - Data access layer
│   ├── individual.repository.ts
│   ├── company.repository.ts
│   └── therapist.repository.ts
├── schemas/              # Validación Zod
│   └── schemas.ts
└── utils/               # Utilidades compartidas
    └── utils.ts
```

**Tareas:**
- [ ] Crear `services/` directory
- [ ] Crear `repositories/` directory
- [ ] Extraer lógica de `matching.js` → `matching.service.ts`
- [ ] Extraer queries de Prisma → `repositories/`
- [ ] Refactorizar API routes para usar services

**Beneficio:** Lógica testeable sin depender de HTTP/framework

---

### Sprint 3: LLM Upgrade & Compliance (1-2 semanas)

#### 3.1 LLM Self-Hosted: Upgrade Gemma 2B → Llama 3.2 3B

**Decision (25 Feb 2026): Mantener self-hosted Ollama en VPS**

**Estado actual:**
- ✅ Cliente Ollama creado (`app/lib/llm.js`)
- ✅ Ollama corriendo en VPS Hostinger (Paris, Francia)
- ✅ Analisis de inclusividad funcional con fallback rule-based
- ✅ 15 tests (12 activos, 3 skipped)

**Decision: Self-hosted ES la opcion correcta para DiversIA**

**Justificacion:**
1. **Presupuesto $0** — Gemini API free tier insuficiente para produccion (5 RPM, 100 req/dia)
2. **GDPR Art. 9** — Datos neurodivergentes (categoria especial) nunca salen de la infra
3. **VPS ya pagado** — Coste marginal de Ollama = $0
4. **Caso de uso acotado** — Solo `analyzeJobInclusivity()` con prompt estructurado
5. **Llama 3.2 3B > Gemma 2B** — IFEval 77.4 vs 61.9 (+25% en seguir instrucciones)

**Upgrade de modelo (Gemma 2B → Llama 3.2 3B):**
- [x] Actualizar default en `app/lib/llm.js` y `.env.example`
- [ ] En VPS: `ollama pull llama3.2:3b` (2GB, requiere acceso al contenedor)

**Tareas pendientes:**
- [ ] Migrar `app/lib/llm.js` → `llm.service.ts` (TypeScript + service layer)
- [ ] Implementar prompts para: evaluacion de candidatos, matching explanations
- [ ] Rate limiting y cache para llamadas al LLM

---

#### 3.2 GDPR Compliance Completo

**Estado actual:** Parcial (~70%)

**Pendiente:**
- [ ] **Data Retention Policy:** Definir cuánto tiempo guardar datos
- [ ] **Right to be Forgotten:** Implementar eliminación completa
- [ ] **Data Portability:** Export en formato estándar (JSON/CSV)
- [ ] **Consent Management:** UI clara para ver/revocar todos los consentimientos
- [ ] **Privacy Policy:** Documento legal completo
- [ ] **Cookie Banner:** Si usamos cookies (analytics)
- [ ] **DPO Contact:** Designar Data Protection Officer (puede ser externo)

**Tareas:**
- [ ] Implementar "Download my data" (ZIP con todos los datos del usuario)
- [ ] Implementar "Delete account" con confirmación y eliminación en cascada
- [ ] Crear dashboard de consentimientos activos
- [ ] Documentar data retention en Privacy Policy
- [ ] Agregar logs de todas las operaciones GDPR

---

#### 3.3 Leyes LATAM (Pendiente de países prioritarios)

**México (LFPDPPP):**
- Similar a GDPR
- Requiere aviso de privacidad en español
- Consentimiento explícito para datos sensibles

**Argentina (PDPA):**
- Una de las más estrictas de LATAM
- Requiere inscripción en registro de bases de datos
- Transfer internacional de datos necesita autorización

**Colombia (Ley 1581):**
- Autorización previa para recolección
- Derecho de habeas data
- Registro de bases de datos

**Chile (Ley 19.628):**
- Regulación de datos sensibles
- Consentimiento expreso

**Tareas (después de definir países):**
- [ ] Crear términos de servicio por país
- [ ] Implementar data localization si es requerida
- [ ] Consultar con abogado local en cada país prioritario

---

### Sprint 4: Testing, Seguridad y Deploy (1-2 semanas)

#### 4.1 Auditoría de Seguridad (OWASP Top 10)

**Tareas:**
- [ ] **Injection:** Verificar que Prisma previene SQL injection
- [ ] **Broken Auth:** Audit de NextAuth/Auth0 config
- [ ] **Sensitive Data Exposure:** Verificar encriptación AES-256-GCM
- [ ] **XML External Entities:** N/A (no usamos XML)
- [ ] **Broken Access Control:** Audit de permisos en cada endpoint
- [ ] **Security Misconfiguration:** Review de headers, CORS, etc.
- [ ] **XSS:** Verificar sanitización (DOMPurify ya implementado)
- [ ] **Insecure Deserialization:** Validar inputs con Zod
- [ ] **Using Components with Known Vulnerabilities:** Dependabot activo
- [ ] **Insufficient Logging:** Agregar logs de seguridad

**Herramientas:**
- [ ] Snyk scan
- [ ] npm audit fix
- [ ] OWASP ZAP scan
- [ ] Penetration testing (contratar si hay presupuesto)

---

#### 4.2 Tests E2E (Playwright)

**Flujos críticos a testear:**
1. Registro de candidato completo
2. Registro de empresa + crear job
3. Matching automático
4. Aceptación de match (consent flow)
5. Revocación de consentimiento
6. Dashboard de candidato
7. Pipeline de empresa
8. Download my data (GDPR)
9. Delete account

**Tareas:**
- [ ] Instalar Playwright
- [ ] Crear `tests/e2e/` directory
- [ ] Implementar tests por flujo
- [ ] Agregar screenshots en failures
- [ ] Integrar en CI/CD

---

#### 4.3 Deployment

**Opciones:**

**Frontend + API Routes (Next.js):**
- ✅ **Vercel** (recomendado): Deploy automático, Edge Functions, Analytics
- ❌ Render, Railway, Fly.io

**PostgreSQL:**
- ✅ **VPS actual** (Dockploy-Compose) - ya disponible
- Alternativa: Neon, Supabase, Railway (managed)

**Backups:**
- ✅ **Automated daily** a S3/Backblaze
- ✅ **Point-in-time recovery** (PITR) con PostgreSQL WAL

**Tareas:**
- [ ] Setup Vercel project
- [ ] Configurar variables de entorno en Vercel
- [ ] Conectar PostgreSQL desde Vercel (IP whitelist)
- [ ] Setup backup automático (cron en VPS → S3)
- [ ] Configurar dominio custom
- [ ] Setup monitoring (Vercel Analytics + Sentry)

---

## 🔄 Decisiones Técnicas Pendientes

### ¿Mantener o Cambiar?

| Tecnología | Estado Actual | Propuesta | Decisión |
|-----------|---------------|-----------|----------|
| **Next.js 15** | ✅ Funcionando | 🟡 Evaluar separación | ⏳ Pendiente respuesta |
| **PostgreSQL** | 🔴 No migrado | ✅ Migrar YA | ✅ **APROBADO** |
| **Prisma** | ✅ Schema diseñado | ✅ Usar | ✅ **APROBADO** |
| **NextAuth v5** | ✅ Implementado | 🟡 Evaluar Auth0/Clerk | ⏳ Pendiente |
| **JSON Storage** | 🔴 Actual | ❌ ELIMINAR | ✅ **ELIMINAR** |
| **LLM (Ollama)** | ✅ Self-hosted | ✅ Upgrade Llama 3.2 3B | ✅ **APROBADO** |
| **Vitest** | ✅ Configurado | ✅ Mantener | ✅ **APROBADO** |
| **jsdom** | ✅ Actual | 🟢 Cambiar a happy-dom | 🟢 Opcional |

---

## 📊 Métricas de Éxito (Actualizadas)

### Técnicas
- [ ] **100% PostgreSQL:** Migración completa, 0 archivos JSON
- [ ] **>80% TypeScript:** Mayoría del código en `.ts/.tsx`
- [ ] **Build time <90s:** Optimización de compilación
- [ ] **>85% test coverage:** En módulos críticos (matching, consent, profiles)
- [ ] **Lighthouse score >90:** Performance, Accessibility, Best Practices, SEO
- [ ] **0 vulnerabilities high/critical:** Dependabot resuelto

### Compliance
- [ ] **GDPR completo:** Todos los derechos implementados
- [ ] **Audit logs 100%:** Todas las operaciones sensibles loggeadas
- [ ] **Data encryption at rest:** AES-256-GCM verificado
- [ ] **Backup automatizado:** Daily backups + restore tested
- [ ] **Privacy Policy publicada:** Revisada por abogado

### Negocio
- [ ] **Modelo de revenue definido:** Pricing claro
- [ ] **Go-to-market ready:** Landing + onboarding completo
- [ ] **Beta testers ready:** 5-10 empresas + 20-50 candidatos
- [ ] **Investment pitch ready:** Deck + demo + métricas

---

## 🚨 Riesgos Actualizados

### Riesgo 1: Delay en Migración PostgreSQL 🔴
**Impacto:** Bloquea todo desarrollo posterior
**Probabilidad:** Media (complejidad técnica)
**Mitigación:**
- Priorizar sobre todo lo demás
- Migrar módulo por módulo (no todo de golpe)
- Mantener tests pasando en cada paso
- Backup de JSONs antes de eliminar

### Riesgo 2: Indefinición de Arquitectura 🟡
**Impacto:** Retrabajos si se decide separar backend después
**Probabilidad:** Alta (decisión estratégica pendiente)
**Mitigación:**
- Responder preguntas del ROADMAP esta semana
- Consultoría con experto si es necesario
- Separar service layer ahora (funciona en ambos escenarios)

### Riesgo 3: Compliance LATAM sin Legal 🟡
**Impacto:** Riesgo legal al lanzar en países sin asesoría
**Probabilidad:** Alta (leyes complejas y diferentes por país)
**Mitigación:**
- Contratar abogado especializado en data privacy LATAM
- Empezar solo en España (GDPR conocido)
- Expandir a LATAM después de validar modelo de negocio

### Riesgo 4: Burnout del Desarrollador 🟢
**Impacto:** Retrasos, calidad de código
**Probabilidad:** Media (mucho trabajo por hacer)
**Mitigación:**
- Priorizar ruthlessly (no todo es urgente)
- Usar managed services (menos DevOps overhead)
- Contratar ayuda si hay presupuesto

---

## 🎯 Priorización Final (Orden de Ejecución)

### 🔥 ESTA SEMANA (11-17 Feb 2026)
1. **Responder preguntas del ROADMAP** (negocio, compliance, arquitectura)
2. **Setup PostgreSQL local** (Docker en VPS)
3. **Migrar `individuals.js` → Prisma** (proof of concept)
4. **Verificar tests** (debe seguir pasando)

### 📅 PRÓXIMAS 2 SEMANAS (18 Feb - 3 Mar)
1. **Completar migración PostgreSQL** (todos los módulos)
2. **Eliminar JSON storage** (backup final)
3. **Setup CI/CD básico** (GitHub Actions)
4. **Migrar 3-5 archivos a TypeScript** (empezar lento)

### 📅 MES 1 (4 Mar - 31 Mar)
1. **Separar service layer** (arquitectura limpia)
2. **Upgrade LLM: Llama 3.2 3B en VPS** (self-hosted, mejor calidad)
3. **GDPR compliance completo** (download data, delete account)
4. **Tests E2E críticos** (registro, matching, consent)

### 📅 MES 2-3 (Abr-May)
1. **Definir y ejecutar arquitectura objetivo** (monolito vs. separado)
2. **Completar migración TypeScript** (>80%)
3. **Auditoría de seguridad** (OWASP Top 10)
4. **Deploy a producción** (Vercel + PostgreSQL)

### 📅 MES 4-6 (Jun-Ago)
1. **Beta con usuarios reales** (5-10 empresas)
2. **Iteración según feedback**
3. **Compliance LATAM** (países prioritarios)
4. **Fundraising** (si es necesario)

---

## 📝 Notas de Sesión

### 10 Feb 2026 - Sesión de Consultoría Estratégica

**Participantes:** Josep (Founder/Dev) + Claude Sonnet 4.5 (Consultor Técnico)

**Trabajos realizados:**
- ✅ Auditoría exhaustiva del proyecto
- ✅ Limpieza de 76 archivos temporales
- ✅ Corrección de errores de build
- ✅ Build exitoso verificado
- ✅ Creación de ROADMAP.md con framework de consultoría
- ✅ Identificación de 5 bloqueadores críticos

**Decisiones tomadas:**
- ✅ Migración JSON → PostgreSQL es prioridad #1 absoluta
- ✅ Mantener PostgreSQL + Prisma (confirmado)
- ✅ TypeScript migration progresiva (archivo por archivo)
- ✅ Mantener LLM self-hosted (Ollama), upgrade Gemma 2B → Llama 3.2 3B (25 Feb)

**Preguntas abiertas para próxima sesión:**
- Modelo de monetización específico
- Países LATAM prioritarios
- Nivel de almacenamiento de datos médicos (diagnósticos explícitos o solo perfiles)
- Capacidad DevOps del equipo
- Proyección de usuarios 12 meses
- Estado de inversión ($400K)
- Necesidad de múltiples frontends (móvil, widget)

---

## 🔗 Referencias

- **[ROADMAP.md](../ROADMAP.md)** - Framework de consultoría estratégica (5 fases)
- **[docs/AUDITORIA_PROYECTO_2026-02-10.md](AUDITORIA_PROYECTO_2026-02-10.md)** - Estado completo del proyecto
- **[DOCUMENTACION_PROYECTO.md](../DOCUMENTACION_PROYECTO.md)** - Documentación técnica detallada
- **[SECURITY_IMPLEMENTATION.md](../SECURITY_IMPLEMENTATION.md)** - Sistema de seguridad
- **[prisma/schema.prisma](../prisma/schema.prisma)** - Schema de base de datos (listo para migrar)
- **[TODO.md](../TODO.md)** - Features pendientes (OpenAI integration)
- **[CRITICAL_ISSUES.md](../CRITICAL_ISSUES.md)** - Issues de seguridad (mayoría resueltos)

---

## 🎉 Próxima Acción Inmediata

**MAÑANA (11 Feb):**
1. ☕ Responder las 14 preguntas del ROADMAP (30-45 min)
2. 🐘 Setup PostgreSQL en VPS (Dockploy-Compose)
3. 🔧 Ejecutar `npx prisma migrate dev --name init`
4. 📝 Migrar primer módulo (`individuals.js` → usar Prisma)

**Meta de la semana:** Tener PostgreSQL funcionando con al menos 1 módulo migrado

---

**Creado:** 13 de enero de 2026
**Última revisión:** 10 de febrero de 2026
**Próxima revisión:** Después de responder preguntas del ROADMAP
**Versión:** v1.1.0 (post-consultoría)
