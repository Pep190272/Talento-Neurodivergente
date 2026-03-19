# Despachos Dashboard v2 — SuperAdmin & UX Overhaul

> **Fecha**: 2026-03-19
> **Prioridad**: p1
> **Contexto**: El dashboard actual del superadmin muestra toda la info de los 3 actores
> en una pagina scroll unica, estatica, con graficos no interactivos y sin puntos
> de conexion entre actores. Se requiere una reestructuracion completa.
>
> **Archivo principal**: `services/profile-service/app/templates/pages/dashboard.html`
> **Stack frontend**: Jinja2 + Alpine.js + Tailwind CSS + Chart.js (ya incluido)

---

## DESPACHO 1: Sistema de pestanas por actor

**Objetivo**: Reemplazar el scroll vertical de secciones (Vista Candidato, Vista Empresa,
Vista Terapeuta) por un sistema de pestanas (tabs) que permita al admin elegir que
vista ver en cada momento.

### Archivos afectados
- `services/profile-service/app/templates/pages/dashboard.html` (lineas 761-1046 aprox — seccion admin)

### Especificacion
1. Anadir un tab bar debajo de los KPI cards del admin (linea 734) con 4 pestanas:
   - **Resumen** (vista por defecto): KPIs globales + diagrama matching trilateral
   - **Candidato**: Lo que ahora es "Vista Candidato" (demo radar + fortalezas + matching empleo)
   - **Empresa**: Lo que ahora es "Vista Empresa" (inclusividad + early adopter)
   - **Terapeuta**: Lo que ahora es "Vista Terapeuta" (perfil profesional + funciones roadmap)
2. Usar Alpine.js `x-data` con una variable `activeTab` y `x-show` para cambiar contenido
3. La tab bar debe ser accesible: `role="tablist"`, `role="tab"`, `aria-selected`, navegacion con flechas
4. Estilo visual: pestana activa con borde inferior primario y fondo sutil, inactivas en gris
5. Animacion de transicion suave entre tabs (Alpine `x-transition`)
6. Los KPI cards de plataforma (Candidatos, Empresas, Terapeutas, Total, Ofertas, GDPR) y el
   banner de sistema se mantienen FUERA de las tabs, siempre visibles arriba

### Criterios de aceptacion
- [ ] Las 4 pestanas funcionan correctamente con Alpine.js
- [ ] Solo se muestra una seccion a la vez
- [ ] Accesibilidad: navegable con teclado, roles ARIA correctos
- [ ] El radar chart del candidato se re-renderiza al cambiar a esa tab (Chart.js requiere que el canvas sea visible)
- [ ] Tests: no se requieren tests backend, pero verificar que no se rompe nada existente

---

## DESPACHO 2: Graficos interactivos y datos dinamicos

**Objetivo**: Sustituir los elementos estaticos (barras de progreso fijas, datos hardcoded)
por graficos interactivos con Chart.js y datos que se puedan explorar.

### Archivos afectados
- `services/profile-service/app/templates/pages/dashboard.html` (JS del bloque `{% block scripts %}`)

### Especificacion
1. **Radar Chart del candidato** (ya existe): Anadir hover con tooltip detallado que muestre
   dimension + valor + categoria. Ya funciona parcialmente — mejorar tooltips.
2. **Score de Inclusividad de la empresa**: Convertir las barras de progreso estaticas en un
   grafico de barras horizontales interactivo con Chart.js (`type: 'bar'`, `indexAxis: 'y'`).
   Tooltip al hover con detalle de cada categoria.
3. **Grafico de distribucion de usuarios**: En la tab "Resumen", anadir un doughnut chart
   que muestre la proporcion candidatos/empresas/terapeutas con los datos reales de `adminStats`.
4. **Timeline de registros** (si hay datos): Grafico de lineas mostrando registros por semana/mes.
   Si no hay endpoint, dejarlo preparado con datos mock y un TODO en el codigo.
5. **Brain Suite scores**: Convertir la tabla estatica de puntuaciones en un grafico de barras
   verticales con animacion de entrada.
6. Todos los graficos deben tener animaciones de entrada (`animation.duration: 800`).
7. Los graficos deben ser responsive y adaptarse a movil.

### Criterios de aceptacion
- [ ] Minimo 3 graficos interactivos con Chart.js (radar mejorado, barras inclusividad, doughnut usuarios)
- [ ] Tooltips informativos en todos los graficos
- [ ] Animaciones de entrada suaves
- [ ] Responsive en movil (graficos se adaptan)
- [ ] No se anade ninguna libreria nueva — usar Chart.js que ya esta cargado

---

