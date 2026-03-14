# Decisiones de Arquitectura Pendientes — DiversIA

**Fecha:** 2026-03-09
**Estado:** APROBADO (sesion 2026-03-09)
**Autor:** Auditoría técnica
**Resultado:** Todas las decisiones aprobadas → ver ADR-005 para implementacion

---

## DECISIÓN 1: Comunicación entre microservicios

### El problema

Los 4 servicios (auth, profile, matching, intelligence) están aislados. No se comunican entre sí. Ejemplo concreto: matching-service tiene un `CandidateProfile` (copia local del perfil) pero no hay forma de que se actualice cuando el candidato completa su assessment en profile-service.

### Las 3 opciones

---

### Opción A: HTTP Síncrono (Recomendada para tu fase actual)

**Qué es:** Cuando un servicio necesita datos de otro, hace una petición HTTP directa.

```
Ejemplo: matching-service necesita el perfil de un candidato
→ GET http://profile-service:8002/api/v1/profiles/internal/{user_id}
→ Recibe JSON con neuro_vector, accommodations, etc.
→ Lo usa para calcular el match
```

**Ventajas:**
- Simple de implementar (httpx ya está en las dependencias)
- Fácil de debuggear (logs HTTP estándar)
- Las URLs ya están definidas en `ServiceURLSettings`
- Docker Compose ya conecta los servicios en la misma red
- Sin infraestructura adicional

**Desventajas:**
- Si profile-service está caído, matching-service falla
- Cada petición de match requiere una llamada HTTP extra (~50ms)
- Acoplamiento temporal (los servicios deben estar vivos al mismo tiempo)

**Esfuerzo:** ~4 horas de implementación

---

### Opción B: Event Bus (RabbitMQ/Redis Pub-Sub)

**Qué es:** Cuando algo pasa en un servicio, publica un "evento". Otros servicios escuchan y reaccionan.

```
Ejemplo:
1. Candidato completa assessment en profile-service
2. profile-service publica evento: "CandidateAssessmentCompleted"
3. matching-service escucha, recibe el evento
4. matching-service actualiza su CandidateProfile local
```

**Ventajas:**
- Desacoplamiento total: servicios independientes
- Resiliencia: si matching-service está caído, el evento espera en cola
- Escalabilidad: múltiples consumidores posibles
- Patrón estándar de microservicios "de libro"

**Desventajas:**
- Infraestructura extra: necesitas RabbitMQ o Redis (otro contenedor Docker)
- Complejidad: consistencia eventual (datos no inmediatos)
- Más código: publishers, consumers, event handlers, serialización
- Debugging más difícil (eventos asíncronos)
- Sobreingeniería para 4 servicios con <50 usuarios

**Esfuerzo:** ~16-20 horas de implementación + mantenimiento

---

### Opción C: Base de datos compartida

**Qué es:** Todos los servicios leen/escriben en la misma PostgreSQL, pero en schemas separados.

```
Ejemplo:
- auth-service → schema "auth" (tabla users)
- profile-service → schema "profiles" (tabla user_profiles, assessments)
- matching-service → LEE de schema "profiles" para obtener neuro_vector
```

**Ventajas:**
- Zero latencia: lectura directa de datos
- Sin infraestructura extra
- Transacciones ACID entre servicios
- Ya tienes una sola PostgreSQL en docker-compose

**Desventajas:**
- Rompe el principio fundamental de microservicios (cada uno tiene su BD)
- Acoplamiento por esquema: cambiar una tabla afecta múltiples servicios
- Si creces, no puedes separar las bases fácilmente
- Técnicamente es un monolito con APIs separadas

**Esfuerzo:** ~2 horas (ya casi está así)

---

### Mi recomendación

**Opción A (HTTP Síncrono)** por estas razones:

1. **Estás en fase beta** (0-50 usuarios) — no necesitas la complejidad de eventos
2. **Las URLs ya están configuradas** en shared/config.py
3. **Docker Compose ya los conecta** en la misma red
4. **Migración futura fácil:** cuando crezcas, puedes añadir eventos sin tirar lo HTTP
5. **Nginx ya es tu gateway** — los servicios se ven entre sí

**Implementación concreta:**
```python
# services/matching-service/app/infrastructure/external/profile_client.py
class ProfileServiceClient:
    async def get_candidate_profile(self, user_id: str) -> CandidateProfile:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{PROFILE_SERVICE_URL}/api/v1/profiles/internal/{user_id}")
            return CandidateProfile.from_dict(resp.json())
```

---

## DECISIÓN 2: Modelo de negocio y pasarela de pago

### Contexto actual
- **Coste operativo:** ~40 EUR/mes (VPS) + ~10 EUR/año (dominio)
- **Ingresos actuales:** 0 EUR
- **Usuarios objetivo inicial:** 5-50 (beta)
- **Ya definido en Prisma:** campo `subscriptionPlan` con valores free/basic/pro
- **Dispatch order existente:** integración Stripe planificada

