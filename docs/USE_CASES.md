# Casos de Uso - Diversia Eternals Marketplace

**CORE BUSINESS:** Marketplace de talento neurodivergente (Matching-first platform)

**Principios Arquitectónicos:**
- Privacy-first: todas las conexiones requieren consentimiento explícito
- Dashboard con métricas para cada actor (Individual, Empresa, Terapeuta)
- Terapeutas apoyan AMBOS lados: candidatos + empresas
- Data ownership: usuarios controlan quién ve qué

---

## 🎯 ACTORES DEL SISTEMA

### 1. **Individual Neurodivergente (Candidato)**
- Busca oportunidades laborales inclusivas
- Necesita assessment de fortalezas/preferencias
- Requiere privacidad en datos sensibles (diagnósticos)
- Control sobre qué empresas ven su perfil

### 2. **Empresa (HR Manager / Reclutador)**
- Busca talento neurodivergente para roles específicos
- Necesita matching basado en skills + acomodaciones
- Requiere métricas de pipeline de contratación
- Puede solicitar soporte de terapeutas para onboarding

### 3. **Terapeuta / Especialista**
- Acompaña individuos (desarrollo personal/profesional)
- Asesora empresas (cultura inclusiva, onboarding)
- Accede a métricas agregadas (nunca datos individuales sin consentimiento)
- Puede recomendar candidatos (con consentimiento)

---

## 🔥 CASOS DE USO - MUST (Core MVP)

### **UC-001: Registro y Perfil de Candidato**

**Actor:** Individual Neurodivergente
**Prioridad:** MUST
**Objetivo:** Crear perfil completo con datos privados controlados

**Precondiciones:**
- Usuario no registrado
- OpenAI API disponible

**Flujo Principal:**
1. Usuario accede a `/forms` → tab "Individual"
2. Completa formulario:
   - Datos personales (nombre, email, ubicación)
   - Diagnósticos (opcional, marcado como "privado" por defecto)
   - Experiencia laboral
   - Preferencias de trabajo (remoto, horarios flexibles, etc.)
   - Acomodaciones necesarias
3. OpenAI valida y normaliza datos (detecta inconsistencias)
4. Usuario define **privacy settings**:
   - ¿Qué pueden ver empresas? (nombre real vs anónimo)
   - ¿Compartir diagnósticos? (sí/no/solo con consentimiento)
   - ¿Visible en búsquedas públicas? (sí/no)
5. Sistema genera `userId` único
6. Guarda en `data/users/individuals/{userId}.json`
7. Redirige a `/dashboard/individual`

**Postcondiciones:**
- Perfil creado con privacy settings aplicados
- Usuario puede ver dashboard vacío (sin matches aún)
- NeuroAgent da bienvenida personalizada

**Flujos Alternativos:**
- **FA-1:** Usuario abandona form → guardar draft en localStorage
- **FA-2:** Email ya existe → ofrecer login o recuperación
- **FA-3:** OpenAI falla validación → permitir guardar sin validar, marcar para review

**Edge Cases:**
- Usuario ingresa diagnóstico no estándar → OpenAI sugiere alternativas reconocidas
- Usuario niega todos permisos de compartir → marcar como "low visibility", impacta matching
- Datos sensibles en campos públicos → OpenAI alerta y sugiere mover a privado

**Criterios de Aceptación:**
```javascript
// Test: debería crear perfil con privacy settings
expect(user.profile.privacy.showRealName).toBe(false) // default
expect(user.profile.privacy.shareDiagnosis).toBe(false) // default
expect(user.profile.status).toBe('active')
```

---

### **UC-002: Assessment Inicial (Quiz + Fortalezas)**

**Actor:** Individual Neurodivergente
**Prioridad:** MUST
**Objetivo:** Completar evaluación de fortalezas cognitivas para mejorar matching

**Precondiciones:**
- Usuario registrado (UC-001)
- Quiz disponible en `/quiz`

**Flujo Principal:**
1. Usuario accede a `/quiz` desde dashboard
2. Sistema carga quiz adaptativo (15 preguntas)
3. Usuario responde preguntas (multiple choice, sliders, drag-drop)
4. OpenAI ajusta dificultad en tiempo real según respuestas
5. Usuario completa quiz (≥90% respondidas)
6. Sistema calcula **profile score**:
   - Fortalezas identificadas (ej: atención al detalle, pensamiento sistémico)
   - Preferencias de trabajo (individual vs equipo)
   - Nivel de habilidades técnicas
7. Genera reporte PDF descargable
8. Actualiza `users/individuals/{userId}.json` con `assessmentData`
9. Dashboard muestra nuevo badge "Assessment Complete"

**Postcondiciones:**
- Assessment guardado en perfil
- Matching algorithm puede usar datos para scoring
- Usuario puede descargar PDF

