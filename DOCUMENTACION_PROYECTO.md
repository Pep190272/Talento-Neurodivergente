# 📘 Documentación Completa del Proyecto DiversIA Eternals (Talento-Neurodivergente)

**Versión:** 1.0.0
**Fecha:** Enero 2026
**Stack:** Next.js 15.3.5 + React 19 + App Router

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Lógica de Negocio](#2-lógica-de-negocio)
3. [Casos de Uso](#3-casos-de-uso)
4. [Arquitectura del Sistema](#4-arquitectura-del-sistema)
5. [Estructura del Proyecto](#5-estructura-del-proyecto)
6. [Componentes Principales](#6-componentes-principales)
7. [APIs y Endpoints](#7-apis-y-endpoints)
8. [Modelos de Datos](#8-modelos-de-datos)
9. [Sistema de Internacionalización](#9-sistema-de-internacionalización)
10. [Tests Unitarios y End-to-End](#10-tests-unitarios-y-end-to-end)
11. [Seguridad Aplicada](#11-seguridad-aplicada)
12. [Configuración y Deployment](#12-configuración-y-deployment)
13. [Recomendaciones y Mejoras](#13-recomendaciones-y-mejoras)
14. [Datos Seed para Demo](#14-datos-seed-para-demo)

---

## 1. Resumen Ejecutivo

### 1.1 ¿Qué es DiversIA Eternals?

**DiversIA Eternals** es una plataforma integral basada en Inteligencia Artificial diseñada para conectar talento neurodivergente con empresas inclusivas. La plataforma busca empoderar a personas con condiciones como TDAH, autismo, dislexia y otras neurodivergencias, ayudándoles a identificar sus fortalezas únicas ("superpoderes cognitivos") y conectarlas con oportunidades laborales adecuadas.

### 1.2 Problema que Resuelve

| Problema | Solución DiversIA |
|----------|-------------------|
| Alto desempleo en población neurodivergente | Matching inteligente candidato-empresa |
| Falta de evaluaciones especializadas | Assessments cognitivos gamificados |
| Empresas sin herramientas de inclusión | Training modules y guías de accommodations |
| Terapeutas sin plataforma de conexión | Dashboard especializado para especialistas |
| Autoconocimiento limitado | Juegos y quizzes de autoexploración |

### 1.3 Stack Tecnológico

```
Frontend:     Next.js 15.3.5 + React 19 (App Router)
Styling:      CSS Global + Variables CSS (Dark Theme)
Icons:        React Icons (Font Awesome) + Lucide React
Charts:       Recharts 3.0.2 (preparado)
State:        React Hooks + localStorage
Backend:      Next.js API Routes (Serverless)
Database:     JSON File Storage (submissions.json)
i18n:         Custom hook useLanguage (ES/EN)
```

---

## 2. Lógica de Negocio

### 2.1 Propuesta de Valor

DiversIA Eternals opera bajo la premisa de que las personas neurodivergentes poseen habilidades cognitivas únicas que son altamente valiosas en el mercado laboral moderno:

- **Hyperfocus** → Productividad excepcional en tareas específicas
- **Pattern Recognition** → Detección de anomalías y análisis de datos
- **Creative Thinking** → Innovación y resolución de problemas no convencional
- **Detail Orientation** → Control de calidad y precisión

### 2.2 Modelo de Tres Actores

```
┌─────────────────────────────────────────────────────────────┐
│                    ECOSISTEMA DiversIA                       │
├─────────────────┬─────────────────┬─────────────────────────┤
│   INDIVIDUAL    │    COMPANY      │      THERAPIST          │
│   (Candidato)   │    (Empresa)    │     (Especialista)      │
├─────────────────┼─────────────────┼─────────────────────────┤
│ - Registro      │ - Registro      │ - Registro              │
│ - Assessment    │ - Publicar jobs │ - Evaluar candidatos    │
│ - Juegos        │ - Ver candidatos│ - Crear accommodations  │
│ - Quiz          │ - Training      │ - Matching manual       │
│ - Dashboard     │ - Analytics     │ - Consultas             │
│ - Chat AI       │ - Settings      │ - Dashboard             │
└─────────────────┴─────────────────┴─────────────────────────┘
```

### 2.3 Flujo de Negocio Principal

```
1. REGISTRO
   Usuario → /forms → Selecciona tipo → Completa formulario
                    ↓
2. ONBOARDING
   Individual: /games + /quiz → Descubre fortalezas
   Company: /company → Configura perfil y posiciones
   Therapist: /therapist → Configura especialidades
                    ↓
3. MATCHING (AI-Powered)
   Candidatos ←→ Posiciones ←→ Terapeutas
                    ↓
4. CONEXIÓN
   Entrevistas → Accommodations → Contratación
```

### 2.4 Métricas Clave del Negocio

Según los datos mostrados en la plataforma:

| Métrica | Valor |
|---------|-------|
| Candidatos evaluados | 2,500+ |
| Empresas inclusivas | 150+ |
| Tasa de matching exitoso | 78% |
| Satisfacción de usuarios | 4.8/5 |

---

## 3. Casos de Uso

### 3.1 Casos de Uso - Usuario Individual

#### CU-01: Registro de Candidato
```
Actor: Usuario neurodivergente
Precondición: Usuario en página /forms
Flujo Principal:
  1. Usuario selecciona tab "Individual"
  2. Completa nombre, diagnósticos (opcional), preferencias
  3. Sistema valida datos (email regex, campos requeridos)
  4. Sistema guarda en submissions.json
  5. Sistema almacena userData en localStorage
  6. Redirect a /dashboard
Postcondición: Usuario registrado y autenticado localmente
```

#### CU-02: Realizar Assessment Cognitivo
```
Actor: Usuario registrado
Precondición: Usuario en /quiz
Flujo Principal:
  1. Usuario selecciona quiz set (neurodiversity/workplace/cognitive)
  2. Sistema carga preguntas del set
  3. Usuario responde preguntas (MCQ, Slider, Text, Draggable)
  4. Sistema calcula puntuación y tiempo
  5. Sistema muestra resultados con Web Speech API
  6. Progreso guardado en localStorage
Postcondición: Assessment completado con estadísticas
```

#### CU-03: Jugar Juego Cognitivo
```
Actor: Usuario registrado
Precondición: Usuario en /games
Flujo Principal:
  1. Usuario ve galería de 10 juegos
  2. Selecciona juego (ej: Memory Grid)
  3. Modal abre con GameContainer
  4. Usuario juega, sistema trackea stats
  5. Game over → StatsDisplay muestra resultados
  6. Stats guardados en localStorage
Postcondición: Juego completado con métricas registradas
```

#### CU-04: Interactuar con NeuroAgent
```
Actor: Usuario en cualquier página con chat
Precondición: Componente NeuroAgent visible
Flujo Principal:
  1. Usuario escribe mensaje en chat
  2. Sistema envía POST /api/chat
  3. API procesa con pattern matching
  4. Respuesta contextual devuelta
  5. Historial guardado en localStorage
Postcondición: Conversación registrada
```

### 3.2 Casos de Uso - Empresa

#### CU-05: Registro de Empresa
```
Actor: Representante de empresa
Precondición: Usuario en /forms
Flujo Principal:
  1. Usuario selecciona tab "Company"
  2. Completa: nombre empresa, roles buscados, timeline
  3. Sistema valida y guarda
  4. Redirect a /company
Postcondición: Empresa registrada
```

#### CU-06: Buscar Candidatos
```
Actor: Empresa registrada
Precondición: Usuario en /company/candidates
Flujo Principal:
  1. Sistema muestra lista de candidatos
  2. Empresa filtra por habilidades/condiciones
  3. Ve perfiles con fortalezas y match score
  4. Puede mover candidatos entre stages (drag-drop)
Postcondición: Pipeline de candidatos actualizado
```

#### CU-07: Completar Training Module
```
Actor: Empresa registrada
Precondición: Usuario en /company/training
Flujo Principal:
  1. Sistema muestra módulos disponibles
  2. Empresa selecciona módulo
  3. Completa contenido y quiz
  4. Sistema registra progreso
Postcondición: Training completado
```

### 3.3 Casos de Uso - Terapeuta

#### CU-08: Registro de Terapeuta
```
Actor: Profesional de salud mental
Precondición: Usuario en /forms
Flujo Principal:
  1. Selecciona tab "Therapist"
  2. Completa: nombre, especialidades, tarifas
  3. Sistema valida y guarda
  4. Redirect a /therapist
Postcondición: Terapeuta registrado
```

#### CU-09: Matching Candidato-Empresa
```
Actor: Terapeuta registrado
Precondición: Usuario en /therapist
Flujo Principal:
  1. Ve lista de empresas con posiciones abiertas
  2. Ve lista de candidatos asignados
  3. Analiza match scores y accommodations
  4. Crea recomendación de accommodation
  5. Facilita conexión candidato-empresa
Postcondición: Match creado o actualizado
```

### 3.4 Diagrama de Casos de Uso

```
                    ┌─────────────────────────────────────┐
                    │           DiversIA Platform          │
                    └─────────────────────────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
   ┌────▼────┐                  ┌─────▼─────┐                 ┌─────▼─────┐
   │Individual│                  │  Company  │                 │ Therapist │
   └────┬────┘                  └─────┬─────┘                 └─────┬─────┘
        │                             │                             │
   ┌────┴────────────┐         ┌──────┴──────────┐          ┌──────┴──────────┐
   │ - Registrarse   │         │ - Registrarse   │          │ - Registrarse   │
   │ - Hacer Quiz    │         │ - Publicar Jobs │          │ - Ver Candidatos│
   │ - Jugar Juegos  │         │ - Ver Candidatos│          │ - Match Manual  │
   │ - Ver Dashboard │         │ - Training      │          │ - Accommodations│
   │ - Chat con AI   │         │ - Analytics     │          │ - Consultas     │
   └─────────────────┘         └─────────────────┘          └─────────────────┘
```

---

## 4. Arquitectura del Sistema

### 4.1 Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTE (Browser)                           │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Pages     │  │ Components  │  │   Hooks     │  │   Utils     │    │
│  │ (App Router)│  │ (React 19)  │  │ (Custom)    │  │(Translations│    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      localStorage                                │    │
│  │  - userData        - chatHistory      - quiz-progress-*         │    │
│  │  - game-progress-* - app_language     - diversia_user_data      │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTP (fetch)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SERVIDOR (Next.js API Routes)                    │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐        ┌─────────────────────┐                 │
│  │  POST/GET /api/forms │        │   POST /api/chat    │                 │
│  │  - Validación       │        │   - Pattern Match   │                 │
│  │  - Normalización    │        │   - Demo Mode       │                 │
│  │  - Persistencia     │        │   - Context Aware   │                 │
│  └──────────┬──────────┘        └─────────────────────┘                 │
│             │                                                            │
│             ▼                                                            │
│  ┌─────────────────────┐                                                │
│  │  /data/submissions  │  ← JSON File Storage                           │
│  │      .json          │                                                │
│  └─────────────────────┘                                                │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼ (Preparado, no implementado)
┌─────────────────────────────────────────────────────────────────────────┐
│                        SERVICIOS EXTERNOS (Stubs)                        │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                      │
│  │  OpenAI API │  │  OpenTDB    │  │  Analytics  │                      │
│  │  (Chat/AI)  │  │  (Quizzes)  │  │  (Future)   │                      │
│  └─────────────┘  └─────────────┘  └─────────────┘                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Arquitectura de Componentes

```
app/
├── layout.js (Root Layout - Theme, Fonts, Maintenance Mode)
│
├── page.js (Home)
│   └── components/Home/
│       ├── Home.js (Orchestrator)
│       ├── Hero.js
│       ├── HowItWorks.js
│       ├── StatsImpact.js
│       ├── Testimonials.js
│       ├── Partners.js
│       ├── CTABanner.js
│       ├── FAQSection.js
│       ├── BlogPreview.js
│       ├── NewsletterSignup.js
│       ├── ContactSupportTeaser.js
│       └── Footer.js
│
├── forms/page.js
│   └── components/GenericForm.js (Dynamic 3-type form)
│
├── games/page.js
│   └── components/games/
│       ├── GameContainer.js (Orchestrator)
│       ├── MemoryGrid.js
│       ├── PatternMatrix.js
│       ├── Operacion.js
│       ├── ReactionTime.js
│       ├── SimonSays.js
│       ├── NumberSequence.js
│       ├── WordBuilder.js
│       ├── ShapeSorter.js
│       ├── ColorMatch.js
│       ├── PathFinder.js
│       └── StatsDisplay.js
│
├── quiz/page.js
│   └── components/quiz/
│       ├── NeurodivergentQuiz.js
│       ├── QuizQuestion.js
│       ├── DraggableList.js
│       └── StatsDisplay.js
│
├── dashboard/page.js (Individual Dashboard)
├── company/page.js (Company Dashboard)
│   ├── analytics/page.js
│   ├── candidates/page.js
│   ├── training/page.js
│   └── settings/page.js
├── therapist/page.js (Therapist Dashboard)
│
└── api/
    ├── forms/route.js (POST/GET)
    └── chat/route.js (POST)
```

### 4.3 Flujo de Datos

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Usuario    │────▶│  Componente  │────▶│   useState   │
│   Interacción│     │    React     │     │  (Local)     │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                     ┌────────────────────────────┴────────────────────────┐
                     │                                                     │
                     ▼                                                     ▼
              ┌──────────────┐                                    ┌──────────────┐
              │ localStorage │                                    │  API Route   │
              │  (Persistir) │                                    │   (Server)   │
              └──────────────┘                                    └──────┬───────┘
                                                                         │
                                                                         ▼
                                                                  ┌──────────────┐
                                                                  │ JSON Storage │
                                                                  │ (Server-side)│
                                                                  └──────────────┘
```

### 4.4 Patrones de Diseño Utilizados

| Patrón | Implementación | Ubicación |
|--------|----------------|-----------|
| **Component Composition** | Home.js orquesta 10+ componentes | `/components/Home/` |
| **Container Pattern** | GameContainer maneja lógica de juegos | `/components/games/` |
| **Custom Hook** | useLanguage para i18n | `/hooks/useLanguage.js` |
| **Factory Pattern** | GenericForm genera 3 tipos de formularios | `/components/GenericForm.js` |
| **Observer Pattern** | Event 'languageChanged' para sincronizar idioma | `useLanguage.js` |
| **Strategy Pattern** | Diferentes validadores por tipo de form | `/api/forms/route.js` |

---

## 5. Estructura del Proyecto

### 5.1 Árbol de Directorios Completo

```
Talento-Neurodivergente/
│
├── app/                              # Next.js App Router (principal)
│   │
│   ├── api/                          # API Routes (Serverless)
│   │   ├── forms/
│   │   │   └── route.js              # POST/GET formularios (156 líneas)
│   │   └── chat/
│   │       └── route.js              # POST chatbot (59 líneas)
│   │
│   ├── components/                   # Componentes React reutilizables
│   │   ├── GenericForm.js            # Formulario dinámico (3 tipos)
│   │   ├── NeuroAgent.js             # Chatbot AI conversacional
│   │   │
│   │   ├── Navbar/
│   │   │   └── Navbar.js             # Navegación con auth detection
│   │   │
│   │   ├── Home/                     # Componentes de landing
│   │   │   ├── Home.js               # Orquestador
│   │   │   ├── Hero.js               # Hero section
│   │   │   ├── HowItWorks.js         # Explicación del proceso
│   │   │   ├── StatsImpact.js        # Métricas de impacto
│   │   │   ├── Testimonials.js       # Testimonios
│   │   │   ├── Partners.js           # Partners/empresas
│   │   │   ├── CTABanner.js          # Call to action
│   │   │   ├── FAQSection.js         # Preguntas frecuentes
│   │   │   ├── BlogPreview.js        # Preview de blog
│   │   │   ├── NewsletterSignup.js   # Suscripción newsletter
│   │   │   ├── ContactSupportTeaser.js
│   │   │   └── Footer.js             # Footer global
│   │   │
│   │   ├── quiz/                     # Sistema de assessments
│   │   │   ├── NeurodivergentQuiz.js # Quiz principal
│   │   │   ├── QuizQuestion.js       # Renderiza preguntas
│   │   │   ├── DraggableList.js      # Drag-drop para ranking
│   │   │   └── StatsDisplay.js       # Muestra resultados
│   │   │
│   │   ├── games/                    # 10 juegos cognitivos
│   │   │   ├── GameContainer.js      # Orquestador de juegos
│   │   │   ├── MemoryGrid.js         # Memoria visual
│   │   │   ├── PatternMatrix.js      # Reconocimiento patrones
│   │   │   ├── Operacion.js          # Precisión de clicks
│   │   │   ├── ReactionTime.js       # Tiempo de reacción
│   │   │   ├── SimonSays.js          # Secuencias
│   │   │   ├── NumberSequence.js     # Secuencias numéricas
│   │   │   ├── WordBuilder.js        # Construcción palabras
│   │   │   ├── ShapeSorter.js        # Clasificación espacial
│   │   │   ├── ColorMatch.js         # Emparejamiento colores
│   │   │   ├── PathFinder.js         # Pathfinding
│   │   │   └── StatsDisplay.js       # Stats de juegos
│   │   │
│   │   ├── Features/                 # Componentes de features
│   │   │   └── ...
│   │   │
│   │   └── GetStarted/
│   │       └── GetStarted.js         # Onboarding wizard
│   │
│   ├── hooks/                        # Custom React Hooks
│   │   └── useLanguage.js            # Hook de internacionalización
│   │
│   ├── utils/                        # Utilidades
│   │   ├── translations.js           # Traducciones básicas (312 líneas)
│   │   └── translations_extended.js  # Traducciones extendidas
│   │
│   ├── data/                         # Almacenamiento JSON
│   │   └── submissions.json          # Datos de formularios
│   │
│   ├── (pages)/                      # Páginas de la app
│   │   ├── page.js                   # Home (/)
│   │   ├── forms/page.js             # Formularios (/forms)
│   │   ├── games/page.js             # Galería juegos (/games)
│   │   ├── quiz/page.js              # Sistema quizzes (/quiz)
│   │   ├── dashboard/page.js         # Dashboard individual (/dashboard)
│   │   ├── company/                  # Dashboard empresa
│   │   │   ├── page.js               # /company
│   │   │   ├── analytics/page.js     # /company/analytics
│   │   │   ├── candidates/page.js    # /company/candidates
│   │   │   ├── training/page.js      # /company/training
│   │   │   └── settings/page.js      # /company/settings
│   │   ├── therapist/page.js         # Dashboard terapeuta
│   │   ├── about/page.js             # Página about
│   │   ├── get-started/page.js       # Onboarding
│   │   └── features/                 # Páginas de features
│   │
│   ├── layout.js                     # Root layout (theme, fonts)
│   └── globals.css                   # Estilos globales
│
├── public/                           # Archivos estáticos
│   └── ...
│
├── package.json                      # Dependencias y scripts
├── package-lock.json                 # Lock file
├── next.config.mjs                   # Configuración Next.js
├── jsconfig.json                     # Paths de importación
├── .gitignore                        # Git ignore
└── README.md                         # README del proyecto
```

### 5.2 Archivos Clave

| Archivo | Propósito | Líneas |
|---------|-----------|--------|
| `app/api/forms/route.js` | Backend de formularios | ~156 |
| `app/api/chat/route.js` | Backend de chatbot | ~59 |
| `app/components/GenericForm.js` | Constructor de formularios | ~200 |
| `app/components/NeuroAgent.js` | Chat UI | ~150 |
| `app/components/games/GameContainer.js` | Orquestador de juegos | ~100 |
| `app/utils/translations.js` | i18n strings | ~312 |
| `app/hooks/useLanguage.js` | Hook de idioma | ~50 |
| `app/layout.js` | Layout raíz | ~80 |

---

## 6. Componentes Principales

### 6.1 GenericForm - Constructor de Formularios

**Ubicación:** `/app/components/GenericForm.js`

**Propósito:** Renderiza dinámicamente 3 tipos de formularios según el tipo de usuario.

```javascript
// Estructura del componente
const GenericForm = () => {
  const [activeTab, setActiveTab] = useState('individual');
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // Configuración de campos por tipo
  const formConfigs = {
    individual: {
      fields: ['name', 'diagnoses', 'preferences'],
      required: ['name']
    },
    company: {
      fields: ['companyName', 'roles', 'timeline'],
      required: ['companyName', 'roles']
    },
    therapist: {
      fields: ['name', 'specialties', 'rates'],
      required: ['name', 'specialties']
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validación
    // POST a /api/forms
    // Guardar en localStorage
    // Redirect
  };
};
```

### 6.2 NeuroAgent - Chatbot AI

**Ubicación:** `/app/components/NeuroAgent.js`

**Propósito:** Asistente conversacional que ayuda a los usuarios a navegar la plataforma.

```javascript
// Características principales
- Interfaz de chat flotante (toggle)
- Historial persistido en localStorage
- Context-aware (conoce userData)
- Typing animation
- Auto-scroll
- Pattern matching para respuestas (demo mode)
- Preparado para integración OpenAI
```

**Keywords soportados (demo mode):**
- `juego` → Información sobre juegos
- `evaluación/assessment` → Info sobre quizzes
- `empresa/contratar` → Info para empresas
- `formulario/registro` → Guía de registro
- `ayuda/cómo funciona` → Explicación general

### 6.3 GameContainer - Orquestador de Juegos

**Ubicación:** `/app/components/games/GameContainer.js`

**Propósito:** Maneja la lógica común de todos los juegos y renderiza el componente específico.

```javascript
// 10 juegos disponibles
const games = {
  memoryGrid: {
    component: MemoryGrid,
    title: 'Memory Grid',
    description: 'Test your visual memory',
    skills: ['Visual Memory', 'Pattern Recognition']
  },
  patternMatrix: { /* ... */ },
  operacion: { /* ... */ },
  reactionTime: { /* ... */ },
  simonSays: { /* ... */ },
  numberSequence: { /* ... */ },
  wordBuilder: { /* ... */ },
  shapeSorter: { /* ... */ },
  colorMatch: { /* ... */ },
  pathFinder: { /* ... */ }
};

// Funcionalidad común
- Guardado automático de progreso
- Estadísticas unificadas
- AI tips placeholder
- Traducción integrada
```

### 6.4 Sistema de Quiz

**Ubicación:** `/app/components/quiz/`

**Componentes:**
- `NeurodivergentQuiz.js` - Componente principal
- `QuizQuestion.js` - Renderiza preguntas
- `DraggableList.js` - Para preguntas de ranking
- `StatsDisplay.js` - Muestra resultados

**Tipos de preguntas soportados:**
```javascript
const questionTypes = {
  mcq: 'Multiple Choice Question',
  slider: 'Escala numérica',
  text: 'Respuesta libre',
  draggable: 'Ranking/Ordenar'
};
```

**Quiz sets disponibles:**
1. `neurodiversity` - Autoconocimiento neurodivergente
2. `workplace` - Preferencias laborales
3. `cognitive` - Habilidades cognitivas

### 6.5 Dashboards Especializados

#### Dashboard Individual (`/dashboard`)
```javascript
// Secciones
- Quick Actions (Forms, Games, Assessment)
- AI Insights (placeholder)
- Recent Activity
- NeuroAgent Chat
- Profile Summary
```

#### Dashboard Empresa (`/company`)
```javascript
// Secciones principales
- KPI Cards (búsquedas, candidatos, tasa éxito)
- Candidate Pipeline (drag-drop)
- AI Recommendations
- Sub-rutas: /analytics, /candidates, /training, /settings
```

#### Dashboard Terapeuta (`/therapist`)
```javascript
// Secciones
- Company Browser (posiciones abiertas)
- Candidate Profiles
- Matching System
- Accommodation Builder
- Video Consultation Prep
```

---

## 7. APIs y Endpoints

### 7.1 POST /api/forms

**Propósito:** Recibir y procesar envíos de formularios.

**Request:**
```javascript
POST /api/forms
Content-Type: application/json

{
  "formData": {
    "name": "Juan Pérez",
    "diagnoses": "TDAH",
    "preferences": "Trabajo remoto"
  },
  "formType": "individual" // | "company" | "therapist"
}
```

**Response (éxito):**
```javascript
{
  "success": true,
  "submission": {
    "id": "1704067200000",
    "type": "individual",
    "data": {
      "name": "Juan Pérez",
      "diagnoses": "TDAH",
      "preferences": "Trabajo remoto"
    },
    "summary": "Individual submission: Juan Pérez",
    "timestamp": "2026-01-01T00:00:00.000Z",
    "validated": true
  },
  "message": "Form submitted successfully"
}
```

**Response (error):**
```javascript
{
  "success": false,
  "errors": ["Name is required", "Invalid email format"],
  "message": "Validation failed"
}
```

**Validaciones implementadas:**
- Campos requeridos por tipo
- Email regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Longitud mínima de nombre: 2 caracteres
- Normalización: `.trim()`, `.toLowerCase()`

### 7.2 GET /api/forms

**Propósito:** Obtener todas las submisiones (para admin/debug).

**Response:**
```javascript
{
  "submissions": [
    { "id": "...", "type": "...", "data": {...}, ... },
    // ...
  ],
  "count": 15
}
```

### 7.3 POST /api/chat

**Propósito:** Procesar mensajes del chatbot NeuroAgent.

**Request:**
```javascript
POST /api/chat
Content-Type: application/json

{
  "prompt": "¿Cómo funcionan los juegos?",
  "userData": {
    "type": "individual",
    "name": "Juan"
  },
  "history": [
    { "role": "user", "content": "Hola" },
    { "role": "assistant", "content": "¡Hola! ¿En qué puedo ayudarte?" }
  ]
}
```

**Response:**
```javascript
{
  "response": "Los juegos de DiversIA están diseñados para evaluar tus habilidades cognitivas de manera divertida. Puedes acceder a ellos desde la sección /games.",
  "timestamp": "2026-01-01T00:00:00.000Z",
  "context": {
    "userData": { "type": "individual", "name": "Juan" },
    "mode": "demo"
  }
}
```

**Modo actual:** Demo (pattern matching)
**Modo futuro:** OpenAI GPT integration

---

## 8. Modelos de Datos

### 8.1 Submission Model

```typescript
interface Submission {
  id: string;              // Timestamp como ID único
  type: 'individual' | 'company' | 'therapist';
  data: {
    // Individual
    name?: string;
    diagnoses?: string;
    preferences?: string;

    // Company
    companyName?: string;
    roles?: string;
    timeline?: string;

    // Therapist
    specialties?: string;
    rates?: string;
  };
  summary: string;         // Resumen generado
  timestamp: string;       // ISO date string
  validated: boolean;      // Si pasó validación
}
```

### 8.2 User Data (localStorage)

```typescript
interface UserData {
  type: 'individual' | 'company' | 'therapist';
  name: string;
  // Campos adicionales según tipo
}
```

### 8.3 Game Stats

```typescript
interface GameStats {
  score: number;
  accuracy: number;        // Porcentaje
  reactionTime?: number;   // Milisegundos
  correct: number;
  incorrect: number;
  aiTips?: string;
  timestamp: string;
  // Campos específicos por juego
}
```

### 8.4 Quiz State

```typescript
interface QuizState {
  current: number;         // Índice pregunta actual
  answers: (any | null)[]; // Respuestas
  startTime: number;       // Timestamp inicio
  stats: Record<number, QuestionStats>;
  completed: boolean;
  aiTips?: string;
  review: boolean;         // Modo revisión
  timer: number;           // Segundos restantes
}
```

### 8.5 Chat Message

```typescript
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}
```

### 8.6 Company (Sample Data)

```typescript
interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  location: string;
  culture: string;
  neurodiversitySupport: string;
  openPositions: Position[];
  benefits: string[];
  contactPerson: string;
  contactEmail: string;
}

interface Position {
  id: string;
  title: string;
  department: string;
  requirements: string[];
  accommodations: string[];
  matchScore: number;
}
```

### 8.7 Candidate (Sample Data)

```typescript
interface Candidate {
  id: string;
  name: string;
  age: number;
  condition: string;       // Ej: "ADHD", "Autism"
  location: string;
  education: string;
  experience: string;
  skills: string[];
  strengths: string[];
  challenges: string[];
  accommodations: string[];
  interests: string[];
  availability: string;
}
```

---

## 9. Sistema de Internacionalización

### 9.1 Hook useLanguage

**Ubicación:** `/app/hooks/useLanguage.js`

```javascript
const useLanguage = () => {
  const [currentLang, setCurrentLang] = useState('es');
  const [isClient, setIsClient] = useState(false);

  // Cargar idioma de localStorage al montar
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('app_language');
    if (saved) setCurrentLang(saved);
  }, []);

  // Cambiar idioma
  const changeLanguage = (langCode) => {
    setCurrentLang(langCode);
    localStorage.setItem('app_language', langCode);
    window.dispatchEvent(new CustomEvent('languageChanged', {
      detail: langCode
    }));
  };

  // Función de traducción
  const t = (key) => {
    return translations[currentLang]?.[key] || key;
  };

  return { currentLang, language: currentLang, changeLanguage, t, isClient };
};
```

### 9.2 Archivos de Traducción

**`/app/utils/translations.js`** (~312 líneas)

```javascript
export const translations = {
  es: {
    // Navbar
    'navbar.home': 'Inicio',
    'navbar.features': 'Características',
    'navbar.games': 'Juegos',
    'navbar.about': 'Nosotros',
    'navbar.getStarted': 'Comenzar',

    // Hero
    'hero.title': 'Desbloquea tu Superpoder Neurodivergente',
    'hero.subtitle': 'Conectamos talento único con empresas inclusivas',

    // Forms
    'forms.individual.title': 'Registro Individual',
    'forms.individual.fullName': 'Nombre Completo',
    // ... más keys
  },
  en: {
    'navbar.home': 'Home',
    'navbar.features': 'Features',
    // ... traducciones en inglés
  }
};
```

### 9.3 Uso en Componentes

```jsx
const MyComponent = () => {
  const { t, currentLang, changeLanguage } = useLanguage();

  return (
    <div>
      <h1>{t('hero.title')}</h1>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('es')}>Español</button>
    </div>
  );
};
```

### 9.4 Idiomas Soportados

| Código | Idioma | Estado |
|--------|--------|--------|
| `es` | Español | ✅ Completo (default) |
| `en` | English | ✅ Completo |

---

## 10. Tests Unitarios y End-to-End

### 10.1 Estado Actual

> ⚠️ **IMPORTANTE:** El proyecto actualmente **NO tiene tests implementados**.

**Análisis realizado:**
- ❌ No hay archivos `*.test.js` o `*.spec.js`
- ❌ No existe directorio `__tests__`
- ❌ No hay configuración de Jest
- ❌ No hay configuración de Playwright (aunque está en dependencies)
- ❌ No hay directorio `cypress/` o `e2e/`
- ❌ No hay script `test` en package.json

### 10.2 Frameworks Recomendados para Implementar

#### Tests Unitarios
```bash
# Instalación recomendada
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

#### Tests E2E
```bash
# Playwright ya está como dependencia
npm install --save-dev @playwright/test
npx playwright install
```

### 10.3 Tests Unitarios Sugeridos

#### Test para API de Formularios
```javascript
// __tests__/api/forms.test.js
import { POST, GET } from '@/app/api/forms/route';

describe('POST /api/forms', () => {
  it('should validate required fields', async () => {
    const request = new Request('http://localhost/api/forms', {
      method: 'POST',
      body: JSON.stringify({ formData: {}, formType: 'individual' })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.success).toBe(false);
    expect(data.errors).toContain('Name is required');
  });

  it('should accept valid individual form', async () => {
    const request = new Request('http://localhost/api/forms', {
      method: 'POST',
      body: JSON.stringify({
        formData: { name: 'Test User', email: 'test@example.com' },
        formType: 'individual'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.submission.validated).toBe(true);
  });

  it('should validate email format', async () => {
    const request = new Request('http://localhost/api/forms', {
      method: 'POST',
      body: JSON.stringify({
        formData: { name: 'Test', email: 'invalid-email' },
        formType: 'individual'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.success).toBe(false);
    expect(data.errors).toContain('Invalid email format');
  });
});
```

#### Test para Hook useLanguage
```javascript
// __tests__/hooks/useLanguage.test.js
import { renderHook, act } from '@testing-library/react';
import useLanguage from '@/app/hooks/useLanguage';

describe('useLanguage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should default to Spanish', () => {
    const { result } = renderHook(() => useLanguage());
    expect(result.current.currentLang).toBe('es');
  });

  it('should change language and persist', () => {
    const { result } = renderHook(() => useLanguage());

    act(() => {
      result.current.changeLanguage('en');
    });

    expect(result.current.currentLang).toBe('en');
    expect(localStorage.getItem('app_language')).toBe('en');
  });

  it('should translate keys correctly', () => {
    const { result } = renderHook(() => useLanguage());

    const translation = result.current.t('navbar.home');
    expect(translation).toBe('Inicio');
  });
});
```

#### Test para Componente GenericForm
```javascript
// __tests__/components/GenericForm.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GenericForm from '@/app/components/GenericForm';

describe('GenericForm', () => {
  it('should render three tabs', () => {
    render(<GenericForm />);

    expect(screen.getByText('Individual')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Therapist')).toBeInTheDocument();
  });

  it('should switch tabs on click', () => {
    render(<GenericForm />);

    fireEvent.click(screen.getByText('Company'));
    expect(screen.getByText('Company Name')).toBeInTheDocument();
  });

  it('should show validation errors', async () => {
    render(<GenericForm />);

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });
});
```

### 10.4 Tests E2E Sugeridos

```javascript
// e2e/registration.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Registration Flow', () => {
  test('should complete individual registration', async ({ page }) => {
    await page.goto('/forms');

    // Verificar que estamos en la página correcta
    await expect(page.locator('h1')).toContainText('Register');

    // Seleccionar tab Individual (default)
    await expect(page.locator('[data-tab="individual"]')).toHaveClass(/active/);

    // Llenar formulario
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('textarea[name="diagnoses"]', 'ADHD');
    await page.fill('textarea[name="preferences"]', 'Remote work');

    // Submit
    await page.click('button[type="submit"]');

    // Verificar redirect a dashboard
    await expect(page).toHaveURL('/dashboard');

    // Verificar que userData está en localStorage
    const userData = await page.evaluate(() => localStorage.getItem('userData'));
    expect(JSON.parse(userData)).toMatchObject({
      type: 'individual',
      name: 'Test User'
    });
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/forms');

    await page.click('button[type="submit"]');

    await expect(page.locator('.error-message')).toBeVisible();
  });
});

test.describe('Games Flow', () => {
  test('should open and play memory game', async ({ page }) => {
    await page.goto('/games');

    // Click en Memory Grid
    await page.click('[data-game="memoryGrid"]');

    // Verificar que modal se abre
    await expect(page.locator('.game-modal')).toBeVisible();

    // Jugar el juego
    await page.click('.game-start-button');

    // Verificar que el juego inició
    await expect(page.locator('.game-board')).toBeVisible();
  });
});

test.describe('Quiz Flow', () => {
  test('should complete neurodiversity quiz', async ({ page }) => {
    await page.goto('/quiz?quiz=neurodiversity');

    // Verificar primera pregunta
    await expect(page.locator('.quiz-question')).toBeVisible();

    // Responder preguntas
    for (let i = 0; i < 5; i++) {
      await page.click('.quiz-option:first-child');
      await page.click('button:has-text("Next")');
    }

    // Verificar resultados
    await expect(page.locator('.quiz-results')).toBeVisible();
  });
});
```

### 10.5 Configuración Sugerida

#### jest.config.js
```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/e2e/'],
};

module.exports = createJestConfig(customJestConfig);
```

#### playwright.config.ts
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 11. Seguridad Aplicada

### 11.1 Estado Actual de Seguridad

| Categoría | Estado | Riesgo |
|-----------|--------|--------|
| Autenticación | ❌ No implementada | CRÍTICO |
| Autorización | ❌ No implementada | CRÍTICO |
| Validación de Input | ✅ Básica | MEDIO |
| Sanitización XSS | ❌ No implementada | CRÍTICO |
| CORS | ❌ No configurado | MEDIO |
| CSP | ❌ No configurado | MEDIO |
| Encriptación de datos | ❌ No implementada | CRÍTICO |
| Rate Limiting | ❌ No implementado | MEDIO |
| Headers de Seguridad | ❌ No configurados | MEDIO |

### 11.2 Validación Implementada

**Ubicación:** `/app/api/forms/route.js` (líneas 42-96)

```javascript
// Validación actual
function validateAndNormalize(formData, formType) {
  const errors = [];
  const normalized = {};

  // Validación de campos requeridos
  if (!formData.name || formData.name.trim().length < 2) {
    errors.push('Name is required (min 2 characters)');
  }

  // Validación de email
  if (formData.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.push('Invalid email format');
    }
  }

  // Normalización
  normalized.name = formData.name?.trim();
  normalized.email = formData.email?.trim().toLowerCase();

  return { errors, normalized };
}
```

### 11.3 Vulnerabilidades Identificadas

#### 11.3.1 Sin Autenticación
```
RIESGO: Cualquier usuario puede acceder a todas las rutas
IMPACTO: Acceso no autorizado a datos sensibles
SOLUCIÓN: Implementar NextAuth.js o JWT
```

#### 11.3.2 Datos Sensibles en localStorage
```javascript
// Código actual (INSEGURO)
localStorage.setItem('userData', JSON.stringify(userData));
localStorage.setItem('chatHistory', JSON.stringify(messages));

// RIESGO: Datos accesibles por XSS
// SOLUCIÓN: Encriptar con crypto-js o usar httpOnly cookies
```

#### 11.3.3 Sin Sanitización XSS
```javascript
// RIESGO: Input del usuario se usa directamente
// Ej: El nombre del usuario se muestra sin sanitizar

// SOLUCIÓN: Usar DOMPurify
import DOMPurify from 'dompurify';
const cleanName = DOMPurify.sanitize(formData.name);
```

#### 11.3.4 API Routes Públicas
```javascript
// Cualquiera puede hacer GET /api/forms y obtener TODOS los datos
// RIESGO: Exposición de datos personales
// SOLUCIÓN: Middleware de autenticación
```

#### 11.3.5 Almacenamiento en JSON Plano
```javascript
// /data/submissions.json contiene datos personales sin encriptar
// RIESGO: Si el servidor es comprometido, todos los datos quedan expuestos
// SOLUCIÓN: Usar base de datos con encriptación o encriptar JSON
```

### 11.4 Mejoras de Seguridad Recomendadas

#### 11.4.1 Implementar Autenticación con NextAuth.js

```javascript
// app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Validar credenciales contra base de datos
        const user = await validateUser(credentials);
        return user || null;
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.type = user.type;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.type = token.type;
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

#### 11.4.2 Middleware de Protección de Rutas

```javascript
// middleware.js
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname;

      // Rutas públicas
      if (path.startsWith('/api/auth') || path === '/' || path === '/about') {
        return true;
      }

      // Rutas protegidas requieren token
      if (path.startsWith('/dashboard') || path.startsWith('/api/forms')) {
        return !!token;
      }

      // Rutas de empresa requieren tipo company
      if (path.startsWith('/company')) {
        return token?.type === 'company';
      }

      return true;
    }
  }
});

export const config = {
  matcher: ['/dashboard/:path*', '/company/:path*', '/therapist/:path*', '/api/:path*']
};
```

#### 11.4.3 Headers de Seguridad en next.config.mjs

```javascript
// next.config.mjs
const nextConfig = {
  output: 'standalone',

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:;"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
```

#### 11.4.4 Rate Limiting

```javascript
// app/api/middleware/rateLimit.js
const rateLimitMap = new Map();

export function rateLimit(options = {}) {
  const { windowMs = 60000, max = 100 } = options;

  return function rateLimitMiddleware(req) {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const now = Date.now();

    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, { count: 1, startTime: now });
      return { allowed: true };
    }

    const userData = rateLimitMap.get(ip);

    if (now - userData.startTime > windowMs) {
      rateLimitMap.set(ip, { count: 1, startTime: now });
      return { allowed: true };
    }

    if (userData.count >= max) {
      return {
        allowed: false,
        retryAfter: Math.ceil((userData.startTime + windowMs - now) / 1000)
      };
    }

    userData.count++;
    return { allowed: true };
  };
}

// Uso en API route
export async function POST(request) {
  const limiter = rateLimit({ windowMs: 60000, max: 10 });
  const { allowed, retryAfter } = limiter(request);

  if (!allowed) {
    return Response.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': retryAfter } }
    );
  }

  // ... resto de la lógica
}
```

#### 11.4.5 Sanitización de Input

```javascript
// app/utils/sanitize.js
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No permitir HTML
    ALLOWED_ATTR: []
  }).trim();
}

export function sanitizeObject(obj) {
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = typeof value === 'string'
      ? sanitizeInput(value)
      : value;
  }
  return sanitized;
}

