# ROADMAP — DiversIA (app.diversia.click)

**Fecha de inicio:** 10 de febrero de 2026
**Ultima actualizacion:** 8 de marzo de 2026
**Estado:** Desarrollo local — NO se commitea a GitHub hasta completar migracion

---

## Principios de trabajo

1. **Todo el desarrollo es local** hasta tener la app completa y funcional
2. **No se pushea a GitHub** hasta preparar el deploy a VPS
3. **El repo de GitHub mantiene la app Node.js** funcional en produccion (Vercel)
4. **El dominio objetivo es `app.diversia.click`** — subdominio del VPS existente
5. **Commitear localmente** para tracking, pero sin push

---

## Estado actual del proyecto (8 marzo 2026)

### Que tenemos (lo que funciona)

| Componente | Estado | Tests |
|-----------|--------|-------|
| **auth-service** | Completo — register, login, JWT, bcrypt | 48 passing |
| **profile-service** | Completo — perfiles, quiz 24D, games, jobs, inclusivity | 57 passing |
| **matching-service** | Completo — scoring trilateral 24D, batch matching | 53 passing |
| **intelligence-service** | Completo — reports LLM, anonymizer, prompt builder | 36 passing |
| **shared kernel** | Completo — value objects, domain exceptions | Incluido en tests |
| **Frontend (Jinja2)** | 14 paginas funcionales, Alpine.js + Tailwind CDN | Sin tests |
| **SQLite standalone** | Funcional — auth_proxy + profiles_local sin PostgreSQL | Manual |
| **Docker Compose** | Definido — 4 servicios + postgres + nginx | Sin verificar |

**Total: 194 tests unitarios, 0 failing**

### Que NO tenemos (lo que falta)

- Tests de integracion cross-service (un servicio llama a otro)
- Tests E2E del frontend (Playwright o similar para Python)
- Use cases completos documentados (flujos de usuario end-to-end)
- Validacion de que Docker Compose arranca y los servicios se comunican
- Build de Tailwind CSS (ahora usa CDN — no valido para produccion)
- Paginas de error (404, 500)
- Configuracion de produccion (CORS, secrets, dominio)
- Deploy a VPS (app.diversia.click)
- Migracion de datos del monolito Node.js (si hay datos reales)

---

## Arquitectura de servicios

```
                    ┌─────────────┐
                    │   nginx     │  :80 / :443
                    │   gateway   │  app.diversia.click
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
    │   profile   │ │    auth     │ │ intelligence│
    │   :8002     │ │   :8001     │ │   :8003     │
    │ HTML+API    │ │ JWT+Users   │ │ LLM Reports │
    └──────┬──────┘ └─────────────┘ └─────────────┘
           │
    ┌──────▼──────┐        ┌──────────────┐
    │  matching   │        │  PostgreSQL  │
    │   :8004     │        │   :5432      │
    │ Scoring 24D │        │  4 schemas   │
    └─────────────┘        └──────────────┘
```

### Servicios y puertos

| Servicio | Puerto | Responsabilidad |
|----------|--------|-----------------|
| nginx gateway | 80/443 | Reverse proxy, SSL, routing |
| auth-service | 8001 | Registro, login, JWT, roles |
| profile-service | 8002 | Perfiles, quiz, games, frontend HTML |
| intelligence-service | 8003 | Informes LLM, anonimizacion |
| matching-service | 8004 | Algoritmo 24D, compatibilidad |
| PostgreSQL | 5432 | Base de datos compartida (4 schemas) |
| Ollama | 11434 | LLM self-hosted (Llama 3.2 3B) |

---

## FASE 1 — Casos de uso y flujos (PENDIENTE)

> Definir QUE hace la app antes de seguir construyendo

### 1.1 Documentar flujos de usuario

**Candidato:**
1. Registrarse (nombre, email, password, rol=candidate)
2. Completar quiz neurocognitivo (24 preguntas → vector 24D)
3. Jugar Brain Suite (3 juegos → scores complementarios)
4. Ver dashboard con radar chart 24D + fortalezas + areas de crecimiento
5. Editar perfil (bio, ubicacion, habilidades)
6. Ver ofertas de empleo con % compatibilidad
7. Aplicar a ofertas (consentimiento explicito — GDPR)
8. Recibir informe de talento (generado por LLM)

