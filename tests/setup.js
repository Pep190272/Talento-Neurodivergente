import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock OpenAI API globalmente
global.mockOpenAI = {
  chat: {
    completions: {
      create: vi.fn().mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              validated: true,
              normalized: {},
              suggestions: []
            })
          }
        }]
      })
    }
  }
}

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock

// Mock fetch para API calls
global.fetch = vi.fn()

// Mock window.location
delete window.location
window.location = { href: '', reload: vi.fn() }
