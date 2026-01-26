# 🚑 ORDEN DE DESPACHO 5-H (HOTFIX): ALIAS & PATHS

**DESTINATARIO**: @[.agent/specialists/03_backend_agent.md]
**PRIORIDAD**: CRÍTICA (Bloqueante de Build)

## 🚨 PROBLEMA
El compilador falla con `Module not found: Can't resolve '@/lib/auth'`.
**Causa raíz**: El archivo `tsconfig.json` no tiene configurada la sección `paths`, por lo que Next.js no sabe resolver el alias `@/`.

## 🛠️ SOLUCIÓN TÉCNICA
1.  **Actualizar `tsconfig.json`**:
    *   Añadir `baseUrl: "."`
    *   Añadir `paths: { "@/*": ["./app/*"] }` (Asumiendo estructura `app/`)
    *   Alternativa si falla: Usar `../../lib/auth` temporalmente, pero prefiero configurar bien los alias.

2.  **Verificar archivo `app/api/auth/[...nextauth]/route.js`**:
    *   Asegurar que apunta correctamente a `app/lib/auth.js`.

## 📝 INSTRUCCIONES DE EJECUCIÓN
Edita `tsconfig.json` e inserta la configuración de `paths` dentro de `compilerOptions`.

```json
"compilerOptions": {
    // ... otras opciones
    "baseUrl": ".",
    "paths": {
      "@/*": ["./app/*"]
    }
}
```

## 🧪 CRITERIOS DE SOLUCIÓN
*   [ ] `npm run dev` no muestra errores al cargar `/api/auth/session` o acceder a páginas protegidas.