**Flujos Alternativos:**
- **FA-1:** Usuario pausa (<90%) → guardar progreso, permitir reanudar en 7 días
- **FA-2:** Usuario completa muy rápido (<5 min) → marcar "low confidence", sugerir repetir
- **FA-3:** OpenAI lento → mostrar loading, timeout 30s, continuar sin adaptación

**Edge Cases:**
- Respuestas todas idénticas (bot/spam) → invalidar, pedir repetir
- Usuario repite quiz → comparar resultados, alertar si discrepancia >40%
- Red falla durante quiz → guardar respuestas localmente, sincronizar después

**Criterios de Aceptación:**
```javascript
// Test: debería completar assessment y calcular fortalezas
expect(assessment.completed).toBe(true)
expect(assessment.strengths).toHaveLength(3) // al menos 3
expect(assessment.confidenceScore).toBeGreaterThan(70)
expect(user.profile.assessmentCompleted).toBe(true)
```

---

### **UC-003: Registro de Empresa y Definición de Vacante**

**Actor:** Empresa (HR Manager)
**Prioridad:** MUST
**Objetivo:** Registrar empresa y crear vacante para buscar talento neurodivergente

**Precondiciones:**
- Usuario no registrado como empresa
- OpenAI API disponible

**Flujo Principal:**
1. Usuario accede a `/forms` → tab "Company"
2. Completa formulario:
   - Datos de empresa (nombre, industria, tamaño)
   - Contacto (email, teléfono)
   - **Vacante:**
     - Título del puesto
     - Descripción detallada
     - Skills requeridos
     - Acomodaciones disponibles (horarios flexibles, remoto, etc.)
     - Rango salarial (opcional)
3. OpenAI valida y analiza:
   - Detecta lenguaje discriminatorio → sugiere reformular
   - Identifica skills técnicas vs blandas
   - Sugiere acomodaciones adicionales comunes
4. Usuario define **visibility settings**:
   - ¿Publicar vacante públicamente? (sí/no)
   - ¿Permitir aplicaciones directas? (sí/no/solo matches)
5. Sistema genera `companyId` y `jobId` únicos
6. Guarda en `data/users/companies/{companyId}.json`
7. Guarda vacante en `data/jobs/{jobId}.json` con status "active"
8. Redirige a `/dashboard/company`

**Postcondiciones:**
- Empresa registrada
- Vacante activa y visible para matching
- Dashboard muestra "0 matches" (aún no calculado)

**Flujos Alternativos:**
- **FA-1:** Empresa ya existe → cargar datos, crear nueva vacante
- **FA-2:** Lenguaje discriminatorio detectado → bloquear submit, pedir corrección
- **FA-3:** OpenAI falla → guardar vacante sin análisis, marcar para review manual

**Edge Cases:**
- Skills muy genéricos ("comunicación") → OpenAI pide especificar
- Sin acomodaciones → NeuroAgent alerta baja compatibilidad, sugiere añadir
- Vacante duplicada → detectar por título+skills similares, alertar

**Criterios de Aceptación:**
```javascript
// Test: debería crear vacante con análisis de inclusividad
expect(job.status).toBe('active')
expect(job.inclusivityScore).toBeGreaterThan(60) // mínimo aceptable
expect(job.accommodations).toHaveLength.greaterThan(0)
expect(company.jobs).toContain(jobId)
```

---

### **UC-004: Matching Algorítmico (AI-Powered)**

**Actor:** Sistema (background process)
**Prioridad:** MUST
**Objetivo:** Calcular compatibilidad entre candidatos y vacantes

**Precondiciones:**
- Al menos 1 candidato con assessment completo (UC-002)
- Al menos 1 vacante activa (UC-003)
- OpenAI API disponible

**Flujo Principal:**
1. Trigger: nueva vacante creada O nuevo assessment completado
2. Sistema carga:
   - Candidatos con assessment + privacy.visibleInSearch = true
   - Vacantes activas con matching enabled
3. Para cada par (candidato, vacante):
   - OpenAI calcula **match score** (0-100):
     - Skills match (40%): técnicas + blandas
     - Acomodaciones fit (30%): candidato needs vs empresa offers
     - Preferencias trabajo (20%): remoto, horarios, cultura
     - Ubicación (10%): si aplica
4. Genera `matchId` para scores >60
5. Guarda en `data/matches/{matchId}.json`:
   ```json
   {
     "matchId": "match_123",
     "candidateId": "user_456",
     "jobId": "job_789",
     "score": 85,
     "scoreBreakdown": {
       "skills": 90,
       "accommodations": 80,
       "preferences": 85,
       "location": 100
     },
     "aiJustification": "Strong match: candidate's attention to detail...",
     "status": "pending", // pending → accepted → rejected
     "createdAt": "2024-01-10T10:00:00Z"
   }
   ```
6. Sistema NO notifica aún (match pending consentimiento)

**Postcondiciones:**
- Matches guardados con status "pending"
- Candidatos ven matches en dashboard (requieren aceptar)
- Empresas NO ven candidatos hasta consentimiento

