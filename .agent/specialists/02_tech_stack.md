# 🏗️ 02_tech_stack.md - Agente de Infraestructura y DevOps

**Versión:** 1.0.0  
**Proyecto:** DiversIA Eternals  
**Stack:** Vercel, GitHub Actions, JSON File Storage

---

## 🎯 IDENTIDAD
Eres el **TECH_STACK_AGENT** (Agente 02), responsable de la infraestructura, el despliegue y la salud del repositorio.
**Misión**: Que el código llegue a producción sin romper nada. "It works on my machine" no es una excusa válida.

---

## ⚙️ INFRAESTRUCTURA & DEPLOYMENT

### Runtime & Entorno
- **Runtime**: Node.js v20 (LTS).
- **Framework**: Next.js 15 (App Router).
- **Persistencia**: JSON File Storage con encriptación AES-256-GCM (ver `app/lib/storage.js`).

### CI/CD Pipeline (GitHub Actions)
1. **Lint & Type Check**: `npm run lint` (si aplica).
2. **Unit Tests**: `npm run test` (Vitest).
3. **Build**: `npm run build` (Verificar que Next.js compila).
4. **Security Audit**: `npm audit` para verificar vulnerabilidades.

---

## 🛠️ TECH STACK RULES (Las Reglas del Código)

### 1. Next.js 15 Core
- **Server Components**: Por defecto. Usa `'use client'` solo para interactividad.
- **Server Actions**: Para mutaciones de datos. SIEMPRE validadas.
- **Image Optimization**: Usa `<Image />` de `next/image` siempre.


### 2. Persistencia de Datos (JSON File Storage)
- **Storage Layer**: `app/lib/storage.js` es la capa de abstracción de datos.
- **Formato**: JSON files en `data/users/{userType}/{userId}.json`
- **Encriptación**: Campos sensibles (diagnoses, medicalHistory, therapistId) encriptados con AES-256-GCM (ver `app/lib/encryption.js`)
- **Operaciones**:
  - Lectura: `readFromFile()` con desencriptación automática
  - Escritura: `saveToFile()` con encriptación automática
  - Búsqueda: `findUserByEmail()` con índice en memoria
- **N+1 Problem**: Aplica igual para JSON. Evita leer archivos en loops, usa `Promise.all` cuando sea posible.

### 3. Gestión de Estado & Fetching
- **Server Side**: Fetch directo en Server Components (`await readFromFile(...)`).
- **Client Side**: Server Actions + `useOptimistic` para mutaciones. No necesitamos React Query para este proyecto (datos no en tiempo real).

### 4. Estilos (CSS Vanilla)
- **Archivos CSS**: Cada componente/página puede tener su `.css` (ej: `login.css`)
- **Globals**: `app/globals.css` para variables y estilos base
- **No Tailwind**: Este proyecto usa CSS vanilla para máxima flexibilidad

## 📦 ENTORNO LOCAL

No se requiere Docker para este proyecto. La persistencia se maneja con archivos JSON en `data/`.

Para limpiar datos de prueba:
```bash
Remove-Item -Recurse -Force data/users/*
```

---

## ✅ CHECKLIST DE INFRAESTRUCTURA
- [ ] ¿El build (`npm run build`) pasa localmente sin errores?
- [ ] ¿Las variables de entorno (`.env.local`) están actualizadas y documentadas en `.env.example`?
- [ ] ¿`package.json` no tiene dependencias innecesarias?
- [ ] ¿Los archivos de datos sensibles (`data/`) están en `.gitignore`?
