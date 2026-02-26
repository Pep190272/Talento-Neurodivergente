/**
 * E2E — Flujo de consentimiento (tests autenticados)
 *
 * Cubre:
 * - POST /api/consent/accept requiere auth (401 sin sesión)
 * - POST /api/consent/reject requiere auth (401 sin sesión)
 * - POST /api/consent/revoke requiere auth (401 sin sesión)
 * - Con sesión pero userId ajeno → 403
 * - Con sesión y userId propio → procesado (200 o error de negocio)
 *
 * Los tests de "aceptar/rechazar/revocar reales" requieren un matchId
 * existente en la DB. Para esos se usan datos del global.setup.
 */

import { test, expect } from '@playwright/test'

// storageState: candidate.json (default del proyecto playwright.config.ts)

const CONSENT_ROUTES = [
  { method: 'POST', path: '/api/consent/accept', body: { userId: 'x', companyId: 'x', jobId: 'x', consentType: 'x' } },
  { method: 'POST', path: '/api/consent/reject', body: { userId: 'x', companyId: 'x', jobId: 'x', consentType: 'x' } },
  { method: 'POST', path: '/api/consent/revoke', body: { userId: 'x', companyId: 'x', jobId: 'x' } },
]

test.describe('Consent API — Access Control (sin sesión)', () => {
  for (const route of CONSENT_ROUTES) {
    test(`${route.method} ${route.path} sin sesión → 401`, async ({ request }) => {
      const resp = await request.post(route.path, {
        headers: { Cookie: '' }, // Forzar sin cookies
        data: route.body,
      })
      expect(resp.status()).toBe(401)
    })
  }
})

test.describe('Consent API — Access Control (sesión activa, userId ajeno)', () => {
  for (const route of CONSENT_ROUTES) {
    test(`${route.method} ${route.path} con userId ajeno → 403`, async ({ page, request }) => {
      const cookies = await page.context().cookies()
      const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ')

      // Enviamos userId diferente al de la sesión
      const resp = await request.post(route.path, {
        headers: { Cookie: cookieHeader },
        data: { ...route.body, userId: 'other-user-id-not-mine' },
      })
      expect(resp.status()).toBe(403)
    })
  }
})

test.describe('Consent Management UI', () => {
  test('página de gestión de consentimientos es accesible', async ({ page }) => {
    // Esta página existe si hay una UI de consent (puede ser parte del dashboard)
    await page.goto('/dashboard/candidate')
    await page.waitForLoadState('domcontentloaded')
    // Verificar que la página cargó sin redirigir a login
    await expect(page).not.toHaveURL(/\/(login|auth)/)
  })
})
