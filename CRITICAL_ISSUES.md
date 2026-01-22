# TEMAS CRÍTICOS - Diversia Eternals

**Fecha de análisis**: 2026-01-17
**Versión analizada**: v0.5.0-masterclass

---

## 🚨 Resumen Ejecutivo

**Estado general**: 🟡 **EN PROGRESO / ESTABILIZANDO** - Se han cerrado vulnerabilidades críticas de seguridad. Autenticación y Tests Base implementados. Pendiente: E2E Tests y Refinamiento Arquitectónico.

**Prioridad según Agent.md**:
```
1. 🔒 SEGURIDAD    → 🔴 CRÍTICO (7 vulnerabilidades severas)
2. 🧪 TESTS         → 🔴 CRÍTICO (0 tests escritos, TDD ignorado)
3. 🏗️ ARQUITECTURA  → 🟡 MEDIO (Race conditions, sin transacciones)
4. ⚡ FUNCIONALIDAD → 🟡 MEDIO (APIs sin implementar, promesas incumplidas)
5. 🎨 ESTÉTICA      → ✅ OK (No evaluado, baja prioridad)
```

---

## 🔒 1. SEGURIDAD - 🔴 CRÍTICO

### 1.1 NO HAY AUTENTICACIÓN NI AUTORIZACIÓN

**Severidad**: 🔴 **BLOQUEANTE**

**Ubicación**: Todas las rutas API (`/api/**`)

**Problema**:
- **CUALQUIERA** puede leer, crear, modificar o eliminar datos
- No hay validación de identidad en ninguna API
- No hay control de acceso a datos sensibles

**Ejemplo concreto**:
```javascript
// app/api/individuals/route.js:25
export async function POST(request) {
  const data = await request.json()
  // ❌ NO HAY VERIFICACIÓN DE QUIÉN ES EL USUARIO
  const profile = await createIndividualProfile(data)
  return NextResponse.json({ data: profile })
}
```

**Impacto real**:
- Un atacante puede crear perfiles falsos masivamente
- Puede leer diagnósticos médicos de usuarios (GDPR violation)
- Puede modificar datos de terceros
- Puede robar toda la base de datos

**Solución requerida**:
1. Implementar NextAuth.js o Clerk para autenticación
2. Agregar middleware de autorización en todas las rutas API
3. Implementar RBAC (Role-Based Access Control)

**Prioridad**: 🔴 **DEBE RESOLVERSE ANTES DE CUALQUIER DESPLIEGUE**

---

### 1.2 NO HAY RATE LIMITING

**Severidad**: 🔴 **ALTA**

**Ubicación**: Todas las rutas API

**Problema**:
- Sin límite de peticiones por IP/usuario
- Vulnerable a ataques DDoS
- Costos de API (OpenAI) sin límite

**Solución requerida**:
```javascript
// Agregar rate limiting con @upstash/ratelimit o similar
import { Ratelimit } from '@upstash/ratelimit'
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})
```

**Prioridad**: 🔴 **ALTA**

---

### 1.3 EXPOSICIÓN DE ERRORES INTERNOS

**Severidad**: 🟡 **MEDIA**

**Ubicación**: `app/api/forms/route.js:151`

**Problema**:
```javascript
// ❌ MAL: Expone detalles internos en producción
return NextResponse.json(
  { error: 'Internal server error' },
  { status: 500 }
)
```

**Solución**:
```javascript
// ✅ BIEN: Error genérico en producción
if (process.env.NODE_ENV === 'production') {
  return NextResponse.json({ error: 'Server error' }, { status: 500 })
} else {
  return NextResponse.json({ error: error.message }, { status: 500 })
}
```

**Prioridad**: 🟡 **MEDIA**

---

### 1.4 NO HAY SANITIZACIÓN DE INPUTS

**Severidad**: 🔴 **ALTA**

**Ubicación**: `app/api/forms/route.js`, `app/api/individuals/route.js`, `app/api/companies/route.js`

**Problema**:
- Los datos del usuario se guardan directamente sin sanitización
- Vulnerable a XSS si se renderizan en el cliente
- Vulnerable a NoSQL injection si se migra a DB

**Ejemplo vulnerable**:
```javascript
// app/api/forms/route.js:54
normalized.firstName = formData.firstName?.trim()
// ❌ NO sanitiza HTML, scripts, o caracteres especiales
```

**Solución requerida**:
```javascript
import DOMPurify from 'isomorphic-dompurify'

normalized.firstName = DOMPurify.sanitize(
  formData.firstName?.trim(),
  { ALLOWED_TAGS: [] } // Solo texto plano
)
```