## DESPACHO 3: Punto de conexion entre actores (Hub de Matching)

**Objetivo**: Crear una seccion visual dentro de la tab "Resumen" que muestre como los 3 actores
estan conectados, con datos reales cuando existan y enlaces navegables.

### Archivos afectados
- `services/profile-service/app/templates/pages/dashboard.html` (seccion admin, nueva subseccion)

### Especificacion
1. **Diagrama de conexion interactivo**: Reemplazar el diagrama estatico actual de 3 cards
   (lineas 1012-1037) por una visualizacion que muestre:
   - Los 3 nodos (Candidato, Empresa, Terapeuta) con iconos y datos reales
   - Lineas de conexion animadas entre ellos (CSS animations con SVG o border/pseudo-elements)
   - Al hacer hover en un nodo, se resaltan sus conexiones
2. **Flujo de matching visual**: Mostrar los pasos del proceso:
   Candidato (quiz 24D) → IA (cosine similarity) → Empresa (ofertas) ← Terapeuta (validacion)
3. **Metricas de conexion**: Mostrar cuantos matches activos hay, cuantos candidatos tienen
   perfil completo, cuantas empresas tienen ofertas publicadas.
4. **CTA por actor**: Desde el hub, poder navegar directamente a la tab del actor correspondiente
   (cambiar `activeTab` al hacer click).

### Criterios de aceptacion
- [ ] Diagrama visual con 3 nodos conectados, no solo 3 cards en fila
- [ ] Animaciones CSS en las lineas de conexion (pulse, dash animation, o similar)
- [ ] Hover interactivo en los nodos
- [ ] Los CTAs cambian a la tab correcta del actor
- [ ] Datos reales de `adminStats` cuando esten disponibles
- [ ] Puro HTML/CSS/Alpine.js — no libreria de grafos externa

---

## DESPACHO 4: Chat privado entre actores

**Objetivo**: Implementar un sistema de mensajeria privada que permita a empresas contactar
con candidatos o terapeutas directamente desde la plataforma.

### IMPORTANTE: Este es el despacho mas complejo. Requiere backend + frontend.

### Archivos a crear/modificar

**Backend (nuevo endpoint en profile-service o servicio dedicado):**
- `services/profile-service/app/api/v1/messages.py` — Router de mensajes
- `services/profile-service/app/application/use_cases/send_message.py`
- `services/profile-service/app/application/use_cases/list_conversations.py`
- `services/profile-service/app/domain/entities/message.py`
- `services/profile-service/app/domain/entities/conversation.py`
- `services/profile-service/app/infrastructure/repositories/message_repository.py`
- `services/profile-service/app/infrastructure/models/message_model.py`
- Migracion SQL para tabla `profiles.messages` y `profiles.conversations`

**Frontend:**
- `services/profile-service/app/templates/pages/messages.html` — Pagina de mensajes
- `services/profile-service/app/templates/pages/dashboard.html` — Widget de mensajes recientes

### Especificacion

#### Modelo de datos
```sql
-- profiles.conversations
CREATE TABLE profiles.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_1_id UUID NOT NULL,  -- user_id del auth-service
    participant_2_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(participant_1_id, participant_2_id)
);

-- profiles.messages
CREATE TABLE profiles.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES profiles.conversations(id),
    sender_id UUID NOT NULL,
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_messages_conversation ON profiles.messages(conversation_id, created_at);
```

#### Endpoints API
- `POST /api/v1/profiles/conversations` — Crear/recuperar conversacion entre 2 usuarios
- `GET /api/v1/profiles/conversations` — Listar conversaciones del usuario actual
- `GET /api/v1/profiles/conversations/{id}/messages` — Mensajes de una conversacion (paginado)
- `POST /api/v1/profiles/conversations/{id}/messages` — Enviar mensaje
- `PATCH /api/v1/profiles/messages/{id}/read` — Marcar como leido

#### Frontend
1. **Widget en dashboard**: Card con "Mensajes recientes" mostrando ultimas conversaciones
   con badge de no leidos.
2. **Pagina /messages**: Interfaz de chat con:
   - Lista de conversaciones a la izquierda (movil: pantalla completa)
   - Area de chat a la derecha con burbujas de mensaje
   - Input de texto con boton enviar
   - Polling cada 10s para nuevos mensajes (o placeholder para WebSocket futuro)
3. **Boton "Contactar"** en los resultados de matching (cuando una empresa ve un candidato compatible)

#### Seguridad
- Solo usuarios autenticados pueden enviar mensajes
- Un usuario solo puede ver sus propias conversaciones
- Rate limiting: max 50 mensajes/hora por usuario
- Sanitizar contenido (XSS prevention)
- No permitir adjuntos en v1