**Flujos Alternativos:**
- **FA-1:** Sin candidatos elegibles → empresa ve "0 matches", sugerir ajustar requisitos
- **FA-2:** OpenAI falla → usar matching básico (keywords), marcar para recalcular
- **FA-3:** Match score <60 → no crear match, logging para analytics

**Edge Cases:**
- Candidato actualizó perfil → recalcular todos matches activos
- Vacante cerrada → marcar matches como "expired"
- Candidato desactivó cuenta → invalidar matches, notificar empresas

**Criterios de Aceptación:**
```javascript
// Test: debería calcular match con score y justificación
expect(match.score).toBeGreaterThanOrEqual(60)
expect(match.scoreBreakdown.skills).toBeDefined()
expect(match.aiJustification).toHaveLength.greaterThan(50)
expect(match.status).toBe('pending')
expect(candidate.privacy.shareDiagnosis).toBe(false) // no compartido aún
```

---

### **UC-005: Consentimiento de Match (Privacy-First)**

**Actor:** Individual Neurodivergente
**Prioridad:** MUST
**Objetivo:** Revisar match sugerido y dar consentimiento para compartir perfil

**Precondiciones:**
- Match calculado (UC-004) con status "pending"
- Candidato logueado

**Flujo Principal:**
1. Usuario ve notification en dashboard: "New Match: Software Engineer @ TechCorp"
2. Usuario abre match details:
   - Job title, descripción, acomodaciones
   - Match score + justificación AI
   - **Privacy preview:** qué verá la empresa si acepta
3. Usuario puede:
   - **Aceptar:** comparte perfil según privacy settings
   - **Rechazar:** match marcado "rejected", no visible para empresa
   - **Customizar:** ajustar qué compartir para ESTE match específico
     - Ejemplo: compartir diagnóstico solo con esta empresa
4. Si acepta:
   - Match status → "accepted"
   - Sistema crea `connection` en `data/connections/{connectionId}.json`
   - Empresa recibe notificación: "New Candidate Match"
   - Candidato puede enviar mensaje inicial (opcional)
5. Dashboard actualiza: "Active Matches: 1"

**Postcondiciones:**
- Conexión establecida con consentimiento documentado
- Empresa puede ver perfil según permisos
- Candidato puede revocar consentimiento después

**Flujos Alternativos:**
- **FA-1:** Usuario customiza permisos → guardar `customPrivacy` para esta conexión
- **FA-2:** Usuario rechaza → match archivado, empresa no sabe que existió
- **FA-3:** Usuario ignora 7 días → auto-expirar match, liberar slot

**Edge Cases:**
- Usuario acepta pero vacante ya cerrada → notificar "position filled"
- Usuario revoca consentimiento después → desconectar, notificar empresa
- Empresa solicita más datos → sistema pide consentimiento adicional

**Criterios de Aceptación:**
```javascript
// Test: debería crear conexión consentida con permisos claros
expect(match.status).toBe('accepted')
expect(connection.consentGivenAt).toBeDefined()
expect(connection.sharedData).toContain('name')
expect(connection.sharedData).not.toContain('diagnosis') // si privacy = false
expect(company.canViewCandidate(candidateId)).toBe(true)
```

---

### **UC-006: Dashboard Individual con Métricas**

**Actor:** Individual Neurodivergente
**Prioridad:** MUST
**Objetivo:** Ver progreso, matches activos, y métricas personales

**Precondiciones:**
- Usuario registrado y logueado

**Flujo Principal:**
1. Usuario accede a `/dashboard/individual`
2. Sistema carga y muestra:
   - **Profile Completion:** barra de progreso (0-100%)
     - Assessment: 40%
     - Experiencia laboral: 30%
     - Preferencias: 20%
     - Skills adicionales: 10%
   - **Active Matches:** lista de matches pendientes/aceptados
     - Score, empresa, fecha
   - **Pending Actions:**
     - "Complete assessment" (si no hecho)
     - "Review 2 new matches"
     - "Update skills" (si >90 días sin actualizar)
   - **Privacy Controls:**
     - Toggle visibilidad perfil
     - Ver qué empresas tienen acceso
     - Revocar consentimientos
   - **Métricas:**
     - Total matches recibidos
     - Matches aceptados/rechazados
     - Profile views (si consentimiento dado)
     - Assessment score
   - **AI Insights:**
     - "Your top strength: Attention to detail"
     - "Improve match rate: add more skills"
     - "5 new jobs match your profile"
3. Quick actions buttons:
   - "Complete Assessment"
   - "Browse Jobs"
   - "Chat with NeuroAgent"

**Postcondiciones:**
- Usuario informado de estado actual
- Puede tomar acciones directamente desde dashboard

**Flujos Alternativos:**
- **FA-1:** Perfil incompleto (<50%) → banner prominente "Complete your profile"
- **FA-2:** Sin matches → mostrar "Tips to improve matching"
- **FA-3:** Muchos matches rechazados → NeuroAgent pregunta si ajustar preferencias

