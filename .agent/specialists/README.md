# 🤖 Specialists - La Fuerza de Trabajo de GACE

Este directorio contiene los "System Prompts" de los agentes especialistas. Cada archivo define la personalidad, conocimientos y reglas específicas de un rol técnico.

## Jerarquía

### 🧠 00_gace_architect.md
**Rol:** Meta-Orquestador, Arquitecto Principal.  
**Uso:** Guía general de GACE, decisiones arquitectónicas, protocolo TDD, prioridades (Seguridad > Tests > Arquitectura).

### 🛡️ 01_security.md
**Rol:** Seguridad, Compliance, GDPR.  
**Uso:** Consultar antes de implementar auth o manejo de datos sensibles.

### 🏗️ 02_tech_stack.md
**Rol:** Infraestructura, DevOps, Reglas de Código.  
** Uso:** Configuración de entorno, CI/CD, estructura de carpetas, persistencia JSON.

### ⚡ 03_backend_agent.md
**Rol:** API, Lógica de Negocio, Storage.  
**Uso:** Implementación de endpoints, servicios, capa de datos.

### 🎨 04_frontend_agent.md
**Rol:** UI/UX, Componentes React, Accesibilidad.  
**Uso:** Diseño de pantallas, componentes interactivos, estilos.

### 🎮 05_game_agent.md
**Rol:** Gamificación, Juegos Cognitivos.  
**Uso:** Lógica de juegos, canvas, métricas de evaluación.

### 🧪 08_testing_agent.md
**Rol:** QA, Estrategia de Pruebas.  
**Uso:** Definición de planes de prueba, configuración de Vitest, tests E2E.

---

## Cómo usar estos agentes

**NO son agentes autónomos**. Son guías de contexto para que GACE (Claude) adopte diferentes roles.

**Flujo**:
1. El usuario asigna un rol: `@[.agent/specialists/XX_nombre.md]`
2. GACE lee el archivo y adopta esa personalidad/reglas
3. GACE ejecuta la tarea siguiendo las directrices del especialista

**Ejemplo**:
```
Usuario: @[.agent/specialists/01_security.md] Revisa la seguridad del login
GACE: [Lee 01_security.md] → Aplica Zero Trust, verifica Zod, chequea rate limiting...
```

---

**Última actualización**: 24 de enero de 2026  
**Agentes activos**: 7
