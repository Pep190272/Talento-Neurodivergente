# Guía de Implementación TDD - Diversia Eternals Marketplace

**Status:** 🔴 **RED Phase** - Todos los tests fallan (esperado)
**Next Step:** 🟢 **GREEN Phase** - Implementar código para hacer pasar los tests

---

## 📊 Estado Actual

### ✅ Completado:
1. ✅ Casos de uso documentados (docs/USE_CASES.md)
2. ✅ Suite completa de tests TDD (7 archivos, ~150+ tests)
3. ✅ Setup de Vitest configurado
4. ✅ Fase RED verificada - todos los tests fallan

### 📝 Tests Creados:

| Archivo | Casos de Uso | Tests | Status |
|---------|--------------|-------|--------|
| `tests/unit/actors/individual.test.js` | UC-001 | ~35 | ❌ FAIL |
| `tests/unit/actors/company.test.js` | UC-003 | ~40 | ❌ FAIL |
| `tests/unit/actors/therapist.test.js` | UC-008, UC-009 | ~45 | ❌ FAIL |
| `tests/unit/matching/algorithm.test.js` | UC-004 | ~35 | ❌ FAIL |
| `tests/unit/matching/consent.test.js` | UC-005, UC-016 | ~40 | ❌ FAIL |
| `tests/unit/dashboards/dashboards.test.js` | UC-006, UC-007, UC-009 | ~50 | ❌ FAIL |
| `tests/unit/privacy/audit.test.js` | UC-017 | ~30 | ❌ FAIL |

**Total:** ~275 tests - **Todos en RED** ✅

---

## 🎯 Prioridades de Implementación (Orden TDD)

### **Phase 1: Core Infrastructure (Semana 1-2)**

#### 1.1 Utilities & Helpers
**Archivo:** `app/lib/utils.js`

```javascript
/**
 * @priority HIGH
 * @dependencies None
 * @tests individual.test.js, company.test.js, therapist.test.js
 */

// Implement:
export function generateUserId(type) {
  // type: 'individual' | 'company' | 'therapist'
  // return: 'ind_xxx', 'comp_xxx', 'ther_xxx'
}

export function generateJobId() {
  // return: 'job_xxx'
}

export function generateMatchId() {
  // return: 'match_xxx'
}

export function generateConnectionId() {
  // return: 'conn_xxx'
}
```

**Tests a pasar:**
- ✅ `generateUserId('individual')` debe retornar string con formato `ind_xxx`
- ✅ IDs deben ser únicos

---

#### 1.2 Data Storage (JSON File System)
**Archivo:** `app/lib/storage.js`

```javascript
/**
 * @priority HIGH
 * @dependencies utils.js
 * @tests ALL tests
 * @note Databaseless architecture - JSON storage
 */

// Implement:
export async function saveToFile(path, data) {
  // Save data to data/{path}.json
  // Create directories if not exist
  // Atomic write with temp file + rename
}

export async function readFromFile(path) {
  // Read from data/{path}.json
  // Return null if not exists
}

export async function updateFile(path, updateFn) {
  // Read, apply updateFn, write atomically
}

export async function deleteFile(path) {
  // Delete file if exists
}

export async function fileExists(path) {
  // Check if file exists
}
```

**Estructura de directorios:**
```
data/
  users/
    individuals/{userId}.json
    companies/{companyId}.json
    therapists/{therapistId}.json
  jobs/{jobId}.json
  matches/{matchId}.json
  connections/{connectionId}.json
  audit_logs/{userId}/{timestamp}.json
```

**Tests a pasar:**
- ✅ Guardar y leer archivos JSON
- ✅ Crear directorios automáticamente
- ✅ Escritura atómica (no corrupción en crash)

---

### **Phase 2: Actores (Semana 2-3)**

#### 2.1 Individual Profile Management
**Archivo:** `app/lib/individuals.js`