**Edge Cases:**
- Usuario nuevo (sin datos) → onboarding tour interactivo
- Datos desactualizados (>6 meses) → banner "Update your profile"
- Profile views altos pero sin conversiones → sugerir mejorar portfolio

**Criterios de Aceptación:**
```javascript
// Test: debería mostrar dashboard con métricas correctas
expect(dashboard.profileCompletion).toBe(85)
expect(dashboard.activeMatches).toHaveLength(3)
expect(dashboard.metrics.totalMatches).toBe(12)
expect(dashboard.privacyControls.visibleInSearch).toBe(true)
```

---

### **UC-007: Dashboard Empresa con Pipeline**

**Actor:** Empresa (HR Manager)
**Prioridad:** MUST
**Objetivo:** Ver candidatos matched, gestionar pipeline de contratación

**Precondiciones:**
- Empresa registrada con al menos 1 vacante activa
- Al menos 1 candidato aceptó match (UC-005)

**Flujo Principal:**
1. Usuario accede a `/dashboard/company`
2. Sistema carga y muestra:
   - **Active Jobs:** lista de vacantes
     - Título, matches pendientes/activos, fecha creación
   - **Candidate Pipeline:** por vacante
     - **New Matches (3):** candidatos que aceptaron, no revisados
     - **Under Review (2):** empresa marcó interés, esperando siguiente paso
     - **Interviewing (1):** proceso activo
     - **Offered (0):** oferta enviada
     - **Hired (0):** contratados
   - **Métricas:**
     - Total candidatos matched
     - Conversion rate (matches → hired)
     - Average time to hire
     - Inclusivity score (acomodaciones ofrecidas)
   - **Therapist Support:**
     - "Request onboarding support" button
     - Lista de terapeutas disponibles
3. Usuario puede:
   - Ver perfiles de candidatos (respetando privacy)
   - Mover candidatos entre etapas pipeline
   - Solicitar datos adicionales (requiere consentimiento)
   - Contactar candidatos vía plataforma
   - Cerrar vacante

**Postcondiciones:**
- Pipeline actualizado
- Candidatos notificados de cambios de estado

**Flujos Alternativos:**
- **FA-1:** Sin candidatos → mostrar "Tips to improve job posting"
- **FA-2:** Candidato rechaza siguiente paso → mover a "Declined", liberar slot
- **FA-3:** Vacante cerrada → archivar pipeline, notificar candidatos activos

**Edge Cases:**
- Candidato revoca consentimiento durante proceso → remover de pipeline, alertar HR
- Multiple HRs de misma empresa → sincronizar cambios en tiempo real
- Candidato aceptado por otra empresa → actualizar status, sugerir alternativas

**Criterios de Aceptación:**
```javascript
// Test: debería mostrar pipeline con métricas correctas
expect(dashboard.activeJobs).toHaveLength(2)
expect(dashboard.pipeline.newMatches).toHaveLength(3)
expect(dashboard.metrics.conversionRate).toBe(15) // 15%
expect(dashboard.candidateProfiles[0].sharedData).not.toContain('diagnosis') // privacy
```

---

### **UC-008: Registro de Terapeuta**

**Actor:** Terapeuta / Especialista
**Prioridad:** MUST
**Objetivo:** Registrarse para ofrecer servicios de acompañamiento

**Precondiciones:**
- Usuario no registrado como terapeuta
- Tiene certificaciones/credenciales

**Flujo Principal:**
1. Usuario accede a `/forms` → tab "Therapist"
2. Completa formulario:
   - Datos personales (nombre, email)
   - Certificaciones (títulos, licencias)
   - Especialización (autismo, ADHD, ansiedad, etc.)
   - Enfoque terapéutico (cognitivo-conductual, sistémico, etc.)
   - Experiencia con neurodiversidad (años)
   - Servicios ofrecidos:
     - Apoyo individual (candidatos)
     - Consultoría empresarial (onboarding, cultura)
     - Talleres/formación
   - Tarifas (opcional, si cobra por plataforma)
3. OpenAI valida coherencia de certificaciones
4. Sistema marca perfil como "pending_verification"
5. Admin revisa credenciales (manual o semi-automático)
6. Si aprobado:
   - Status → "active"
   - Terapeuta recibe email de bienvenida
   - Redirige a `/dashboard/therapist`

**Postcondiciones:**
- Terapeuta registrado y verificado
- Visible para individuos/empresas buscando apoyo

**Flujos Alternativos:**
- **FA-1:** Certificación no reconocida → pedir documentación adicional
- **FA-2:** Terapeuta sin licencia válida → rechazar, sugerir completar formación
- **FA-3:** Terapeuta duplicado → cargar perfil existente

**Edge Cases:**
- Certificación expirada → alertar, pedir renovación
- Especialización muy amplia → NeuroAgent pide especificar nicho
- Sin experiencia neurodiversidad → permitir con badge "New to ND"