**Empresa:**
1. Registrarse (nombre empresa, email, password, rol=company)
2. Completar evaluacion de inclusividad (18 preguntas, 6 categorias)
3. Ver dashboard con score de inclusividad
4. Publicar ofertas de empleo (titulo, descripcion, habilidades, adaptaciones)
5. Ver candidatos compatibles con % matching
6. Solicitar conexion con candidato (requiere consentimiento)
7. Recibir informe de matching (explicacion IA — EU AI Act)

**Terapeuta:**
1. Registrarse (nombre, email, password, rol=therapist)
2. Completar perfil profesional (especialidad, licencia, areas)
3. Ver dashboard con estadisticas
4. Publicar cursos/talleres (futuro)
5. Conectar con candidatos (futuro)

### 1.2 Mapear endpoints necesarios por flujo

Para cada paso del flujo, verificar que existe:
- Ruta HTML (Jinja2) para la UI
- Endpoint API para la logica
- Test unitario para el use case
- Test de integracion para la conexion

### 1.3 Identificar gaps

Comparar lo que el frontend llama vs lo que el backend expone.
Documentar endpoints faltantes o incompletos.

---

## FASE 2 — Completar la capa de aplicacion (PENDIENTE)

> Use cases, repositorios, y la logica que conecta frontend con dominio

### 2.1 Use cases faltantes

| Use case | Servicio | Estado |
|----------|----------|--------|
| RegisterUser | auth-service | Implementado |
| LoginUser | auth-service | Implementado |
| CreateProfile | profile-service | Implementado |
| SubmitQuiz | profile-service | Implementado |
| SaveGameScore | profile-service | Implementado (SQLite) |
| GetDashboard | profile-service | Implementado (SQLite) |
| CreateJobOffer | profile-service | Implementado (SQLite) |
| EvaluateInclusivity | profile-service | Implementado (SQLite) |
| CalculateMatch | matching-service | Implementado |
| RunBatchMatching | matching-service | Implementado |
| GenerateReport | intelligence-service | Implementado |
| **ApplyToJob** | profile-service | **FALTA** |
| **RequestConnection** | profile-service | **FALTA** |
| **ManageConsent** | profile-service | **FALTA** |
| **ExportData (GDPR)** | profile-service | **FALTA** |
| **DeleteAccount (GDPR)** | profile-service | **FALTA** |
| **VerifyTherapist** | profile-service | **FALTA** |

### 2.2 Repositorios (PostgreSQL)

Migrar de SQLite standalone a repositorios SQLAlchemy reales:
- [ ] UserRepository (auth-service) — ya tiene ORM, falta wiring completo
- [ ] ProfileRepository (profile-service) — migrar profiles_local.py a ORM
- [ ] JobRepository (profile-service) — migrar jobs de SQLite a ORM
- [ ] InclusivityRepository (profile-service) — migrar de SQLite a ORM
- [ ] GameScoreRepository (profile-service) — migrar de SQLite a ORM

### 2.3 Comunicacion inter-servicio

- [ ] profile-service → auth-service: validar JWT (actualmente local)
- [ ] profile-service → matching-service: solicitar matching
- [ ] profile-service → intelligence-service: solicitar informe
- [ ] Definir patron: HTTP sync vs eventos async vs shared DB

---

## FASE 3 — Tests completos (PENDIENTE)

> Suite de tests que garantice que todo funciona

### 3.1 Tests unitarios adicionales

- [ ] Use cases faltantes de Fase 2 (ApplyToJob, ManageConsent, etc.)
- [ ] Repositorios SQLAlchemy (con SQLite in-memory para tests)
- [ ] Frontend: tests de templates Jinja2 (renderizado correcto)

### 3.2 Tests de integracion

- [ ] auth-service: register + login + obtener token
- [ ] profile-service: crear perfil + quiz + ver dashboard
- [ ] matching-service: calcular match con datos reales
- [ ] intelligence-service: generar informe con mock LLM
- [ ] Cross-service: login → perfil → matching → informe

### 3.3 Tests E2E (Playwright o httpx)

- [ ] Flujo candidato completo: register → quiz → dashboard → jobs
- [ ] Flujo empresa: register → inclusivity → jobs → candidatos
- [ ] Flujo terapeuta: register → perfil → dashboard
- [ ] GDPR: export datos + delete account
- [ ] Errores: 404, 401, 403, 500

### 3.4 Objetivo

- **Minimo 300 tests** (194 actuales + ~100 nuevos)
- **0 failing**
- **Cobertura de todos los flujos criticos**

