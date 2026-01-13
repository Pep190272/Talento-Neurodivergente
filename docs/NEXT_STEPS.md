# Próximos Pasos - Integración UI con Backend

**Estado actual:** Backend core implementado (v0.4.0) - Arquitectura JSON file-based
**Objetivo:** Integrar módulos backend con la UI existente
**Tiempo estimado:** 1-2 semanas
**Prioridad:** ALTA - Para tener MVP funcional completo

---

## 📋 Roadmap de Integración

### Sprint 1: API Routes & Auth (3-5 días)

#### 1.1 Implementar Next.js API Routes
**Ubicación:** `app/api/`
**Módulos a exponer:**

```
app/api/
├── individuals/
│   ├── route.js              # POST /api/individuals (create)
│   └── [userId]/
│       ├── route.js          # GET, PATCH /api/individuals/:userId
│       └── privacy/route.js  # PATCH /api/individuals/:userId/privacy
├── companies/
│   ├── route.js              # POST /api/companies
│   └── [companyId]/
│       ├── route.js          # GET, PATCH /api/companies/:companyId
│       └── jobs/
│           ├── route.js      # POST /api/companies/:companyId/jobs
│           └── [jobId]/route.js  # GET, PATCH, DELETE
├── matching/
│   ├── jobs/[jobId]/route.js    # GET /api/matching/jobs/:jobId
│   └── candidates/[userId]/route.js  # GET /api/matching/candidates/:userId
├── consent/
│   ├── accept/route.js       # POST /api/consent/accept
│   ├── reject/route.js       # POST /api/consent/reject
│   └── revoke/route.js       # POST /api/consent/revoke
├── dashboards/
│   ├── individual/[userId]/route.js
│   ├── company/[companyId]/route.js
│   └── therapist/[therapistId]/route.js
└── auth/
    └── [...nextauth]/route.js  # NextAuth.js configuration
```

**Ejemplo de implementación:**

```javascript
// app/api/individuals/route.js
import { createIndividualProfile } from '@/lib/individuals'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const data = await request.json()
    const profile = await createIndividualProfile(data)
    return NextResponse.json(profile, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}
```

**Tareas:**
- [ ] Crear estructura de carpetas `app/api/`
- [ ] Implementar endpoints para individuals (CRUD)
- [ ] Implementar endpoints para companies (CRUD)
- [ ] Implementar endpoints para jobs (CRUD)
- [ ] Implementar endpoints para matching (read-only)
- [ ] Implementar endpoints para consent (accept/reject/revoke)
- [ ] Implementar endpoints para dashboards (read-only)
- [ ] Agregar validación de inputs con Zod
- [ ] Agregar manejo de errores consistente
- [ ] Documentar API con comentarios JSDoc

**Testing:**
- [ ] Crear tests de integración para cada endpoint
- [ ] Probar con curl o Postman
- [ ] Verificar manejo de errores

---

#### 1.2 Implementar Autenticación con NextAuth.js
**Librería:** NextAuth.js v5 (Auth.js)
**Providers:** Email Magic Link + Google OAuth (opcional)

**Instalación:**
```bash
npm install next-auth@beta @auth/core
```

**Configuración:**

```javascript
// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth"
import EmailProvider from "next-auth/providers/email"
import { findUserByEmail } from '@/lib/storage'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Verificar si usuario existe en nuestro sistema
      const existingUser = await findUserByEmail(user.email)
      return !!existingUser
    },
    async session({ session, token }) {
      // Agregar información del usuario a la sesión
      const user = await findUserByEmail(session.user.email)
      session.user.userId = user.userId
      session.user.userType = user.userType
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
  }
})

export { handlers as GET, handlers as POST }
```

