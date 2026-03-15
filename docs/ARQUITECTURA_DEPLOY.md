# Arquitectura de Deployment — DiversIA Eternals

**Última actualización:** 15 de marzo de 2026
**Estado:** Producción activa en VPS

---

## Resumen de infraestructura

```
┌─────────────────────────────────────────────────────────────┐
│                        USUARIO                               │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              VPS Hostinger — París, Francia                   │
│              Panel: Dokploy (Docker Compose)                  │
│                                                               │
│  ┌─────────────────────┐   ┌──────────────────────────────┐  │
│  │   Next.js 15 App    │   │   diversia-ollama            │  │
│  │   App Router (SSR)  │   │   Ollama + Llama 3.2 3B      │  │
│  │   NextAuth (JWT)    │   │   Puerto: 11434              │  │
│  │   Puerto: 3000      │   │   ~2 GB RAM (modelo)         │  │
│  └─────────┬───────────┘   └──────────────────────────────┘  │
│            │                                                  │
│            │ PostgreSQL TCP                                   │
│            ▼                                                  │
│  ┌─────────────────────┐                                     │
│  │   diversia-db       │                                     │
│  │   PostgreSQL 16     │                                     │
│  │   Puerto: 5432      │                                     │
│  │   8 GB RAM          │                                     │
│  └─────────────────────┘                                     │
└──────────────────────────────────────────────────────────────┘
```

---

## Variables de entorno en el VPS

Configurar en: Dokploy → Servicio Next.js → Environment Variables

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | `postgresql://USER:PASS@diversia-db:5432/diversia` |
| `NEXTAUTH_SECRET` | 64 caracteres hex: `openssl rand -hex 32` |
| `NEXTAUTH_URL` | URL pública del dominio (ej. `https://app.diversia.click`) |
| `ENCRYPTION_KEY` | 64 caracteres hex (AES-256-GCM para datos médicos) |
| `OLLAMA_HOST` | `http://diversia-ollama:11434` (red interna Docker) |
| `OLLAMA_MODEL` | `llama3.2:3b` |

> **GDPR**: Todos los servicios corren en el mismo VPS en París (Francia, UE).
> Los datos nunca salen del territorio europeo (Art. 44 GDPR).

---

## Sprints completados — Resumen técnico

### Sprint 1 (Enero 2026) — Fundaciones
- Migración completa JSON → PostgreSQL (Prisma 7, PostgreSQL 16)
- Eliminación de `app/lib/storage.js` (13KB)
- Next.js actualizado a 15.5.12 (CVE-2026-23864)
- Vitest configurado con mocks de Prisma

### Sprint 2 (Febrero 2026) — Datos y Schema
- Schema Prisma expandido: Individual, Company, Therapist, Job, Connection, Matching
- 5 migraciones aplicadas en producción
- `seed.ts` reescrito con datos de prueba reales
- API routes migradas de `storage.js` a Prisma

### Sprint 3 (22 Feb 2026) — Arquitectura
- Service Layer: `app/lib/services/` (lógica de negocio pura)
- Repository Layer: `app/lib/repositories/` (acceso a datos con Prisma)
- `CompanyRepo`, `IndividualRepo`, `TherapistRepo` (Issue #25)

### Sprint 4 (25 Feb 2026) — LLM + GDPR Compliance
- `llm.service.ts`: Ollama → Llama 3.2 3B, 3 prompts especializados, rate limiting, TTL cache
- GDPR completo: `DELETE /api/individuals/:id/gdpr/delete`, `GET /gdpr/export`, `GET /consents`
- Endpoints GDPR con auth + ownership verification (Issue #26)

### Sprint 5 (26 Feb 2026) — Seguridad + E2E
- 7 vulnerabilidades Broken Access Control corregidas (dashboard, matching, consent)
- CSP + HSTS añadidos en middleware.js
- Playwright E2E: 5 suites, 25+ tests (Issue #27)

### Sprint 6 (Marzo 2026) — Migración a VPS
- Migración completa de Vercel a VPS Hostinger (París)
- Eliminación de dependencias Vercel (@vercel/speed-insights)
- Todos los servicios (app + DB + Ollama) en la misma red Docker

---

## Checklist de deploy a producción

### Primera vez (setup inicial)

```bash
# 1. Configurar servicios en Dokploy (Docker Compose)

# 2. Configurar variables de entorno (ver tabla arriba)

# 3. Aplicar migraciones en la DB de producción
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# 4. Verificar Ollama corriendo
curl http://localhost:11434/api/health
# Respuesta esperada: {"status":"ok"}

# 5. Si Llama 3.2 3B no está descargado:
docker exec -it diversia-ollama ollama pull llama3.2:3b
```

### Cada deploy

```bash
# Antes de desplegar, verificar que los tests pasan:
npm test              # Vitest (unit tests)
npm run test:e2e:public  # Playwright (tests públicos, sin DB)
npm run build         # Build de Next.js
```

---

## Checklist de operaciones pendientes

### Backup automatizado (PENDIENTE)

```bash
# Script a ejecutar en cron en el VPS (cada noche a las 3:00 AM):
# /opt/scripts/backup-postgres.sh

#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="/tmp/diversia_${TIMESTAMP}.sql.gz"

# Dump comprimido
docker exec diversia-db pg_dump -U postgres diversia | gzip > "$BACKUP_FILE"

# Subir a S3/Backblaze (requiere aws CLI configurado)
aws s3 cp "$BACKUP_FILE" s3://diversia-backups/postgres/

# Limpiar backups locales > 7 días
find /tmp -name "diversia_*.sql.gz" -mtime +7 -delete

# Cron (crontab -e en el VPS):
# 0 3 * * * /opt/scripts/backup-postgres.sh >> /var/log/diversia-backup.log 2>&1
```

### Monitoring (PENDIENTE)

```bash
# Sentry (errores en frontend + API)
npm install @sentry/nextjs
# Configurar SENTRY_DSN en variables de entorno
# Añadir sentry.client.config.ts y sentry.server.config.ts
```

### Branch protection (PENDIENTE)

En GitHub (Settings → Branches):
- Proteger `main`: require PR + 1 review
- Status checks requeridos: test (vitest) + build

---

## Troubleshooting común

| Problema | Causa probable | Solución |
|----------|---------------|----------|
| `Prisma: Can't reach database server` | DB caída o red Docker mal configurada | `docker start diversia-db`, verificar red |
| `Ollama connection refused` | Contenedor diversia-ollama caído | `docker start diversia-ollama` en VPS |
| `NEXTAUTH_SECRET not set` | Variable de entorno faltante | Añadir en Dokploy |
| Build falla con TS errors | `typescript.ignoreBuildErrors: false` | Revisar errores en `npx tsc --noEmit` |
| Tests E2E fallan en CI | Servidor no arrancado | Verificar `webServer` config en playwright.config.ts |

---

**Creado:** 26 de febrero de 2026
**Actualizado:** 15 de marzo de 2026 — Migración completa a VPS, eliminación de Vercel
**Siguiente revisión:** Después de implementar backup + monitoring