```javascript
/**
 * @priority MUST
 * @dependencies storage.js, utils.js
 * @tests tests/unit/actors/individual.test.js (35 tests)
 */

export async function createIndividualProfile(data, options = {}) {
  // 1. Validate required fields
  // 2. Check email uniqueness
  // 3. Generate userId
  // 4. Apply default privacy settings
  // 5. Validate with OpenAI (if available)
  // 6. Save to data/users/individuals/{userId}.json
  // 7. Return profile object with methods (getPublicView, etc.)
}

export async function validateIndividualData(data) {
  // OpenAI validation
  // Return: { validated, normalized, suggestions, warnings }
}

export async function getIndividualById(userId) {
  // Read from storage
  // Return profile with methods attached
}

export async function updateIndividualProfile(userId, updates) {
  // Update profile
  // Trigger recalculateMatches if relevant fields changed
}

export async function deactivateIndividual(userId) {
  // Set status = 'inactive'
  // Invalidate all active matches
  // Revoke all connections
}
```

**Estructura de datos (ejemplo):**
```json
{
  "userId": "ind_abc123",
  "email": "user@example.com",
  "profile": {
    "name": "John Doe",
    "location": "Madrid, Spain",
    "diagnoses": ["ADHD"],
    "experience": [...],
    "preferences": {...},
    "accommodationsNeeded": [...],
    "skills": [...]
  },
  "privacy": {
    "visibleInSearch": true,
    "showRealName": false,
    "shareDiagnosis": false,
    "allowTherapistAccess": true
  },
  "assessment": {
    "completed": false,
    "completedAt": null,
    "strengths": [],
    "score": 0
  },
  "matches": {
    "pending": [],
    "accepted": [],
    "rejected": []
  },
  "therapistId": null,
  "status": "active",
  "createdAt": "2024-01-15T10:00:00Z",
  "lastActive": "2024-01-15T10:00:00Z"
}
```

**Tests críticos:**
- ✅ Crear perfil con privacy settings por defecto
- ✅ Rechazar email duplicado
- ✅ Diagnosis privado por defecto (no en public view)
- ✅ Validación OpenAI (con fallback si API falla)
- ✅ Draft save en localStorage si form incompleto

**Dependencias externas:**
- OpenAI API (opcional con fallback)
- localStorage (client-side para drafts)

---

#### 2.2 Company & Job Management
**Archivo:** `app/lib/companies.js`

```javascript
/**
 * @priority MUST
 * @dependencies storage.js, utils.js
 * @tests tests/unit/actors/company.test.js (40 tests)
 */

export async function createCompany(data) {
  // 1. Validate required fields
  // 2. Check email uniqueness
  // 3. Generate companyId
  // 4. Initialize empty jobs array
  // 5. Save to data/users/companies/{companyId}.json
}

export async function createJobPosting(companyId, jobData) {
  // 1. Validate required fields (title, skills, accommodations)
  // 2. Require at least 1 accommodation
  // 3. Analyze inclusivity with OpenAI
  // 4. Detect discriminatory language
  // 5. Generate jobId
  // 6. Save to data/jobs/{jobId}.json
  // 7. Add jobId to company.jobs array
  // 8. Trigger matching algorithm
}

export async function analyzeJobInclusivity(jobData) {
  // OpenAI analysis
  // Return: {
  //   inclusivityScore: 0-100,
  //   hasDiscriminatoryLanguage: boolean,
  //   issues: [...],
  //   suggestedRevisions: [...],
  //   suggestedAccommodations: [...]
  // }
}

export async function getCompanyById(companyId) {}
export async function getJobById(jobId) {}
export async function closeJob(jobId) {
  // Mark status = 'closed'
  // Invalidate pending matches
  // Notify affected candidates
}
```

**Tests críticos:**
- ✅ Crear empresa con companyId único
- ✅ Crear job con análisis de inclusividad
- ✅ Bloquear job con lenguaje discriminatorio
- ✅ Requerir al menos 1 acomodación
- ✅ Detectar duplicados de jobs

---

#### 2.3 Therapist Management
**Archivo:** `app/lib/therapists.js`

