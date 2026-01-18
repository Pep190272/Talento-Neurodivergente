// app/lib/encryption.js
import crypto from 'crypto'

/**
 * Obtiene la clave de encriptación desde las variables de entorno.
 * La clave debe ser una cadena hexadecimal de 64 caracteres (32 bytes).
 *
 * @returns {Buffer} Buffer de 32 bytes con la clave de encriptación
 * @throws {Error} Si ENCRYPTION_KEY no está configurada
 */
export function getEncryptionKey() {
  const key = process.env.ENCRYPTION_KEY

  if (!key) {
    throw new Error('ENCRYPTION_KEY not set in environment')
  }

  return Buffer.from(key, 'hex')
}

/**
 * Encripta datos usando AES-256-GCM.
 *
 * AES-256-GCM proporciona:
 * - Confidencialidad (los datos están cifrados)
 * - Autenticidad (se puede verificar que no fueron modificados)
 * - Integridad (cualquier cambio se detecta)
 *
 * @param {string} plaintext - Texto plano a encriptar
 * @param {Buffer} key - Clave de encriptación (32 bytes)
 * @returns {string} Texto encriptado en formato "encrypted:iv:tag:ciphertext"
 */
export function encryptData(plaintext, key) {
  // Generar IV (Initialization Vector) aleatorio de 16 bytes
  // El IV debe ser único para cada encriptación
  const iv = crypto.randomBytes(16)

  // Crear cipher usando AES-256-GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)

  // Encriptar el texto
  let ciphertext = cipher.update(plaintext, 'utf8', 'hex')
  ciphertext += cipher.final('hex')

  // Obtener el authentication tag (GCM mode)
  // El tag se usa para verificar la integridad de los datos
  const authTag = cipher.getAuthTag()

  // Retornar en formato: encrypted:iv:tag:ciphertext
  // Todos los componentes se almacenan en hexadecimal
  return `encrypted:${iv.toString('hex')}:${authTag.toString('hex')}:${ciphertext}`
}

/**
 * Desencripta datos que fueron encriptados con encryptData().
 *
 * @param {string} encrypted - Texto encriptado en formato "encrypted:iv:tag:ciphertext"
 * @param {Buffer} key - Clave de encriptación (32 bytes)
 * @returns {string} Texto plano desencriptado
 * @throws {Error} Si el formato es inválido, la clave es incorrecta, o los datos fueron modificados
 */
export function decryptData(encrypted, key) {
  // Validar formato
  if (!encrypted?.startsWith('encrypted:')) {
    throw new Error('Invalid encrypted format')
  }

  // Separar los componentes
  const parts = encrypted.split(':')

  if (parts.length !== 4) {
    throw new Error('Invalid encrypted format: expected 4 parts')
  }

  const [, ivHex, tagHex, ciphertext] = parts

  // Convertir de hexadecimal a Buffer
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(tagHex, 'hex')

  // Crear decipher usando AES-256-GCM
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)

  // Establecer el authentication tag
  // Si el tag no coincide, se lanzará un error al llamar final()
  decipher.setAuthTag(authTag)

  // Desencriptar
  let plaintext = decipher.update(ciphertext, 'hex', 'utf8')
  plaintext += decipher.final('utf8')

  return plaintext
}
