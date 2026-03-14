// app/lib/encryption.ts
import crypto from 'crypto'

export function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error('ENCRYPTION_KEY not set in environment')
  }
  return Buffer.from(key, 'hex')
}

export function encryptData(plaintext: string, key: Buffer): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)

  let ciphertext = cipher.update(plaintext, 'utf8', 'hex')
  ciphertext += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  return `encrypted:${iv.toString('hex')}:${authTag.toString('hex')}:${ciphertext}`
}

export function decryptData(encrypted: string, key: Buffer): string {
  if (!encrypted?.startsWith('encrypted:')) {
    throw new Error('Invalid encrypted format')
  }

  const parts = encrypted.split(':')
  if (parts.length !== 4) {
    throw new Error('Invalid encrypted format: expected 4 parts')
  }

  const [, ivHex, tagHex, ciphertext] = parts

  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(tagHex, 'hex')

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(authTag)

  let plaintext = decipher.update(ciphertext, 'hex', 'utf8')
  plaintext += decipher.final('utf8')

  return plaintext
}