```javascript
/**
 * @priority MUST
 * @dependencies storage.js, consent.js
 * @tests tests/unit/actors/therapist.test.js (45 tests)
 */

export async function createTherapist(data) {
  // 1. Validate required fields (certifications)
  // 2. Validate certifications with OpenAI
  // 3. Check license expiry
  // 4. Generate therapistId
  // 5. Set status = 'pending_verification'
  // 6. Save to data/users/therapists/{therapistId}.json
}

export async function verifyTherapist(therapistId, verificationData) {
  // 1. Admin approval
  // 2. Update status = 'active' or 'rejected'
  // 3. Send welcome email if approved
  // 4. Return updated therapist
}

export async function getTherapistClients(therapistId) {
  // 1. Get all connections where therapist has access
  // 2. Filter by consent status
  // 3. Return { individualClients: [], companyClients: [] }
}

export async function addClientToTherapist(therapistId, clientId) {
  // Requires client consent
}

export async function getClientDataForTherapist(therapistId, clientId) {
  // 1. Verify consent exists
  // 2. Log access in audit log
  // 3. Return client data (respecting permissions)
  // 4. Throw 403 if no consent
}
```

**Tests críticos:**
- ✅ Crear therapist con pending_verification
- ✅ Validar certificaciones
- ✅ Rechazar certificaciones expiradas
- ✅ Solo mostrar clientes con consentimiento
- ✅ Bloquear acceso sin consentimiento (403)

---

### **Phase 3: Matching Core (Semana 3-4)**

#### 3.1 Matching Algorithm
**Archivo:** `app/lib/matching.js`

```javascript
/**
 * @priority CRITICAL
 * @dependencies storage.js, individuals.js, companies.js
 * @tests tests/unit/matching/algorithm.test.js (35 tests)
 * @note Core business logic - marketplace heart
 */

export async function calculateMatch(candidateId, jobId) {
  // 1. Load candidate profile + assessment
  // 2. Load job posting
  // 3. Calculate score breakdown:
  //    - Skills match: 40%
  //    - Accommodations fit: 30%
  //    - Preferences: 20%
  //    - Location: 10%
  // 4. Use OpenAI for semantic skill matching
  // 5. Generate AI justification
  // 6. Return match object with score 0-100
}

export async function runMatchingForJob(jobId) {
  // 1. Get all eligible candidates:
  //    - assessment.completed = true
  //    - privacy.visibleInSearch = true
  //    - status = 'active'
  // 2. Calculate match for each
  // 3. Create match if score >= 60
  // 4. Save matches with status = 'pending'
  // 5. DO NOT notify yet (privacy-first)
  // 6. Return array of matches
}

export async function runMatchingForCandidate(candidateId) {
  // Similar to runMatchingForJob but for one candidate
  // Run when candidate completes assessment
}

export async function recalculateMatches(userId) {
  // When user updates profile
  // Recalculate all active matches
}
```

**Algoritmo de scoring:**
```javascript
// Pseudo-código
function calculateSkillsScore(candidateSkills, jobSkills) {
  // 1. Exact matches: 100%
  // 2. Semantic matches via OpenAI: 70-90%
  // 3. Partial matches: 40-60%
  // 4. No match: 0%

  const exactMatches = candidateSkills.filter(s => jobSkills.includes(s))
  const semanticMatches = await getSemanticMatches(candidateSkills, jobSkills)

  return weightedAverage(exactMatches, semanticMatches)
}

function calculateAccommodationsScore(needed, offered) {
  // % of needed accommodations that are offered
  const coverage = needed.filter(n => offered.includes(n)).length / needed.length
  return coverage * 100
}

function calculatePreferencesScore(candidatePrefs, jobDetails) {
  // Work mode, team size, hours, etc.
  let score = 0
  if (candidatePrefs.workMode === jobDetails.workMode) score += 33
  if (candidatePrefs.flexibleHours && jobDetails.accommodations.includes('Flexible hours')) score += 33
  // ...
  return score
}

function calculateLocationScore(candidateLocation, jobLocation, workMode) {
  if (workMode === 'remote') return 100
  if (candidateLocation === jobLocation) return 100
  // Distance-based scoring...
  return distanceScore
}
```

**Tests críticos:**
- ✅ Score entre 0-100
- ✅ Score breakdown con 4 componentes
- ✅ Solo crear match si score >= 60
- ✅ No match si candidate invisible
- ✅ No compartir diagnosis en match data
- ✅ OpenAI fallback a keyword matching

---

#### 3.2 Consent & Privacy Management
**Archivo:** `app/lib/consent.js`

