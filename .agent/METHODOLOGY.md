# METHODOLOGY.md - Metodología de Desarrollo DiversIA Eternals

**Versión:** 2.0.0
**Fecha:** 4 de marzo de 2026
**Autor:** Josep + Atlas (GACE)

---

## 1. Versionado

### Semantic Versioning (MAJOR.MINOR.PATCH-label)

| Tipo | Cuándo | Ejemplo |
|------|--------|---------|
| **MAJOR** (X.0.0) | Cambio de arquitectura, breaking changes | 2.0.0-microservices |
| **MINOR** (0.X.0) | Feature completa o servicio nuevo | 2.1.0-auth |
| **PATCH** (0.0.X) | Bugfix, refactor, docs | 2.0.1 |
| **Label** | Identifica el foco del release | -auth, -matching, -security |

### Historial de Versiones

| Versión | Fecha | Foco | Stack |
|---------|-------|------|-------|
| 0.4.0-pragmatic | 2026-01-16 | Agent.md v2, enfoque pragmático | Next.js |
| 0.5.0-masterclass | 2026-01-17 | TDD Masterclass, Draft Mode | Next.js |
| 0.6.0-security | 2026-01-18 | Enterprise Security (HIPAA/GDPR/OWASP) | Next.js |
| 0.7.0-llm | 2026-01-24 | Self-Hosted LLM (Ollama) | Next.js |
| 1.0.0 | 2026-02-26 | Production-ready monolith | Next.js + Prisma |
| **2.0.0-microservices** | **2026-03-04** | **Migración a microservicios Python/FastAPI** | **FastAPI + SQLAlchemy** |

### Versión Actual: 2.0.0-microservices

---

## 2. Commits

### Conventional Commits (obligatorio)

```
<type>(<scope>): <description>

[body]

[footer: Closes #XX, Refs #YY]
```

**Types:**
- `feat:` — Nueva feature o servicio
- `fix:` — Bugfix
- `refactor:` — Cambio interno sin cambio de comportamiento
- `test:` — Tests nuevos o modificados
- `docs:` — Documentación
- `chore:` — Build, deps, config
- `security:` — Fix de seguridad
- `perf:` — Mejora de rendimiento

**Scopes:** `auth`, `profiles`, `matching`, `intelligence`, `shared`, `gateway`, `infra`, `docs`

**Ejemplos:**
```
feat(auth): implement registration use case with bcrypt hashing

- RegisterCandidate use case with transaction
- SQLAlchemy UserRepository
- JWT generation on successful registration
- pytest: 12 tests (unit + integration)

Closes #38
```

```
fix(matching): correct cosine similarity for zero vectors

Prevents division by zero when candidate has empty neuro-vector.
Returns 0.0 instead of NaN.

Closes #40
```

---

## 3. Pull Requests

### Formato obligatorio

**Título**: `[servicio] tipo: descripción concisa` (max 70 chars)
- `[auth] feat: registration flow with JWT`
- `[matching] fix: inclusivity score always 100`

**Body:**
```markdown
## Summary
- Qué se hizo y por qué (1-3 bullets)

## Issues
- Closes #38
- Refs #41

## Changes
- Archivos clave modificados (no lista exhaustiva)

## Decisions
- Decisiones arquitectónicas tomadas y por qué

## Cost
- Horas: ~X horas
- Herramientas: Claude Opus, Ollama, pytest
- Infra: €0 (desarrollo local) / €X (si hubo cambios en VPS)

## Test Plan
- [ ] Tests unitarios pasando
- [ ] Tests de integración pasando
- [ ] Docker build OK
- [ ] Health check respondiendo

## Version
- Versión anterior: 2.0.X
- Versión nueva: 2.0.Y / 2.1.0
```

### Cierre de Issues

- **Issue completamente resuelta**: Usar `Closes #XX` en el footer del commit y en el PR
- **Issue parcialmente resuelta**: Usar `Refs #XX` y añadir comentario en la issue con el progreso
- **Issue que requiere verificación**: Cerrar solo después de verificar en staging/producción

---

## 4. Documentación Diaria

### Al inicio de cada sesión
```markdown
## Sesión YYYY-MM-DD

### Contexto
- Estado del proyecto al empezar
- Issues a atacar: #XX, #YY, #ZZ

### Decisiones de Negocio
- [Si hubo discusiones sobre modelo de negocio, producto, UX]

### Plan del Día
1. ...
2. ...
```

