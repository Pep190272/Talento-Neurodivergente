# 🏁 ORDEN DE DESPACHO #4: Migración y Gobernanza
**DESTINATARIO**: BACKEND_AGENT (03)
**TAREA**: Migración de Datos JSON -> SQL y Auditoría
**PRIORIDAD**: 🔴 CRÍTICA

## 📋 CONTEXTO
Contamos con datos de usuarios y jobs en archivos JSON que deben ser migrados a las nuevas tablas de Postgres sin pérdida de información ni de integridad de encriptación.

## 🎯 TAREAS REQUERIDAS
1. **Script de Migración**: Adaptar `scripts/migrate-json-to-db.js` (basado en el archivo legacy rescatado) para mapear los JSON actuales al nuevo esquema de Prisma.
2. **Mantenimiento de Encriptación**: Asegurar que los campos médicos (`diagnoses`, etc.) mantengan su formato `encrypted:...` durante el traslado.
3. **Audit Logging**: Implementar el disparador de `AuditLog` en cada operación de escritura de Prisma.
4. **Verificación**: Crear un script de conteo para asegurar que `Total JSON Users == Total DB Users`.

## 🔒 RESTRICCIONES
- **Atomicidad**: La migración debe hacerse en una transacción o de forma que pueda repetirse sin duplicar datos (Idempotencia).
- **Seguridad**: No loguear datos sensibles durante la migración.
- **Gobernanza**: Cada registro migrado debe tener una entrada en `AuditLog` indicando "legacy_data_migration".

## 🏁 CRITERIOS DE ÉXITO
- 100% de los archivos en `data/users` y `data/jobs` migrados a la DB.
- Los tests de autenticación y matching siguen pasando usando la DB.