### Criterios de aceptacion
- [ ] Modelo de datos con migracion SQL
- [ ] 4 endpoints REST funcionando con autorizacion
- [ ] Tests unitarios para use cases (min 8 tests)
- [ ] Tests de integracion para endpoints (min 4 tests)
- [ ] Frontend: pagina /messages con interfaz de chat funcional
- [ ] Widget de mensajes recientes en dashboard
- [ ] Boton "Contactar" en resultados de matching
- [ ] Seguridad: autorizacion, sanitizacion, rate limiting

### Clean Architecture
- **Domain**: `Message`, `Conversation` (entities puras, sin imports externos)
- **Application**: `SendMessage`, `ListConversations`, `GetMessages` (use cases)
- **Infrastructure**: `SQLAlchemyMessageRepository`, `MessageModel`
- **API**: Thin controllers en `messages.py`

---

## DESPACHO 5: Guia interactiva por actor (Onboarding Tour)

**Objetivo**: Crear una guia interactiva paso a paso que explique el funcionamiento
de la plataforma para cada tipo de actor (candidato, empresa, terapeuta).

### Archivos afectados
- `services/profile-service/app/templates/pages/dashboard.html` — Boton de inicio + logica
- `services/profile-service/app/static/js/onboarding-tour.js` (NUEVO)
- `services/profile-service/app/static/css/onboarding-tour.css` (NUEVO)

### Especificacion
1. **Trigger**: Boton "?" flotante en esquina inferior derecha + auto-inicio en primer login
2. **Implementacion pura**: HTML/CSS/Alpine.js, SIN librerias externas (ni Shepherd, ni Intro.js)
3. **Mecanismo**:
   - Overlay oscuro semi-transparente sobre toda la pagina
   - "Spotlight" (recorte en el overlay) que ilumina el elemento objetivo
   - Tooltip flotante con titulo, descripcion y botones (Anterior/Siguiente/Cerrar)
   - Posicionamiento automatico del tooltip (arriba/abajo/izquierda/derecha segun espacio)
   - Transicion suave al cambiar de paso
4. **Guias por rol**:

   **Candidato** (6 pasos):
   1. "Bienvenido" — Barra de progreso del perfil
   2. "Tu perfil" — Card de perfil personal
   3. "Quiz 24D" — Seccion del radar chart / CTA del quiz
   4. "Brain Suite" — Card de juegos cognitivos
   5. "Tus fortalezas" — Panel de top dimensiones
   6. "Empleos compatibles" — Seccion de matching

   **Empresa** (5 pasos):
   1. "Bienvenido" — KPI cards
   2. "Tu plan" — Banner Early Adopter
   3. "Inclusividad" — Score de inclusividad
   4. "Publicar ofertas" — Quick action de ofertas
   5. "Matching" — Seccion de matching inteligente

   **Terapeuta** (4 pasos):
   1. "Bienvenido" — KPI cards
   2. "Tu perfil profesional" — Card de perfil
   3. "Verificacion" — Checklist de visibilidad
   4. "Proximamente" — Funciones del roadmap

   **Admin** (5 pasos):
   1. "Panel de control" — KPI cards de plataforma
   2. "Pestanas de actor" — Tab bar (despacho 1)
   3. "Hub de matching" — Diagrama de conexion (despacho 3)
   4. "Mensajes" — Widget de mensajes (despacho 4)
   5. "Acciones rapidas" — Grid de quick actions

5. **Persistencia**: Guardar en `localStorage` si el usuario ya vio la guia (`diversia_tour_seen_<role>`)
6. **Accesibilidad**: Focus trap dentro del tour, Escape para cerrar, anuncios para screen readers

### Criterios de aceptacion
- [ ] Tour funcional para los 4 roles
- [ ] Overlay + spotlight + tooltip posicionado correctamente
- [ ] Navegacion: Anterior, Siguiente, Cerrar, Escape
- [ ] Se auto-muestra en primer login, no se repite despues
- [ ] Boton "?" flotante para re-lanzar en cualquier momento
- [ ] 0 dependencias externas (puro Alpine.js + CSS)
- [ ] Accesible: focus trap, aria-live, Escape to close

---

## DESPACHO 6: UX/UI — Contrastes, accesibilidad y claridad visual

**Objetivo**: Mejorar drasticamente el contraste, la legibilidad y la accesibilidad visual
de todo el dashboard. Recordar: "nos miran hasta los ciegos" — la plataforma es para
talento neurodivergente, la accesibilidad no es opcional, es la razon de ser.

