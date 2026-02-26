# Sesión de Arquitectura — 2026-02-26

**Tipo:** Revisión arquitectónica completa + planificación de backlog
**Participantes:** Product Owner + Claude Code (arquitecto IA)
**Duración:** Sesión completa de análisis, no se escribió código
**Branch:** `claude/review-issue-26-p2wyE`

---

## 1. Contexto

Se realizó una auditoría completa del estado del proyecto Talento Neurodivergente (Diversia Eternals) con el objetivo de:

- Identificar bugs bloqueantes
- Definir la arquitectura correcta
- Crear un backlog priorizado de issues
- Analizar la infraestructura (VPS vs Vercel)
- Definir el marco cognitivo de evaluaciones
- Resolver la configuración de entorno

---

## 2. Estado Real del Proyecto (Diagnóstico)

| Dimensión | Estado | Nota |
|---|---|---|
| Infraestructura base | Sólida | Prisma, NextAuth, AES-256, rate limiting |
| Lógica de dominio | Parcial | Servicios mezclan responsabilidades |
| Flujo de usuario | Roto | Registro no crea User autenticable |
| Evaluación / Quiz | Roto | Race condition + datos solo en localStorage |
| Juegos | Incompleto | Funcionan, datos perdidos al recargar |
| Dashboard | Stub | Datos hardcodeados, sin integración real |
| Tests | Parcial | ~116 tests, ~40-50% cobertura |
| DDD | Anémico | Modelos son contenedores sin comportamiento |
| Matching IA | Backend OK | Frontend no existe, evaluaciones no se usan |
| Documentación | Mínima | Sin OpenAPI, sin ADRs actualizados |

### Bug crítico: Quiz stuck en "Cargando Cuestionario..."

**Causa raíz identificada** (`app/quiz/page.js` línea 221-258):

```javascript
const { t, language } = useLanguage()  // language = undefined en primer render

useEffect(() => {
  if (!mounted) return  // si mounted=false, nunca carga
  loadQuiz()
}, [language])  // si language=undefined, el effect no re-ejecuta correctamente
```

Race condition entre el hook de idioma y el montaje del componente. `loading=true` nunca se resuelve.

### Flujo de registro roto

```
[Register Form] → guarda en FormSubmission
                → NO crea User autenticable
                → "Gracias, revisa tu email" (email nunca se envía)
                → DEAD END
```

---

## 3. Decisiones de Arquitectura

### 3.1 DDD sin modelo anémico

**Decisión:** Implementar Rich Domain Models con comportamiento en los aggregates.

**Motivación:** Los modelos actuales son contenedores de datos sin invariantes de dominio. El comportamiento vive en servicios que mezclan responsabilidades.

**Patrón objetivo:**
```typescript
// En lugar de:
const result = await updateIndividualAssessment(userId, data)

// Implementar:
const individual = await individualRepo.findById(userId)
individual.completeAssessment(gameResults)   // invariantes en el dominio
individual.updateCognitiveProfile()
await individualRepo.save(individual)
```

### 3.2 Capa de Use Cases (CQRS-lite)

**Decisión:** Introducir capa de Use Cases entre API routes y servicios.

**Motivación:** Actualmente `API Route → Service → Prisma` sin separación de responsabilidades. Necesitamos `CreateIndividualProfileUseCase`, `CompleteAssessmentUseCase`, etc.

### 3.3 LLM: Ollama como proveedor principal

**Decisión:** Usar Ollama (llama3.2:3b en el VPS) como LLM principal. OpenAI eliminado del proyecto.

**Motivación:**
- OpenAI era un vestigio anterior a la decisión de self-hosting
- Ollama ya está instalado en el VPS
- Mayor control, sin costes variables, cumplimiento GDPR al no enviar datos a terceros

