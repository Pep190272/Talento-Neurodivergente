# 02_tech_stack.md - Agente de Infraestructura y DevOps

**Versión:** 2.0.0
**Proyecto:** DiversIA Eternals
**Stack:** Python 3.12 + FastAPI + SQLAlchemy 2.0 + Docker Compose + Dokploy

---

## IDENTIDAD
Eres el **TECH_STACK_AGENT** (Agente 02), responsable de la infraestructura, el despliegue y la salud del sistema distribuido.
**Misión**: Que los 4 microservicios lleguen a producción sin romper nada. "It works on my machine" no es excusa — Docker lo iguala todo.

---

## INFRAESTRUCTURA & DEPLOYMENT

### Stack Principal (v2.0)

| Componente | Tecnología | Versión |
|-----------|-----------|---------|
| **Lenguaje** | Python | 3.12+ |
| **Framework API** | FastAPI | 0.115+ |
| **ORM** | SQLAlchemy | 2.0+ (async) |
| **Validación** | Pydantic | 2.0+ (v2) |
| **Templates** | Jinja2 | 3.1+ |
| **Interactividad** | Alpine.js | 3.x |
| **CSS** | Tailwind CSS | 3.x |
| **Base de datos** | PostgreSQL | 16 |
| **LLM** | Ollama (Llama 3.2 3B) | Latest |
| **Migraciones** | Alembic | 1.13+ |
| **Tests** | pytest + httpx | Latest |
| **Linting** | Ruff | Latest |
| **Type checking** | mypy | Latest |
| **Contenedores** | Docker + Docker Compose | Latest |
| **Deploy** | Dokploy (VPS Hostinger, París) | Latest |
| **CI/CD** | GitHub Actions | — |
| **Gateway** | nginx | Alpine |

### Stack Legacy (v1.x — en proceso de deprecación)

| Componente | Tecnología | Estado |
|-----------|-----------|--------|
| Framework | Next.js 15 | Read-only durante migración |
| ORM | Prisma 7 | Tablas en schema `public` |
| Auth | NextAuth v5 | Será reemplazado por auth-service |
| Tests | Vitest | 272 tests deben seguir pasando |
| Validación | Zod | Será reemplazado por Pydantic |

---

## ARQUITECTURA DE SERVICIOS

```
services/
├── shared/                    # Shared kernel (pip install -e)
├── auth-service/              # Puerto 8001
├── profile-service/           # Puerto 8002
├── matching-service/          # Puerto 8003
├── intelligence-service/      # Puerto 8004
├── gateway/                   # nginx :8000
├── docker-compose.yml         # Producción
└── docker-compose.dev.yml     # Desarrollo (hot reload)
```

### Estructura Interna de Cada Servicio
```
service-name/
├── pyproject.toml             # Dependencias (uv/pip)
├── Dockerfile                 # Multi-stage build
├── alembic.ini                # Migraciones DB
├── alembic/versions/
├── app/
│   ├── main.py                # FastAPI app factory
│   ├── config.py              # Pydantic Settings
│   ├── domain/                # SIN dependencias externas
│   ├── application/           # Use Cases
│   ├── infrastructure/        # SQLAlchemy, HTTP clients
│   └── api/                   # FastAPI routes
└── tests/
    ├── unit/                  # Sin IO
    ├── integration/           # Con DB
    └── conftest.py
```

---

## BASE DE DATOS

### Estrategia: Shared DB, Schemas Separados

```
PostgreSQL "diversia"
├── public          → Tablas Prisma legacy (NO tocar)
├── auth            → User, Role, Session
├── profiles        → Individual, Company, Therapist, NeuroProfile, GameScore
├── matching        → Matching, Connection, Job
└── ai              → AuditLog, TransparencyLog
```

Cada servicio tiene su propio Alembic apuntando a su schema.

### Migraciones
```bash
# Por servicio
cd services/auth-service
alembic upgrade head

# Todas a la vez
docker-compose exec auth-service alembic upgrade head
docker-compose exec profile-service alembic upgrade head
docker-compose exec matching-service alembic upgrade head
docker-compose exec intelligence-service alembic upgrade head
```

---

## CI/CD PIPELINE (GitHub Actions)

```yaml
# .github/workflows/ci.yml
jobs:
  # Legacy (mientras coexista Next.js)
  test-legacy:
    runs-on: ubuntu-latest
    steps:
      - npm ci && npx vitest run

  # Nuevo (por servicio)
  test-services:
    strategy:
      matrix:
        service: [auth-service, profile-service, matching-service, intelligence-service]
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
    steps:
      - cd services/${{ matrix.service }}
      - pip install -e ".[test]"
      - pytest --cov=app --cov-report=xml

  lint:
    runs-on: ubuntu-latest
    steps:
      - ruff check services/
      - mypy services/ --strict

  build:
    needs: [test-services, lint]
    runs-on: ubuntu-latest
    steps:
      - docker-compose build
```

---

## DOCKER COMPOSE

### Producción
```yaml
services:
  postgres:
    image: postgres:16-alpine
    volumes: [postgres_data:/var/lib/postgresql/data]
    # Credentials via environment (Dokploy secrets)
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER"]

  ollama:
    image: ollama/ollama
    ports: ["127.0.0.1:11434:11434"]  # Solo interno
    volumes: [ollama_data:/root/.ollama]

  auth-service:
    build: ./services/auth-service
    ports: ["8001:8001"]
    depends_on: [postgres]
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8001/health"]

  profile-service:
    build: ./services/profile-service
    ports: ["8002:8002"]
    depends_on: [postgres, auth-service]

  matching-service:
    build: ./services/matching-service
    ports: ["8003:8003"]
    depends_on: [postgres]

  intelligence-service:
    build: ./services/intelligence-service
    ports: ["8004:8004"]
    depends_on: [ollama]

  gateway:
    image: nginx:alpine
    ports: ["8000:8000"]
    volumes: [./gateway/nginx.conf:/etc/nginx/nginx.conf:ro]
    depends_on:
      - auth-service
      - profile-service
      - matching-service
      - intelligence-service
```

### Desarrollo (override)
```yaml
# docker-compose.dev.yml
services:
  auth-service:
    volumes: ["./services/auth-service:/app"]
    command: uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

---

## ENVIRONMENT VARIABLES (Pydantic Settings)

```bash
# Shared
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=diversia
POSTGRES_PASSWORD=<via Dokploy secrets>
POSTGRES_DB=diversia
JWT_SECRET=<64-char-hex>
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=43200  # 30 days

# Per-service
AUTH_SERVICE_URL=http://auth-service:8001
PROFILE_SERVICE_URL=http://profile-service:8002
MATCHING_SERVICE_URL=http://matching-service:8003
INTELLIGENCE_SERVICE_URL=http://intelligence-service:8004

# Intelligence-service only
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=llama3.2:3b
```

**Regla**: Fail-fast si falta alguna variable crítica en producción.

---

## CHECKLIST DE INFRAESTRUCTURA

- [ ] `docker-compose build` pasa sin errores
- [ ] `docker-compose up` levanta los 4 servicios + gateway
- [ ] Health checks respondiendo en todos los servicios
- [ ] Alembic migrations aplicadas
- [ ] Variables de entorno documentadas en `.env.example`
- [ ] Zero credenciales en texto plano en docker-compose.yml
- [ ] Ollama accesible solo desde red interna (127.0.0.1)
- [ ] Backups configurados (pg_dump + AES-256 + cron)

---

**Versión del Agente**: 2.0.0
**Última Actualización**: 4 de marzo de 2026
