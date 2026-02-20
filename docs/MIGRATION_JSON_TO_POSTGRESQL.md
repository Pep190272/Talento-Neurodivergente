# Migración JSON File Storage → PostgreSQL (Prisma 7)

**Fecha:** 2026-02-20
**Estado:** Completada (todos los módulos de negocio migrados)

## Contexto

DiversIA Eternals usaba un sistema de almacenamiento basado en archivos JSON (`app/lib/storage.js`) con lectura/escritura atómica y encriptación AES-256-GCM para datos sensibles. Este sistema presentaba:

- **O(n) scans**: Cada query requería leer todos los archivos de un directorio
- **Race conditions**: Escrituras concurrentes sin transacciones
- **Sin índices**: Búsquedas por campo requerían deserializar cada registro
- **No escalable**: Inaceptable con volumen real de usuarios

La migración a PostgreSQL vía Prisma 7 resuelve todos estos problemas manteniendo la misma API pública de cada módulo.

## Estado Pre-Migración

| Módulo | Storage | Estado |
|--------|---------|--------|
| `individuals.ts` | Prisma | Ya migrado |
| `companies.ts` | Prisma | Ya migrado |
| `audit.ts` | Prisma | Ya migrado |
| `therapists.js` | `storage.js` (JSON) | **Pendiente** |
| `matching.js` | `storage.js` (JSON) | **Pendiente** |
| `consent.js` | `storage.js` (JSON) | **Pendiente** |
| `dashboards.js` | Mixto (ambas capas) | **Pendiente** |

## Estado Post-Migración

| Módulo | Storage | Archivo |
|--------|---------|---------|
| `individuals.ts` | Prisma | Sin cambios |
| `companies.ts` | Prisma | Sin cambios |
| `audit.ts` | Prisma | Sin cambios |
| `therapists.ts` | **Prisma** | Nuevo (reemplaza `.js`) |
| `matching.ts` | **Prisma** | Nuevo (reemplaza `.js`) |
| `consent.ts` | **Prisma** | Nuevo (reemplaza `.js`) |
| `dashboards.ts` | **Prisma** | Nuevo (reemplaza `.js`) |

## Cambios Realizados

### 1. Expansión del Schema Prisma

**Migración:** `20260220100000_expand_therapist_connection_matching`

#### Modelo `Therapist` (de 3 campos a 25+)
- Añadidos: `specializations`, `certifications`, `certificationValidation`, `neurodiversityExperience`, `experienceYears`, `approach`, `services`, `languages`, `location`, `bio`, `acceptingNewClients`
- Añadidos: `clients[]`, `companyPartners[]`, `companyContracts`, `pendingRequests`
- Añadidos: `maxClients`, `currentClients` (capacidad)
- Añadidos: `verificationStatus`, `verifiedAt`, `verifiedBy`, `verificationNotes`, `rejectionReason`, `rejectedAt`
- Añadidos: `badges[]`, `warnings`, `metadata`
- Añadido índice: `verificationStatus`

#### Modelo `Connection` (de 4 campos a 12+)
- Añadidos: `matchId`, `jobId` (referencia al origen)
- Añadidos: `customPrivacy`, `consentGivenAt`, `revokedAt`, `revokedReason` (GDPR consent)
- Añadido: `pipelineStage` (pipeline de contratación)
- Añadido: `metadata` (tracking de interacciones)
- Añadidos índices: `individualId`, `companyId`, `status`

#### Modelo `Matching` (campos de consent/expiración)
- Añadido: `companyId` (desnormalizado para queries)
- Añadidos: `expiresAt`, `expiredAt`, `acceptedAt`, `rejectedAt`
- Añadidos: `rejectionReason`, `reasonPrivate` (GDPR: nunca visible a empresa)
- Añadido: `candidateData` JSON (snapshot anonimizado para audit trail)
- Añadidos: `connectionId`, `candidateNotified`, `companyCanView`
- Añadido índice: `companyId`

