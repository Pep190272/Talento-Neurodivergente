# 🏁 DESPACHO #2: Integración LLM - Análisis de Inclusividad

**DESTINATARIO**: BACKEND_AGENT (03)  
**PRIORIDAD**: 🔴 CRÍTICA  
**ESTADO**: ⏳ PENDIENTE DE EJECUCIÓN

---

## 📋 CONTEXTO

### Infraestructura Completada ✅
- VPS Hostinger configurado (77.83.232.203)
- Dokploy operativo
- Ollama + Gemma 2B corriendo en contenedor Docker
- Puerto 11434 expuesto
- Variables de entorno añadidas a `.env.local`

### Documentación Creada ✅
- `docs/DESPLIEGUE_VPS.md` - Proceso completo paso a paso

---

## 🎯 TAREA

Implementar integración con Ollama (Gemma 2B) para analizar inclusividad de job postings.

**Funcionalidades requeridas**:
1. Cliente HTTP para comunicarse con Ollama
2. Función `analyzeJobInclusivity(jobData)` que retorna scoring 0-100
3. Detección de lenguaje discriminatorio
4. Validación con Zod
5. Manejo robusto de errores (timeout, fallback)
6. Tests unitarios con mocking completo

---

## 📁 ARCHIVOS A CREAR

### 1. `app/lib/llm.js`
Cliente Ollama con:
- `generateCompletion(prompt, options)`
- `analyzeJobInclusivity(jobData)`
- Timeout de 10s
- Fallback si VPS down

### 2. `app/lib/schemas/job-analysis.js`
Esquema Zod para validar respuesta del LLM

### 3. `tests/unit/lib/llm.test.js`
Tests unitarios con fetch mockeado

---

## 📁 ARCHIVOS A MODIFICAR

### 1. `app/lib/companies.js`
Integrar `analyzeJobInclusivity` en `createJobPosting()`

### 2. `tests/unit/actors/company.test.js`
Hacer pasar los 10 tests pendientes según `TODO.md`

---

## 🔒 RESTRICCIONES

### Seguridad
1. **NO enviar datos médicos** a Ollama (sanitizar job descriptions)
2. **NO loguear** requests/responses completas (solo metadata)
3. **Implementar timeout** de 10s máximo
4. **Fallback graceful** si VPS no responde

### Testing
1. **CERO llamadas reales** a Ollama en tests (todo mockeado)
2. **Coverage ≥ 80%** en `llm.js`
3. **10 tests de company.test.js** deben pasar

### Calidad
1. **Validación Zod** obligatoria en response
2. **Error handling** robusto (network failure, timeout, invalid JSON)
3. **Código comentado** en inglés
4. **TDD**: Red → Green → Refactor

---

## 📊 CRITERIOS DE ÉXITO

- [x] VPS con Ollama funcionando (COMPLETADO)
- [ ] `app/lib/llm.js` creado y probado
- [ ] Jobs creados tienen `inclusivityScore`
- [ ] Detecta términos discriminatorios ("young", "rockstar", etc.)
- [ ] 10 tests de `company.test.js` pasando
- [ ] Coverage ≥ 80%
- [ ] Fallback funcional si VPS down

---

## 🕒 DURACIÓN ESTIMADA

**2.5 - 3.5 horas**

| Fase | Tiempo |
|------|--------|
| Desarrollo cliente LLM | 1.5h |
| Integración + Tests | 1.5h |
| Verificación | 0.5h |

---

## 📖 REFERENCIAS

- **Plan detallado**: `brain/implementation_plan.md`
- **TODO specs**: `TODO.md` líneas 8-103
- **Despliegue VPS**: `docs/DESPLIEGUE_VPS.md`
- **Tests existentes**: `tests/unit/actors/company.test.js`

---

## ✅ PARA EJECUTAR ESTE DESPACHO

Asigna rol al agente:
```
@[.agent/specialists/03_backend_agent.md] Ejecuta DESPACHO #2
```

---

**Creado**: 24 de enero de 2026, 13:50  
**Autor**: GACE (Meta-Orquestador)
