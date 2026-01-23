
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { encryptData, decryptData, getEncryptionKey } from '@/lib/encryption'
import { sanitizeInput } from '@/lib/utils'
import { saveToFile } from '@/lib/storage'
import fs from 'fs/promises'

// Mock fs module
vi.mock('fs/promises')

describe('🛡️ Security Unit Tests', () => {

    describe('Encryption Module', () => {
        const TEST_KEY_HEX = '1234567890123456789012345678901234567890123456789012345678901234' // 64 hex chars
        const TEST_KEY = Buffer.from(TEST_KEY_HEX, 'hex')
        const PLAIN_TEXT = 'Secret Data 123'

        it('should encrypt data correctly', () => {
            const encrypted = encryptData(PLAIN_TEXT, TEST_KEY)
            expect(encrypted).not.toBe(PLAIN_TEXT)
            expect(encrypted).toContain(':') // IV:AuthTag:Content format
        })

        it('should decrypt data correctly', () => {
            const encrypted = encryptData(PLAIN_TEXT, TEST_KEY)
            const decrypted = decryptData(encrypted, TEST_KEY)
            expect(decrypted).toBe(PLAIN_TEXT)
        })

        it('should throw error with invalid key', () => {
            expect(() => {
                encryptData(PLAIN_TEXT, 'short-key')
            }).toThrow()
        })

        it('should fail to decrypt with wrong key', () => {
            const encrypted = encryptData(PLAIN_TEXT, TEST_KEY)
            // Invalid key buffer
            const WRONG_KEY = Buffer.from(TEST_KEY_HEX.replace('1', '2'), 'hex')

            expect(() => {
                decryptData(encrypted, WRONG_KEY)
            }).toThrow()
        })
    })

    describe('Sanitization Module (DOMPurify)', () => {
        it('should allow safe text', () => {
            const input = 'Hello World'
            expect(sanitizeInput(input)).toBe('Hello World')
        })

        it('should remove script tags', () => {
            const input = 'Hello <script>alert("xss")</script> World'
            expect(sanitizeInput(input)).toBe('Hello  World') // Script removed
        })

        it('should remove onclick attributes', () => {
            const input = 'Hello <a href="#" onclick="stealCookies()">Click me</a>'
            // Since our config removes ALL tags:
            expect(sanitizeInput(input)).toBe('Hello Click me')
        })

        it('should handle non-string inputs', () => {
            expect(sanitizeInput(123)).toBe(123)
            expect(sanitizeInput(null)).toBe(null)
        })
    })

})
