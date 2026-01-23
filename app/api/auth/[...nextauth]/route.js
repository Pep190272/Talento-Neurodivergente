// app/api/auth/[...nextauth]/route.js
/**
 * NextAuth.js v5 (Auth.js) API Route Handler
 *
 * Este archivo maneja todas las rutas de autenticación:
 * - POST /api/auth/signin - Login
 * - POST /api/auth/signout - Logout
 * - GET /api/auth/session - Obtener session actual
 * - GET /api/auth/csrf - CSRF token
 * - GET /api/auth/providers - Lista de providers
 * - POST /api/auth/callback/credentials - Callback de credentials provider
 */

import { handlers } from '@/lib/auth'

export const { GET, POST } = handlers
