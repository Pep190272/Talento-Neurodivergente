# Agent.md - Directrices de Desarrollo para Claude

**LEER ESTE ARCHIVO ANTES DE CADA TAREA**

## 🎯 Principio Fundamental

**ENFOQUE LÁSER**: Solo trabajar en la tarea específica solicitada. No revisar todo el código, solo las dependencias directas y archivos afectados por el cambio.

---

## 📋 Metodología TDD - SIEMPRE

### Flujo Obligatorio:
1. **PRIMERO: Escribir tests que FALLEN**
2. **SEGUNDO: Implementar código mínimo para que PASEN**
3. **TERCERO: Refactorizar manteniendo tests en verde**

### Sin Excepciones:
- ❌ NUNCA escribir funcionalidad sin test previo
- ❌ NUNCA commitear código sin tests
- ❌ NUNCA saltarse el ciclo Red→Green→Refactor

### Tests por Actor:
```
/tests
  /auth
    - login.neurodivergent.test.js
    - login.therapist.test.js
    - login.company.test.js
  /features
    - [feature].test.js
```

---

## 🔒 Seguridad - Prioridad Máxima

### Verificar SIEMPRE:
- [ ] Validación de inputs (XSS, SQL Injection)
- [ ] Sanitización de datos
- [ ] Autenticación en rutas protegidas
- [ ] Autorización por rol (neurodiv/therapist/company)
- [ ] Headers de seguridad
- [ ] Secrets NUNCA en código
- [ ] Rate limiting en APIs

### OWASP Top 10:
Consultar antes de cualquier feature que maneje datos de usuario o autenticación.

---

## 📁 Alcance de Revisión - Optimización de Tokens

### ✅ SÍ Revisar:
- Archivo(s) específico(s) de la tarea
- Dependencias directas (imports)
- Tests relacionados
- Tipos/interfaces compartidos

### ❌ NO Revisar (a menos que sea necesario):
- Todo el proyecto
- Archivos no relacionados
- Documentación completa
- Historial de git completo

### Estrategia de Búsqueda:
```bash
# Usar grep/find para ubicar, no leer todo
grep -r "functionName" --include="*.js"
find . -name "*Component.js" -type f
```

---

## 🏗️ Estructura de Rutas

### Rutas de Primer Nivel (autenticadas):
```
/dashboard       → Neurodivergentes (TODO: renombrar a /neurodiv)
/therapist       → Terapeutas
/company         → Empresas (overview)
/candidates      → Candidatos (independiente, multi-actor)
```

### Rutas Anidadas:
```
/company/analytics
/company/training
/company/settings
```

### Autenticación:
- ✅ Todas las rutas listadas requieren login
- ✅ WordPress maneja /login y /admin
- ✅ App en talento-neurodivergente.vercel.app

---

## 🎨 Estándares de Código

### Paleta de Colores Corporativa:
```css
--primary-blue: #046BD2
--primary-dark: #045CB4
--background: #FFFFFF
--surface: #F9FAFB
--elevated: #F0F5FA
--text-heading: #1E293B
--text-body: #334155
--text-secondary: #64748B
--border: #E5E7EB
```

### Fuentes:
- **Headings**: 'Orbitron', monospace
- **Body**: 'Rajdhani', sans-serif

### CSS Modules:
- ✅ Usar CSS Modules para componentes (.module.css)
- ✅ BEM para CSS global
- ❌ NO usar estilos inline excepto dinámicos

### JavaScript:
- ✅ Next.js 15 App Router
- ✅ "use client" cuando necesario
- ✅ Componentes funcionales
- ❌ NO hardcodear colores en JS (usar CSS variables)

---

## 🔄 Flujo de Trabajo

### Antes de Empezar:
1. Leer esta guía (Agent.md)
2. Identificar archivos específicos a modificar
3. Escribir tests (Red)
4. Implementar (Green)
5. Refactorizar (Refactor)

### Durante el Trabajo:
- **Comunicar**: Explicar qué estás haciendo y por qué
- **Preguntar**: Si algo no está claro sobre la tarea
- **Limitar**: Solo cambiar lo necesario

### Commits:
```bash
# Formato obligatorio:
tipo: descripción corta - vX.Y.Z

Explicación detallada del cambio.
Razón del cambio.
Archivos afectados.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**Tipos**: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

---

## 📊 Testing Stack

### Herramientas:
- **Framework**: Vitest (configurado en package.json)
- **React Testing**: @testing-library/react
- **E2E**: (TBD - Playwright/Cypress)

### Coverage Mínimo:
- 80% statements
- 70% branches
- 80% functions
- 80% lines

---

## 🚫 Anti-Patrones - NO HACER

1. ❌ Leer todo el proyecto para cambios pequeños
2. ❌ Código sin tests
3. ❌ Colores hardcodeados en JavaScript
4. ❌ Crear features sin test previo
5. ❌ Ignorar validación de seguridad
6. ❌ Commits sin versión
7. ❌ Deploy sin verificar tests
8. ❌ Duplicar código en lugar de abstraer
9. ❌ console.log en producción
10. ❌ Secretos en código

---

## ✅ Checklist Pre-Commit

```
[ ] Tests escritos y pasando
[ ] Seguridad verificada (OWASP)
[ ] Solo archivos necesarios modificados
[ ] Código limpio y legible
[ ] Mensaje de commit descriptivo con versión
[ ] Sin console.log/debuggers
[ ] CSS variables usadas (no hardcoded colors)
[ ] Tipos/PropTypes definidos
[ ] Documentación actualizada si necesario
```

---

## 🎯 Prompt Optimizado para Tareas

Cuando recibas una tarea, responde:

```
📌 TAREA: [Descripción breve]
📁 ARCHIVOS: [Lista específica]
🧪 TESTS: [Tests necesarios]
🔒 SEGURIDAD: [Consideraciones]
⏱️ ESTIMACIÓN: [Pasos a seguir]

¿Procedo?
```

Espera confirmación antes de leer archivos innecesarios.

---

## 🔗 Referencias Rápidas

- **Proyecto**: Talento Neurodivergente (Diversia.click)
- **Framework**: Next.js 15 (App Router)
- **Idioma UI**: Español
- **Idioma Código**: Inglés (nombres, comentarios técnicos)
- **Deploy**: Vercel (no hacer deploy hasta que código esté limpio)

---

## 📝 Notas Importantes

1. **Prioridad**: Seguridad > Tests > Funcionalidad > Estética
2. **Eficiencia**: Tokens son limitados, ser preciso
3. **Comunicación**: Siempre explicar el "por qué"
4. **Calidad**: Código limpio > Código rápido

---

**Versión**: 1.0.0
**Última actualización**: 2026-01-15
**Mantenido por**: Equipo Diversia + Claude Sonnet 4.5
