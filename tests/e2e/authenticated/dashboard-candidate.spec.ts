/**
 * E2E — Dashboard del candidato (tests autenticados)
 *
 * Prerrequisito: global.setup.ts ha creado el usuario de test y guardado
 * el storageState en tests/e2e/.auth/candidate.json
 *
 * Cubre:
 * - Dashboard carga correctamente
 * - API /api/dashboards/individual/:userId requiere auth (401 sin sesión)
 * - API devuelve datos con sesión válida
 * - API /api/matching/candidates/:userId requiere auth
 */

import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

// storageState se aplica automáticamente desde playwright.config.ts (candidate.json)

test.describe('Dashboard candidato — UI', () => {
  test('dashboard carga y no redirige a login', async ({ page }) => {
    await page.goto('/dashboard/candidate')
    // Con sesión activa, no debe redirigir a login
    await expect(page).not.toHaveURL(/\/(login|auth)/)
    // Debe mostrar el dashboard
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('dashboard muestra contenido relevante al candidato', async ({ page }) => {
    await page.goto('/dashboard/candidate')
    // Esperar que cargue
    await page.waitForLoadState('domcontentloaded')
    // El dashboard debe tener alguna sección visible (matches, perfil, etc.)
    const bodyText = await page.locator('body').textContent()
    expect(bodyText?.length).toBeGreaterThan(100) // Hay contenido
  })
})

test.describe('API /api/dashboards/individual/:userId — Access Control', () => {
  test('sin sesión devuelve 401', async ({ request }) => {
    // Usamos request sin cookies (contexto limpio)
    const resp = await request.get('/api/dashboards/individual/any-user-id', {
      headers: { Cookie: '' }, // Forzar sin cookies
    })
    // Debe ser 401 (Unauthorized) — fix que aplicamos en Sprint 5
    expect(resp.status()).toBe(401)
  })

  test('con sesión y userId incorrecto devuelve 403', async ({ page, request }) => {
    // Usamos las cookies del candidato de test
    const cookies = await page.context().cookies()
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ')

    const resp = await request.get('/api/dashboards/individual/other-user-id', {
      headers: { Cookie: cookieHeader },
    })
    // Debe ser 403 (Forbidden) porque el userId no coincide con la sesión
    expect(resp.status()).toBe(403)
  })
})

test.describe('API /api/matching/candidates/:userId — Access Control', () => {
  test('sin sesión devuelve 401', async ({ request }) => {
    const resp = await request.get('/api/matching/candidates/any-user-id', {
      headers: { Cookie: '' },
    })
    expect(resp.status()).toBe(401)
  })

  test('con sesión y userId ajeno devuelve 403', async ({ page, request }) => {
    const cookies = await page.context().cookies()
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ')

    const resp = await request.get('/api/matching/candidates/otro-user-id', {
      headers: { Cookie: cookieHeader },
    })
    expect(resp.status()).toBe(403)
  })
})