```javascript
/**
 * @priority CRITICAL
 * @dependencies storage.js, matching.js, audit.js
 * @tests tests/unit/matching/consent.test.js (40 tests)
 * @note Privacy-first architecture - GDPR compliance
 */

export async function acceptMatch(matchId, candidateId, options = {}) {
  // 1. Verify match exists and status = 'pending'
  // 2. Update match.status = 'accepted'
  // 3. Create connection with consent documented
  // 4. Determine sharedData based on privacy settings + customPrivacy
  // 5. Notify company
  // 6. Log consent in audit log
  // 7. Return { match, connection, notifications }
}

export async function rejectMatch(matchId, candidateId, options = {}) {
  // 1. Update match.status = 'rejected'
  // 2. DO NOT notify company (privacy)
  // 3. Archive match
  // 4. Optional private rejection reason
}

export async function customizeMatchPrivacy(connectionId, customPrivacy) {
  // Override default privacy for this specific connection
  // Example: shareDiagnosis = true for this company only
}

export async function revokeConsent(connectionId, candidateId, options = {}) {
  // 1. Verify connection exists
  // 2. Prevent revocation if status = 'hired'
  // 3. Update connection.status = 'revoked'
  // 4. Remove candidate from company pipeline
  // 5. Company loses access immediately
  // 6. Notify company (no reason given for privacy)
  // 7. Log revocation in audit log
}

export async function createConnection(matchData, consentData) {
  // Internal function called by acceptMatch
  // Create connection object with:
  // - connectionId
  // - consentGivenAt
  // - sharedData array
  // - customPrivacy overrides
}

export async function getCandidateDataForCompany(companyId, candidateId) {
  // 1. Verify active connection exists
  // 2. Check connection.sharedData permissions
  // 3. Log access in audit log
  // 4. Return filtered candidate data
  // 5. Throw 403 if no connection
}
```

**Estructura de Connection:**
```json
{
  "connectionId": "conn_xyz789",
  "matchId": "match_abc123",
  "candidateId": "ind_user123",
  "companyId": "comp_tech456",
  "jobId": "job_dev789",
  "status": "active",
  "consentGivenAt": "2024-01-15T12:00:00Z",
  "customPrivacy": {
    "shareDiagnosis": true,
    "shareTherapistContact": false
  },
  "sharedData": ["name", "email", "skills", "assessment", "diagnosis"],
  "pipelineStage": "new",
  "messages": [],
  "revokedAt": null,
  "createdAt": "2024-01-15T12:00:00Z"
}
```

**Tests críticos:**
- ✅ Aceptar match crea connection con consent
- ✅ sharedData respeta privacy settings
- ✅ Rechazar match no notifica a empresa
- ✅ Revocar consent remueve acceso inmediato
- ✅ No revocar si status = 'hired'
- ✅ Custom privacy override default por conexión
- ✅ 403 si acceso sin consentimiento

---

### **Phase 4: Dashboards & Metrics (Semana 4-5)**

#### 4.1 Dashboard Logic
**Archivo:** `app/lib/dashboards.js`

```javascript
/**
 * @priority MUST
 * @dependencies storage.js, matching.js, consent.js
 * @tests tests/unit/dashboards/dashboards.test.js (50 tests)
 */

export async function getIndividualDashboard(userId) {
  // Return:
  // - profileCompletion: 0-100
  // - completionBreakdown: { assessment: 40, experience: 30, ... }
  // - activeMatches: [{ matchId, jobTitle, companyName, score, status }]
  // - pendingActions: [{ action, priority, cta }]
  // - privacyControls: { settings, companiesWithAccess, actions }
  // - metrics: { totalMatches, acceptanceRate, profileViews }
  // - aiInsights: { topStrength, suggestions }
  // - quickActions: [{ label, route }]
}

export async function getCompanyDashboard(companyId) {
  // Return:
  // - activeJobs: [{ jobId, title, matchesPending, matchesActive }]
  // - pipeline: { newMatches, underReview, interviewing, offered, hired }
  // - metrics: { totalCandidates, conversionRate, avgTimeToHire, inclusivityScore }
  // - therapistSupport: { available, availableTherapists, requestButton }
  // - actions: [...]
}

export async function getTherapistDashboard(therapistId) {
  // Return:
  // - individualClients: [{ userId, name, progress }] (with consent only)
  // - companyClients: [{ companyId, name, serviceType }]
  // - aggregateMetrics: { avgMatchRate, platformAvgMatchRate, topStrength }
  // - pendingRequests: [{ type, requestorId }]
  // - resources: { gamesLibrary, shareableLinks }
}
```

