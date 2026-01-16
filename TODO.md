# TODO - Features Pendientes

**Última actualización:** 2026-01-16
**Versión actual:** v0.4.0-pragmatic

---

## 🔴 Alta Prioridad - OpenAI Inclusivity Analysis

### Análisis de Inclusividad de Jobs

**Estado:** Implementación básica completa, features avanzadas pendientes

**Features completadas:**
- ✅ Scoring básico de inclusividad (0-100)
- ✅ Detección de número de accommodations
- ✅ Validación de accommodations mínimos requeridos

**Features pendientes:**

#### 1. Scoring diferencial de accommodations
**Test:** `should score higher with more accommodations`
```javascript
// Actualmente todos los jobs reciben score 100
// Debe: Calcular score basado en CANTIDAD y CALIDAD de accommodations
// Fórmula propuesta:
// - Base: 50 puntos
// - +10 puntos por cada accommodation (max 6 = 60 pts)
// - Bonus por accommodations específicos: +5 pts cada uno
//   * Remote work
//   * Flexible hours
//   * Async communication
//   * Written documentation
```

#### 2. Detección de lenguaje discriminatorio
**Test:** `should detect discriminatory language`
**Requiere:** Integración con OpenAI API

```javascript
// Palabras/frases a detectar:
const discriminatoryTerms = {
  age_discrimination: ['young', 'energetic', 'digital native', 'recent graduate'],
  ableism: ['perfect communication', 'flawless', 'no limitations', 'neurotypical'],
  gender_bias: ['rockstar', 'ninja', 'guru'],
  cultural_bias: ['native speaker', 'cultural fit']
}

// Output esperado:
{
  hasDiscriminatoryLanguage: true,
  issues: [
    { type: 'age_discrimination', text: 'young', position: 15 }
  ],
  suggestedRevisions: "Consider: 'motivated' instead of 'young energetic'"
}
```

#### 3. Bloqueo de jobs altamente discriminatorios
**Test:** `should block job posting with high discrimination score`

```javascript
// Si discriminationScore > 70:
// - throw new Error('Job posting contains discriminatory language')
// - Incluir detalles de qué revisar
```

#### 4. Suggested Accommodations
**Test:** `should suggest additional accommodations`

```javascript
// Basado en el rol y skills, sugerir accommodations adicionales
// Ejemplo: Para "Software Engineer" → sugerir:
// - Pair programming support
// - Code review async
// - Quiet workspace
// - Noise-cancelling headphones provided
```

#### 5. Skills Breakdown
**Test:** `should categorize skills into technical and soft`

```javascript
// Clasificar skills en:
job.skillsBreakdown = {
  technical: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
  soft: ['Communication', 'Teamwork'],
  domain: ['E-commerce', 'Payment systems']
}
```

#### 6. Detección de skills genéricos
**Test:** `should reject overly generic skills`

```javascript
// Si > 80% de skills son genéricos (Communication, Teamwork, Leadership)
// Añadir warning:
{
  type: 'generic_skills',
  message: 'Skills are too generic for effective matching'
}
```

---

## 🟡 Prioridad Media - Edge Cases

### 7. Visibility Settings
**Tests:**
- `should create private job not visible in public searches`
- `should allow direct applications for public jobs`

**Implementación necesaria:**
```javascript
// En createJobPosting:
if (jobData.visibility === 'private') {
  job.allowDirectApplications = false // default for private
}
```

### 8. OpenAI API Failure Handling
**Test:** `should handle OpenAI API failure gracefully`

**Implementación necesaria:**
```javascript
try {
  const analysis = await analyzeJobInclusivity(jobData)
  job.inclusivityScore = analysis.score
  job.inclusivityAnalysis = analysis
} catch (error) {
  // Fallback gracefully
  job.inclusivityScore = undefined
  job.reviewStatus = 'pending_manual_review'
  console.warn('OpenAI analysis failed, marking for manual review')
}
```

### 9. Duplicate Job Detection
**Test:** `should detect duplicate job postings`

**Implementación necesaria:**
```javascript
// Comparar nuevo job con jobs existentes de la misma company
// Si similarity > 80% (title + skills):
job.warnings = [{
  type: 'potential_duplicate',
  similarJobId: existingJob.jobId,
  similarity: 85
}]
```

---

## 🔵 Implementadas pero sin tests - individuals.js

Las siguientes features están en el código pero necesitan tests TDD:

### 10. Draft Mode
```javascript
createIndividualProfile(data, { draft: true })
// Guarda en localStorage sin crear perfil completo
```

### 11. Warning System (Low Visibility)
```javascript
// Si privacy settings son muy restrictivos:
profile.warnings = [{
  type: 'low_visibility',
  message: 'Low visibility settings may reduce matching opportunities'
}]
```

### 12. Integration Metadata
```javascript
profile.redirectTo = '/dashboard/individual'
profile.triggerWelcomeMessage = true
profile.welcomeMessageContext = { userId, name }
```

### 13. Public View Method
```javascript
profile.getPublicView() // Retorna vista pública del perfil
```

### 14. Enhanced AI Validation
```javascript
validateIndividualData(data)
// Detecta diagnósticos no estándar
// Detecta información sensible en campos públicos
```

---

## 📊 Progreso Actual

**Tests de company.test.js:**
- ✅ 16 tests pasando (62%)
- ❌ 10 tests fallando (38%)

**Deuda técnica:**
- Tests de `individuals.js` pendientes
- Coverage actual: ~40% (objetivo: 80%)
- E2E tests no iniciados

---

## 🎯 Próximos Pasos Recomendados

### Sesión 1: OpenAI Integration (4-6 horas)
1. Setup OpenAI API key en .env
2. Implementar `analyzeJobInclusivity` completo
3. TDD para cada feature (Red → Green → Refactor)
4. Mocking de OpenAI API en tests

### Sesión 2: Individual Profile Tests (2-3 horas)
1. Tests para draft mode
2. Tests para warning system
3. Tests para public view
4. Coverage >= 80%

### Sesión 3: E2E Tests (3-4 horas)
1. Setup Playwright
2. User registration flow
3. Job posting flow
4. Matching flow

---

## 📝 Notas de Implementación

### OpenAI API Integration

**Estructura recomendada:**
```javascript
// lib/openai.js
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function analyzeJobInclusivity(jobData) {
  const prompt = `
    Analyze this job posting for inclusivity and neurodiversity-friendliness:

    Title: ${jobData.title}
    Description: ${jobData.description}
    Skills: ${jobData.skills.join(', ')}
    Accommodations: ${jobData.accommodations.join(', ')}

    Return JSON with:
    - score (0-100)
    - hasDiscriminatoryLanguage (boolean)
    - issues (array of {type, text, position})
    - suggestedRevisions (string)
    - suggestedAccommodations (array)
  `

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' }
  })

  return JSON.parse(response.choices[0].message.content)
}
```

### Testing Strategy

**Mock OpenAI en tests:**
```javascript
// tests/setup.js
vi.mock('openai', () => ({
  default: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                score: 85,
                hasDiscriminatoryLanguage: false,
                issues: [],
                suggestedRevisions: null,
                suggestedAccommodations: ['Pair programming support']
              })
            }
          }]
        })
      }
    }
  }))
}))
```

---

## 🔗 Referencias

- [OpenAI API Docs](https://platform.openai.com/docs/api-reference)
- [Vitest Mocking](https://vitest.dev/guide/mocking.html)
- [Agent.md - Sección TDD](./Agent.md#-metodología-tdd---siempre)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

**Versión:** 1.0.0
**Mantenido por:** Equipo Diversia + Claude Sonnet 4.5
