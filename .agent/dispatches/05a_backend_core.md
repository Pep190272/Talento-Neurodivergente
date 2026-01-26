# 🏁 ORDEN DE DESPACHO 5-A: MOTOR (BACKEND CORE)

**DESTINATARIO**: @[.agent/specialists/03_backend_agent.md]
**PRIORIDAD**: ALTA (Bloqueante para UI)

## 🎯 OBJETIVO
Desconectar el sistema de archivos JSON (`storage.js`) y conectar la autenticación y la gestión de usuarios a PostgreSQL (Prisma), utilizando TDD estricto.

## 📋 TAREAS ESPECÍFICAS
1.  **Test Driven Development (TDD) - Ciclo 1**:
    *   **RED**: Crear `tests/services/user.service.test.ts`. Debe fallar al intentar buscar un usuario que sabemos que existe en la DB migrada.
    *   **GREEN**: Crear `app/lib/services/users.ts`. Implementar `findUserByEmail` usando `prisma.user.findUnique`.
    *   **REFACTOR**: Tipar correctamente las respuestas.

2.  **Migración de Auth**:
    *   Modificar `app/lib/auth.js`.
    *   Reemplazar `findUserByEmail` del `storage.js` por el nuevo servicio de Prisma.
    *   Asegurar que la validación de contraseñas (`bcrypt`) sigue funcionando con el `passwordHash` de la DB.

3.  **Audit Logs**:
    *   Actualizar función de auditoría para escribir en la tabla `AuditLog` de Postgres en lugar de archivos JSON.

## 🚫 RESTRICCIONES
*   **Zero JSON**: No se debe leer ni escribir en la carpeta `/data` para operaciones de usuario.
*   **Single Responsibility**: `auth.js` solo orquesta, `users.ts` accede a datos.
*   **Seguridad**: No exponer `passwordHash` en el objeto de sesión.

## 🧪 CRITERIOS DE ACEPTACIÓN
*   [ ] `npm test` pasa para el nuevo servicio.
*   [ ] Login funciona con usuarios migrados (ej. admin).
*   [ ] DBeaver muestra nuevos logs de "USER_LOGIN" en la tabla `AuditLog`.