### Quién paga y quién no

| Actor | ¿Paga? | Justificación |
|-------|--------|---------------|
| **Candidato** | NO, nunca | Son el producto/valor. Cobrarles reduciría la base de talento. Es como LinkedIn: los candidatos son gratis. |
| **Empresa** | SÍ | Son quienes obtienen valor directo: acceso a talento neurodivergente evaluado y matched. |
| **Terapeuta** | SÍ (opcional) | Visibilidad profesional + pacientes referidos. Modelo freemium. |

---

### Propuesta de planes para EMPRESAS

#### Plan FREE (Gratuito)
- Ver catálogo de candidatos (perfiles anonimizados)
- 3 matches/mes calculados
- Sin informes IA
- Sin contacto directo con candidatos
- Badge "Empresa en DiversIA"

#### Plan STARTER — 49 EUR/mes
- 15 matches/mes calculados
- 3 informes IA/mes (candidate_summary)
- Publicar hasta 3 ofertas activas
- Contacto con candidatos matched (>70% compatibilidad)
- Soporte email

#### Plan PRO — 149 EUR/mes
- Matches ilimitados
- Informes IA ilimitados (los 4 tipos)
- Ofertas ilimitadas
- Dashboard analytics de inclusividad
- Acceso a Team Fit reports
- Accommodation Guides personalizadas
- Soporte prioritario
- Badge "Empresa Inclusiva Verificada"

#### Plan ENTERPRISE — Precio a medida (desde 399 EUR/mes)
- Todo lo de PRO
- API access directo
- Integración con ATS (Greenhouse, Workday, etc.)
- Account manager dedicado
- Formación en neurodiversidad para RRHH
- Informes trimestrales de impacto

---

### Propuesta de planes para TERAPEUTAS

#### Plan FREE (Gratuito)
- Perfil profesional en directorio
- Recibir solicitudes de verificación
- Ver candidatos asignados (máximo 5)

#### Plan PROFESIONAL — 29 EUR/mes
- Candidatos ilimitados
- Dashboard de seguimiento
- Herramientas de endorsement
- Visibilidad prioritaria en matching
- Badge "Terapeuta Verificado"

---

### Modelo de primeros adoptantes (Early Adopter)

> **Actualizado (ADR-006):** Modelo migrado a pago por exito. Early adopters ya no reciben meses gratis de SaaS, sino descuento en success fee.

- **Primeras 25 empresas:** 50% descuento en success fee (primeras 5 contrataciones)
- **Primeras 25 terapeutas:** Acceso premium gratuito
- **Candidatos:** Siempre gratis
- **Implementacion:** Tracking automatico via `count_by_role` al registrar

---

### Proyección de ingresos (conservadora)

| Mes | Empresas Starter | Empresas Pro | Terapeutas Pro | MRR |
|-----|-----------------|-------------|----------------|-----|
| 1-6 | 0 (early adopters) | 0 (early adopters) | 0 (early adopters) | 0 EUR |
| 7 | 5 | 2 | 10 | 788 EUR |
| 12 | 15 | 5 | 25 | 2.205 EUR |
| 18 | 30 | 10 | 40 | 3.630 EUR |
| 24 | 50 | 20 | 60 | 6.180 EUR |

**Breakeven:** ~Mes 7 (cuando los early adopters empiezan a pagar)

---

### Pasarela de pago: Stripe

**Por qué Stripe:**
- Estándar en SaaS europeo
- Soporta suscripciones recurrentes nativas
- Webhooks robustos para actualizar estado
- Cumple PSD2/SCA (autenticación fuerte europea)
- SDK Python (stripe-python) maduro
- Dashboard para gestión sin código
- Cupones/descuentos nativos (para early adopters)
- Facturación automática con IVA europeo

**Coste de Stripe:**
- 1,5% + 0,25 EUR por transacción (tarjetas europeas)
- 2,5% + 0,25 EUR por transacción (tarjetas no europeas)
- Sin cuota mensual

**Implementación técnica:**
```
Nuevo servicio: payment-service (:8005)
├── domain/
│   ├── entities/subscription.py    (Subscription, Plan, Invoice)
│   └── repositories/i_subscription_repo.py
├── application/
│   ├── use_cases/create_checkout.py
│   ├── use_cases/handle_webhook.py
│   └── use_cases/cancel_subscription.py
├── infrastructure/
│   ├── stripe/stripe_client.py     (Stripe SDK adapter)
│   └── persistence/models.py
└── api/v1/payments.py
```