// Uso en API
import { sanitizeObject } from '@/app/utils/sanitize';

export async function POST(request) {
  const body = await request.json();
  const sanitizedData = sanitizeObject(body.formData);
  // ... procesar datos sanitizados
}
```

#### 11.4.6 Encriptación de localStorage

```javascript
// app/utils/secureStorage.js
import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.NEXT_PUBLIC_STORAGE_KEY || 'default-key';

export const secureStorage = {
  setItem(key, value) {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(value),
      SECRET_KEY
    ).toString();
    localStorage.setItem(key, encrypted);
  },

  getItem(key) {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;

    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch {
      return null;
    }
  },

  removeItem(key) {
    localStorage.removeItem(key);
  }
};

// Uso
import { secureStorage } from '@/app/utils/secureStorage';

secureStorage.setItem('userData', { name: 'Juan', type: 'individual' });
const userData = secureStorage.getItem('userData');
```

### 11.5 Checklist de Seguridad para Producción

```
□ Implementar autenticación (NextAuth.js)
□ Configurar middleware de autorización
□ Añadir headers de seguridad (CSP, HSTS, etc.)
□ Implementar rate limiting en APIs
□ Sanitizar todos los inputs con DOMPurify
□ Encriptar datos sensibles en localStorage
□ Migrar de JSON file a base de datos segura
□ Configurar CORS apropiadamente
□ Habilitar HTTPS en producción
□ Auditar dependencias con npm audit
□ Implementar logging de seguridad
□ Configurar validación de environment variables
□ Revisar permisos de archivos en servidor
□ Implementar backup encriptado de datos
```

---

## 12. Configuración y Deployment

### 12.1 Variables de Entorno

```bash
# .env.local (desarrollo)
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
OPENAI_API_KEY=your_openai_api_key_here