**Prioridad**: 🔴 **ALTA**

---

### 1.5 DATOS SENSIBLES EN TEXTO PLANO

**Severidad**: 🔴 **BLOQUEANTE (GDPR/HIPAA violation)**

**Ubicación**: `data/` directory, `app/lib/storage.js`

**Problema**:
- Diagnósticos médicos (ADHD, autismo, etc.) almacenados sin encriptación
- Archivos JSON legibles por cualquiera con acceso al servidor
- Viola GDPR Art. 32 (seguridad de procesamiento)
- Viola HIPAA (si aplica en jurisdicción del usuario)

**Ejemplo vulnerable**:
```json
// data/users/individuals/user123.json
{
  "profile": {
    "diagnoses": ["ADHD", "Autism Level 1"],  // ❌ TEXTO PLANO
    "medicalHistory": "..."  // ❌ TEXTO PLANO
  }
}
```

**Solución requerida**:
1. Encriptar campos sensibles con `crypto` module
2. Usar key management service (KMS)
3. Implementar audit logs de acceso

**Prioridad**: 🔴 **BLOQUEANTE**

---

### 1.6 NO HAY ARCHIVO .env

**Severidad**: 🟡 **MEDIA**

**Ubicación**: Raíz del proyecto

**Problema**:
- El README.md menciona `.env.local` pero no existe
- No hay template `.env.example`
- OpenAI API key expuesta si alguien sigue el README

**Solución**:
1. Crear `.env.example` con placeholders
2. Agregar `.env*` al `.gitignore` (verificar que esté)
3. Documentar variables requeridas

**Prioridad**: 🟡 **MEDIA**

---

### 1.7 NO HAY VALIDACIÓN DE TIPOS

**Severidad**: 🟡 **MEDIA**

**Ubicación**: Todas las APIs

**Problema**:
- No se valida que los datos sean del tipo esperado
- Puede causar crashes o comportamiento inesperado

**Solución**:
```javascript
import { z } from 'zod'

const IndividualSchema = z.object({
  email: z.string().email(),
  profile: z.object({
    name: z.string().min(2).max(100),
    diagnoses: z.array(z.string()).optional()
  })
})
```

**Prioridad**: 🟡 **MEDIA**

---

## 🧪 2. TESTS - 🔴 CRÍTICO

### 2.1 0 TESTS ESCRITOS

**Severidad**: 🔴 **BLOQUEANTE**

**Ubicación**: Todo el proyecto

**Problema**:
- **Agent.md línea 94**: "TDD = Defines lo que debe hacer ANTES de hacerlo"
- **Agent.md línea 136**: "🚫 CÓDIGO SIN TESTS = CÓDIGO QUE NO EXISTE"
- El proyecto tiene 0 tests a pesar de tener Vitest configurado
- TDD completamente ignorado

**Estadísticas**:
```bash
$ grep -r "\.test\." app/
# 0 resultados (solo en node_modules)

$ grep -r "\.spec\." app/
# 0 resultados
```

**Impacto**:
- No se puede verificar que el código funciona
- Refactorings son peligrosos
- No hay red de seguridad para cambios
- Viola principio #2 del Agent.md

**Tests requeridos (mínimo)**:
```
✅ app/lib/storage.test.js        → CRUD operations
✅ app/lib/individuals.test.js    → Profile creation/validation
✅ app/lib/companies.test.js      → Company creation
✅ app/lib/matching.test.js       → Matching algorithm
✅ app/lib/consent.test.js        → GDPR consent flows
✅ app/api/forms/route.test.js    → Form submission
✅ app/api/chat/route.test.js     → Chat responses
✅ app/api/individuals/[userId]/privacy/route.test.js  → Privacy settings
```

**Prioridad**: 🔴 **BLOQUEANTE** - Sin tests, no hay garantía de calidad

---

### 2.2 ARCHIVO setup.js NO EXISTE

**Severidad**: 🟡 **MEDIA**

**Ubicación**: `tests/setup.js` (referenciado en `vitest.config.js:10`)

**Problema**:
```javascript
// vitest.config.js:10
setupFiles: ['./tests/setup.js'],  // ❌ ESTE ARCHIVO NO EXISTE
```

**Impacto**:
- Los tests fallarán al ejecutarse
- No hay configuración de testing-library
- No hay mocks globales

**Solución**:
```javascript
// tests/setup.js
import '@testing-library/jest-dom'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})
```

