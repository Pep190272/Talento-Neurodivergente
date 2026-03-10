# Despliegue VPS - DiversIA Microservicios

**Fecha original**: 24 de enero de 2026 (Ollama)
**Ultima actualizacion**: 10 de marzo de 2026 (microservicios completos)
**Servidor**: VPS Hostinger (Paris, Francia)
**URL**: https://app.diversia.click
**Tecnologias**: Dokploy, Docker Compose, Traefik, nginx, PostgreSQL 16, Ollama

---

## Especificaciones del VPS

| Caracteristica | Valor |
|----------------|-------|
| **Proveedor** | Hostinger |
| **CPU** | 2 cores |
| **RAM** | 8 GB |
| **Disco** | 100 GB SSD |
| **OS** | Ubuntu 24.04 LTS |
| **Panel** | Dokploy |
| **Ubicacion** | Paris, Francia (EU — GDPR compliant) |

---

## Arquitectura desplegada (10 Mar 2026)

```
Internet
    |
app.diversia.click (DNS)
    |
Traefik (Dokploy — auto SSL)
    |
dokploy-network
    |
nginx gateway (:8000)
    |
internal network (bridge)
    |
+----------+----------+----------+----------+----------+
|          |          |          |          |          |
auth     profile   matching  intelligence  db       ollama
:8001    :8002     :8003     :8004        :5432    :11434
```

### Redes Docker

| Red | Tipo | Servicios | Proposito |
|-----|------|-----------|-----------|
| `dokploy-network` | External | gateway | Traefik → nginx |
| `internal` | Bridge | todos | Comunicacion inter-servicio |

### Contenedores

| Contenedor | Imagen | Puerto | Health check |
|-----------|--------|--------|-------------|
| diversia-gateway | nginx:alpine | 8000 | — |
| diversia-auth | auth-service (custom) | 8001 | /health |
| diversia-profile | profile-service (custom) | 8002 | /health |
| diversia-matching | matching-service (custom) | 8003 | /health |
| diversia-intelligence | intelligence-service (custom) | 8004 | /health |
| diversia-db | postgres:16-alpine | 5432 | pg_isready |
| diversia-ollama | ollama/ollama:latest | 11434 | ollama list |

---

## Configuracion de Dokploy

### Compose Service

El deploy se gestiona via un **Compose service** en Dokploy:
- **Proyecto**: Diversia
- **Provider**: GitHub (rama `main`)
- **Compose path**: `services/docker-compose.prod.yml`
- **Dominio**: `app.diversia.click` apuntando al servicio gateway (:8000)

### Variables de entorno

Configuradas en Dokploy Environment:
```
POSTGRES_USER=<usuario>
POSTGRES_PASSWORD=<password>
POSTGRES_DB=diversia_db
JWT_SECRET=<secret>
```

### Dominio

- **Dominio**: `app.diversia.click`
- **SSL**: Automatico via Traefik/Let's Encrypt
- **Puerto interno**: 8000 (nginx gateway)

---

## Proceso de deploy

### Deploy inicial

1. Crear proyecto "Diversia" en Dokploy
2. Crear Compose service apuntando al repo GitHub
3. Configurar `docker-compose.prod.yml` como compose file
4. Configurar variables de entorno
5. Configurar dominio `app.diversia.click` → puerto 8000
6. Deploy

### Redeploy (actualizaciones)

1. Push a rama en GitHub
2. Merge PR a `main`
3. En Dokploy: click "Deploy" (o configurar auto-deploy en push)

---

## nginx Gateway

El gateway usa DNS dinamico de Docker para resolver servicios:

```nginx
resolver 127.0.0.11 valid=10s ipv6=off;

location /api/v1/auth/ {
    set $auth_upstream http://auth-service:8001;
    proxy_pass $auth_upstream;
}
```

Esto evita que nginx cachee IPs al arrancar y falle con 502 cuando Docker reasigna IPs.

### Security headers

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy` con `unsafe-inline` y `unsafe-eval` (Alpine.js)
- `Strict-Transport-Security` (HSTS)
- Rate limiting por zona (auth: 10r/s, api: 30r/s, ai: 5r/s)

---

## Troubleshooting

### 502 Bad Gateway

**Causa comun**: nginx cachea DNS al arrancar.
**Solucion**: Usar `resolver 127.0.0.11` + variables `set $upstream` en nginx.conf.

### 404 Traefik

**Causa comun**: gateway no esta en `dokploy-network`.
**Solucion**: Asegurar que gateway tiene `networks: [internal, dokploy-network]`.

### Servicios no se conectan entre si

**Causa comun**: red `default` no funciona con redes externas.
**Solucion**: Usar red `internal` nombrada explicitamente.

### Migraciones fallan al reiniciar

**Causa comun**: Alembic migraciones no son idempotentes.
**Solucion**: Usar `IF NOT EXISTS` en todas las operaciones DDL.

---

## Consumo de Recursos

| Servicio | RAM estimada |
|----------|-------------|
| PostgreSQL 16 | ~300 MB |
| 4 microservicios Python | ~400 MB total |
| nginx | ~10 MB |
| Ollama + Llama 3.2 3B | ~2.5 GB |
| Docker overhead | ~300 MB |
| Sistema Ubuntu | ~500 MB |
| **Total** | **~4 GB de 8 GB** |

**Margen disponible**: ~4 GB

---

## Seguridad

- LLM self-hosted (datos no salen de la UE)
- PostgreSQL solo accesible dentro de la red Docker
- Ollama solo accesible dentro de la red Docker (cambiado de publico a interno)
- SSL automatico en todas las rutas publicas
- Rate limiting en nginx gateway
- JWT con bcrypt para autenticacion
- Pydantic v2 para validacion de inputs

---

**Documentacion creada**: 24 de enero de 2026
**Ultima actualizacion**: 10 de marzo de 2026
**Autor**: GACE + Claude Opus 4.6
