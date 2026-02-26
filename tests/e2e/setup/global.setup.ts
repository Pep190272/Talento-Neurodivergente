/**
 * Global Setup — Playwright E2E
 *
 * Se ejecuta UNA VEZ antes de todos los tests autenticados.
 * Crea usuarios de test en la DB (vía API real) y guarda el estado
 * de sesión (cookies NextAuth) para reutilizarlo en los tests.
 *
 * Los usuarios de test usan un sufijo único por ejecución para evitar
 * conflictos si la DB no se limpia entre runs.
 */

import { test as setup, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const AUTH_DIR = path.join(__dirname, '../.auth')

// Credenciales de test — únicas por run para evitar colisiones en DB
const run = Date.now()
export const TEST_CANDIDATE = {
  email: `test.candidate.${run}@diversia-test.local`,
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'Candidate',
}
export const TEST_COMPANY = {
  email: `test.company.${run}@diversia-test.local`,
  password: 'TestPassword123!',
  name: `TestCorp ${run}`,
}

// Fichero donde se guardan las credenciales generadas para que los tests las lean
const CREDENTIALS_FILE = path.join(AUTH_DIR, 'credentials.json')

setup('crear usuario candidato y guardar sesión', async ({ page, request }) => {
  fs.mkdirSync(AUTH_DIR, { recursive: true })

  // 1. Crear candidato vía API
  const createResp = await request.post(`${BASE_URL}/api/individuals`, {
    data: {
      email: TEST_CANDIDATE.email,
      password: TEST_CANDIDATE.password,
      firstName: TEST_CANDIDATE.firstName,
      lastName: TEST_CANDIDATE.lastName,
      userType: 'individual',
    },
  })

  // Si ya existe (re-run local) también está bien; si falla por otro motivo, lo logamos
  if (!createResp.ok() && createResp.status() !== 409) {
    console.warn(
      `[setup] Candidate creation returned ${createResp.status()} — may already exist`
    )
  }

  // 2. Login para obtener cookies de NextAuth
  await page.goto(`${BASE_URL}/login`)
  await page.fill('#email', TEST_CANDIDATE.email)
  await page.fill('#password', TEST_CANDIDATE.password)
  await page.click('button[type="submit"]')

  // Esperar que la navegación lleve al dashboard de candidato
  await page.waitForURL(/\/dashboard/, { timeout: 15_000 })

  // 3. Guardar estado de sesión (cookies + localStorage)
  await page.context().storageState({ path: path.join(AUTH_DIR, 'candidate.json') })
})

setup('crear empresa y guardar sesión', async ({ page, request }) => {
  fs.mkdirSync(AUTH_DIR, { recursive: true })

  // 1. Crear empresa vía API
  const createResp = await request.post(`${BASE_URL}/api/companies`, {
    data: {
      email: TEST_COMPANY.email,
      password: TEST_COMPANY.password,
      name: TEST_COMPANY.name,
      userType: 'company',
    },
  })

  if (!createResp.ok() && createResp.status() !== 409) {
    console.warn(
      `[setup] Company creation returned ${createResp.status()} — may already exist`
    )
  }

  // 2. Login
  await page.goto(`${BASE_URL}/login`)
  await page.fill('#email', TEST_COMPANY.email)
  await page.fill('#password', TEST_COMPANY.password)
  await page.click('button[type="submit"]')

  await page.waitForURL(/\/dashboard/, { timeout: 15_000 })

  // 3. Guardar estado de sesión de empresa
  await page.context().storageState({ path: path.join(AUTH_DIR, 'company.json') })

  // Guardar credenciales para que los tests puedan hacer llamadas API directas
  fs.writeFileSync(
    CREDENTIALS_FILE,
    JSON.stringify({ candidate: TEST_CANDIDATE, company: TEST_COMPANY }, null, 2)
  )
})
