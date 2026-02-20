# ROADMAP — DiversIA Eternals

**Fecha de inicio:** 10 de febrero de 2026
**Ultima actualizacion:** 20 de febrero de 2026
**Estado:** Sprint 1 en progreso — Fundaciones criticas

---

## Indice

1. [Progreso Actual](#progreso-actual)
2. [Sprint 1: Fundaciones Criticas](#sprint-1-fundaciones-criticas)
3. [Sprint 2: Tests y Limpieza](#sprint-2-tests-y-limpieza)
4. [Sprint 3: Arquitectura y Capas](#sprint-3-arquitectura-y-capas)
5. [Sprint 4: LLM y Compliance](#sprint-4-llm-y-compliance)
6. [Sprint 5: Seguridad y Deploy](#sprint-5-seguridad-y-deploy)
7. [Decisiones Tecnicas](#decisiones-tecnicas)
8. [Preguntas Estrategicas Pendientes](#preguntas-estrategicas-pendientes)
9. [Notas de Sesion](#notas-de-sesion)

---

## Progreso Actual

### Completado

| Tarea | Fecha | Detalle |
|-------|-------|---------|
| Auditoria completa del proyecto | 10 Feb | 76 archivos temp eliminados, build arreglado |
| Dependabot: Next.js 15.5.9 a 15.5.12 | 20 Feb | CVE-2026-23864 (DoS, CVSS 7.5) parcheado |
| Migracion JSON a PostgreSQL (codigo) | 20 Feb | 4 modulos: therapists, matching, consent, dashboards |
| Expansion schema Prisma | 20 Feb | Therapist (3 a 33 cols), Connection (4 a 17), Matching (+consent/expiracion) |
| prisma migrate deploy | 20 Feb | 5 migraciones aplicadas exitosamente en PostgreSQL 16 |
| seed.ts actualizado | 20 Feb | 4 users, 2 jobs, 3 matchings, 4 connections, 7 audit logs |
| Bug fix: dashboards.ts | 20 Feb | `company.profile.name` a `company.name` (campo inexistente) |
| Bug fix: dashboards.ts audit | 20 Feb | `storage.getAuditLogsForUser()` a `audit.ts` (Prisma) |
| API route actualizada | 20 Feb | `individuals/[userId]` usa consent.ts en vez de storage.js |
| prisma.config.ts seed command | 20 Feb | Migrado de package.json (requisito Prisma 7) |
| PrismaClient adapter fix | 20 Feb | seed.ts usa `@prisma/adapter-pg` (requisito Prisma 7) |

### En Progreso

| Tarea | Estado | Bloqueante |
|-------|--------|------------|
| Actualizar tests para `.ts` | Pendiente | No |
| Eliminar archivos `.js` legacy | Esperando tests | No |

### Estado de Modulos

| Modulo | Storage | Archivo | Estado |
|--------|---------|---------|--------|
| `individuals.ts` | Prisma | Pre-existente | Operativo |
| `companies.ts` | Prisma | Pre-existente | Operativo |
| `audit.ts` | Prisma | Pre-existente | Operativo |
| `therapists.ts` | Prisma | Nuevo (reemplaza `.js`) | Operativo |
| `matching.ts` | Prisma | Nuevo (reemplaza `.js`) | Operativo |
| `consent.ts` | Prisma | Nuevo (reemplaza `.js`) | Operativo |
| `dashboards.ts` | Prisma | Nuevo (reemplaza `.js`) | Operativo |
| `storage.js` | JSON files | Legacy | Sin consumidores en `app/` |

---

## Sprint 1: Fundaciones Criticas

**Periodo:** 10-20 Feb 2026
**Estado:** Casi completo

### 1.1 Migracion JSON a PostgreSQL — COMPLETADO

- [x] Expansion schema Prisma (Therapist, Connection, Matching)
- [x] `therapists.js` a `therapists.ts` (Prisma)
- [x] `matching.js` a `matching.ts` (Prisma)
- [x] `consent.js` a `consent.ts` (Prisma)
- [x] `dashboards.js` a `dashboards.ts` (Prisma)
- [x] API route `individuals/[userId]` actualizada
- [x] `prisma migrate deploy` ejecutado (5 migraciones)
- [x] seed.ts expandido y verificado

**Resultado:** 0 consumidores de `storage.js` en `app/`. Todos los modulos de negocio usan PostgreSQL via Prisma.

### 1.2 Seguridad: Dependabot — COMPLETADO

- [x] Next.js 15.5.9 a 15.5.12 (CVE-2026-23864, CVSS 7.5)

### 1.3 Tests: Actualizar para modulos `.ts` — PENDIENTE

- [ ] Actualizar tests en `tests/unit/actors/therapist.test.js` para importar desde `.ts`
- [ ] Verificar que tests existentes pasan con nuevos modulos
- [ ] Agregar tests para funcionalidad nueva (consent atomico, matching expandido)

### 1.4 Limpieza: Eliminar archivos legacy — PENDIENTE

- [ ] Eliminar `app/lib/therapists.js`
- [ ] Eliminar `app/lib/matching.js`
- [ ] Eliminar `app/lib/consent.js`
- [ ] Eliminar `app/lib/dashboards.js`
- [ ] Evaluar eliminacion de `app/lib/storage.js`

### 1.5 Migrar `app/api/forms/route.js` — PENDIENTE

- [ ] Actualmente usa `fs` directo para `data/submissions.json`
- [ ] Migrar a Prisma o a un modelo dedicado

---

## Sprint 2: Tests y Limpieza

**Periodo:** Semana 3-4 Feb 2026
**Estado:** No iniciado

### 2.1 Corregir Tests Existentes

**Estado previo:** 155 tests, 4 pasando (3%)
**Objetivo:** Tests refactorizados para modulos Prisma

- [ ] Configurar mocking de Prisma para tests unitarios
- [ ] Migrar `tests/unit/actors/therapist.test.js`
- [ ] Migrar `tests/unit/actors/matching.test.js`
- [ ] Migrar `tests/unit/actors/consent.test.js`
- [ ] Migrar `tests/unit/actors/dashboards.test.js`
- [ ] Verificar que tests de `individuals` y `companies` siguen pasando

### 2.2 Setup CI/CD Basico

- [ ] GitHub Actions workflow: tests + build
- [ ] Proteccion de branch `main`
- [ ] Dependabot configurado (ya detecta vulnerabilidades)

### 2.3 Migracion TypeScript Progresiva

**Regla:** "Si editas un `.js`, conviertelo a `.ts` en el mismo commit"

- [ ] API routes mas usadas (matching, individuals, consent)
- [ ] Componentes React criticos (`.jsx` a `.tsx`)
- [ ] Objetivo: >80% TypeScript antes de quitar `ignoreBuildErrors`

---

## Sprint 3: Arquitectura y Capas

**Periodo:** Marzo 2026
**Estado:** No iniciado

### 3.1 Extraer Service Layer

Independiente de la decision monolito vs. microservicios:

```
app/lib/
  services/          # Logica de negocio pura
    matching.service.ts
    consent.service.ts
    profiles.service.ts
  repositories/      # Data access layer (Prisma)
    individual.repository.ts
    company.repository.ts
    therapist.repository.ts
```

- [ ] Crear `services/` con logica extraida de modulos actuales
- [ ] Crear `repositories/` con queries Prisma encapsuladas
- [ ] Refactorizar API routes para usar services
- [ ] Logica testeable sin depender de HTTP/framework

### 3.2 Definir Arquitectura Objetivo

**Pendiente de preguntas estrategicas (ver seccion final)**

**Opcion A: Monolito Next.js (actual)**
- Simple, todo en un repo, deploy unico
- Limita app movil futura

**Opcion B: Backend separado (NestJS/Fastify)**
- Multiples frontends (web, movil, widget)
- Mas complejo, dos deploys

---

## Sprint 4: LLM y Compliance

**Periodo:** Marzo-Abril 2026
**Estado:** No iniciado

### 4.1 Migracion Gemma 2B a API Externa

**Estado actual:** Cliente Ollama creado pero Gemma 2B self-hosted no es viable para produccion.

- [ ] Evaluar: Gemini API, Claude API, OpenAI API
- [ ] Migrar `app/lib/llm.js` a `llm.service.ts`
- [ ] Implementar prompts para: evaluacion de candidatos, matching explanations, analisis de inclusividad
- [ ] Rate limiting y cache para API calls

### 4.2 GDPR Compliance Completo

**Estado actual:** ~70% implementado

- [ ] Data Retention Policy (definir periodos)
- [ ] Right to be Forgotten completo (eliminacion en cascada)
- [ ] Data Portability (export JSON/CSV)
- [ ] Consent Management UI (ver/revocar consentimientos)
- [ ] Privacy Policy (documento legal)
- [ ] DPO Contact designado

---

## Sprint 5: Seguridad y Deploy

**Periodo:** Abril-Mayo 2026
**Estado:** No iniciado

### 5.1 Auditoria de Seguridad (OWASP Top 10)

- [ ] SQL Injection (Prisma previene, verificar raw queries)
- [ ] Broken Auth (audit NextAuth config)
- [ ] Sensitive Data Exposure (verificar AES-256-GCM)
- [ ] Broken Access Control (audit permisos por endpoint)
- [ ] XSS (DOMPurify ya implementado, verificar cobertura)
- [ ] Input Validation (Zod en todas las rutas)

### 5.2 Tests E2E (Playwright)

- [ ] Registro de candidato completo
- [ ] Registro de empresa + crear job
- [ ] Matching automatico
- [ ] Aceptacion de match (consent flow)
- [ ] Revocacion de consentimiento
- [ ] Dashboard de candidato
- [ ] Pipeline de empresa
- [ ] Download my data (GDPR)

### 5.3 Deployment

- [ ] Setup Vercel (o alternativa)
- [ ] Variables de entorno en produccion
- [ ] PostgreSQL en produccion (VPS actual o managed)
- [ ] Backup automatizado
- [ ] Monitoring (Sentry, Vercel Analytics)

---

## Decisiones Tecnicas

### Tomadas

| Decision | Resultado | Fecha |
|----------|-----------|-------|
| PostgreSQL + Prisma | Aprobado y ejecutado | 10 Feb |
| JSON a PostgreSQL (migracion) | Completado para todos los modulos | 20 Feb |
| Next.js 15 (mantener) | Actualizado a 15.5.12 | 20 Feb |
| Vitest (mantener) | Aprobado | 10 Feb |
| TypeScript progresivo | En progreso (modulos `.ts` creados) | 20 Feb |
| JSON columns para datos semi-estructurados | Certifications, metadata, companyContracts como `Json` | 20 Feb |
| `clients[]` como String array | MVP adecuado, tabla intermedia futura si >100 clientes | 20 Feb |
| MatchingStatus como enum Prisma | PENDING, APPROVED, REJECTED, WITHDRAWN, CONTESTED | 20 Feb |
| Connection.status como String | "active", "revoked" — por simplicidad | 20 Feb |
| Prisma 7 adapter pattern | `@prisma/adapter-pg` en runtime, `env('DATABASE_URL')` en CLI | 20 Feb |

### Pendientes

| Decision | Opciones | Depende de |
|----------|----------|------------|
| Monolito vs. backend separado | Next.js monolito / NestJS separado | Multiples frontends? |
| NextAuth vs. Auth0/Clerk | Mantener NextAuth / Migrar a managed | Compliance, budget |
| LLM provider | Gemini API / Claude API / OpenAI | Evaluacion, costes |
| Hosting | Vercel + VPS / Railway / Render | Budget, DevOps capacity |

---

## Preguntas Estrategicas Pendientes

> Estas preguntas fueron planteadas en la sesion del 10 Feb y siguen abiertas.
> Las respuestas definen la arquitectura objetivo y el go-to-market.

### Modelo de Negocio
- [ ] Modelo de revenue? (SaaS / Marketplace / Mixto / Freemium)
- [ ] Quien paga? (Empresas / Individuos / Terapeutas)
- [ ] Cliente principal? (Grandes empresas / Pymes / Startups)

### Compliance y Jurisdicciones
- [ ] Paises LATAM prioritarios? (Mexico, Argentina, Colombia, Chile)
- [ ] Almacenar diagnosticos medicos explicitos o solo perfiles de fortalezas?
- [ ] Terapeutas empleados o independientes?
- [ ] Certificaciones necesarias? (ISO 27001, SOC 2, ENS, HIPAA)

### Arquitectura y Escalabilidad
- [ ] Multiples frontends previstos? (App movil, widget embebible)
- [ ] Capacidad DevOps? (Solo / Equipo pequeno / Equipo grande)
- [ ] Proyeccion usuarios 12 meses?
- [ ] Estado inversion $400K?

---

## Notas de Sesion

### Sesion 1 — 10 Feb 2026

**Trabajos realizados:**
- Auditoria completa del proyecto
- Limpieza de 76 archivos temporales
- Correccion de errores de build (exports faltantes, params await)
- Build exitoso verificado
- ROADMAP y framework de consultoria creados

**Decisiones:**
- PostgreSQL + Prisma confirmado
- Migracion JSON a PostgreSQL es prioridad #1
- TypeScript progresivo (archivo por archivo)

### Sesion 2 — 20 Feb 2026

**Trabajos realizados:**
- Dependabot merge: Next.js 15.5.12 (CVE-2026-23864)
- Migracion completa JSON a PostgreSQL (4 modulos)
- Schema Prisma expandido (Therapist, Connection, Matching)
- 5 migraciones aplicadas en PostgreSQL 16
- seed.ts reescrito con datos de prueba completos
- 2 bugs corregidos en dashboards (company.profile.name, audit logs)
- API route actualizada (storage.js a consent.ts)
- Documentacion de migracion creada

**Decisiones tecnicas:**
- JSON columns para datos semi-estructurados (certifications, metadata)
- `clients[]` como String array en Therapist (adecuado para MVP)
- MatchingStatus como enum, Connection.status como string
- `@prisma/adapter-pg` obligatorio en Prisma 7 para runtime
- Seed command en `prisma.config.ts` (no en package.json)

**Bugs encontrados y corregidos:**
- `dashboards.js` accedia a `company.profile.name` que no existia (Prisma normaliza como `company.name`)
- `dashboards.js` llamaba a `storage.getAuditLogsForUser()` pero audit logs se escribian a PostgreSQL via `audit.ts`
- `seed.ts` usaba `new PrismaClient()` sin adapter (Prisma 7 requiere `@prisma/adapter-pg`)
- `seed.ts` upsert sin `include` impedia acceder a IDs de relaciones

---

## Referencias

- [docs/MIGRATION_JSON_TO_POSTGRESQL.md](docs/MIGRATION_JSON_TO_POSTGRESQL.md) — Detalle tecnico de la migracion
- [docs/AUDITORIA_PROYECTO_2026-02-10.md](docs/AUDITORIA_PROYECTO_2026-02-10.md) — Auditoria inicial
- [prisma/schema.prisma](prisma/schema.prisma) — Schema de base de datos
- [SECURITY_IMPLEMENTATION.md](SECURITY_IMPLEMENTATION.md) — Sistema de seguridad

---

**Proxima sesion:** Actualizar tests para modulos `.ts`, eliminar archivos legacy, setup CI/CD