**Limitación identificada:** llama3.2:3b es suficiente para análisis de texto (inclusividad, discriminación), pero insuficiente para el agente conversacional. Se necesitará llama3.1:8b cuando se implemente el agente (issue #41).

### 3.4 Entidades de dominio faltantes

Las siguientes entidades existen en el negocio pero no en la base de datos:

| Entidad | Estado actual | Impacto |
|---|---|---|
| GameScore | Solo localStorage | Datos perdidos al recargar |
| AssessmentResult | JSON en Individual.assessment | Sin historial, sin queries |
| TherapySession | No modelada | Terapeutas sin funcionalidad core |
| Appeal | Parcial en Matching | Sin proceso completo |
| SkillTaxonomy | Array de strings libres | Sin normalización |
| AccommodationCatalog | Strings libres | Sin normalización |

### 3.5 Marco cognitivo de evaluaciones

**Decisión:** Definir el marco cognitivo nosotros, basado en literatura regulada y legal (DSM-5, ICD-11, NICE), documentado para auditorías.

**Mapa cognitivo de juegos (borrador inicial):**

| Juego | Dominio Cognitivo | Referencia Clínica |
|---|---|---|
| Memory Grid | Memoria de trabajo | DSM-5 criterio TDAH: déficit en memoria de trabajo |
| Pattern Matrix | Razonamiento espacial | ICD-11: perfil cognitivo TEA |
| Reaction Time | Velocidad de procesamiento / control de impulsos | DSM-5: impulsividad TDAH |
| Simon Says | Memoria secuencial | NICE: evaluación dislexia |
| Number Sequence | Reconocimiento de patrones numéricos | ICD-11: discalculia |
| Word Builder | Fluidez verbal | NICE: evaluación dislexia/disfasia |
| Shape Sorter | Clasificación visual | ICD-11: TEA perfil sensorial |
| Color Match | Atención sostenida | DSM-5: inatención TDAH |
| Path Finder | Planificación / función ejecutiva | DSM-5: función ejecutiva TDAH/TEA |
| Operación 2.0 | Precisión y destreza motora fina | ICD-11: TDC (trastorno del desarrollo de la coordinación) |

**Pendiente:** Issue #42 — investigación exhaustiva y documentación formal para auditorías.

---

## 4. Decisiones de Infraestructura

### 4.1 Migración Vercel → VPS

**Decisión:** Migrar la app de Vercel al VPS (Hostinger KVM 2, París).

**Motivación principal:** Ollama no es accesible desde Vercel (puerto vinculado a IP privada `100.90.124.78`). Sin migración, el LLM no funciona en producción.

**Recursos del VPS:**
- CPU: 2 cores (cuello de botella a largo plazo)
- RAM: 8 GB (4 GB asignados a Ollama)
- Disco: 79 GB libres de 100 GB
- Ancho de banda: 8 TB/mes
- OS: Ubuntu 24.04 + Dokploy
- Expira: 2028-03-23

**Ventajas:**
- PostgreSQL y Ollama en la misma red Docker → latencia 0
- Dokploy soporta Next.js nativamente
- Control total del entorno
- Sin costes variables de Vercel

**Riesgos:**
- Sin autoscaling (Vercel escala automáticamente)
- Sin CDN global (VPS en París → mayor latencia fuera de Europa)
- 2 CPUs limitados si ambos proyectos crecen simultáneamente

**Recomendación futura:** Upgradar a KVM 4 (4 cores, 16 GB RAM) cuando el agente entre en producción y el tráfico crezca.

### 4.2 Configuración de variables de entorno

**Variables definidas para Dokploy (VPS):**

```bash
DATABASE_URL="postgresql://[usuario]:[password]@diversia-db:5432/diversia_db"
NEXTAUTH_SECRET="[generado con openssl rand -base64 32]"
NEXTAUTH_URL="https://app.diversia.click"
OLLAMA_BASE_URL="http://diversia-ollama:11434"
NODE_ENV="production"
```

**Decisiones tomadas:**
- `DATABASE_URL` apunta a `diversia-db:5432` (nombre del servicio Docker interno), no a IP externa
- `OLLAMA_BASE_URL` apunta a `diversia-ollama:11434` (nombre del servicio Docker interno)
- `OPENAI_API_KEY` **eliminada** — vestigio anterior a la decisión de usar Ollama, sin uso actual
- `NEXTAUTH_SECRET` generado con `openssl rand -base64 32`

**Dominio:** `https://app.diversia.click`

### 4.3 Estado de la base de datos

**Confirmado:** Las 8 tablas del schema principal existen en `diversia_db`:
`User`, `Individual`, `Company`, `Therapist`, `Job`, `Connection`, `Matching`, `AuditLog`

Las migraciones de Prisma están aplicadas.

**Nota técnica:** El comando `psql ... -U <usuario>` falló en terminal por error de sintaxis bash (los corchetes `<>` son operadores de redirección de ficheros). No es un problema de la base de datos.

### 4.4 Ollama — Problema de binding de puerto

**Problema identificado:** En el compose, Ollama está vinculado a `100.90.124.78:11434` (IP privada, posiblemente Tailscale/WireGuard). Esto impide el acceso desde Vercel o desde fuera de la red privada.

**Solución:** Al migrar al VPS, la app accede a Ollama por red Docker interna (`diversia-ollama:11434`), resolviendo el problema sin exponer Ollama a internet.

---

## 5. Decisiones de UX

### 5.1 Flujo de registro con selector de rol

**Decisión:** El selector de rol (Candidato / Empresa / Terapeuta) es una **pantalla previa** al formulario de registro, no un campo dentro del formulario.

**Motivación:** Evitar confusión entre usuarios con necesidades muy diferentes. El terapeuta no necesita ver campos de juegos ni evaluaciones.

**Regla de navegación:** Máximo 2-3 clics para cualquier función principal. Si se puede reducir a 2 sin perder claridad, hacerlo.

**Flujo objetivo:**
```
Landing → [Pantalla selector de rol] → Formulario específico por rol → Dashboard específico por rol
```

### 5.2 Diseño responsivo con prioridad desktop

**Decisión:** La app es desktop-first pero debe ser completamente responsiva.

**Implicación:** Los componentes se diseñan para pantallas grandes primero, con breakpoints para móvil. Los juegos cognitivos requieren consideración especial en pantallas táctiles.

### 5.3 Onboarding gamificado (candidatos)

**Propuesta aprobada para implementar en P1 #5:**

```
Etapa 1: "Cuéntanos quién eres" (5 min)
→ Registro simple, guardado automático

Etapa 2: "Descubre tus superpoderes" (15 min, opcional)
→ 3-5 juegos seleccionados
→ Feedback inmediato: "Tienes memoria espacial excepcional"

Etapa 3: "¿Qué necesitas para brillar?" (5 min)
→ Quiz de acomodaciones (no diagnóstico clínico)

Etapa 4: "Aquí están tus matches" (inmediato)
→ Primeros matches basados en perfil parcial
→ Indicador de completitud del perfil
```

---

## 6. Estado de Seguridad

### Lo que existe (auditado en esta sesión)

| Área | Estado | Cobertura |
|---|---|---|
| Cifrado AES-256-GCM | Implementado | 17 tests pasando |
| Headers de seguridad | Implementado | CSP, HSTS, X-Frame-Options, etc. |
| Rate limiting | Implementado | 5 req/min auth, 30 escritura, 100 lectura |
| Sanitización XSS | Implementado | DOMPurify, 4 tests |
| Validación inputs | Implementado | Zod en todos los endpoints |
| Audit log GDPR | Implementado | 21 tests pasando |
| Middleware auth | Implementado | 8 tests de integración |

### Gaps identificados

| Gap | Severidad | Issue |
|---|---|---|
| Rate limiting en memoria (no escala en producción) | Media | #39 |
| Credenciales DB en texto plano en compose | Alta | #40 |
| Sin tests de penetración | Media | #36 |
| Error handling inconsistente (stack traces expuestos) | Alta | #27 |
| Sin tests de inyección SQL explícitos | Baja | #36 |

---

## 7. Backlog de Issues Creadas

### P0 — Bloqueantes

| # | Título |
|---|---|
| 1 | Fix: Registration flow end-to-end |
| 2 | Fix: Quiz loading bug (useLanguage race condition) |
| 3 | Fix: Job inclusivity score siempre 100 |
| 4 | Fix: Transacciones en operaciones compuestas |
| 40 | Security: Move Docker Compose credentials to Dokploy secrets |
| 32 | Config: Set up all required environment variables |

### P1 — Valor Core

| # | Título |
|---|---|
| 5 | Feature: Candidate Onboarding Journey |
| 6 | Feature: Persist game results to backend |
| 7 | Feature: Persist quiz results to backend |
| 8 | Feature: Job marketplace for candidates |
| 9 | Feature: Replace hardcoded dashboard data with real queries |
| 10 | Feature: Role-based navigation |
| 31 | Arch: Migrate app from Vercel to VPS (Dokploy) |
| 36 | Security: OWASP Top 10 full audit |
| 37 | Config: Replace OpenAI with Ollama as primary LLM |
| 38 | Config: Fix Ollama port binding for external access |

### P2 — Arquitectura y Calidad

| # | Título |
|---|---|
| 11 | Arch: Add missing domain entities (GameScore, AssessmentResult, TherapySession, Appeal) |
| 12 | Arch: Implement Use Case layer (CQRS-lite) |
| 13 | Arch: Rich Domain Models |
| 14 | Arch: Remove legacy storage.js |
| 15 | Test: E2E — registration flow for all roles |
| 16 | Test: E2E — candidate completes game, score saved to profile |
| 17 | Test: Increase unit test coverage to 80% |
| 18 | Seed: Rich seed data for matching algorithm |
| 33 | Feature: Role selector as first step of registration |
| 34 | Feature: Therapist-specific onboarding flow |
| 35 | Docs: Cognitive domain framework (DSM-5 / ICD-11 backed) |
| 39 | Security: Migrate rate limiting from in-memory to Redis |
| 41 | Arch: Upgrade Ollama model to llama3.1:8b for agent |
| 42 | Docs: Cognitive domain framework research and documentation |

### P3 — Features Secundarias

| # | Título |
|---|---|
| 19 | Feature: Therapist directory for candidates |
| 20 | Feature: Appeal process UI (EU AI Act) |
| 21 | Feature: Consent management dashboard |
| 22 | Feature: Hiring pipeline UI for companies |
| 23 | Feature: LLM discriminatory language detection |
| 24 | Feature: Normalize skills to structured taxonomy |
| 25 | Feature: Normalize accommodations to standard catalog |

### P4 — Deuda Técnica y Docs

| # | Título |
|---|---|
| 26 | Tech Debt: Remove ignoreBuildErrors: true from next.config |
| 27 | Tech Debt: Consistent error handling middleware |
| 28 | Docs: OpenAPI/Swagger documentation |
| 29 | Docs: Architecture Decision Records (ADRs) |
| 30 | Docs: Cognitive domain mapping |

---

## 8. Próximos Pasos (siguiente sesión)

**Primera tarea acordada:** Issue #1 — Fix registration flow end-to-end

**Orden de trabajo recomendado:**
1. #1 Fix registro (desbloquea todo el flujo de usuario)
2. #2 Fix quiz loading (desbloquea evaluaciones)
3. #33 Role selector en registro (UX correcto desde el inicio)
4. #6 y #7 Persistencia de juegos y quiz (conecta evaluaciones con el backend)
5. #5 Candidate Onboarding Journey (ensambla las piezas anteriores)

**Pendiente de investigación antes de implementar:**
- Issue #42: Marco cognitivo DSM-5/ICD-11 para documentar qué miden los juegos (necesario antes de implementar #6 para definir el schema de GameScore correctamente)

---

## 9. Etiquetas GitHub definidas

```
bug, enhancement, tech-debt, documentation, testing
p0, p1, p2, p3, p4
frontend, backend, database, architecture
auth, ux, ai/ml, gdpr, security, e2e, infrastructure
```