**O alternativa más simple** (sin servicio nuevo):
- Añadir endpoints de pago en profile-service
- Un módulo `infrastructure/stripe/` con el client
- Menos infraestructura, suficiente para beta

---

### Alternativas a Stripe consideradas

| Pasarela | Pros | Contras | Veredicto |
|----------|------|---------|-----------|
| **Stripe** | Estándar SaaS, suscripciones nativas, SDK Python | 1.5%+0.25€ por tx | **Elegida** |
| **PayPal** | Conocida por usuarios | UX peor, API legacy, no ideal para SaaS | Descartada |
| **Redsys** | Bancos españoles | Solo España, sin suscripciones nativas | Descartada |
| **Paddle** | Gestión IVA/impuestos automática | 5% comisión (más cara) | Posible alternativa |
| **LemonSqueezy** | Simple, gestión fiscal | Menos features, más joven | Descartada |

---

## DECISIÓN 3: Prioridad de implementación

### Opción 1: Primero funcionalidad, luego pagos
```
Mes 1: Cablear use cases + limpiar legacy
Mes 2: Docker compose funcional + deploy VPS
Mes 3: Integrar Stripe + planes
```
**Ventaja:** Producto funcional para early adopters desde el día 1

### Opción 2: Primero pagos, luego funcionalidad
```
Mes 1: Stripe + planes + checkout
Mes 2: Cablear use cases
Mes 3: Deploy
```
**Ventaja:** Monetización lista desde el lanzamiento

### Recomendación: Opción 1

Los early adopters no van a pagar los primeros 6 meses. Mejor tener un producto funcional que un cobrador sin producto.

---

## Resumen de decisiones pendientes

| # | Decisión | Opciones | Mi recomendación |
|---|----------|----------|------------------|
| 1 | Comunicación inter-servicio | HTTP sync / Event bus / BD compartida | **HTTP Síncrono** |
| 2 | Quién paga | Candidato / Empresa / Terapeuta | **Empresa + Terapeuta (candidato gratis)** |
| 3 | Planes empresa | Free/Starter/Pro/Enterprise | **49/149/399+ EUR/mes** |
| 4 | Planes terapeuta | Free/Profesional | **29 EUR/mes** |
| 5 | Pasarela de pago | Stripe / PayPal / Redsys / Paddle | **Stripe** |
| 6 | Early adopters | Descuento / Gratis temporal / Nada | **6 meses gratis (PRO)** |
| 7 | Servicio de pagos | Nuevo payment-service / En profile-service | **En profile-service** (fase beta) |
| 8 | Prioridad | Funcionalidad primero / Pagos primero | **Funcionalidad primero** |

---

## Estado de las decisiones (actualizado 14 Mar 2026)

| # | Decision | Resultado |
|---|----------|-----------|
| 1 | Comunicacion inter-servicio | **Aprobado: HTTP Sincrono** |
| 2 | Quien paga | **Actualizado (ADR-006): Empresa paga success fee solo al contratar. Candidatos y terapeutas gratis.** |
| 3 | Planes empresa | **Sustituido (ADR-006): Acceso gratis + success fee (10-15% salario) al contratar** |
| 4 | Planes terapeuta | **Sustituido (ADR-006): Gratis (se reevaluara con marketplace maduro)** |
| 5 | Pasarela de pago | **Pausado: Stripe checkout pausado. Facturacion manual o Stripe Invoicing.** |
| 6 | Early adopters | **Actualizado (ADR-006): 50% descuento en success fee (primeras 25 empresas, primeras 5 contrataciones)** |
| 7 | Servicio de pagos | **Pausado: subscription-service se mantiene (87 tests) pero desarrollo pausado** |
| 8 | Prioridad | **Aprobado: Funcionalidad primero, pagos en Fase 1 post-deploy** |

### Nuevas decisiones tomadas (9 Mar 2026)

| # | Decision | Resultado |
|---|----------|-----------|
| 9 | Planes candidato B2C | **Sustituido (ADR-006): Candidato siempre gratis** |
| 10 | 5 nuevos bounded contexts | **Aprobado: subscriptions/learning/community/marketplace/analytics** |
| 11 | Estrategia de base de datos | **Aprobado: schemas separados en misma PostgreSQL** |
| 12 | Prioridad de nuevos contextos | **Aprobado: subscriptions → analytics → learning → community → marketplace** |

### Decisiones actualizadas (14 Mar 2026)

| # | Decision | Resultado |
|---|----------|-----------|
| 13 | Modelo de negocio | **Aprobado (ADR-006): Pago por exito (success fee) en lugar de SaaS suscripcion fija** |
| 14 | Stripe checkout | **Pausado: No se requiere checkout de suscripciones. Se usara Stripe Invoicing cuando haya volumen.** |

Ver **ADR-005** para modelo SaaS original y **ADR-006** para migracion a pago por exito.
