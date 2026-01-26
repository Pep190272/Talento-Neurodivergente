# 🏁 ORDEN DE DESPACHO #6: LOGIN & REDIRECCIÓN

**DESTINATARIO:** Agente FullStack (Next.js + Auth.js)
**TAREA:** Implementar botón de Login y lógica de redirección basada en roles.

**CONTEXTO:**
- Ya existe `app/lib/auth.js` (Configuración Auth.js).
- Ya existe Navbar (`app/components/Navbar/Navbar.js`) pero el login está oculto/feo.
- Ya existe lógica de routing en `app/(dashboard)/dashboard/page.tsx` (que hace de router).
- **Faltan:** Botón explícito en Navbar y Middleware para protección/redirección automática antes de llegar a la página.

**RESTRICCIONES:**
- 🛡️ **Seguridad**: Proteger rutas `/dashboard/*` vía Middleware (Rechazar acceso sin sesión).
- 🧪 **TDD Estricto**: Primero crear test que verifique la lógica de redirección.
- ♿ **Accesibilidad**: El botón de Login debe ser accesible y visible.

**PLAN DE EJECUCIÓN (GACE PROTOCOL):**
1.  **🔴 RED (Test)**: Crear `tests/middleware.test.js`.
    - Caso 1: Usuario no autenticado accede a `/dashboard` -> Redirect `/login` (o `/auth/role-selection` si preferimos).
    - Caso 2: Usuario autenticado accede a `/login` -> Redirect `/dashboard`.
2.  **🟢 GREEN (Implementación)**:
    - Actualizar `middleware.js` integrando `auth` de `app/lib/auth.js`.
    - Implementar lógica de protección de rutas.
3.  **🔵 REFACTOR (UI)**:
    - Modificar `app/components/Navbar/Navbar.js`.
    - Reemplazar enlace de texto "Login" por botón estilizado (Outline Style) para diferenciarlo de "Comenzar" (Solid Style).