**Cálculo de Profile Completion:**
```javascript
function calculateProfileCompletion(profile) {
  const weights = {
    assessment: 40,
    experience: 30,
    preferences: 20,
    additionalSkills: 10
  }

  let completion = 0

  // Assessment
  if (profile.assessment.completed) completion += weights.assessment

  // Experience
  if (profile.experience && profile.experience.length > 0) {
    completion += weights.experience
  }

  // Preferences
  if (profile.preferences && Object.keys(profile.preferences).length > 3) {
    completion += weights.preferences
  }

  // Additional Skills
  if (profile.skills && profile.skills.length > 3) {
    completion += weights.additionalSkills
  }

  return completion
}
```

**Tests críticos:**
- ✅ Profile completion correcto (0-100)
- ✅ Pending actions relevantes
- ✅ Privacy controls con empresas con acceso
- ✅ Company pipeline respeta privacy
- ✅ Therapist solo ve clientes con consentimiento
- ✅ Métricas agregadas anónimas

---

### **Phase 5: Privacy & Compliance (Semana 5-6)**

#### 5.1 Audit Logging
**Archivo:** `app/lib/audit.js`

```javascript
/**
 * @priority CRITICAL
 * @dependencies storage.js
 * @tests tests/unit/privacy/audit.test.js (30 tests)
 * @note GDPR compliance - 7 year retention
 */

export async function logDataAccess(accessEvent) {
  // 1. Validate required fields (accessedBy, targetUser, dataAccessed, reason)
  // 2. Classify sensitivity level
  // 3. Generate logId
  // 4. Add timestamp, ipAddress
  // 5. Calculate retentionUntil (7 years)
  // 6. Save to data/audit_logs/{targetUser}/{timestamp}.json
  // 7. Return log object
}

export async function getUserAuditLog(userId, filters = {}) {
  // 1. Read all logs for userId
  // 2. Apply filters (dateRange, dataType)
  // 3. Add friendly names (companyName, etc.)
  // 4. Return { entries: [...] }
}

export async function getAuditLog(adminId, options) {
  // Admin access to all logs
  // Redact sensitive data
}

export async function exportAuditLog(userId, options) {
  // Export as JSON/CSV
  // GDPR right to data portability
}

export async function detectAnomalies(entityId) {
  // Detect suspicious access patterns
  // Return anomalies array
}
```

**Estructura de Audit Log:**
```json
{
  "logId": "log_abc123",
  "accessedBy": "comp_xyz789",
  "accessedByType": "company",
  "targetUser": "ind_user123",
  "dataAccessed": ["diagnosis", "assessment"],
  "dataType": "sensitive",
  "sensitivityLevel": "high",
  "reason": "pipeline_review",
  "ipAddress": "192.168.1.1",
  "timestamp": "2024-01-15T14:30:00Z",
  "retentionUntil": "2031-01-15T14:30:00Z"
}
```

**Tests críticos:**
- ✅ Log cada acceso a datos sensibles
- ✅ Requiere reason obligatorio
- ✅ Clasificación de sensitivity level
- ✅ Usuario puede ver quién accedió sus datos
- ✅ Retención 7 años (GDPR)
- ✅ Detectar anomalías (accesos excesivos)
- ✅ Export para portabilidad (GDPR)

---

## 🔄 Flujo de Trabajo TDD

### Para cada módulo:

1. **RED:** Ejecutar tests, verificar que fallan
   ```bash
   npm test -- tests/unit/actors/individual.test.js
   ```

2. **GREEN:** Implementar código mínimo para pasar tests
   ```javascript
   // app/lib/individuals.js
   export async function createIndividualProfile(data) {
     // Implementación mínima
   }
   ```

3. **REFACTOR:** Mejorar código manteniendo tests verdes
   - Extraer funciones
   - Optimizar performance
   - Mejorar legibilidad

4. **Repeat:** Siguiente test

---

## 📦 Dependencias Externas

### OpenAI API Integration
**Archivo:** `app/lib/openai.js`

