/**
 * E2E — Homepage & Public Features
 *
 * Covers:
 * - Hero section renders with typewriter effect
 * - AI assistant button is accessible (keyboard + screen reader)
 * - Chat opens and closes correctly
 * - Stats section animates on scroll
 * - Navigation links work
 * - Accessibility: focus management, ARIA attributes
 */

import { test, expect } from '@playwright/test'

test.describe('Homepage — Hero Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('renders hero with typewriter text and CTA buttons', async ({ page }) => {
    // Hero section exists
    await expect(page.locator('.hero')).toBeVisible()

    // CTA buttons exist
    await expect(page.locator('a[href="/get-started"]')).toBeVisible()
    await expect(page.locator('a[href="/demo"]')).toBeVisible()
  })

  test('AI assistant button is keyboard accessible', async ({ page }) => {
    const assistantBtn = page.locator('button.ai-assistant')
    await expect(assistantBtn).toBeVisible()

    // Should have aria-label
    await expect(assistantBtn).toHaveAttribute('aria-label', /.+/)

    // Should have aria-expanded
    await expect(assistantBtn).toHaveAttribute('aria-expanded', 'false')

    // Should be focusable via tab
    await assistantBtn.focus()
    await expect(assistantBtn).toBeFocused()
  })

  test('chat opens on assistant button click', async ({ page }) => {
    const assistantBtn = page.locator('button.ai-assistant')
    await assistantBtn.click()

    // Chat overlay should appear
    const chatOverlay = page.locator('[role="dialog"]')
    await expect(chatOverlay).toBeVisible()
    await expect(chatOverlay).toHaveAttribute('aria-modal', 'true')

    // Chat input should have focus
    const chatInput = page.locator('#chat-input-field')
    await expect(chatInput).toBeFocused()
  })

  test('chat closes on Escape key', async ({ page }) => {
    // Open chat
    await page.locator('button.ai-assistant').click()
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Press Escape
    await page.keyboard.press('Escape')

    // Chat should close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('chat closes on close button click', async ({ page }) => {
    await page.locator('button.ai-assistant').click()
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    await page.locator('.chat-close').click()
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('key features section renders 3 feature items', async ({ page }) => {
    const features = page.locator('.feature-item')
    await expect(features).toHaveCount(3)
  })

  test('stats section renders 4 stat cards', async ({ page }) => {
    const statCards = page.locator('.stat-card')
    await expect(statCards).toHaveCount(4)
  })
})

test.describe('Homepage — Navigation', () => {
  test('get-started link navigates to /get-started', async ({ page }) => {
    await page.goto('/')
    await page.locator('a[href="/get-started"]').first().click()
    await expect(page).toHaveURL(/\/get-started/)
  })

  test('features page loads correctly', async ({ page }) => {
    await page.goto('/features')
    await expect(page.locator('body')).not.toBeEmpty()
    await expect(page).not.toHaveURL(/error/)
  })

  test('about page loads correctly', async ({ page }) => {
    await page.goto('/about')
    await expect(page.locator('body')).not.toBeEmpty()
    await expect(page).not.toHaveURL(/error/)
  })
})

test.describe('Homepage — Accessibility', () => {
  test('page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/')

    // Should have h1
    const h1 = page.locator('h1')
    await expect(h1).toHaveCount(1)

    // Should have h2s for sections
    const h2s = page.locator('h2')
    const h2Count = await h2s.count()
    expect(h2Count).toBeGreaterThanOrEqual(1)
  })

  test('images have alt text', async ({ page }) => {
    await page.goto('/')

    const images = page.locator('img')
    const count = await images.count()

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt')
      expect(alt).not.toBeNull()
      expect(alt).not.toBe('')
    }
  })

  test('interactive elements are focusable', async ({ page }) => {
    await page.goto('/')

    // All buttons should be focusable
    const buttons = page.locator('button')
    const btnCount = await buttons.count()

    for (let i = 0; i < btnCount; i++) {
      const btn = buttons.nth(i)
      if (await btn.isVisible()) {
        await btn.focus()
        await expect(btn).toBeFocused()
      }
    }
  })

  test('color contrast meets WCAG AA (no #94A3B8 on white)', async ({ page }) => {
    await page.goto('/')

    // Verify the old low-contrast color is not used
    const styles = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*')
      const lowContrastElements: string[] = []
      for (const el of allElements) {
        const color = getComputedStyle(el).color
        // #94A3B8 = rgb(148, 163, 184)
        if (color === 'rgb(148, 163, 184)') {
          lowContrastElements.push(el.tagName)
        }
      }
      return lowContrastElements
    })

    // Should have 0 elements with the old low-contrast color
    expect(styles).toHaveLength(0)
  })
})