---

## FASE 4 — Frontend production-ready (PENDIENTE)

> De CDN a build propio, paginas de error, accesibilidad

### 4.1 Build de Tailwind CSS

- [ ] Instalar Tailwind CSS como dependencia (no CDN)
- [ ] Configurar build pipeline (postcss + purge)
- [ ] Generar `app.min.css` con solo los estilos usados
- [ ] Evaluar: Vite, esbuild, o simple postcss CLI

### 4.2 Bundle de JavaScript

- [ ] Alpine.js: vendor bundle local (no CDN)
- [ ] Chart.js: vendor bundle local (no CDN)
- [ ] Lucide icons: solo los iconos usados (tree-shake)
- [ ] app.js: minificado

### 4.3 Paginas de error

- [ ] 404.html — pagina no encontrada
- [ ] 500.html — error del servidor
- [ ] 401.html — no autenticado (redirect a login)
- [ ] Middleware FastAPI para servir estas paginas

### 4.4 Accesibilidad

- [ ] Verificar ARIA labels en formularios
- [ ] Verificar contraste de colores (WCAG AA)
- [ ] Verificar navegacion por teclado
- [ ] Focus traps en modales

### 4.5 SEO basico

- [ ] Meta tags (title, description) por pagina
- [ ] Open Graph tags para redes sociales
- [ ] robots.txt
- [ ] sitemap.xml

---

## FASE 5 — Docker y entorno de produccion (PENDIENTE)

> Verificar que Docker Compose funciona end-to-end

### 5.1 Verificar Docker Compose

- [ ] `docker compose up` arranca los 4 servicios + postgres + nginx
- [ ] Migraciones Alembic se ejecutan automaticamente
- [ ] Health checks funcionan (/health en cada servicio)
- [ ] nginx rutea correctamente a cada servicio
- [ ] Seed data se carga en primera ejecucion

### 5.2 Variables de entorno

- [ ] `.env.production` con todas las variables necesarias
- [ ] JWT_SECRET unico y seguro (no dev default)
- [ ] DATABASE_URL apuntando a PostgreSQL
- [ ] OLLAMA_URL apuntando al servicio Ollama
- [ ] CORS_ORIGINS configurado para app.diversia.click

### 5.3 SSL y dominio

