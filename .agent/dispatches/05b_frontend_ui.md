# 🏁 ORDEN DE DESPACHO 5-B: FACHADA (FRONTEND UI)

**DESTINATARIO**: @[.agent/specialists/03_backend_agent.md] (Fullstack Capacity)
**PRIORIDAD**: MEDIA (Depende de 5-A)

## 🎯 OBJETIVO
Implementar el flujo visual de entrada y la estructura protegida del dashboard, asegurando que la experiencia de usuario coincida con el Mockup aprobado.

## 📋 TAREAS ESPECÍFICAS
1.  **Landing Page (Public)**:
    *   Editar `app/page.tsx`.
    *   Diseño: Hero Section limpio, Título "Transforma el talento...", Botón "Comenzar" prominente.
    *   Botón "Comenzar" redirige a `/auth/role-selection`.

2.  **Selección de Rol**:
    *   Crear `app/auth/role-selection/page.tsx`.
    *   UI: 3 Tarjetas grandes (Candidato, Empresa, Terapeuta).
    *   Acción: Al clicar, guarda el rol en contexto/query param y redirige a `/login` (o `/register`).

3.  **Dashboard Layout (Protected)**:
    *   Crear `app/dashboard/layout.tsx`.
    *   **Logic**: Verificar sesión. Si no hay usuario -> Redirect a `/login`.
    *   **UI**: Sidebar lateral (colapsable en móvil) + Header con Avatar.
    *   **Menú Dinámico**:
        *   Si `user.type === 'company'` -> Mostrar "Mis Ofertas", "Buscar Talento".
        *   Si `user.type === 'individual'` -> Mostrar "Mi Perfil", "Ofertas para mí".

## 🚫 RESTRICCIONES
*   **Route Groups**: Usar `(public)` para landing/auth y `(dashboard)` para lo privado.
*   **Componentes**: Usar componentes de servidor (RSC) donde sea posible para performance.
*   **Estilos**: CSS Modules o Tailwind (si está configurado), manteniendo coherencia con la imagen "Azul Diversia".

## 🧪 CRITERIOS DE ACEPTACIÓN
*   [ ] Navegación: Landing -> Comenzar -> Elige Rol -> Login -> Dashboard.
*   [ ] Dashboard inaccesible si no estás logueado (redirección automática).
*   [ ] Menú lateral cambia según el rol del usuario logueado.
