# DiversIA Eternals

Plataforma de matching trilateral 24D para talento neurodivergente. Conecta candidatos neurodivergentes, empresas inclusivas y terapeutas/especialistas mediante un algoritmo de matching multidimensional potenciado por IA self-hosted.

## Stack Tecnologico

| Capa | Tecnologia | Version |
|------|-----------|---------|
| Backend | Python + FastAPI | 3.12 / 0.115+ |
| ORM | SQLAlchemy | 2.0 |
| Validacion | Pydantic | v2 |
| Base de datos | SQLite (desarrollo) | — |
| Tests | pytest | 9.0+ |
| LLM | Ollama + Llama 3.2 3B | Self-hosted EU |
| Frontend | Jinja2 + Alpine.js + Tailwind CSS (CDN) | — |
| Frontend (legacy) | Next.js 15 | Vercel, en deprecacion |

## Arquitectura

### Lo que funciona HOY (desarrollo local)

Solo se ejecuta **profile-service** en el puerto **:8002**:

```
  profile-service (:8002)     Ollama (:11434)
  ┌───────────────────────┐   ┌──────────────┐
  │ Frontend (14 paginas) │   │ Llama 3.2 3B │
  │ Auth proxy (SQLite)   │──▶│ Self-hosted   │
  │ Profiles, Quiz, Games │   └──────────────┘
  │ Jobs, Inclusivity     │
  │ Matching 24D          │
  └───────────┬───────────┘
              │
        SQLite (local)
```

### Servicios

| Servicio | Puerto | Estado | Tests |
|----------|--------|--------|-------|
| **profile-service** | :8002 | **Operativo** — corre en localhost:8002 | 83 |
| **auth-service** | :8001 | Codigo listo, pendiente deploy | 48 |
| **matching-service** | :8003 | Codigo listo, pendiente deploy | 53 |
| **intelligence-service** | :8004 | Codigo listo, pendiente deploy | 36 |
| **shared kernel** | — | Libreria compartida | 13 |

Cada servicio sigue **Clean Architecture**:
```
service/
  app/
    domain/          # Entidades y value objects (sin dependencias)
    application/     # Use cases, DTOs, interfaces
    infrastructure/  # Persistencia, clientes externos
    api/             # Endpoints FastAPI, schemas
    main.py          # Entry point
  tests/
    unit/            # Tests unitarios
```

## Setup Rapido

### Prerequisitos
- Python 3.12+
- Ollama (opcional, para LLM)

### Desarrollo local

```bash
cd services/profile-service
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8002
# Abrir http://localhost:8002
```

No requiere PostgreSQL, Docker, ni nginx. Usa SQLite automaticamente.

### Ollama (opcional)

```bash
ollama pull llama3.2:3b
# Se conecta a http://localhost:11434
```

## Estructura del Proyecto

```
Talento-Neurodivergente/
├── services/                    # Microservicios Python/FastAPI
│   ├── profile-service/         # ACTIVO — perfiles, quiz, games, jobs, frontend
│   ├── auth-service/            # Codigo listo, sin desplegar
│   ├── matching-service/        # Codigo listo, sin desplegar
│   ├── intelligence-service/    # Codigo listo, sin desplegar
│   ├── shared/                  # Shared kernel (value objects, auth, rate limiter)
│   └── docker-compose.yml       # Orquestacion (sin verificar)
├── app/                         # Frontend Next.js (legacy, en Vercel)
├── prisma/                      # Schema Prisma (legacy)
├── tests/                       # Tests E2E (listos, requieren servicios corriendo)
├── scripts/                     # backup-postgres.sh, restore-postgres.sh, admin
├── docs/                        # Documentacion, ADRs, sesiones
└── .agent/                      # Sistema de agentes GACE
```

## Tests

```bash
cd services/profile-service && python -m pytest tests/ -q    # 83 tests
cd services/auth-service && python -m pytest tests/ -q       # 48 tests
cd services/matching-service && python -m pytest tests/ -q   # 53 tests
cd services/intelligence-service && python -m pytest tests/ -q  # 36 tests
cd services/shared && python -m pytest tests/ -q             # 13 tests
```

**Total: 233 tests, 0 failing**

## Seguridad y Compliance

- **Autenticacion**: JWT custom con bcrypt
- **Rate Limiting**: Sliding window (in-memory + Redis ready)
- **LLM Self-Hosted**: Llama 3.2 3B via Ollama (zero data leaks, EU residency)
- **GDPR**: Art. 6, 7, 9, 15, 17, 20 — consent granular, export, delete, audit trail 7 anos
- **EU AI Act**: Art. 13, 14, 22 — transparencia, supervision humana, derecho a impugnar

## Deployment

| Entorno | Que corre | Estado |
|---------|-----------|--------|
| **Desarrollo local** | profile-service :8002 + SQLite | Funcional |
| **Vercel** | Next.js legacy (frontend) | En produccion, pendiente retirar |
| **VPS Hostinger (Paris)** | Ollama + (futuro: Docker Compose) | Ollama operativo |

## Costes

| Concepto | Coste |
|----------|-------|
| VPS Hostinger (2 CPU, 8GB RAM, Paris EU) | ~40 EUR/mes |
| Frontend legacy Vercel | 0 EUR |
| Dominio diversia.click | ~10 EUR/ano |
| Desarrollo IA (Claude Opus 4, ~10 sesiones) | ~80 EUR total |
| **Total mensual operativo** | **~40 EUR/mes** |

## Roadmap resumido

### Completado
- [x] 4 microservicios con Clean Architecture y 233 tests
- [x] Frontend Jinja2 (14 paginas) + auth standalone SQLite
- [x] Quiz 24D + radar chart + 3 juegos cognitivos
- [x] Matching 24D con scoring y razones
- [x] GDPR + EU AI Act compliance
- [x] 28/29 issues del backlog resueltas

### Pendiente
- [ ] Verificar Docker Compose end-to-end
- [ ] Build Tailwind CSS (sin CDN)
- [ ] Deploy a app.diversia.click
- [ ] Beta con usuarios reales

Ver [ROADMAP.md](ROADMAP.md) para el plan completo.

## License

MIT License — ver [LICENSE](LICENSE).

---

**Construido para la comunidad neurodivergente**