**Criterios de Aceptación:**
```javascript
// Test: debería crear perfil terapeuta con verificación
expect(therapist.status).toBe('pending_verification')
expect(therapist.certifications).toHaveLength.greaterThan(0)
expect(therapist.specializations).toContain('autism')
expect(therapist.services).toContain('individual_support')
```

---

### **UC-009: Dashboard Terapeuta con Clientes**

**Actor:** Terapeuta
**Prioridad:** MUST
**Objetivo:** Ver clientes asignados, métricas agregadas, solicitudes de empresas

**Precondiciones:**
- Terapeuta verificado (UC-008)
- Al menos 1 cliente dio consentimiento para compartir datos

**Flujo Principal:**
1. Usuario accede a `/dashboard/therapist`
2. Sistema carga y muestra:
   - **Individual Clients (5):**
     - Lista de candidatos que autorizaron acceso
     - Ver progreso: assessment scores, matches activos
     - Notas privadas del terapeuta
     - Última sesión
   - **Company Clients (2):**
     - Empresas con contrato de consultoría
     - Ver métricas de inclusión (agregadas)
     - Solicitudes de onboarding activas
   - **Métricas Agregadas (Anónimas):**
     - "Your clients' avg match rate: 72% (vs platform avg: 65%)"
     - "Top strength identified: Problem solving"
     - "Most requested accommodation: Flexible hours"
   - **Pending Requests:**
     - "Company TechCorp requests onboarding support"
     - "Individual John Doe requests session"
   - **Resources:**
     - Acceso a biblioteca de juegos/quizzes
     - Links compartibles para recomendar a clientes
3. Terapeuta puede:
   - Aceptar/rechazar nuevos clientes
   - Ver detalles de clientes (solo con consentimiento)
   - Recomendar candidatos a empresas (con consentimiento)
   - Agregar notas privadas
   - Programar sesiones

**Postcondiciones:**
- Terapeuta informado de estado de clientes
- Puede tomar acciones de acompañamiento

**Flujos Alternativos:**
- **FA-1:** Sin clientes → mostrar "How to get clients" + tips
- **FA-2:** Cliente revoca consentimiento → remover de lista inmediatamente
- **FA-3:** Solicitud de datos sensibles sin permiso → bloquear, alertar

**Edge Cases:**
- Terapeuta intenta ver datos sin consentimiento → error 403 + log
- Cliente en crisis → sistema detecta red flags, alerta terapeuta
- Empresa solicita datos individuales → pedir consentimiento explícito

**Criterios de Aceptación:**
```javascript
// Test: debería mostrar dashboard con clientes consentidos
expect(dashboard.individualClients).toHaveLength(5)
expect(dashboard.companyClients).toHaveLength(2)
expect(dashboard.aggregateMetrics.avgMatchRate).toBe(72)
expect(dashboard.canViewClientData(clientId, therapistId)).toBe(true) // solo si consent
```

---

## 🎯 CASOS DE USO - SHOULD (Enhance Matching)

### **UC-010: Terapeuta Recomienda Candidato a Empresa**

**Actor:** Terapeuta
**Prioridad:** SHOULD
**Objetivo:** Recomendar candidato a empresa específica con consentimiento

**Precondiciones:**
- Terapeuta tiene cliente individual (candidato)
- Candidato dio consentimiento para recomendaciones
- Empresa tiene vacante activa

**Flujo Principal:**
1. Terapeuta ve vacante compatible en dashboard
2. Terapeuta identifica cliente que encaja bien
3. Terapeuta solicita permiso explícito al cliente:
   - "¿Puedo recomendarte a TechCorp para rol X?"
   - Muestra detalles de vacante
4. Cliente acepta → terapeuta envía recomendación:
   - Mensaje personalizado a empresa
   - Destaca fortalezas del candidato
   - Sugiere acomodaciones específicas
5. Sistema crea `recommendation` en `data/recommendations/{recId}.json`
6. Empresa recibe notificación: "Therapist recommendation: High potential match"
7. Empresa puede:
   - Ver perfil candidato (con permisos)
   - Aceptar recomendación → iniciar proceso de match
   - Declinar con feedback opcional

**Postcondiciones:**
- Recomendación registrada
- Candidato y empresa notificados
- Si aceptada → match creado con score boosted (+10 puntos)

**Flujos Alternativos:**
- **FA-1:** Cliente rechaza → no procede, terapeuta puede sugerir otra vacante
- **FA-2:** Empresa rechaza → feedback enviado a terapeuta
- **FA-3:** Cliente no responde en 3 días → recomendación expirada

**Criterios de Aceptación:**
```javascript
// Test: debería crear recomendación con consentimiento
expect(recommendation.candidateConsent).toBe(true)
expect(recommendation.therapistId).toBe(therapist.id)
expect(recommendation.matchScore).toBe(match.score + 10) // boost
expect(company.notifications).toContain('therapist_recommendation')
```

---

### **UC-011: Empresa Solicita Soporte de Terapeuta para Onboarding**

