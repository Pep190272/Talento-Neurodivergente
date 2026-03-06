# DiversIA Eternals

Plataforma de matching trilateral 24D para talento neurodivergente. Conecta candidatos neurodivergentes, empresas inclusivas y terapeutas/especialistas mediante un algoritmo de matching multidimensional potenciado por IA self-hosted.

## Stack Tecnologico

| Capa | Tecnologia | Version |
|------|-----------|---------|
| Backend | Python + FastAPI | 3.12 / 0.115+ |
| ORM | SQLAlchemy | 2.0 |
| Validacion | Pydantic | v2 |
| Base de datos | PostgreSQL | 16 |
| Migraciones | Alembic | 1.13+ |
| Tests | pytest | 9.0+ |
| LLM | Ollama + Llama 3.2 3B | Self-hosted EU |
| Gateway | nginx | 1.25 |
| Contenedores | Docker Compose | v2 |
| Frontend (legacy) | Next.js | 15.x |
| Frontend (nuevo) | Jinja2 + Alpine.js + Tailwind | Pendiente |

## Arquitectura

```
                    nginx gateway (:80)
                         |
        +----------------+----------------+----------------+
        |                |                |                |
  auth-service     profile-service  matching-service  intelligence-service
    (:8001)           (:8002)          (:8003)            (:8004)
        |                |                |                |
        +----------------+----------------+----------------+
                         |
                   PostgreSQL 16
              (schemas: auth, profiles, matching, ai)
```

### 4 Microservicios (Clean Architecture)

1. **auth-service** (:8001) — Registro, login, JWT, gestion de usuarios
2. **profile-service** (:8002) — Perfiles neurodivergentes, quiz, evaluacion neurocognitiva
3. **matching-service** (:8003) — Matching trilateral 24D, scoring multidimensional
4. **intelligence-service** (:8004) — Reportes LLM, anonimizacion, prompt builder, transparencia IA

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
- Docker y Docker Compose v2
- Python 3.12+ (para desarrollo local sin Docker)

### Con Docker Compose (recomendado)

```bash
# Clonar el repositorio
git clone https://github.com/Pep190272/Talento-Neurodivergente.git
cd Talento-Neurodivergente/services

# Copiar variables de entorno
cp ../.env.example .env

# Levantar todos los servicios
docker-compose up --build
```

Los servicios estaran disponibles en:
- Gateway: http://localhost:80
- Auth API: http://localhost:8001/docs
- Profile API: http://localhost:8002/docs
- Matching API: http://localhost:8003/docs
- Intelligence API: http://localhost:8004/docs

### Desarrollo Local (sin Docker)

```bash
cd services/auth-service
pip install -e ".[dev]"
pytest
uvicorn app.main:app --reload --port 8001
```

## Estructura del Proyecto

```
Talento-Neurodivergente/
├── services/                    # Microservicios Python/FastAPI
│   ├── auth-service/            # Autenticacion y usuarios
│   ├── profile-service/         # Perfiles neurodivergentes
│   ├── matching-service/        # Matching trilateral 24D
│   ├── intelligence-service/    # LLM y analisis IA
│   ├── gateway/nginx.conf       # API Gateway
│   ├── docker-compose.yml       # Orquestacion
│   └── init-schemas.sql         # Schemas PostgreSQL
├── app/                         # Frontend Next.js (legacy, en migracion)
├── prisma/                      # Schema Prisma (legacy)
├── tests/                       # Tests Vitest (legacy, 272 tests)
├── docs/                        # Documentacion
│   ├── adr/                     # Architecture Decision Records
│   ├── sessions/                # Notas de sesion
│   └── ...
├── .agent/                      # Sistema de agentes GACE
├── CHANGELOG.md                 # Historial de cambios
├── ROADMAP.md                   # Plan de desarrollo
└── PROJECT_STATUS.md            # Estado actual del proyecto
```

## Tests

```bash
# Tests de microservicios (pytest)
cd services/auth-service && pytest          # 48 tests
cd services/matching-service && pytest      # 42 tests
cd services/auth-service && pytest tests/   # 36 tests seguridad/persistencia

# Tests legacy (Vitest) — siguen pasando
npm test                                    # 272 tests
```

**Total tests: 398** (126 nuevos pytest + 272 legacy Vitest)

## Seguridad y Compliance

### Proteccion de Datos
- **Encriptacion at rest**: AES-256-GCM para datos medicos sensibles
- **Autenticacion**: JWT custom con bcrypt (microservicios) + NextAuth v5 (legacy)
- **Autorizacion**: 3 actores (Individual, Terapeuta, Empresa)
- **Rate Limiting**: Por servicio con slowapi
- **CORS**: Configuracion env-aware (desarrollo vs produccion)
- **OWASP**: Top 10 auditado y corregido

### IA/LLM Privacy
- **Self-Hosted LLM**: Llama 3.2 3B via Ollama en VPS EU (Paris)
- **Zero Data Leaks**: Sin APIs de terceros para IA
- **Data Residency**: Todo el procesamiento IA en servidores EU
- **Procesamiento efimero**: Datos en memoria solo durante analisis
- **No Training**: El modelo nunca se entrena con datos de produccion

### Compliance
- **GDPR**: Art. 5, 9, 25, 32, 44-49 (datos neurodivergentes = categoria especial)
- **HIPAA Ready**: Encriptacion de datos medicos y controles de acceso
- **EU AI Act**: Sistema IA de alto riesgo compliant (self-hosted, auditable, transparente)

Ver [SECURITY_IMPLEMENTATION.md](./SECURITY_IMPLEMENTATION.md) para detalles del stack legacy.

## Deployment

### Produccion (VPS Hostinger + Dokploy)
- **Servicios**: Docker Compose con 4 microservicios + PostgreSQL + Ollama
- **Localizacion**: Paris, Francia (EU — cumplimiento GDPR)
- **Coste**: ~€40/mes (VPS con 2 CPU, 8GB RAM, 100GB SSD)

### Legacy (Vercel)
- El frontend Next.js sigue desplegado en Vercel durante la migracion
- Se eliminara cuando el frontend Jinja2 este completo

## Roadmap

### Completado
- [x] Migracion JSON a PostgreSQL (Prisma)
- [x] 272 tests unitarios + integracion + E2E
- [x] LLM self-hosted (Ollama + Llama 3.2 3B)
- [x] OWASP security audit (7 vulnerabilidades corregidas)
- [x] Arquitectura microservicios Python/FastAPI (4 servicios)
- [x] Clean Architecture con domain layer puro
- [x] 126 tests nuevos (pytest)
- [x] Alembic migrations
- [x] GDPR compliance ~90%

### Pendiente
- [ ] Frontend Jinja2 + Alpine.js + Tailwind CSS
- [ ] Eliminar Next.js legacy (Issue #63)
- [ ] Deploy microservicios en VPS
- [ ] Tests E2E cross-service
- [ ] Backup automatizado
- [ ] Monitoring (Sentry)
- [ ] Beta con usuarios reales

## Contributing

1. Fork el repositorio
2. Crea una feature branch (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la branch (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## License

Este proyecto esta licenciado bajo la MIT License — ver [LICENSE](LICENSE).

---

**Construido para la comunidad neurodivergente**
