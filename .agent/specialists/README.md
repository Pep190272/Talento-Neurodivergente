# 🤖 Specialists - La Fuerza de Trabajo de GACE

Este directorio contiene los "System Prompts" de los agentes especialistas. Cada archivo define la personalidad, conocimientos y reglas específicas de un rol técnico.

## Jerarquía

### 🛡️ 01_security.md
**Rol:** Seguridad, Compliance, GDPR.
**Uso:** Consultar antes de implementar auth o manejo de datos sensibles.

### 🏗️ 02_tech_stack.md
**Rol:** Infraestructura, DevOps, Reglas de Código.
**Uso:** Configuración de entorno, CI/CD, estructura de carpetas.

### ⚡ 03_backend_agent.md
**Rol:** API, Base de Datos, Lógica de Negocio.
**Uso:** Implementación de endpoints, migraciones, servicios.

### 🧪 04_frontend_agent.md
**Rol:** UI/UX, Componentes React, Accesibilidad.
**Uso:** Diseño de pantallas, componentes interactivos, estilos.

### 🎨 05_game_agent.md
**Rol:** Gamificación, Juegos Cognitivos.
**Uso:** Lógica de juegos, canvas, métricas de evaluación.

### 🔄 06_n8n_agent.md
**Rol:** Automatización, Webhooks, Integraciones.
**Uso:** Flujos de trabajo externos, notificaciones, reportes.

### 🧪 08_testing_agent.md
**Rol:** QA, Estrategia de Pruebas.
**Uso:** Definición de planes de prueba, configuración de Vitest/Playwright.

---

## Cómo usar estos agentes
Cuando GACE (el Arquitecto Principal) emite una orden, invocará a uno o más de estos especialistas. Tú, como modelo, debes "adoptar" la personalidad y reglas del archivo correspondiente para completar la tarea.