**Actor:** Empresa
**Prioridad:** SHOULD
**Objetivo:** Contratar terapeuta para asesorar proceso de onboarding inclusivo

**Precondiciones:**
- Empresa tiene candidato en etapa "Hired" o "Interviewing"
- Terapeuta disponible con servicio "company_consulting"

**Flujo Principal:**
1. Empresa accede a pipeline → selecciona candidato
2. Click "Request Onboarding Support"
3. Sistema muestra terapeutas disponibles:
   - Filtro por especialización (match con candidato)
   - Rating, experiencia, tarifas
4. Empresa selecciona terapeuta + describe necesidad:
   - "Need help with sensory-friendly workspace setup"
   - "Training for team on neurodiversity awareness"
5. Solicitud enviada a terapeuta
6. Terapeuta acepta → sistema crea `consultingContract`
7. Terapeuta y empresa coordinan:
   - Sesiones de asesoría
   - Acceso a métricas del candidato (con consentimiento)
   - Recomendaciones de acomodaciones
8. Candidato notificado: "Your employer hired therapist support for your onboarding"

**Postcondiciones:**
- Contrato de consultoría activo
- Terapeuta puede acceder a datos relevantes (con consentimiento)
- Empresa recibe plan de onboarding personalizado

**Flujos Alternativos:**
- **FA-1:** Terapeuta rechaza → sugerir alternativas
- **FA-2:** Candidato se opone → respetar, buscar alternativa
- **FA-3:** Empresa cancela después → terapeuta cobra fee mínimo

**Criterios de Aceptación:**
```javascript
// Test: debería crear contrato de consultoría
expect(contract.type).toBe('onboarding_support')
expect(contract.candidateConsent).toBe(true) // si datos compartidos
expect(therapist.companyClients).toContain(companyId)
expect(contract.status).toBe('active')
```

---

### **UC-012: Notificaciones Contextuales y Recordatorios**

**Actor:** Sistema (automated)
**Prioridad:** SHOULD
**Objetivo:** Mantener usuarios engaged con notificaciones relevantes

**Flujo Principal:**
1. Sistema identifica eventos trigger:
   - Nuevo match calculado (UC-004)
   - Empresa movió candidato en pipeline (UC-007)
   - Match expira en 24h (UC-005)
   - Assessment obsoleto (>6 meses)
   - Nuevo mensaje de empresa/candidato
2. Sistema genera notificación contextual:
   - In-app: badge + pop-up
   - Email: digest diario (configurable)
   - Push (si PWA instalado)
3. Notificación incluye:
   - Título conciso
   - Descripción con contexto
   - CTA claro ("Review Match", "Update Profile")
   - Link directo a acción
4. Usuario puede:
   - Actuar inmediatamente
   - Snooze (postponer 1 día/semana)
   - Dismiss (archivar)
   - Disable tipo de notificación
5. Sistema aprende preferencias:
   - Frecuencia óptima (evita spam)
   - Horario preferido (respeta timezone)
   - Canales efectivos (in-app vs email)

**Postcondiciones:**
- Usuario informado de eventos importantes
- Engagement mejorado sin spam

**Flujos Alternativos:**
- **FA-1:** Usuario nunca abre notificaciones → reducir frecuencia automáticamente
- **FA-2:** Notificación urgente (ej: match expira) → priorizar
- **FA-3:** Usuario desactiva todo → respetar, solo emails críticos

**Criterios de Aceptación:**
```javascript
// Test: debería generar notificación contextual
expect(notification.type).toBe('new_match')
expect(notification.urgency).toBe('medium')
expect(notification.cta).toBe('Review Match')
expect(user.notifications.unread).toBe(1)
```

---

## 🔧 CASOS DE USO - COULD (Nice to Have)

### **UC-013: Exportar Portafolio Profesional**

**Actor:** Individual Neurodivergente
**Prioridad:** COULD
**Objetivo:** Generar PDF con assessment results y fortalezas para compartir

**Flujo Principal:**
1. Usuario accede a dashboard → "Export Portfolio"
2. Selecciona qué incluir:
   - Assessment results
   - Fortalezas identificadas
   - Skills técnicos
   - Experiencia laboral
   - Recomendaciones de terapeutas (si aplica)
3. OpenAI genera documento profesional:
   - Diseño limpio y accesible
   - Gráficos de fortalezas
   - Sección "About Me" generada por AI
4. Usuario puede:
   - Descargar PDF
   - Generar link compartible (expira en 30 días)
   - Enviar a empresas directamente
5. Sistema registra compartidos (analytics)

**Criterios de Aceptación:**
```javascript
// Test: debería generar PDF con datos correctos
expect(portfolio.format).toBe('pdf')
expect(portfolio.sections).toContain('strengths')
expect(portfolio.shareableLink).toMatch(/^https:\/\/.*/)
expect(portfolio.expiresAt).toBeDefined()
```

---

