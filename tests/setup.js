import '@testing-library/jest-dom'
import { expect, afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import fs from 'fs/promises'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')

// Clean test data before each test
beforeEach(async () => {
  // Clean up data directory for isolated tests
  try {
    const directories = [
      'users/individuals',
      'users/companies',
      'users/therapists',
      'jobs',
      'matches',
      'connections',
      'audit_logs'
    ]

    for (const dir of directories) {
      const fullPath = path.join(DATA_DIR, dir)
      try {
        const files = await fs.readdir(fullPath)
        for (const file of files) {
          if (file.endsWith('.json')) {
            await fs.unlink(path.join(fullPath, file))
          }
        }
      } catch (error) {
        // Directory doesn't exist yet, that's ok
        if (error.code !== 'ENOENT') {
          // Silently ignore
        }
      }
    }
  } catch (error) {
    // Ignore cleanup errors
  }

  // Reset mocks
  vi.clearAllMocks()
})

// Cleanup after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
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

// Mock localStorage - Implementación funcional para tests
const localStorageMock = (() => {
  let store = {}

  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = String(value)
    }),
    removeItem: vi.fn((key) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index) => {
      const keys = Object.keys(store)
      return keys[index] || null
    })
  }
})()

global.localStorage = localStorageMock

// Mock fetch para API calls
global.fetch = vi.fn()

// Mock window.location
delete window.location
window.location = { href: '', reload: vi.fn() }