- [ ] Configurar app.diversia.click en DNS
- [ ] Certificado SSL (Let's Encrypt via Dokploy o certbot)
- [ ] nginx con HTTPS + redirect HTTP → HTTPS
- [ ] HSTS header

### 5.4 Seguridad de produccion

- [ ] Rate limiting con Redis (no in-memory)
- [ ] CORS estricto (solo app.diversia.click)
- [ ] CSP headers
- [ ] Secrets en Dokploy env vars (no en archivos)
- [ ] PostgreSQL: password fuerte, no accesible externamente

---

## FASE 6 — Deploy a VPS (PENDIENTE)

> Subir a app.diversia.click y verificar

### 6.1 Preparar repositorio

- [ ] Actualizar repo GitHub con todos los cambios locales
- [ ] Limpiar archivos innecesarios (.pyc, __pycache__, SQLite DBs)
- [ ] Verificar .gitignore completo
- [ ] Tag de version (v2.0.0)

### 6.2 Deploy

- [ ] Push a GitHub
- [ ] SSH al VPS
- [ ] `git pull` en el VPS
- [ ] `docker compose up -d --build`
- [ ] Verificar que todos los servicios arrancan
- [ ] Verificar que app.diversia.click responde

### 6.3 Migracion de datos (si aplica)

- [ ] Evaluar si hay datos reales en la app Node.js (Vercel)
- [ ] Si hay usuarios reales: script de migracion Prisma → SQLAlchemy
- [ ] Si no hay datos reales: solo seed data

### 6.4 Validacion post-deploy

- [ ] Registro de usuario funciona
- [ ] Login funciona
- [ ] Quiz + dashboard funciona
- [ ] Games funciona
- [ ] Matching funciona
- [ ] Inclusivity funciona
- [ ] Jobs funciona

### 6.5 Retirar app Node.js

- [ ] Verificar que app.diversia.click funciona al 100%
- [ ] Redirigir dominio principal (si aplica)
- [ ] Desactivar deploy de Vercel
- [ ] Eliminar archivos Node.js del repo (app/, prisma/, package.json, etc.)

---

## FASE 7 — Post-deploy (FUTURO)

> Mejoras continuas una vez la app esta en produccion

### 7.1 Monitoring

- [ ] Logs centralizados (Loki/Grafana o simple log rotation)
- [ ] Health check dashboard
- [ ] Alertas por servicio caido

### 7.2 Backups

- [ ] Backup automatizado de PostgreSQL (cron → S3/Backblaze)
- [ ] Retention policy para backups

### 7.3 Funcionalidades pendientes

- [ ] Verificacion de terapeutas (licencia profesional)
- [ ] Catalogo de cursos/talleres de terapeutas
- [ ] Pipeline de candidatos para empresas (vista tipo Kanban)
- [ ] Notificaciones (email o in-app)
- [ ] App movil (si se confirma necesidad)
- [ ] Bias detection en descripciones de empleo
- [ ] AI Transparency Log (EU AI Act)

### 7.4 Legal/Compliance

- [ ] Privacy Policy (documento legal)
- [ ] Terms of Service
- [ ] DPO contact designado
- [ ] Cookie consent banner
- [ ] AI Act compliance audit

---

## Historial de versiones

| Version | Fecha | Descripcion |
|---------|-------|-------------|
| v0.x | Feb 2026 | Monolito Next.js — Sprints 1-5 |
| v1.0.0 | 26 Feb | Monolito production-ready (272 tests, OWASP audit) |
| v2.0.0-dev | 4-7 Mar | Microservicios Python/FastAPI (194 tests, 14 paginas) |
| **v2.0.0** | **TBD** | **Deploy a app.diversia.click** |

---

## Referencia rapida: como ejecutar

### Desarrollo local (standalone)

```bash
cd services/profile-service
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8002
# Abre http://localhost:8002
```

### Tests

```bash
# Todos los servicios
cd services/auth-service && python -m pytest tests/ -q
cd services/profile-service && python -m pytest tests/ -q
cd services/matching-service && python -m pytest tests/ -q
cd services/intelligence-service && python -m pytest tests/ -q
```

### Docker (cuando este listo)

```bash
cd services
docker compose up --build
# Abre http://localhost (nginx)
```

---

## Sprints historicos (v1.0.0 — referencia)

> Documentacion completa de la evolucion del monolito Next.js.
> Ver commits en rama `master` para el codigo original.

<details>
<summary>Sprint 1-5 (Feb 2026) — Click para expandir</summary>

### Sprint 1: Fundaciones Criticas (10-21 Feb)
- Migracion JSON → PostgreSQL (Prisma)
- 191 tests, build exitoso
- Dependabot: Next.js 15.5.12

### Sprint 2: Tests y Limpieza (22 Feb)
- 272 tests (de 191), 0 failed
- Branch protection, CI/CD
- Issues #25-#27 planificadas

### Sprint 3: Arquitectura (22-25 Feb)
- Service + Repository layer extraidos
- Decision: mantener monolito (equipo pequeno, MVP)

### Sprint 4: LLM y Compliance (25 Feb)
- Ollama + Llama 3.2 3B (self-hosted, GDPR Art. 9)
- GDPR ~90% (export, delete, consent, retention)

### Sprint 5: Seguridad y Deploy (26 Feb)
- OWASP audit: 7 vulnerabilidades corregidas
- Playwright E2E: 25+ tests
- Vercel deploy funcional

</details>

### Sesiones de migracion v2.0.0

<details>
<summary>Sesiones 6-10 (Mar 2026) — Click para expandir</summary>

### Sesion 6 (4 Mar): Scaffolding + auth + matching
- 4 servicios Python/FastAPI, Docker Compose, nginx
- auth-service: 48 tests, matching-service: 42 tests

### Sesion 7 (5-6 Mar): profile + intelligence + persistencia
- profile-service + intelligence-service implementados
- SQLAlchemy ORM, Alembic, OWASP hardening
- 36 tests adicionales (126 total microservicios)

### Sesiones 8-9 (6-7 Mar): Frontend Jinja2
- 12 paginas HTML con Alpine.js + Tailwind
- Auth standalone (SQLite), quiz 24D, radar chart
- Dashboard candidato/empresa/terapeuta

### Sesion 10 (7 Mar): Brain Suite + Matching 24D
- 3 juegos cognitivos, inclusivity assessment
- Job CRUD, matching 24D con scoring + razones
- 14 paginas, 194 tests totales

</details>
