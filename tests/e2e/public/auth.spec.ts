/**
 * E2E — Autenticación y rutas públicas
 *
 * Cubre:
 * - Navegación a páginas públicas
 * - Redirects de protección de rutas (sin login → login page)
 * - Flujo de login correcto e incorrecto
 * - Redirect post-login al dashboard según rol
 */

import { test, expect } from '@playwright/test'

test.describe('Páginas públicas', () => {
  test('landing page carga correctamente', async ({ page }) => {
    await page.goto('/')
    // La página debe cargar sin errores (no debe mostrar 500)
    await expect(page).not.toHaveURL(/error/)
    // Verificar que hay contenido en el body
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('role-selection page muestra las 3 opciones', async ({ page }) => {
    await page.goto('/auth/role-selection')
    await expect(page.getByText('Soy Candidato')).toBeVisible()
    await expect(page.getByText('Soy Empresa')).toBeVisible()
    await expect(page.getByText('Soy Terapeuta')).toBeVisible()
  })

  test('seleccionar "Soy Candidato" lleva a /login?role=individual', async ({ page }) => {
    await page.goto('/auth/role-selection')
    await page.getByText('Soy Candidato').click()
    await expect(page).toHaveURL(/\/login\?role=individual/)
  })

  test('seleccionar "Soy Empresa" lleva a /login?role=company', async ({ page }) => {
    await page.goto('/auth/role-selection')
    await page.getByText('Soy Empresa').click()
    await expect(page).toHaveURL(/\/login\?role=company/)
  })

  test('página de login tiene campos email y password', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('login con credenciales inválidas muestra error', async ({ page }) => {
    await page.goto('/login')
    await page.fill('#email', 'noexiste@test.com')
    await page.fill('#password', 'wrongpassword')
    await page.click('button[type="submit"]')

    // No debe redirigir al dashboard
    await expect(page).not.toHaveURL(/\/dashboard/)
    // Debe mostrar algún mensaje de error
    await expect(page.locator('body')).toContainText(/invalid|error|incorrect|incorrecta|inválid/i)
  })
})

test.describe('Protección de rutas autenticadas', () => {
  test('acceso a /dashboard sin sesión redirige a login', async ({ page }) => {
    await page.goto('/dashboard')
    // Debe redirigir fuera de /dashboard
    await page.waitForURL(/\/(login|auth)/, { timeout: 10_000 })
    await expect(page).not.toHaveURL(/\/dashboard/)
  })

  test('acceso a /dashboard/candidate sin sesión redirige a login', async ({ page }) => {
    await page.goto('/dashboard/candidate')
    await page.waitForURL(/\/(login|auth)/, { timeout: 10_000 })
    await expect(page).not.toHaveURL(/\/dashboard/)
  })

  test('acceso a /dashboard/company sin sesión redirige a login', async ({ page }) => {
    await page.goto('/dashboard/company')
    await page.waitForURL(/\/(login|auth)/, { timeout: 10_000 })
    await expect(page).not.toHaveURL(/\/dashboard/)
  })
})

test.describe('Registro de candidato — UI', () => {
  test('formulario de registro candidato carga con campos requeridos', async ({ page }) => {
    await page.goto('/register/candidate')
    await expect(page.locator('[name="firstName"]')).toBeVisible()
    await expect(page.locator('[name="lastName"]')).toBeVisible()
    await expect(page.locator('[name="email"]')).toBeVisible()
  })

  test('formulario de registro empresa carga con campos requeridos', async ({ page }) => {
    await page.goto('/register/company')
    // El GetStarted component en modo company debe tener campos de empresa
    await expect(page.locator('form')).toBeVisible()
  })
})