### 2. Migración de Módulos

#### `therapists.js` → `therapists.ts`
- `findUserByEmail()` → `prisma.user.findUnique()`
- `saveToFile()` → `prisma.$transaction(user.create + therapist.create)`
- `readFromFile()` → `prisma.therapist.findUnique({ include: user })`
- `updateFile()` → `prisma.therapist.update()`
- `readAllFromDirectory()` → `prisma.therapist.findMany({ where: {...} })`
- Cross-calls a `individuals.ts` se mantienen (addTherapistToIndividual/removeTherapistFromIndividual)
- Función `normalizeTherapist()` mapea Prisma row → `TherapistProfile` (mismo shape que JSON)

#### `matching.js` → `matching.ts`
- `saveToFile(matchFilePath)` → `prisma.matching.create()`
- `readFromFile(matchFilePath)` → `prisma.matching.findUnique()`
- `getMatchesForJob()` (O(n) scan) → `prisma.matching.findMany({ where: { jobId } })` (indexed)
- `getMatchesForCandidate()` (O(n) scan) → `prisma.matching.findMany({ where: { individualId } })` (indexed)
- `findAll('matches', predicate)` → `prisma.matching.findMany({ where: ... })`
- `updateFile()` → `prisma.matching.update()`
- `processExpiredMatches()`: de O(n) scan → query indexada `WHERE status = 'PENDING' AND expiresAt < now()`
- `invalidateMatchesForJob/Candidate()`: de loop + file updates → `prisma.matching.updateMany()`
- Status mapping: `pending` ↔ `PENDING`, `accepted` ↔ `APPROVED`, `rejected` ↔ `REJECTED`, `expired` ↔ `WITHDRAWN`

#### `consent.js` → `consent.ts`
- `saveToFile(connectionFilePath)` → `prisma.connection.create()`
- `readFromFile(connectionFilePath)` → `prisma.connection.findUnique()`
- `updateFile(matchFilePath)` → `prisma.matching.update()` (en transacción)
- `getConnectionsForUser()` (O(n) scan) → `prisma.connection.findMany({ where: ... })` (indexed)
- **Eliminado**: `updateFile(getUserFilePath('individual'))` — ya no se escriben `matches.*` ni `connections[]` embebidos en el Individual JSON. Las relaciones son queries a tablas separadas.
- `acceptMatch()` ahora usa `prisma.$transaction()` para crear Connection + actualizar Matching atómicamente

#### `dashboards.js` → `dashboards.ts`
- `getConnectionsForUser()` → `prisma.connection.findMany()`
- `getAuditLogsForUser()` → `audit.ts getUserAuditLog()` (Prisma)
- `readFromFile(getConnectionFilePath())` → `prisma.connection.findUnique()`
- **Bug fix**: `company.profile.name` → `company.name` (el bug existía porque `companies.ts` normaliza name como campo top-level, no bajo `.profile`)

### 3. API Routes Actualizadas

- `app/api/individuals/[userId]/route.js`: `storage.getConnectionsForUser` → `consent.getActiveConnection` (Prisma indexed query)

### 4. Archivos `.js` Legacy

Los archivos `.js` originales se mantienen en el repo pero ya **no son usados** en producción:
- `app/lib/therapists.js` → reemplazado por `therapists.ts`
- `app/lib/matching.js` → reemplazado por `matching.ts`
- `app/lib/consent.js` → reemplazado por `consent.ts`
- `app/lib/dashboards.js` → reemplazado por `dashboards.ts`
- `app/lib/storage.js` → ya no tiene consumidores en `app/`

Next.js/TypeScript resuelve `.ts` antes que `.js` cuando el import no tiene extensión.

## Decisiones Técnicas

### 1. JSON columns vs campos relacionales
Para datos semi-estructurados que no se consultan por WHERE (certifications, metadata, companyContracts), usamos columnas `Json` de PostgreSQL. Esto mantiene flexibilidad sin necesitar migraciones por cada cambio de shape.