**Prioridad**: 🟡 **MEDIA** (pero necesario para tests)

---

### 2.3 SIN COBERTURA DE CÓDIGO

**Severidad**: 🟡 **MEDIA**

**Problema**:
- No hay baseline de cobertura
- No hay gate de CI/CD para cobertura mínima

**Solución**:
```javascript
// vitest.config.js
coverage: {
  provider: 'v8',
  lines: 80,      // Mínimo 80% líneas
  functions: 80,  // Mínimo 80% funciones
  branches: 75,   // Mínimo 75% branches
  statements: 80  // Mínimo 80% statements
}
```

**Prioridad**: 🟡 **MEDIA**

---

## 🏗️ 3. ARQUITECTURA - 🟡 MEDIO

### 3.1 RACE CONDITIONS EN STORAGE

**Severidad**: 🟡 **MEDIA**

**Ubicación**: `app/lib/storage.js:44-64`

**Problema**:
```javascript
// storage.js:44
export async function saveToFile(filePath, data) {
  // ❌ Si dos requests escriben el mismo archivo simultáneamente:
  // 1. Request A escribe temp file
  // 2. Request B escribe temp file (sobreescribe A)
  // 3. Request A hace rename (pierde datos de B)
  // 4. Request B hace rename (sobrevive B, pero A se perdió)

  const tempPath = `${fullPath}.tmp`
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8')
  await fs.rename(tempPath, fullPath)
}
```

**Solución**:
```javascript
import { readFile, writeFile, rename } from 'fs/promises'
import { randomBytes } from 'crypto'

export async function saveToFile(filePath, data) {
  const fullPath = path.join(DATA_DIR, filePath)
  const dir = path.dirname(fullPath)

  await ensureDirectory(dir)

  // Usar temp file único por request
  const tempPath = `${fullPath}.tmp.${randomBytes(8).toString('hex')}`

  try {
    await writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8')
    await rename(tempPath, fullPath)
  } catch (error) {
    await unlink(tempPath).catch(() => {})
    throw error
  }
}
```

**Prioridad**: 🟡 **MEDIA** (pero puede causar pérdida de datos)

---

### 3.2 NO HAY TRANSACCIONES

**Severidad**: 🟡 **MEDIA**

**Ubicación**: `app/lib/*.js`

**Problema**:
- Operaciones multi-archivo no son atómicas
- Si falla una escritura, las anteriores persisten (estado inconsistente)

**Ejemplo vulnerable**:
```javascript
// Si esto falla a mitad, el user existe pero no su privacy settings
await saveToFile(getUserFilePath('individual', userId), profile)
await saveToFile(`users/individuals/${userId}/privacy.json`, privacySettings)
// ❌ Si la segunda falla, el estado es inconsistente
```

**Solución**:
Implementar patrón Write-Ahead Log (WAL) o usar DB con transacciones

**Prioridad**: 🟡 **MEDIA**

---

### 3.3 NO HAY ÍNDICES NI BÚSQUEDA EFICIENTE

**Severidad**: 🟡 **MEDIA**

**Ubicación**: `app/lib/storage.js:159-162`

**Problema**:
```javascript
// storage.js:159
export async function findByField(dirPath, field, value) {
  const allData = await readAllFromDirectory(dirPath)  // ❌ Lee TODOS los archivos
  return allData.find(item => item[field] === value) || null
}
```

**Impacto**:
- Con 10,000 usuarios, buscar por email lee 10,000 archivos
- O(n) en lugar de O(1)
- No escala

**Solución**:
Implementar índices secundarios:
```javascript
// data/indexes/users_by_email.json
{
  "user@example.com": "users/individuals/user123.json"
}
```

**Prioridad**: 🟡 **MEDIA** (pero se volverá crítico con escala)

---

### 3.4 DRAFT MODE SIN TESTS

**Severidad**: 🟡 **MEDIA**

**Ubicación**: `app/lib/draft-manager.js`

**Problema**:
- El modo DRAFT está implementado pero sin tests
- Viola Agent.md: "DRAFT = en desarrollo, con tests funcionando"

**Solución**:
Escribir tests para draft-manager.js antes de usar en producción

**Prioridad**: 🟡 **MEDIA**

---

## ⚡ 4. FUNCIONALIDAD - 🟡 MEDIO

### 4.1 CHAT API NO USA OPENAI

**Severidad**: 🟡 **MEDIA**

**Ubicación**: `app/api/chat/route.js:10`