### **UC-014: Reviews y Feedback Post-Hiring**

**Actor:** Empresa + Individual
**Prioridad:** COULD
**Objetivo:** Recoger feedback después de contratación para mejorar matching

**Flujo Principal:**
1. 30 días después de "Hired":
   - Sistema envía encuesta a candidato:
     - "¿El rol coincide con lo esperado?"
     - "¿Las acomodaciones fueron suficientes?"
     - Rating 1-5
   - Sistema envía encuesta a empresa:
     - "¿El candidato cumple expectativas?"
     - "¿El proceso de onboarding fue efectivo?"
     - Rating 1-5
2. Ambos completan (opcional)
3. Sistema agrega feedback:
   - Mejora matching algorithm
   - Actualiza inclusivity score de empresa
   - Identifica áreas de mejora

**Criterios de Aceptación:**
```javascript
// Test: debería enviar encuesta post-hiring
expect(survey.sentAt).toBeDefined()
expect(survey.recipientType).toBe('candidate')
expect(survey.completed).toBe(false) // pending
```

---

### **UC-015: Admin Panel - Moderación y Analytics**

**Actor:** Admin/Moderador
**Prioridad:** COULD
**Objetivo:** Revisar reportes, moderar contenido, ver analytics

**Flujo Principal:**
1. Admin accede a `/admin` (protected)
2. Ve dashboard con:
   - Flagged content (reportes de usuarios)
   - Pending therapist verifications
   - Analytics agregados:
     - Total usuarios por actor
     - Match success rate
     - Top industries hiring
3. Puede:
   - Aprobar/rechazar terapeutas
   - Desactivar usuarios violando ToS
   - Ver logs de acceso a datos sensibles (compliance)
   - Exportar reportes para stakeholders

**Criterios de Aceptación:**
```javascript
// Test: debería mostrar analytics agregados
expect(admin.analytics.totalUsers).toBe(1250)
expect(admin.analytics.matchSuccessRate).toBe(68)
expect(admin.pendingVerifications).toHaveLength(3)
```

---

## 🔐 CASOS DE USO - PRIVACY & SECURITY (Transversales)

### **UC-016: Revocar Consentimiento de Conexión**

**Actor:** Individual Neurodivergente
**Prioridad:** MUST (Critical for Privacy)
**Objetivo:** Revocar acceso de empresa a datos personales

**Flujo Principal:**
1. Usuario accede a dashboard → "Privacy Controls"
2. Ve lista de empresas con acceso activo
3. Selecciona empresa → "Revoke Access"
4. Sistema muestra impacto:
   - "This will remove you from their pipeline"
   - "They will no longer see your profile"
5. Usuario confirma
6. Sistema:
   - Connection status → "revoked"
   - Empresa pierde acceso inmediato
   - Candidato removido de pipeline
   - Empresa notificada: "Candidate withdrew from process"
7. Registro de revocación guardado (compliance)

**Criterios de Aceptación:**
```javascript
// Test: debería revocar acceso inmediatamente
expect(connection.status).toBe('revoked')
expect(connection.revokedAt).toBeDefined()
expect(company.canViewCandidate(candidateId)).toBe(false)
expect(company.pipeline.candidates).not.toContain(candidateId)
```

---

### **UC-017: Audit Log de Acceso a Datos Sensibles**

**Actor:** Sistema (compliance)
**Prioridad:** MUST (GDPR/Legal)
**Objetivo:** Registrar todos los accesos a datos sensibles para compliance

**Flujo Principal:**
1. Cada vez que datos sensibles son accedidos:
   - Diagnósticos
   - Datos personales identificables
   - Assessment results detallados
2. Sistema registra en `data/audit_logs/{timestamp}.json`:
   - Quién accedió (userId, role)
   - Qué datos (dataType, fields)
   - Cuándo (timestamp)
   - Por qué (reason: "matching", "therapist_review", etc.)
   - IP address
3. Usuario puede ver su propio audit log:
   - Dashboard → "Who viewed my data"
4. Admin puede auditar logs (compliance)

**Criterios de Aceptación:**
```javascript
// Test: debería registrar acceso a datos sensibles
expect(auditLog.accessedBy).toBe(companyId)
expect(auditLog.dataAccessed).toContain('diagnosis')
expect(auditLog.reason).toBe('pipeline_review')
expect(auditLog.ipAddress).toBeDefined()
```

---

## 📊 MÉTRICAS CLAVE (KPIs)

### **Para Candidatos:**
- Profile completion rate
- Assessment completion rate
- Match acceptance rate (accepted / total matches)
- Time to first match
- Active matches count

### **Para Empresas:**
- Match-to-hire conversion rate
- Time to hire
- Inclusivity score (acomodaciones ofrecidas)
- Candidate satisfaction (post-hiring survey)
- Pipeline health (candidates per stage)

### **Para Terapeutas:**
- Client match success rate (vs platform avg)
- Client satisfaction rating
- Active clients count
- Onboarding support requests fulfilled