# .env.production (producción)
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://diversia.example.com
OPENAI_API_KEY=your_production_openai_key

# Variables adicionales recomendadas
NEXT_PUBLIC_STORAGE_KEY=your_encryption_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://diversia.example.com
```

### 12.2 Scripts de NPM

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### 12.3 Configuración Next.js

```javascript
// next.config.mjs
const nextConfig = {
  output: 'standalone',

  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },

  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false
    };
    return config;
  },

  // Headers de seguridad (ver sección 11.4.3)
  async headers() {
    return [/* ... */];
  }
};

export default nextConfig;
```

### 12.4 Deployment

#### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy a producción
vercel --prod
```

#### Docker
```dockerfile
# Dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### 12.5 Estado de Mantenimiento

El proyecto tiene actualmente un modo de mantenimiento activado:

```javascript
// app/layout.js (línea 10)
const maintenanceMode = true;  // ← ACTIVADO
```

Para desactivar:
```javascript
const maintenanceMode = false;
```

---

## 13. Recomendaciones y Mejoras

### 13.1 Prioridad Alta (Críticas)

| # | Mejora | Impacto | Esfuerzo |
|---|--------|---------|----------|
| 1 | Implementar autenticación | Seguridad | Alto |
| 2 | Añadir tests unitarios | Calidad | Medio |
| 3 | Sanitizar inputs (XSS) | Seguridad | Bajo |
| 4 | Migrar a base de datos | Escalabilidad | Alto |
| 5 | Encriptar localStorage | Seguridad | Bajo |

### 13.2 Prioridad Media

| # | Mejora | Impacto | Esfuerzo |
|---|--------|---------|----------|
| 6 | Integrar OpenAI real | Funcionalidad | Medio |
| 7 | Añadir tests E2E | Calidad | Medio |
| 8 | Configurar CORS | Seguridad | Bajo |
| 9 | Implementar rate limiting | Seguridad | Bajo |
| 10 | Añadir headers seguridad | Seguridad | Bajo |

### 13.3 Prioridad Baja (Nice to have)

| # | Mejora | Impacto | Esfuerzo |
|---|--------|---------|----------|
| 11 | PWA offline support | UX | Medio |
| 12 | Más idiomas (PT, FR) | Alcance | Medio |
| 13 | Analytics dashboard real | Business | Alto |
| 14 | Notificaciones push | Engagement | Medio |
| 15 | Export de datos (CSV/PDF) | Funcionalidad | Bajo |

### 13.4 Roadmap Sugerido

```
FASE 1 - Seguridad Básica (2-3 semanas)
├── Implementar NextAuth.js
├── Añadir middleware de autorización
├── Configurar headers de seguridad
├── Sanitizar inputs
└── Encriptar localStorage