**Problema**:
```javascript
// route.js:10
export async function POST(request) {
  // ❌ Usa reglas hardcodeadas, NO OpenAI
  if (lowerPrompt.includes('juego')) {
    response = "¡Excelente pregunta! Tenemos 11 juegos..."
  }
}
```

**README.md promete**:
```markdown
- OpenAI API integration for validation, normalization, and responses
- Context-aware chat with user data and platform activity
```

**Impacto**:
- Promesa incumplida en documentación
- Chat no es "inteligente", solo keywords

**Solución**:
```javascript
import OpenAI from 'openai'
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [
    { role: 'system', content: 'Eres NeuroDialect...' },
    { role: 'user', content: prompt }
  ]
})
```

**Prioridad**: 🟡 **MEDIA** (funciona, pero no como se documenta)

---

### 4.2 FORMS API NO USA OPENAI

**Severidad**: 🟡 **MEDIA**

**Ubicación**: `app/api/forms/route.js:42`

**Problema**:
- README promete "AI validation"
- Validación es manual con regex

**Prioridad**: 🟡 **MEDIA**

---

### 4.3 RUTAS API INCOMPLETAS

**Severidad**: 🟢 **BAJA**

**Problema**:
- Muchas rutas existen pero no están completamente implementadas
- Endpoints GET faltantes para resources

**Prioridad**: 🟢 **BAJA** (no crítico, pero mejorable)

---

## 📊 Resumen de Prioridades

### 🔴 BLOQUEANTES (Resolver antes de cualquier despliegue)
1. [x] [1.1] Implementar autenticación y autorización (NextAuth v5 Complete)
2. [x] [1.5] Encriptar datos sensibles (AES-256 Validado)
3. [x] [2.1] Escribir tests básicos (Auth, Security, Storage, Integration OK)

### 🔴 CRÍTICAS (Resolver en sprint actual)
4. [x] [1.2] Implementar rate limiting (Middleware Active)
5. [x] [1.4] Sanitizar todos los inputs (DOMPurify System-wide)
6. [ ] [3.1] Resolver race conditions en storage (Parcial via Atomic Writes, pendiente revisión profunda)

### 🟡 IMPORTANTES (Resolver en próximos 2 sprints)
7. [ ] [1.3] Ocultar errores internos en producción
8. [ ] [1.6] Crear .env.example y documentar
9. [ ] [1.7] Validar tipos con Zod
10. [x] [2.2] Crear tests/setup.js (Configurado Vitest)
11. [ ] [3.2] Implementar transacciones o WAL
12. [ ] [3.4] Tests para draft-manager

### 🟢 MEJORAS (Backlog)
13. [3.3] Implementar índices para búsquedas
14. [4.1] Integrar OpenAI en chat API
15. [4.2] Integrar OpenAI en forms validation

---

## 🎯 Plan de Acción Recomendado

### Sprint 1 (Semana 1-2): SEGURIDAD
```
Día 1-2:  Implementar NextAuth.js
Día 3-4:  Agregar middleware de autorización
Día 5:    Implementar rate limiting
Día 6-7:  Encriptar datos sensibles
Día 8-10: Tests de seguridad
```

### Sprint 2 (Semana 3-4): TESTS
```
Día 1-2:  Setup de testing (setup.js, utils)
Día 3-5:  Tests de storage y libs
Día 6-8:  Tests de API routes
Día 9-10: Tests de components
```

### Sprint 3 (Semana 5-6): ARQUITECTURA
```
Día 1-3:  Resolver race conditions
Día 4-6:  Implementar transacciones
Día 7-10: Refactoring con tests como red de seguridad
```

---

## 📚 Referencias

- **Agent.md líneas 24-31**: Jerarquía de prioridades
- **Agent.md líneas 94-136**: Metodología TDD
- **Agent.md líneas 220-240**: Principios de seguridad
- **OWASP Top 10 2021**: https://owasp.org/Top10/
- **GDPR Art. 32**: Seguridad del procesamiento

---

**Conclusión**: Este proyecto tiene una base sólida de funcionalidad, pero **NO ESTÁ LISTO PARA PRODUCCIÓN** debido a vulnerabilidades críticas de seguridad y ausencia total de tests. Se requieren mínimo 4-6 semanas de trabajo enfocado en seguridad y testing antes de considerar un despliegue.

**Siguiente paso recomendado**: Comenzar con [1.1] Autenticación, ya que bloquea el despliegue y es prerequisito para otros fixes de seguridad.
