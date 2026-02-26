# Arquitectura de Deployment — DiversIA Eternals

**Última actualización:** 26 de febrero de 2026
**Estado:** Producción activa

---

## Resumen de infraestructura

```
┌─────────────────────────────────────────────────────────────┐
│                        USUARIO                               │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     VERCEL (CDN/Edge)                        │
│  • Next.js 15 App Router                                     │
│  • API Routes (SSR)                                          │
│  • NextAuth (JWT sessions)                                   │
│  • Dominio: [tu-dominio].vercel.app                          │
└──────────────────┬────────────────────┬─────────────────────┘
                   │                    │
        PostgreSQL │          Ollama    │
           TCP     │          HTTP      │
                   ▼                    ▼
┌──────────────────────────────────────────────────────────────┐
│              VPS Hostinger — París, Francia                   │
│              Panel: Dokploy (Docker Compose)                  │
│                                                               │
│  ┌─────────────────────┐   ┌──────────────────────────────┐  │
│  │   diversia-db       │   │   diversia-ollama            │  │
│  │   PostgreSQL 16     │   │   Ollama + Llama 3.2 3B      │  │
│  │   Puerto: 5432      │   │   Puerto: 11434              │  │
│  │   8 GB RAM          │   │   ~2 GB RAM (modelo)         │  │
│  └─────────────────────┘   └──────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## Variables de entorno en Vercel

Configurar en: Vercel Dashboard → Project → Settings → Environment Variables

| Variable | Entorno | Descripción |
|----------|---------|-------------|
| `DATABASE_URL` | Production | `postgresql://USER:PASS@YOUR_VPS_IP:5432/diversia` |
| `NEXTAUTH_SECRET` | Production | 64 caracteres hex: `openssl rand -hex 32` |
| `NEXTAUTH_URL` | Production | `https://tu-dominio.vercel.app` |
| `ENCRYPTION_KEY` | Production | 64 caracteres hex (AES-256-GCM para datos médicos) |
| `OLLAMA_HOST` | Production | `http://YOUR_VPS_IP:11434` |
| `OLLAMA_MODEL` | Production | `llama3.2:3b` |

> **GDPR**: `DATABASE_URL` y `OLLAMA_HOST` apuntan al VPS en París (Francia, UE).
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

---

## Checklist de deploy a producción

### Primera vez (setup inicial)

```bash
# 1. Clonar repositorio en Vercel
#    → Conectar GitHub repo en vercel.com/new

# 2. Configurar variables de entorno (ver tabla arriba)

# 3. Aplicar migraciones en la DB de producción
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# 4. Verificar Ollama corriendo en VPS
curl http://YOUR_VPS_IP:11434/api/health
# Respuesta esperada: {"status":"ok"}

# 5. Si Llama 3.2 3B no está descargado:
# (En el VPS, dentro del contenedor diversia-ollama)
docker exec -it diversia-ollama ollama pull llama3.2:3b
```

### Cada deploy (automático en Vercel)

Vercel detecta push a `main` y despliega automáticamente. No se requiere acción manual.

```bash
# Antes de mergear a main, verificar que los tests pasan:
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
# Configurar SENTRY_DSN en variables de entorno de Vercel
# Añadir sentry.client.config.ts y sentry.server.config.ts

# Vercel Analytics (tráfico y performance)
npm install @vercel/analytics
# En app/layout.tsx: import { Analytics } from '@vercel/analytics/react'
# <Analytics /> en el layout
```

### Branch protection (PENDIENTE)

En Gitea (Settings → Branches):
- Proteger `main`: require PR + 1 review
- Status checks requeridos: test (vitest) + build

---

## Troubleshooting común

| Problema | Causa probable | Solución |
|----------|---------------|----------|
| `Prisma: Can't reach database server` | IP del VPS no en whitelist o DB caída | Verificar VPS corriendo, revisar firewall |
| `Ollama connection refused` | Contenedor diversia-ollama caído | `docker start diversia-ollama` en VPS |
| `NEXTAUTH_SECRET not set` | Variable de entorno faltante | Añadir en Vercel Dashboard |
| Build falla con TS errors | `typescript.ignoreBuildErrors: false` | Revisar errores en `npx tsc --noEmit` |
| Tests E2E fallan en CI | Servidor no arrancado | Verificar `webServer` config en playwright.config.ts |

---

**Creado:** 26 de febrero de 2026
**Siguiente revisión:** Después de implementar backup + monitoring