```javascript
/**
 * @note Todas las funciones OpenAI deben tener fallback
 */

export async function validateWithOpenAI(data, schema) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{
        role: 'system',
        content: 'Validate and normalize data according to schema'
      }, {
        role: 'user',
        content: JSON.stringify({ data, schema })
      }]
    })

    return JSON.parse(response.choices[0].message.content)
  } catch (error) {
    console.error('OpenAI API error:', error)
    return { validated: false, error: error.message, useFallback: true }
  }
}

export async function semanticSkillMatch(candidateSkills, jobSkills) {
  // With fallback to keyword matching
}

export async function analyzeInclusivity(jobDescription) {
  // With fallback to regex-based detection
}
```

---

## 🚀 Comandos Útiles

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm test -- --watch

# Ejecutar tests específicos
npm test -- tests/unit/actors/individual.test.js

# Ver coverage
npm run test:coverage

# UI interactiva
npm run test:ui

# Ejecutar solo tests que fallan
npm test -- --reporter=verbose --bail
```

---

## 📏 Criterios de Aceptación

### Para considerar un módulo "completo":

✅ **Tests:**
- [ ] Todos los tests pasan (GREEN)
- [ ] Coverage >= 80%
- [ ] No tests skipped
- [ ] No warnings en consola

✅ **Código:**
- [ ] Código legible y bien comentado
- [ ] Funciones pequeñas (<50 líneas)
- [ ] Nombres descriptivos
- [ ] Error handling robusto
- [ ] Fallbacks para APIs externas

✅ **Privacy:**
- [ ] Datos sensibles nunca en logs
- [ ] Consent documentado en todas las conexiones
- [ ] Audit log para accesos sensibles
- [ ] GDPR compliance

✅ **Performance:**
- [ ] Operaciones I/O asíncronas
- [ ] Batch processing donde aplique
- [ ] Caching para lecturas frecuentes
- [ ] <100ms respuesta para operaciones simples
- [ ] <3s para matching completo (100 candidatos)

---

## 🎯 Métricas de Éxito

### Sprint 1 (Semanas 1-2):
- [ ] Utils + Storage implementado
- [ ] Individual profile CRUD completo
- [ ] 35+ tests pasando (individual.test.js)

### Sprint 2 (Semanas 2-3):
- [ ] Company + Jobs implementado
- [ ] Therapist implementado
- [ ] 120+ tests pasando (actores completos)

### Sprint 3 (Semanas 3-4):
- [ ] Matching algorithm funcional
- [ ] Consent management completo
- [ ] 195+ tests pasando (core business completo)

### Sprint 4 (Semanas 4-5):
- [ ] Dashboards con métricas
- [ ] 245+ tests pasando

### Sprint 5 (Semanas 5-6):
- [ ] Audit logging GDPR-compliant
- [ ] **275+ tests pasando (100% suite)**
- [ ] **MVP completo** 🎉

---

## 🔐 Security Checklist

- [ ] Validar todos los inputs del usuario
- [ ] Sanitizar datos antes de guardar en JSON
- [ ] No exponer rutas de archivos al cliente
- [ ] Rate limiting en API endpoints
- [ ] HTTPS only en producción
- [ ] Tokens JWT con expiración
- [ ] Audit log inmutable
- [ ] Backup automático de data/
- [ ] Encriptar datos sensibles en reposo (diagnoses)

---

## 📚 Recursos Adicionales

- **Casos de Uso Completos:** `docs/USE_CASES.md`
- **Tests Suite:** `tests/unit/**/*.test.js`
- **OpenAI API Docs:** https://platform.openai.com/docs
- **GDPR Guidelines:** https://gdpr.eu/
- **Vitest Docs:** https://vitest.dev/

---

## 🤝 Flujo de Desarrollo

### 1. Pick a module (ej: individuals.js)
### 2. Run tests: `npm test -- individual.test.js`
### 3. Implement functions to pass 1 test at a time
### 4. Refactor when all tests green
### 5. Move to next module

**Remember:**
- 🔴 RED → 🟢 GREEN → 🔵 REFACTOR → 🔁 REPEAT
- Write minimal code to pass the test
- Refactor only when tests are green
- Privacy-first always
- GDPR compliance is non-negotiable

---

**Good luck! 🚀**

**Next Step:** Start with `app/lib/utils.js` and `app/lib/storage.js`
