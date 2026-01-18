// tests/lib/encryption.test.js
import { describe, it, expect, beforeAll } from 'vitest'
import { encryptData, decryptData, getEncryptionKey } from '@/lib/encryption'

describe('Encryption Module', () => {
  beforeAll(() => {
    // Asegurar que hay una clave de encriptación para los tests
    if (!process.env.ENCRYPTION_KEY) {
      // Generar una clave de prueba (64 caracteres hex = 32 bytes)
      process.env.ENCRYPTION_KEY = '0'.repeat(64)
    }
  })

  describe('encryptData y decryptData', () => {
    it('debe encriptar y desencriptar texto plano correctamente', () => {
      const plaintext = 'ADHD'
      const key = getEncryptionKey()

      const encrypted = encryptData(plaintext, key)
      expect(encrypted).toMatch(/^encrypted:/)
      expect(encrypted).not.toContain('ADHD')

      const decrypted = decryptData(encrypted, key)
      expect(decrypted).toBe('ADHD')
    })

    it('debe fallar con clave incorrecta', () => {
      const plaintext = 'ADHD'
      const encrypted = encryptData(plaintext, getEncryptionKey())

      const wrongKey = Buffer.from('0'.repeat(64), 'hex')
      // Cambiar un byte para hacerla diferente
      wrongKey[0] = 1

      expect(() => decryptData(encrypted, wrongKey)).toThrow()
    })

    it('debe usar formato encrypted:iv:tag:ciphertext', () => {
      const encrypted = encryptData('test', getEncryptionKey())
      const parts = encrypted.split(':')

      expect(parts[0]).toBe('encrypted')
      expect(parts).toHaveLength(4)
      expect(parts[1]).toHaveLength(32) // IV hex (16 bytes = 32 hex chars)
      expect(parts[2]).toHaveLength(32) // Auth tag hex (16 bytes = 32 hex chars)
    })

    it('debe encriptar diferentes textos a diferentes valores', () => {
      const key = getEncryptionKey()
      const encrypted1 = encryptData('ADHD', key)
      const encrypted2 = encryptData('Autism Level 1', key)

      expect(encrypted1).not.toBe(encrypted2)
      expect(decryptData(encrypted1, key)).toBe('ADHD')
      expect(decryptData(encrypted2, key)).toBe('Autism Level 1')
    })

    it('debe producir diferentes valores encriptados para el mismo texto (debido a IV aleatorio)', () => {
      const key = getEncryptionKey()
      const plaintext = 'ADHD'

      const encrypted1 = encryptData(plaintext, key)
      const encrypted2 = encryptData(plaintext, key)

      // Deben ser diferentes debido al IV aleatorio
      expect(encrypted1).not.toBe(encrypted2)

      // Pero ambos deben desencriptar al mismo valor
      expect(decryptData(encrypted1, key)).toBe(plaintext)
      expect(decryptData(encrypted2, key)).toBe(plaintext)
    })
  })

  describe('getEncryptionKey', () => {
    it('debe lanzar error si ENCRYPTION_KEY no está configurada', () => {
      const originalKey = process.env.ENCRYPTION_KEY
      delete process.env.ENCRYPTION_KEY

      expect(() => getEncryptionKey()).toThrow('ENCRYPTION_KEY not set in environment')

      // Restaurar
      process.env.ENCRYPTION_KEY = originalKey
    })

    it('debe retornar un Buffer de 32 bytes', () => {
      const key = getEncryptionKey()

      expect(Buffer.isBuffer(key)).toBe(true)
      expect(key.length).toBe(32) // AES-256 requiere 32 bytes
    })
  })

  describe('decryptData - validación', () => {
    it('debe lanzar error con formato inválido', () => {
      const key = getEncryptionKey()

      expect(() => decryptData('invalid', key)).toThrow('Invalid encrypted format')
      expect(() => decryptData('notencrypted:aaa:bbb:ccc', key)).toThrow('Invalid encrypted format')
    })

    it('debe lanzar error con partes faltantes', () => {
      const key = getEncryptionKey()

      expect(() => decryptData('encrypted:aaa:bbb', key)).toThrow()
      expect(() => decryptData('encrypted:aaa', key)).toThrow()
    })
  })

  describe('Casos de uso reales', () => {
    it('debe encriptar diagnósticos correctamente', () => {
      const diagnoses = ['ADHD', 'Autism Level 1', 'Dyslexia']
      const key = getEncryptionKey()

      const encrypted = diagnoses.map(d => encryptData(d, key))

      encrypted.forEach(enc => {
        expect(enc).toMatch(/^encrypted:/)
        expect(enc).not.toContain('ADHD')
        expect(enc).not.toContain('Autism')
        expect(enc).not.toContain('Dyslexia')
      })

      const decrypted = encrypted.map(enc => decryptData(enc, key))
      expect(decrypted).toEqual(diagnoses)
    })

    it('debe encriptar therapistId correctamente', () => {
      const therapistId = 'ther_xyz789'
      const key = getEncryptionKey()

      const encrypted = encryptData(therapistId, key)
      expect(encrypted).toMatch(/^encrypted:/)
      expect(encrypted).not.toContain('ther_xyz789')

      const decrypted = decryptData(encrypted, key)
      expect(decrypted).toBe(therapistId)
    })
  })
})
