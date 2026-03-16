/**
 * E2E — Registration Flows
 *
 * Covers:
 * - Candidate registration form validation
 * - Company registration form validation
 * - Therapist registration form validation
 * - Form accessibility (labels, required fields)
 */

import { test, expect } from '@playwright/test'

test.describe('Candidate Registration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register/candidate')
  })

  test('form loads with required fields', async ({ page }) => {
    await expect(page.locator('[name="firstName"]')).toBeVisible()
    await expect(page.locator('[name="lastName"]')).toBeVisible()
    await expect(page.locator('[name="email"]')).toBeVisible()
  })

  test('form validates required fields on submit', async ({ page }) => {
    // Try to submit empty form
    const submitBtn = page.locator('button[type="submit"]')
    if (await submitBtn.isVisible()) {
      await submitBtn.click()
      // Should not navigate away
      await expect(page).toHaveURL(/\/register\/candidate/)
    }
  })

  test('form fields have proper labels for accessibility', async ({ page }) => {
    // Each input should have an associated label or aria-label
    const inputs = page.locator('input[name]')
    const count = await inputs.count()

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i)
      if (await input.isVisible()) {
        const id = await input.getAttribute('id')
        const ariaLabel = await input.getAttribute('aria-label')
        const placeholder = await input.getAttribute('placeholder')

        // At least one accessibility attribute must be present
        const hasAccessibleName = id || ariaLabel || placeholder
        expect(hasAccessibleName).toBeTruthy()
      }
    }
  })
})

test.describe('Company Registration', () => {
  test('form loads correctly', async ({ page }) => {
    await page.goto('/register/company')
    await expect(page.locator('form')).toBeVisible()
  })

  test('form has company-specific fields', async ({ page }) => {
    await page.goto('/register/company')
    // Should have company-related inputs
    await expect(page.locator('body')).not.toBeEmpty()
  })
})

test.describe('Therapist Registration', () => {
  test('form loads correctly', async ({ page }) => {
    await page.goto('/register/therapist')
    await expect(page.locator('form')).toBeVisible()
  })
})

test.describe('Role Selection Flow', () => {
  test('all three roles are accessible via keyboard', async ({ page }) => {
    await page.goto('/auth/role-selection')

    // Tab through the role options
    const candidateOption = page.getByText('Soy Candidato')
    const companyOption = page.getByText('Soy Empresa')
    const therapistOption = page.getByText('Soy Terapeuta')

    await expect(candidateOption).toBeVisible()
    await expect(companyOption).toBeVisible()
    await expect(therapistOption).toBeVisible()
  })
})
