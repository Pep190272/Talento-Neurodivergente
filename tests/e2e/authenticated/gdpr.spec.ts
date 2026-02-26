/**
 * E2E — GDPR (tests autenticados)
 *
 * Cubre:
 * - GET /api/individuals/:userId/gdpr/export requiere auth
 * - DELETE /api/individuals/:userId/gdpr/delete requiere auth y confirmación
 * - GET /api/individuals/:userId/consents requiere auth y ownership
 *
 * NOTA: Los tests de "delete account" no se ejecutan automáticamente para
 * no destruir el usuario de test. Se marcan como skip en CI con el flag
 * SKIP_DESTRUCTIVE_E2E=true (default en CI).
 */

import { test, expect } from '@playwright/test'

const SKIP_DESTRUCTIVE = process.env.SKIP_DESTRUCTIVE_E2E !== 'false'

test.describe('GDPR API — Access Control (sin sesión)', () => {
  test('GET /gdpr/export sin sesión → 401', async ({ request }) => {
    const resp = await request.get('/api/individuals/any-user-id/gdpr/export', {
      headers: { Cookie: '' },
    })
    expect(resp.status()).toBe(401)
  })

  test('DELETE /gdpr/delete sin sesión → 401', async ({ request }) => {
    const resp = await request.delete('/api/individuals/any-user-id/gdpr/delete', {
      headers: { Cookie: '' },
      data: { confirmation: 'DELETE' },
    })
    expect(resp.status()).toBe(401)
  })

  test('GET /consents sin sesión → 401', async ({ request }) => {
    const resp = await request.get('/api/individuals/any-user-id/consents', {
      headers: { Cookie: '' },
    })
    expect(resp.status()).toBe(401)
  })
})

test.describe('GDPR API — Access Control (sesión activa, userId ajeno)', () => {
  test('GET /gdpr/export con userId ajeno → 403', async ({ page, request }) => {
    const cookies = await page.context().cookies()
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ')

    const resp = await request.get('/api/individuals/other-user-id/gdpr/export', {
      headers: { Cookie: cookieHeader },
    })
    expect(resp.status()).toBe(403)
  })

  test('GET /consents con userId ajeno → 403', async ({ page, request }) => {
    const cookies = await page.context().cookies()
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ')

    const resp = await request.get('/api/individuals/other-user-id/consents', {
      headers: { Cookie: cookieHeader },
    })
    expect(resp.status()).toBe(403)
  })
})

test.describe('GDPR Export — Download my data', () => {
  test('GET /gdpr/export con sesión y userId propio devuelve datos', async ({ page, request }) => {
    // Obtener el userId de la sesión actual
    const sessionResp = await request.get('/api/auth/session')
    if (!sessionResp.ok()) {
      test.skip(true, 'No se pudo obtener la sesión actual')
      return
    }

    const session = await sessionResp.json()
    const userId = session?.user?.id
    if (!userId) {
      test.skip(true, 'No hay userId en la sesión')
      return
    }

    const cookies = await page.context().cookies()
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ')

    const resp = await request.get(`/api/individuals/${userId}/gdpr/export`, {
      headers: { Cookie: cookieHeader },
    })

    // Debe ser 200 con datos del usuario o 404 si no tiene perfil aún
    expect([200, 404]).toContain(resp.status())

    if (resp.status() === 200) {
      const body = await resp.json()
      // El export debe contener los datos del usuario
      expect(body).toHaveProperty('userId', userId)
    }
  })
})

test.describe('GDPR Delete Account', () => {
  test.skip(
    SKIP_DESTRUCTIVE,
    'Test destructivo — ejecutar manualmente con SKIP_DESTRUCTIVE_E2E=false'
  )

  test('DELETE /gdpr/delete con confirmación elimina la cuenta', async ({ page, request }) => {
    const sessionResp = await request.get('/api/auth/session')
    const session = await sessionResp.json()
    const userId = session?.user?.id

    if (!userId) {
      test.skip(true, 'No hay sesión activa')
      return
    }

    const cookies = await page.context().cookies()
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ')

    const resp = await request.delete(`/api/individuals/${userId}/gdpr/delete`, {
      headers: { Cookie: cookieHeader },
      data: { confirmation: 'DELETE' },
    })

    expect(resp.status()).toBe(200)
    const body = await resp.json()
    expect(body.success).toBe(true)
  })
})