FASE 2 - Testing (1-2 semanas)
├── Configurar Jest
├── Escribir tests unitarios para APIs
├── Escribir tests de componentes
├── Configurar Playwright
└── Escribir tests E2E críticos

FASE 3 - Escalabilidad (2-3 semanas)
├── Migrar a PostgreSQL/MongoDB
├── Implementar caching (Redis)
├── Configurar CDN
└── Optimizar bundle size

FASE 4 - Funcionalidad AI (1-2 semanas)
├── Integrar OpenAI para chat
├── Generar quizzes dinámicos
├── AI feedback en juegos
└── Matching inteligente real
```

---

## 14. Datos Seed para Demo

### 14.1 Propósito y Separación de Producción

Los datos seed existen **exclusivamente para demo** y pruebas. Todos usan el dominio `@seed.diversia.com` y **JAMÁS deben mezclarse** con datos reales de usuarios, empresas o terapeutas registrados en producción.

**Regla de oro:** El sistema ya está en producción recogiendo datos reales. Los datos seed permiten demostrar funcionalidad completa sin contaminar la base de datos real.

### 14.2 Cobertura de Datos Seed (v2.7.0)

| Entidad | Cantidad | Detalle |
|---------|----------|---------|
| **Super Admin** | 1 | diversiaeternals@gmail.com |
| **Empresas** | 14 | 14 sectores distintos |
| **Ofertas de empleo** | 33 | Desde peón sin experiencia hasta CTO |
| **Candidatos** | 24 | 15 neurodivergencias distintas |
| **Terapeutas** | 8 | Complementarios entre sí |
| **Matchings IA** | 55+ | Scores 38-97 |
| **Conexiones** | 49+ | Terapia + Consulting + Job Match |
| **Audit Logs** | 15+ | GDPR + EU AI Act |

### 14.3 Sectores Empresariales Cubiertos

| Sector | Empresa | Ofertas |
|--------|---------|---------|
| Tecnología | NeuraTech Solutions | Frontend, Data, Backend |
| Restauración | Cocina Inclusiva | Chef, Cocinero/a línea, Ayudante, Camarero/a, Office |
| Alimentación | NutriDiversa | Control calidad, Logística |
| Servicios | ServiPlus Inclusivo | Mantenimiento, Jardinería, Limpieza |
| Salud | Clínica NeuroVida | Admin sanitario, Auxiliar enfermería |
| Educación | Academia Brillante | Profesor/a, Apoyo educativo |
| Retail | TiendaParaTodos | Reponedor/a, Visual merchandiser |
| Logística | LogiAccess | Operario almacén, Inventarios |
| ONG | Fundación Puentes | Educador/a social, Coordinador/a |
| Consultoría D&I | Diversa Consulting | Consultor/a, Formador/a |
| **Construcción** | Construcciones Puente Verde | Peón, Albañil, Pintor/a, Carpintero/a, Lampista, Solador/a |
| **Automoción** | AutoTaller NeuroMotor | Mecánico/a, Electricista auto, Aprendiz, Chapista |
| **Viveros/Agricultura** | Viveros del Sol | Jardinero/a, Peón agrícola, Florista |
| **Artesanía** | Obrador Artesano Manos Diversas | Ceramista, Ebanista, Restaurador/a |

### 14.4 Neurodivergencias Representadas en Candidatos

| Neurodivergencia | Candidatos | Oficios representados |
|-----------------|------------|----------------------|
| TDAH | Carlos, Lucía, Diego, Marina | Frontend dev, Chef, Mantenimiento, Pintora |
| TEA (nivel 1) | Ana, Marcos, Irene, Adrián | Data scientist, Calidad, Almacén, Jardinero |
| TEA (nivel 2) | Óscar | Mecánico de taller |
| Dislexia | Pablo, Nuria, Héctor | Diseñador, Educadora, Ebanista |
| Discalculia | Elena | Content manager |
| Dispraxia/TDC | Jorge | Consultor accesibilidad |
| Síndrome de Tourette | Raúl, Rosa | Backend dev, Cocinera de línea |
| TPS (Procesamiento Sensorial) | Clara | Ilustradora |
| Altas Capacidades | Miguel, Laura | Arquitecto software, Investigadora |
| TANV | David | Atención al cliente |
| TOC | Alberto | Auditor |
| **TAG (Ansiedad Generalizada)** | Carmen (+ TDAH) | Ceramista |
| **Trastorno Bipolar tipo II** | Tomás | Peón agrícola |
| **Doble Excepcionalidad** | Sofía (AC+TDAH), Fernando (TDAH+Dislexia), Carmen (TAG+TDAH) | Consultora, Albañil, Ceramista |

### 14.5 Terapeutas Seed

| Terapeuta | Especialidad | Para quién |
|-----------|-------------|------------|
| Dra. Carmen Vega | TDAH + Coaching Ejecutivo | Candidatos TDAH + empresas |
| Dr. Alejandro Ruiz | TEA + Integración Sensorial | Candidatos TEA + empresas |
| Lda. Marta Soler | Dislexia + Dificultades Aprendizaje | Candidatos Dislexia/Discalculia/TANV |
| Dr. Pablo Navarro | Neuropsicología Clínica (Diagnóstico) | Evaluaciones formales |
| Lda. Sofía Chen | Coaching Laboral Neurodivergente | Coaching + empresas |
| Dra. Isabel Moreno | Altas Capacidades + Doble Excepcionalidad | Perfiles complejos |
| **Lda. Lucía Ramos** | **Terapia Ocupacional (oficios manuales)** | **Adaptación puestos manuales + empresas** |
| **Dr. Rafael Torres** | **EMDR/Trauma en neurodivergentes** | **Burnout, bipolaridad, ansiedad** |

### 14.6 Archivos de Datos Seed

```
prisma/
├── seed.ts                        # Orquestador principal (matchings, conexiones, audit)
└── seed-data/
    ├── candidates.ts              # 24 candidatos neurodivergentes
    ├── companies.ts               # 14 empresas con 33 ofertas
    └── therapists.ts              # 8 terapeutas especializados