### **Para Plataforma:**
- Total active users (por actor)
- Match success rate (overall)
- Privacy compliance (consent rate, revocations)
- Engagement rate (DAU/MAU)
- Revenue (si aplica: therapist fees, premium features)

---

## 🧪 TESTING STRATEGY

### **Niveles de Testing:**

1. **Unit Tests:** Funciones aisladas (matching algorithm, privacy checks)
2. **Integration Tests:** Flujos completos (registro → assessment → matching → aceptación)
3. **E2E Tests:** Casos de uso completos desde UI
4. **Privacy Tests:** Verificar que datos sensibles NO son accesibles sin consentimiento
5. **Performance Tests:** Matching a escala (1000+ candidatos, 100+ vacantes)

### **Herramientas:**
- Vitest (unit + integration)
- Playwright (E2E)
- MSW (mock OpenAI API)

---

## 📁 ESTRUCTURA DE DATOS (JSON)

### `data/users/individuals/{userId}.json`
```json
{
  "userId": "ind_123",
  "email": "john@example.com",
  "profile": {
    "name": "John Doe",
    "location": "Madrid, Spain",
    "diagnoses": ["ADHD", "Autism Level 1"], // privado por defecto
    "experience": [...],
    "preferences": {
      "workMode": "remote",
      "flexibleHours": true,
      "teamSize": "small"
    },
    "accommodationsNeeded": ["Quiet workspace", "Written instructions"]
  },
  "privacy": {
    "visibleInSearch": true,
    "showRealName": false,
    "shareDiagnosis": false, // requiere consentimiento explícito
    "allowTherapistAccess": true
  },
  "assessment": {
    "completed": true,
    "completedAt": "2024-01-05T10:00:00Z",
    "strengths": ["Attention to detail", "Systematic thinking"],
    "score": 85,
    "confidenceScore": 92
  },
  "matches": {
    "pending": ["match_456"],
    "accepted": ["match_789"],
    "rejected": ["match_012"]
  },
  "therapistId": "ther_345", // si tiene terapeuta asignado
  "status": "active",
  "createdAt": "2024-01-01T10:00:00Z",
  "lastActive": "2024-01-10T15:30:00Z"
}
```

### `data/users/companies/{companyId}.json`
```json
{
  "companyId": "comp_456",
  "name": "TechCorp",
  "industry": "Technology",
  "size": "50-200",
  "contact": {
    "email": "hr@techcorp.com",
    "phone": "+34123456789"
  },
  "jobs": ["job_789", "job_790"],
  "inclusivityScore": 85,
  "status": "active",
  "createdAt": "2024-01-02T10:00:00Z"
}
```

### `data/jobs/{jobId}.json`
```json
{
  "jobId": "job_789",
  "companyId": "comp_456",
  "title": "Software Engineer",
  "description": "Full-stack developer...",
  "skills": ["JavaScript", "React", "Node.js"],
  "accommodations": ["Remote work", "Flexible hours", "Async communication"],
  "salaryRange": "40k-60k",
  "visibility": "public",
  "inclusivityScore": 90,
  "status": "active",
  "createdAt": "2024-01-03T10:00:00Z",
  "matches": {
    "pending": ["match_123"],
    "accepted": ["match_456"]
  }
}
```

### `data/matches/{matchId}.json`
```json
{
  "matchId": "match_123",
  "candidateId": "ind_123",
  "jobId": "job_789",
  "companyId": "comp_456",
  "score": 85,
  "scoreBreakdown": {
    "skills": 90,
    "accommodations": 80,
    "preferences": 85,
    "location": 100
  },
  "aiJustification": "Strong match: candidate's attention to detail aligns with quality-focused role...",
  "status": "pending", // pending → accepted → rejected → expired
  "createdAt": "2024-01-10T10:00:00Z",
  "expiresAt": "2024-01-17T10:00:00Z"
}
```

### `data/connections/{connectionId}.json`
```json
{
  "connectionId": "conn_789",
  "matchId": "match_123",
  "candidateId": "ind_123",
  "companyId": "comp_456",
  "jobId": "job_789",
  "status": "active", // active → revoked → completed
  "consentGivenAt": "2024-01-10T12:00:00Z",
  "customPrivacy": {
    "shareDiagnosis": true, // override default para esta conexión
    "shareTherapistContact": false
  },
  "sharedData": ["name", "email", "skills", "assessment", "diagnosis"],
  "pipelineStage": "interviewing", // new → under_review → interviewing → offered → hired → declined
  "messages": ["msg_1", "msg_2"],
  "revokedAt": null,
  "createdAt": "2024-01-10T12:00:00Z"
}
```

---

**FIN DE DOCUMENTACIÓN DE CASOS DE USO**

Este documento será la base para:
1. Implementar tests (siguiente paso)
2. Diseñar arquitectura de componentes
3. Definir API endpoints
4. Establecer modelos de datos
5. Guiar desarrollo incremental
