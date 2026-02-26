import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E Test Configuration — Sprint 5
 *
 * Tres modos de ejecución:
 *   - CI (NODE_ENV=test):  lanza Next.js dev server automáticamente
 *   - Local (servidor ya corriendo): conecta a localhost:3000
 *   - Headless por defecto, headed con --headed flag
 *
 * Base URL: http://localhost:3000 (configurable vía BASE_URL env var)
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './tests/e2e/results',

  // Timeout global por test
  timeout: 30_000,

  // Reintentos en CI (flaky tests por timing)
  retries: process.env.CI ? 2 : 0,

  // Parallelismo: off en CI para evitar conflictos de DB, on local
  fullyParallel: !process.env.CI,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html', { outputFolder: 'tests/e2e/report', open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL: BASE_URL,

    // Capturar trace, screenshot y video en failures
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Locale en español
    locale: 'es-ES',
    timezoneId: 'Europe/Madrid',
  },

  projects: [
    // ── Setup: crea estado de auth para tests autenticados ───────────────
    {
      name: 'setup',
      testMatch: '**/global.setup.ts',
    },

    // ── Tests públicos (sin auth) ─────────────────────────────────────────
    {
      name: 'public',
      testMatch: '**/public/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },

    // ── Tests autenticados (requieren setup) ──────────────────────────────
    {
      name: 'authenticated',
      testMatch: '**/authenticated/**/*.spec.ts',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        // storageState por defecto para candidato; los tests de empresa lo sobrescriben
        storageState: 'tests/e2e/.auth/candidate.json',
      },
    },
  ],

  // Arrancar Next.js dev server si no hay uno corriendo (CI)
  ...(process.env.CI && {
    webServer: {
      command: 'npm run dev',
      url: BASE_URL,
      reuseExistingServer: true,
      timeout: 120_000,
      env: {
        NODE_ENV: 'test',
        DATABASE_URL: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || '',
      },
    },
  }),
})