```

### 14.7 Cómo ejecutar el seeder

```bash
npx prisma db seed
```

**Credenciales seed (solo demo):**
- Candidatos: `candidate123`
- Empresas: `company123`
- Terapeutas: `therapist123`
- Admin: `d1v3rs14Eternal$`

---

## Apéndice A: Glosario

| Término | Definición |
|---------|------------|
| **Neurodivergente** | Persona con condiciones como TDAH, autismo, dislexia, etc. |
| **Superpoder cognitivo** | Fortaleza única derivada de la neurodivergencia |
| **Accommodation** | Adaptación laboral para facilitar el trabajo |
| **Matching** | Proceso de emparejar candidato con empresa |
| **Assessment** | Evaluación de habilidades cognitivas |

## Apéndice B: Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run lint             # Ejecutar linter

# Build y producción
npm run build            # Construir para producción
npm run start            # Iniciar servidor de producción

# Testing (cuando se implemente)
npm test                 # Ejecutar tests unitarios
npm run test:e2e         # Ejecutar tests E2E
npm run test:coverage    # Ver cobertura de tests
```

## Apéndice C: Contacto y Soporte

- **Repositorio:** Talento-Neurodivergente
- **Issues:** GitHub Issues
- **Documentación:** Este documento

---

**Documento generado:** Enero 2026
**Versión del proyecto:** 1.0.0
**Autor:** Documentación automática con Claude