### Al final de cada sesión
```markdown
### Resultado
- Issues completadas: #XX (link al PR)
- Issues en progreso: #YY (% completado)
- Nuevas issues creadas: #ZZ (descripción)

### Costes de la Sesión
- Horas de trabajo: X horas
- Herramientas utilizadas: Claude Opus, pytest, Docker
- Coste infra: €X (si aplica)
- Tokens LLM consumidos: ~XXk tokens (estimación)

### Estado al Cerrar
- Versión: 2.X.Y
- Tests: XX passing, YY failing
- Servicios operativos: auth-service, matching-service...
- Pendiente para mañana: ...
```

### Dónde documentar
- **Decisiones arquitectónicas**: En `docs/adr/ADR-XXX.md` (Architecture Decision Records)
- **Sesiones de trabajo**: En `docs/sessions/YYYY-MM-DD.md`
- **Changelog técnico**: En `CHANGELOG.md`
- **Estado general**: En `ROADMAP.md`

---

## 5. Tracking de Costes

### Categorías de Coste

| Categoría | Descripción | Cómo trackear |
|-----------|-------------|---------------|
| **Horas** | Tiempo invertido en desarrollo | Por sesión y por PR |
| **Infra** | VPS Hostinger (€40/mes), dominio, etc. | Mensual |
| **Herramientas IA** | Claude (tokens), GitHub Copilot | Por sesión (estimación) |
| **LLM Runtime** | Ollama en VPS (CPU time) | Incluido en infra |
| **Testing** | CI/CD minutes en GitHub Actions | Mensual |

### Formato en cada PR
```markdown
## Cost
- Dev time: ~3 hours
- AI assistance: Claude Opus (~150k tokens)
- Infrastructure: €0 (local development)
- Total estimated: ~3h dev + €0 infra
```

---

## 6. Workflow de Desarrollo

### Ciclo por Feature

```
1. ISSUE       → Issue existe en GitHub con labels y prioridad
2. BRANCH      → git checkout -b claude/<description>-<sessionId>
3. PLAN        → Documentar qué se va a hacer y por qué
4. TDD         → Red → Green → Refactor por cada función
5. COMMIT      → Conventional commit referenciando issue
6. TEST        → pytest + docker build
7. PR          → Con formato obligatorio (ver sección 3)
8. REVIEW      → Verificar que issue se resuelve
9. MERGE       → A main con squash o merge commit
10. VERSION    → Actualizar CHANGELOG + version tag
11. CLOSE      → Cerrar issue con referencia al PR
```

### Branch Naming
```
claude/<description>-<sessionId>
```
Ejemplo: `claude/review-issues-app-refactor-FZuy5`

### Git Hygiene
- NUNCA force push a main
- Pull antes de push
- Commits atómicos (un cambio lógico por commit)
- Rebase sobre main antes de PR si hay conflictos

---

## 7. Definition of Done

Una feature/fix se considera **DONE** cuando:

- [ ] Código implementado siguiendo Clean Architecture
- [ ] Tests unitarios del domain (≥95% coverage)
- [ ] Tests de integración con DB real
- [ ] Tests de API con TestClient
- [ ] `pytest` pasa en local
- [ ] `docker-compose build` exitoso
- [ ] Documentación actualizada (CHANGELOG, ADR si procede)
- [ ] PR creado con formato obligatorio
- [ ] Issue cerrada con `Closes #XX`
- [ ] Versión bumped si es minor o mayor
- [ ] Costes documentados en el PR

---

## 8. Priorización de Issues

### Labels de Prioridad

| Label | Significado | SLA |
|-------|------------|-----|
| **p0** | Bloqueante — nada más funciona sin esto | Esta sesión |
| **p1** | Core value — feature necesaria para MVP | Este sprint |
| **p2** | Calidad — mejora arquitectónica o testing | Próximo sprint |
| **p3** | Nice-to-have — feature secundaria | Cuando haya tiempo |
| **p4** | Tech debt — cleanup, docs, refactor | Backlog |

### Labels de Servicio

| Label | Servicio |
|-------|---------|
| `auth` | auth-service |
| `profiles` | profile-service |
| `matching` | matching-service |
| `AI/ML` | intelligence-service |
| `infra` | Docker, gateway, CI/CD |
| `frontend` | Jinja2 templates |
| `database` | SQLAlchemy, Alembic, migrations |
| `security` | Cross-cutting |
| `testing` | Cross-cutting |

---

**Última Actualización**: 4 de marzo de 2026
**Mantenido por**: Josep & Atlas (GACE)