### Archivos afectados
- `services/profile-service/app/templates/base.html` — Variables CSS globales, fuentes
- `services/profile-service/app/templates/pages/dashboard.html` — Clases Tailwind
- `services/profile-service/app/static/css/` — Estilos custom si es necesario

### Especificacion

#### 1. Contrastes WCAG AAA
- Texto principal: minimo ratio 7:1 contra fondo (WCAG AAA)
- Texto secundario (gray-500 actual): subir a gray-700 o mas oscuro
- Labels en graficos: asegurar legibilidad sobre fondo blanco
- Badges y pills: texto sobre fondo de color con ratio minimo 4.5:1
- **Revisar todos los `text-gray-400` y `text-gray-500`** — la mayoria no pasan WCAG AA

#### 2. Tipografia
- Aumentar tamaño base de texto en cards: de `text-sm` (14px) a `text-base` (16px)
- Headers de seccion: de `text-lg` a `text-xl`, font-weight `bold`
- Numeros en KPI cards: mantener `text-2xl` pero anadir `font-bold`
- Line-height generoso en textos descriptivos (leading-relaxed)

#### 3. Espaciado y separacion visual
- Anadir bordes mas definidos entre secciones (no solo bg sutil)
- Cards: sombra ligeramente mas pronunciada (`shadow-md` en lugar de la actual `glass`)
- Separadores visuales claros entre bloques de informacion
- Padding consistente en todas las cards (min `p-6`)

#### 4. Colores semanticos claros
- **Candidato**: azul primario (#046BD2) — ya esta
- **Empresa**: ambar/dorado (#D97706) — reforzar en todas sus secciones
- **Terapeuta**: purpura (#7C3AED) — reforzar en todas sus secciones
- **Exito/activo**: verde (#059669)
- **Alerta/pendiente**: ambar (#D97706)
- **Error**: rojo (#DC2626)
- Cada tab de actor debe tener un acento de color visible en la cabecera

#### 5. Modo de alto contraste (toggle)
- Anadir un boton toggle en el header: "Alto contraste"
- Al activar: fondos blancos puros, textos negros puros, bordes de 2px solid
- Persistir preferencia en localStorage
- Respetar `prefers-contrast: more` del sistema operativo

#### 6. Iconografia
- Asegurar que todos los iconos de Lucide tienen `aria-hidden="true"` (decorativos)
- Donde el icono es informativo, anadir `aria-label` o texto alternativo
- Tamano minimo de iconos interactivos: 24x24px (WCAG 2.5.5)

#### 7. Focus visible
- Todos los elementos interactivos deben tener un `focus-visible` ring claro
- Ring de 2px offset, color primario, sobre TODOS los botones, links, tabs
- Tab order logico (revisar que no haya tabindex negativos)

### Criterios de aceptacion
- [ ] Todos los textos principales pasan WCAG AAA (ratio 7:1)
- [ ] Textos secundarios pasan WCAG AA minimo (ratio 4.5:1)
- [ ] Toggle de alto contraste funcional con persistencia en localStorage
- [ ] Focus visible en todos los elementos interactivos
- [ ] Iconos con aria-hidden o aria-label segun corresponda
- [ ] Tamano minimo de targets tactiles: 44x44px
- [ ] Colores semanticos consistentes por actor
- [ ] Sin regressions en la funcionalidad existente
- [ ] Verificar con extension de navegador (axe, Lighthouse Accessibility > 90)

---

## Orden de ejecucion recomendado

```
FASE 1 (paralelo):
  - Despacho 6 (UX/UI) ← base visual para todo lo demas
  - Despacho 1 (Tabs)  ← estructura para los demas despachos

FASE 2 (paralelo, tras fase 1):
  - Despacho 2 (Graficos interactivos)
  - Despacho 3 (Hub de matching)
  - Despacho 5 (Guia interactiva)

FASE 3 (secuencial, tras fase 2):
  - Despacho 4 (Chat) ← el mas complejo, requiere backend
```

## Dependencias entre despachos

| Despacho | Depende de |
|----------|------------|
| 1 (Tabs) | Ninguno |
| 2 (Graficos) | 1 (necesita tabs para saber donde colocar cada grafico) |
| 3 (Hub matching) | 1 (va en la tab "Resumen") |
| 4 (Chat) | Ninguno (independiente, pero integrar widget tras completar) |
| 5 (Guia interactiva) | 1, 2, 3 (necesita todos los elementos en su sitio para hacer spotlight) |
| 6 (UX/UI) | Ninguno (pero mejor hacerlo primero para que todo lo demas se construya sobre la base correcta) |