### 2. `clients[]` como String array en Therapist
Aunque lo ideal sería una tabla intermedia, mantuvimos `clients: String[]` en Therapist para minimizar cambios en la lógica de negocio. El array contiene IDs de Individual y se usa para verificar relaciones terapéuticas. Es adecuado para MVP con < 100 clientes por terapeuta.

### 3. Status enum vs strings
- `Matching.status` usa el enum `MatchingStatus` de Prisma (PENDING, APPROVED, REJECTED, WITHDRAWN, CONTESTED)
- `Connection.status` se mantiene como `String` ("active", "revoked") por simplicidad
- Los módulos `.ts` mapean entre la representación interna (enum) y la API pública (strings)

### 4. No se eliminó `storage.js`
Se mantiene para referencia y porque algunos tests lo importan. Se puede eliminar en un sprint de limpieza dedicado.

## Migración Ejecutada (2026-02-20)

### PostgreSQL Local Setup

```bash
# PostgreSQL 16 nativo (no Docker)
pg_ctlcluster 16 main start

# Crear usuario y base de datos
sudo -u postgres psql -c "CREATE USER diversia_admin WITH PASSWORD 'diversia_pass' CREATEDB;"
sudo -u postgres psql -c "CREATE DATABASE diversia_db OWNER diversia_admin;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE diversia_db TO diversia_admin;"

# Aplicar migraciones
DATABASE_URL="postgresql://diversia_admin:diversia_pass@localhost:5432/diversia_db" npx prisma migrate deploy
```

### Resultado

Las 5 migraciones se aplicaron exitosamente:

| Migración | Estado |
|-----------|--------|
| `20260126163651_ecosystem_360_polymorphic_connections` | Aplicada |
| `20260220000000_eu_ai_act_compliance` | Aplicada |
| `20260220000001_expand_individual_profile` | Aplicada |
| `20260220000002_expand_company_job` | Aplicada |
| `20260220100000_expand_therapist_connection_matching` | Aplicada |

**Tablas creadas**: User, Individual, Company, Job, Therapist, Connection, Matching, AuditLog

### Verificación de Modelos Expandidos

- **Therapist**: 33 columnas + 2 índices (pkey, verificationStatus) + FK a User
- **Connection**: 17 columnas + 4 índices (pkey, individualId, companyId, status) + FKs
- **Matching**: 29 columnas + 6 índices (pkey, companyId, individualId, jobId, status, unique individualId+jobId) + FKs

## Pasos Pendientes

1. ~~**Ejecutar migración en PostgreSQL**~~: Completado (2026-02-20)
2. ~~**Actualizar seed.ts**~~: Completado (2026-02-20) — 4 users, 2 jobs, 3 matchings, 4 connections, 7 audit logs
3. **Actualizar tests**: Algunos tests en `tests/unit/actors/therapist.test.js` aún importan funciones del `.js`
4. **Eliminar archivos `.js` legacy**: Cuando los tests estén actualizados
5. **Migrar `app/api/forms/route.js`**: Aún usa `fs` directamente para `data/submissions.json`

### Cambios en seed.ts (Paso 2)

- **Fix Prisma 7**: `new PrismaClient()` → `new PrismaClient({ adapter: new PrismaPg({ connectionString }) })`
- **Fix upsert**: Añadido `include: { company: true }` etc. para obtener IDs de relaciones
- **Fix config**: Movido `seed` de `package.json` a `prisma.config.ts` (`migrations.seed`)
- **Datos expandidos**:
  - Therapist con 4 specializations, 2 certifications, verified status, 2 clients, 1 company partner
  - 2 candidatos con assessments completos, preferencias, experiencia laboral
  - 2 job postings con inclusivity analysis
  - 3 matchings (APPROVED con connection, PENDING, REJECTED con razón privada)
  - 4 connections (consulting, 2× therapy, job_match en pipeline underReview)
  - 7 audit logs (login, matching, review, consent, profile_viewed, therapist_access)