**Variables de entorno (.env.local):**
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generated-secret-here
EMAIL_SERVER=smtp://user:pass@smtp.sendgrid.net:587
EMAIL_FROM=noreply@diversia.click
```

**Tareas:**
- [ ] Instalar NextAuth.js
- [ ] Configurar Email provider (Resend o SendGrid)
- [ ] Crear páginas de auth (/auth/login, /auth/verify, /auth/error)
- [ ] Configurar callbacks para integrar con nuestro storage
- [ ] Implementar middleware para proteger rutas
- [ ] Crear hooks personalizados (useSession, useUser)
- [ ] Probar flujo completo de login/logout

**Testing:**
- [ ] Probar registro con email magic link
- [ ] Probar login de usuario existente
- [ ] Verificar protección de rutas privadas
- [ ] Probar logout y limpieza de sesión

---

### Sprint 2: Páginas de Dashboard (4-6 días)

#### 2.1 Dashboard Individual (Candidato)
**Ubicación:** `app/dashboard/individual/page.jsx`

**Componentes a crear:**
```
app/dashboard/individual/
├── page.jsx                    # Layout principal
├── components/
│   ├── ProfileCompletion.jsx   # Card con % de completitud
│   ├── MatchesList.jsx         # Lista de matches pendientes
│   ├── ActiveConnections.jsx   # Conexiones activas con empresas
│   ├── PrivacySettings.jsx     # Panel de configuración privacidad
│   └── AuditLog.jsx           # Historial de accesos (GDPR)
└── layout.jsx                  # Layout compartido con sidebar
```

**Funcionalidades clave:**
- ✅ Mostrar profile completion con breakdown
- ✅ Lista de matches pendientes ordenados por score
- ✅ Aceptar/rechazar matches con modal de preview de privacidad
- ✅ Ver conexiones activas y pipeline stage
- ✅ Revocar consentimiento con confirmación
- ✅ Configurar privacidad por defecto
- ✅ Ver audit log (quién accedió a mis datos)

**Ejemplo de componente:**

```jsx
// app/dashboard/individual/components/MatchesList.jsx
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export default function MatchesList() {
  const { data: session } = useSession()
  const [matches, setMatches] = useState([])

  useEffect(() => {
    fetch(`/api/matching/candidates/${session.user.userId}`)
      .then(res => res.json())
      .then(data => setMatches(data.pending))
  }, [session])

  const handleAccept = async (matchId) => {
    const response = await fetch('/api/consent/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, userId: session.user.userId })
    })

    if (response.ok) {
      // Actualizar lista
      setMatches(prev => prev.filter(m => m.matchId !== matchId))
    }
  }

  return (
    <div className="matches-list">
      <h2>Nuevos Matches ({matches.length})</h2>
      {matches.map(match => (
        <MatchCard
          key={match.matchId}
          match={match}
          onAccept={handleAccept}
        />
      ))}
    </div>
  )
}
```

**Tareas:**
- [ ] Crear layout del dashboard con sidebar
- [ ] Implementar ProfileCompletion component
- [ ] Implementar MatchesList component
- [ ] Implementar modal de privacy preview
- [ ] Implementar ActiveConnections component
- [ ] Implementar PrivacySettings component
- [ ] Implementar AuditLog component
- [ ] Agregar loading states y error handling
- [ ] Aplicar estilos light theme consistentes

---

#### 2.2 Dashboard Company (Empresa)
**Ubicación:** `app/dashboard/company/page.jsx`

**Componentes a crear:**
```
app/dashboard/company/
├── page.jsx
├── components/
│   ├── JobsList.jsx            # Lista de vacantes
│   ├── PipelineBoard.jsx       # Kanban board por job
│   ├── CandidateCard.jsx       # Card de candidato con datos
│   ├── JobForm.jsx            # Crear/editar vacante
│   └── InclusivityScore.jsx   # Score de inclusividad
└── jobs/[jobId]/
    └── page.jsx                # Detalle de job con pipeline
```

**Funcionalidades clave:**
- ✅ Lista de jobs abiertos/cerrados
- ✅ Crear nueva vacante con análisis de inclusividad
- ✅ Ver pipeline de candidatos por job
- ✅ Mover candidatos entre stages (drag & drop o dropdown)
- ✅ Ver datos de candidatos respetando permisos
- ✅ Solicitar datos adicionales (con consent request)
- ✅ Cerrar vacante

**Tareas:**
- [ ] Crear layout dashboard empresa
- [ ] Implementar JobsList component
- [ ] Implementar JobForm con validación
- [ ] Implementar análisis de inclusividad en tiempo real
- [ ] Implementar PipelineBoard (Kanban o lista)
- [ ] Implementar CandidateCard con datos permitidos
- [ ] Agregar funcionalidad de mover candidatos
- [ ] Implementar modal de solicitud de datos adicionales
- [ ] Aplicar estilos consistentes

---

#### 2.3 Dashboard Therapist (Terapeuta)
**Ubicación:** `app/dashboard/therapist/page.jsx`

**Componentes a crear:**
```
app/dashboard/therapist/
├── page.jsx
├── components/
│   ├── ClientsList.jsx         # Lista de clientes
│   ├── ClientProgress.jsx      # Progreso de cliente
│   ├── MetricsOverview.jsx     # Métricas agregadas
│   └── SessionLog.jsx         # Log de sesiones
└── clients/[clientId]/
    └── page.jsx                # Detalle de cliente
