# 🗺️ ROADMAP — DiversIA Eternals

**Fecha de inicio:** 10 de febrero de 2026
**Última actualización:** 10 de febrero de 2026
**Estado:** Fase de Consultoría Estratégica

---

## 📋 Índice

1. [Fase de Consultoría Actual](#fase-de-consultoría-actual)
2. [Preguntas Pendientes](#preguntas-pendientes)
3. [Decisiones Técnicas Tomadas](#decisiones-técnicas-tomadas)
4. [Plan de Migración](#plan-de-migración)
5. [Timeline Estimado](#timeline-estimado)

---

## 🎯 FASE DE CONSULTORÍA ACTUAL

### Sesión de Estrategia — 10 Feb 2026

**Objetivo:** Definir arquitectura objetivo, validar stack tecnológico y establecer framework de compliance antes de escalar.

---

## 🎯 FASE 1: MODELO DE NEGOCIO Y GO-TO-MARKET

### A. Monetización y Actores

**1. ¿Quién paga y cuánto?**
- [ ] ¿Las empresas pagan subscripción por publicar jobs + acceso a candidatos?
- [ ] ¿Los individuos acceden gratis o también pagan (freemium)?
- [ ] ¿Los terapeutas cobran por evaluación/sesión o tienen fee mensual?
- [ ] ¿Hay comisión por contratación exitosa (placement fee)?

**2. ¿Cuál es tu modelo de revenue principal?**
- [ ] SaaS (subscripción empresas)
- [ ] Marketplace (comisión por match/contratación)
- [ ] Mixto (subscripción + comisión)
- [ ] Freemium (básico gratis, premium de pago)

**3. ¿Quién es tu cliente principal (anchor customer)?**
- [ ] Empresas grandes (>500 empleados)
- [ ] Pymes (10-500 empleados)
- [ ] Startups/tech companies

**Estado:** ⏳ Pendiente de respuesta

---

## 🌍 FASE 2: COMPLIANCE Y GOBERNANZA DE DATOS

### B. Jurisdicciones y Regulaciones

**4. Lanzamiento España → Expansión LATAM: ¿Qué países priorizas?**
- [ ] México
- [ ] Argentina
- [ ] Colombia
- [ ] Chile
- [ ] Otros: ___________

**Impacto:** Define qué leyes específicas debemos cumplir (cada país tiene sus propias leyes de protección de datos)

**5. Datos sensibles que manejas:**

Según el código actual:
- ✅ Diagnósticos médicos (neurodivergencia)
- ✅ Datos biométricos (assessment cognitivo)
- ✅ Datos laborales
- ✅ Datos de salud mental

**Pregunta crítica:** ¿Necesitas almacenar diagnósticos médicos específicos (ej: "TDAH", "Autismo") o es suficiente con perfiles de fortalezas/accommodations sin diagnosis explícitos?

> 💡 **Recomendación consultora:** Si puedes evitar almacenar diagnósticos explícitos y trabajar solo con "perfiles de fortalezas + accommodations necesarios", reduces dramáticamente el riesgo legal y compliance burden.

**6. ¿Los terapeutas son empleados tuyos o terceros independientes?**
- [ ] Empleados → más responsabilidad legal sobre sus evaluaciones
- [ ] Independientes → necesitas términos de servicio + insurance claros

**Estado:** ⏳ Pendiente de respuesta

---

## 🏗️ FASE 3: ARQUITECTURA Y STACK

### C. Separación Core vs. Lógica de Negocio

**Arquitectura Propuesta:**

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js)                 │
│  - UI/UX components                                  │
│  - Client-side logic                                 │
└─────────────────────┬───────────────────────────────┘
                      │ REST/GraphQL API
┌─────────────────────▼───────────────────────────────┐
│               API GATEWAY (Next.js API)              │
│  - Authentication                                    │
│  - Rate limiting                                     │
│  - Input validation                                  │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│            BUSINESS LOGIC LAYER (Services)           │
│  - Domain logic (matching, consent, profiles)       │
│  - Business rules                                    │
│  - SEPARADO en paquetes/módulos independientes      │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│              DATA ACCESS LAYER (Prisma)              │
│  - PostgreSQL                                        │
│  - Encryption at rest                                │
└──────────────────────────────────────────────────────┘
```

**7. ¿Prevés necesitar múltiples frontends a futuro?**
- [ ] App móvil nativa (iOS/Android)
- [ ] Dashboard separado para admins/terapeutas
- [ ] Widget embebible para empresas

> **Si SÍ → Deberíamos separar el backend en un monorepo o microservicios desde YA**

**8. Stack actual — Evaluación:**

| Decisión Actual | Recomendación | Alternativa | Estado |
|----------------|---------------|-------------|--------|
| **Next.js 15** | 🟡 Revisar | Separar frontend (Next.js) + backend (NestJS/Fastify) | Pendiente |
| **PostgreSQL** | ✅ Correcto | (mantener) | ✅ Aprobado |
| **Prisma ORM** | ✅ Correcto | (mantener) | ✅ Aprobado |
| **NextAuth v5** | 🟡 Revisar | Auth0 / Clerk (compliance integrado) | Pendiente |
| **JSON File Storage** | ❌ ELIMINAR | PostgreSQL | 🔴 **Prioridad #1** |
| **Gemma 2B (self-hosted)** | ❌ Cambiar | Gemini API / Claude API | 🟡 Propuesto |

**9. ¿Cuál es tu capacidad de DevOps actual?**
- [ ] Solo tú (dev solo)
- [ ] Pequeño equipo (2-5 personas)
- [ ] Equipo grande (>5)

> **Si eres solo tú o equipo pequeño → Managed services > Self-hosting**
> Ejemplo: Auth0 > self-hosted auth, Gemini API > Ollama self-hosted

**Estado:** ⏳ Pendiente de respuesta

---

## 🔒 FASE 4: SEGURIDAD Y GOBERNANZA

### D. Threat Model y Attack Surface

**10. ¿Qué es lo MÁS crítico de proteger en tu negocio?**
(Ordena del 1 al 5, siendo 1 el más crítico)

- [ ] Datos médicos de individuos (diagnósticos, evaluaciones)
- [ ] Datos empresariales (estrategias de hiring, salarios)
- [ ] Propiedad intelectual (algoritmo de matching)
- [ ] Integridad de evaluaciones (evitar fraude en assessments)
- [ ] Privacidad de terapeutas (credenciales, licencias)

**11. ¿Necesitas certificaciones formales?**
- [ ] ISO 27001 (seguridad de información)
- [ ] SOC 2 Type II (confianza empresas grandes)
- [ ] HIPAA compliance (si operas en USA)
- [ ] Certificación ENS (España gobierno)

> 💡 Si quieres vender a grandes empresas en España → **ENS Alto** puede ser requerido

**12. Backup y Disaster Recovery:**
- [ ] RPO (Recovery Point Objective): ¿Tolerancia a pérdida de datos? (ej: "tolero perder máximo 1 hora")
- [ ] RTO (Recovery Time Objective): ¿Tiempo de recuperación? (ej: "sistema debe volver en <4 horas")

**Estado:** ⏳ Pendiente de respuesta

---

## 📊 FASE 5: ESCALABILIDAD Y ROADMAP

### E. Proyección de Crecimiento

**13. ¿Cuántos usuarios esperas en 12 meses?**
- Individuos: ___
- Empresas: ___
- Terapeutas: ___

**14. ¿Tienes inversión confirmada o estás buscando?**
Según la auditoría, existe un "Plan maestro pre-inversión ($400K BA)".

- [ ] Ya tienes los $400K
- [ ] Estás buscando inversión
- [ ] ¿Qué milestones debes alcanzar para cerrar esa ronda?

**Estado:** ⏳ Pendiente de respuesta

---

## 🎯 PRÓXIMOS PASOS

Una vez respondidas las preguntas, diseñaremos:

### 1. **Arquitectura Objetivo** (separación clara core/negocio)
- Definir boundaries entre capas
- Decidir monolito vs. microservicios
- Plan de separación frontend/backend

### 2. **Stack Definitivo** (qué mantener, qué cambiar)
- Validar Next.js vs. backend separado
- Decidir estrategia de autenticación (NextAuth vs. Auth0/Clerk)
- Migrar LLM (Gemma 2B → Gemini API)

### 3. **Plan de Migración** (priorizado por riesgo/impacto)

#### Sprint 1: Fundaciones Críticas (1 semana)
- [ ] Migración JSON → PostgreSQL (Prisma)
- [ ] Migración .js → .ts (progresiva, empezar por app/lib/)
- [ ] Setup CI/CD básico (GitHub Actions)

#### Sprint 2: Separación de Capas (2 semanas)
- [ ] Extraer business logic a service layer independiente
- [ ] Crear data access layer (repositorios Prisma)
- [ ] Refactor API routes para usar services

#### Sprint 3: LLM Integration (1 semana)
- [ ] Migrar de Gemma 2B → Gemini API
- [ ] Implementar prompts para evaluación de candidatos
- [ ] Agregar AI explanations al matching

#### Sprint 4: Seguridad y Compliance (2 semanas)
- [ ] Audit completo de seguridad (OWASP Top 10)
- [ ] Implementar data retention policies (GDPR)
- [ ] Agregar audit logs completos
- [ ] Documentar flujos de consentimiento

### 4. **Compliance Framework** (GDPR + leyes LATAM específicas)
- Mapear requisitos por jurisdicción
- Implementar data localization si es necesario
- Crear términos de servicio y privacy policy

### 5. **Roadmap de Seguridad** (certificaciones, auditorías)
- Penetration testing
- Vulnerability scanning automatizado
- Plan de certificación (ISO 27001 / SOC 2)

---

## 📅 Timeline Estimado

**Fase 1: Fundaciones (Mes 1-2)**
- Migración PostgreSQL
- TypeScript migration
- Separación de capas

**Fase 2: Compliance (Mes 2-3)**
- GDPR compliance completo
- Leyes LATAM específicas
- Audit logs y data governance

**Fase 3: Escalabilidad (Mes 3-4)**
- Optimización de queries
- Caching strategy
- Load testing

**Fase 4: Go-to-Market (Mes 4-6)**
- Beta con empresas piloto
- Onboarding de terapeutas
- Marketing y fundraising

---

## 📝 Notas de Sesión

### Sesión 1 — 10 Feb 2026

**Trabajos realizados:**
- ✅ Auditoría completa del proyecto
- ✅ Limpieza de 76 archivos temporales
- ✅ Corrección de errores de build (exports faltantes, params await)
- ✅ Build exitoso verificado

**Decisiones técnicas:**
- Mantener PostgreSQL + Prisma
- Migración JSON → PostgreSQL es prioridad #1
- TypeScript migration progresiva (archivo por archivo)
- Evaluar migración Gemma 2B → Gemini API

**Preguntas abiertas para próxima sesión:**
- Modelo de monetización específico
- Países LATAM a priorizar
- Nivel de almacenamiento de datos médicos
- Capacidad DevOps del equipo
- Proyección de usuarios 12 meses
- Estado de inversión ($400K)

---

## 🔗 Referencias

- [AUDITORIA_PROYECTO_2026-02-10.md](docs/AUDITORIA_PROYECTO_2026-02-10.md) - Auditoría completa del estado actual
- [DOCUMENTACION_PROYECTO.md](DOCUMENTACION_PROYECTO.md) - Documentación técnica
- [SECURITY_IMPLEMENTATION.md](SECURITY_IMPLEMENTATION.md) - Sistema de seguridad
- [prisma/schema.prisma](prisma/schema.prisma) - Schema de base de datos

---

**Próxima sesión:** Responder preguntas de las 5 fases y definir arquitectura objetivo
