/**
 * Backend API client for microservices (profile-service, matching-service, etc.)
 *
 * In local dev, microservices run at localhost:8000 (nginx gateway).
 * In production, this URL will be configured via NEXT_PUBLIC_BACKEND_URL.
 *
 * All calls are fire-and-forget safe: if the backend is unavailable,
 * errors are logged but never thrown to the caller (localStorage remains
 * the primary persistence layer for the Next.js frontend).
 */

const BACKEND_URL =
  typeof window !== 'undefined'
    ? (window.__BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000')
    : (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000')

/**
 * Send a request to the backend microservices.
 * Returns the parsed JSON response, or null if the request fails.
 */
export async function backendApi(path, { method = 'POST', body = null, timeout = 5000 } = {}) {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)

    // Try to get auth token from cookie or localStorage
    let token = null
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/access_token=([^;]+)/)
      if (match) token = match[1]
    }
    if (!token && typeof localStorage !== 'undefined') {
      token = localStorage.getItem('access_token')
    }

    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(`${BACKEND_URL}/api/v1${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    clearTimeout(timer)

    if (!res.ok) {
      console.warn(`[backend-api] ${method} ${path} → ${res.status}`)
      return null
    }

    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      return await res.json()
    }
    return { ok: true }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn(`[backend-api] ${method} ${path} → timeout`)
    } else {
      console.warn(`[backend-api] ${method} ${path} → ${err.message}`)
    }
    return null
  }
}