```

**Funcionalidades clave:**
- ✅ Lista de clientes con consentimiento
- ✅ Ver progreso de matching de clientes
- ✅ Métricas agregadas (completion rate, matches, etc.)
- ✅ Log de sesiones
- ✅ Acceso a datos con audit logging

**Tareas:**
- [ ] Crear layout dashboard terapeuta
- [ ] Implementar ClientsList component
- [ ] Implementar ClientProgress component
- [ ] Implementar MetricsOverview component
- [ ] Implementar SessionLog component
- [ ] Agregar funcionalidad de agregar notas privadas
- [ ] Aplicar estilos consistentes

---

### Sprint 3: Páginas de Registro & Onboarding (3-4 días)

#### 3.1 Registro de Individual
**Ubicación:** `app/register/individual/page.jsx`

**Flujo multi-step:**
```
Step 1: Email + Nombre
Step 2: Diagnósticos + Acomodaciones (opcional)
Step 3: Skills + Experiencia
Step 4: Configuración de Privacidad
Step 5: Assessment (redirect)
```

**Tareas:**
- [ ] Crear wizard multi-step con react-hook-form
- [ ] Implementar validación con Zod
- [ ] Integrar con API POST /api/individuals
- [ ] Agregar OpenAI suggestions en real-time (opcional)
- [ ] Implementar auto-save (draft)
- [ ] Aplicar light theme styles
- [ ] Agregar progress indicator

---

#### 3.2 Registro de Company
**Ubicación:** `app/register/company/page.jsx`

**Flujo:**
```
Step 1: Información de empresa
Step 2: Primera vacante (con análisis de inclusividad)
Step 3: Confirmación
```

**Tareas:**
- [ ] Crear wizard de registro
- [ ] Implementar análisis de inclusividad en tiempo real
- [ ] Integrar con API POST /api/companies
- [ ] Mostrar sugerencias de mejora
- [ ] Aplicar light theme styles

---

### Sprint 4: Features Avanzadas (3-4 días)

#### 4.1 Matching Algorithm Integration
**Tareas:**
- [ ] Crear cron job o API endpoint para trigger matching
- [ ] Implementar notificaciones de nuevos matches
- [ ] Agregar recalculation cuando perfil se actualiza
- [ ] Implementar expiración automática de matches

#### 4.2 Audit Log UI
**Tareas:**
- [ ] Crear página de audit log para usuario
- [ ] Implementar filtros (por fecha, por tipo de dato)
- [ ] Agregar export CSV/JSON (GDPR data portability)
- [ ] Mostrar nombres amigables de empresas/terapeutas

#### 4.3 GDPR Compliance Features
**Tareas:**
- [ ] Implementar "Download my data" button
- [ ] Implementar "Delete my account" flow
- [ ] Agregar consent checkboxes en todos los formularios
- [ ] Crear página de Privacy Policy
- [ ] Crear página de Terms of Service

---

### Sprint 5: Testing & Refinamiento (2-3 días)

#### 5.1 Testing E2E
**Tareas:**
- [ ] Instalar Playwright o Cypress
- [ ] Crear tests E2E para flujos principales:
  - [ ] Registro de candidato
  - [ ] Registro de empresa + crear job
  - [ ] Matching y aceptación de match
  - [ ] Revocación de consentimiento
- [ ] Probar en diferentes navegadores

#### 5.2 Performance & UX
**Tareas:**
- [ ] Agregar loading skeletons
- [ ] Optimizar consultas repetidas con cache
- [ ] Implementar optimistic updates
- [ ] Agregar toast notifications
- [ ] Mejorar responsive design
- [ ] Accessibility audit (a11y)

#### 5.3 Documentation
**Tareas:**
- [ ] Documentar API endpoints (Swagger/OpenAPI)
- [ ] Crear guía de desarrollo para nuevos devs
- [ ] Documentar data models
- [ ] Crear changelog

---

## 🛠️ Stack Tecnológico Confirmado

### Frontend
- ✅ **Framework:** Next.js 15.3.8 (App Router + Turbopack)
- ✅ **React:** 19.0.0
- 🔜 **Auth:** NextAuth.js v5 (Auth.js)
- 🔜 **Forms:** React Hook Form + Zod
- 🔜 **State:** React Context + SWR (para cache)
- ✅ **Styling:** CSS Modules (light theme ya implementado)

### Backend
- ✅ **Runtime:** Node.js (Next.js API Routes)
- ✅ **Storage:** JSON files + fs/promises
- ✅ **Validation:** Custom (ya implementado en módulos)
- 🔜 **Email:** Resend o SendGrid (para magic links)

### Testing
- ✅ **Unit:** Vitest + Testing Library
- 🔜 **E2E:** Playwright o Cypress
- 🔜 **API:** Supertest o fetch tests

### DevOps
- ✅ **Hosting:** Vercel (frontend + API routes)
- 🔜 **Backups:** S3 o Backblaze (rsync diario)
- 🔜 **Monitoring:** Vercel Analytics + Sentry (opcional)
- 🔜 **CI/CD:** GitHub Actions (tests + deploy)

---

## 📊 Métricas de Éxito

### Técnicas
- [ ] 100% de endpoints API implementados y documentados
- [ ] >80% de cobertura de tests en módulos críticos
- [ ] <2s tiempo de carga de dashboards
- [ ] Lighthouse score >90 (Performance, Accessibility)

### Producto
- [ ] Usuario puede registrarse y completar perfil en <5 minutos
- [ ] Matching funciona automáticamente al completar assessment
- [ ] Empresa puede crear job y recibir matches en <3 clicks
- [ ] Usuario puede revocar consentimiento en <2 clicks
- [ ] Audit log visible y descargable (GDPR)

---

## 🚨 Riesgos & Mitigaciones

### Riesgo 1: Escalabilidad del File Storage
**Impacto:** Performance degrada con >500 usuarios
**Mitigación:**
- Implementar índices en memoria (Map de userId → file path)
- Agregar cache con SWR o React Query
- Monitorear tamaño de data/ directory
- Plan de migración a SQLite cuando se alcance límite

### Riesgo 2: Concurrencia en Escrituras
**Impacto:** Race conditions con múltiples writes simultáneos
**Mitigación:**
- Ya implementado: atomic writes (temp + rename)
- Considerar locks a nivel de archivo si es necesario
- Limitar concurrencia con rate limiting

### Riesgo 3: Backup & Disaster Recovery
**Impacto:** Pérdida de datos sin backups
**Mitigación:**
- Implementar backup diario a S3/Backblaze
- Versionar archivos JSON con timestamps
- Probar restore process

---

## 🎯 Priorización Recomendada

### Semana 1: Foundation (CRÍTICO)
1. ✅ API Routes básicas (individuals, companies)
2. ✅ NextAuth.js setup
3. ✅ Dashboard Individual básico
4. ✅ Registro Individual

### Semana 2: Core Features (ALTA)
5. ✅ Dashboard Company
6. ✅ Matching integration
7. ✅ Consent flows (accept/reject/revoke)
8. ✅ Registro Company

### Semana 3: Polish & Launch (MEDIA)
9. ✅ Audit Log UI
10. ✅ GDPR features
11. ✅ Testing E2E
12. ✅ Performance optimization

---

## 📝 Notas Técnicas

### Next.js API Routes Best Practices
- Usar `NextResponse` para respuestas consistentes
- Implementar error handling con try/catch
- Validar inputs con Zod antes de llamar módulos
- Agregar rate limiting con `@upstash/ratelimit` (opcional)
- Logging con `pino` o similar

### Security Considerations
- ✅ Validar permisos en cada endpoint
- ✅ Sanitizar inputs (ya implementado en utils)
- ✅ Proteger rutas con NextAuth middleware
- 🔜 Implementar CORS headers correctos
- 🔜 Agregar CSRF protection
- 🔜 Rate limiting para prevenir abuse

### Performance Optimizations
- Usar `revalidate` en fetch calls para cache
- Implementar pagination en listas largas
- Lazy load de componentes pesados
- Optimizar bundle size con dynamic imports
- Comprimir responses con gzip/brotli

---

## 🎉 Conclusión

**Tiempo total estimado:** 2-3 semanas
**Esfuerzo:** 1 desarrollador full-time

**Al completar estos pasos tendremos:**
- ✅ MVP funcional completo del marketplace
- ✅ UI integrada con backend
- ✅ Auth funcional
- ✅ GDPR compliance
- ✅ Tests E2E
- ✅ Listo para usuarios reales

**Siguiente acción inmediata:** Empezar con Sprint 1.1 - Crear estructura de API routes

---

**Creado:** 2026-01-13
**Versión:** v0.4.0
**Próxima revisión:** Después de Sprint 1
