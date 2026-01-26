# 🏁 ORDEN DE DESPACHO 5-C: TERRITORIO PROTEGIDO (DASHBOARDS)

**DESTINATARIO**: @[.agent/specialists/03_backend_agent.md]
**PRIORIDAD**: ALTA (Continuación de 5-B)

## 🎯 OBJETIVO
Implementar la estructura protegida de la aplicación. Una vez el usuario se loguea, debe acceder a un Dashboard específico según su rol (Empresa o Candidato), con un Layout que garantice la seguridad y la navegación contextual.

## 📋 TAREAS ESPECÍFICAS
1.  **Layout Protegido (`app/(dashboard)/layout.tsx`)**:
    *   Este layout envuelve TODAS las rutas privadas.
    *   **Auth Check**: Verificar sesión con `auth()`. Si no hay sesión, redirect inmediato a `/login`.
    *   **UI**: Implementar un Sidebar (lateral) y un Header (superior).
    *   **Validación de Perfil**: (Opcional por ahora) Si el usuario no tiene perfil completo, mostrar aviso.

2.  **Dashboard Empresa (`app/(dashboard)/company/page.tsx`)**:
    *   Ruta base para usuarios tipo `company`.
    *   Mostrar tarjetas de resumen: "Ofertas Activas", "Candidatos Nuevos".

3.  **Dashboard Candidato (`app/(dashboard)/candidate/page.tsx`)**:
    *   Ruta base para usuarios tipo `individual`.
    *   Mostrar tarjetas: "Mi Perfil", "Matching Score", "Ofertas Recomendadas".

4.  **Middleware de Redirección (`app/(dashboard)/page.tsx`)**:
    *   Página "Router". Si entras a `/dashboard`, te redirige a `/dashboard/company` o `/dashboard/candidate` según tu rol.

## 🚫 RESTRICCIONES
*   **Security First**: Ninguna ruta bajo `(dashboard)` debe ser pública.
*   **Route Groups**: Todo esto va dentro de la carpeta `(dashboard)` que ya creamos, para no afectar al Landing.
*   **Reutilización**: Usar el componente `LogoutButton` en el Sidebar.

## 🧪 CRITERIOS DE ACEPTACIÓN
*   [ ] Entrar a `/dashboard` sin login -> Redirige a Login.
*   [ ] Entrar con usuario Empresa -> Ve menú de Empresa.
*   [ ] Entrar con usuario Candidato -> Ve menú de Candidato.
