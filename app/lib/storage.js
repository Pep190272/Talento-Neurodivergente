/**
 * Storage module for JSON file-based data persistence
 * Provides atomic writes, safe reads, and directory management
 *
 * Data structure:
 * data/
 *   users/
 *     individuals/{userId}.json
 *     companies/{companyId}.json
 *     therapists/{therapistId}.json
 *   jobs/{jobId}.json
 *   matches/{matchId}.json
 *   connections/{connectionId}.json
 *   audit_logs/{userId}/{logId}.json
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { encryptData, decryptData, getEncryptionKey } from './encryption.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Base data directory (relative to project root)
const DATA_DIR = path.join(process.cwd(), 'data')

// ════════════════════════════════════════════════════════════════════════════
// CAMPOS SENSIBLES QUE DEBEN ENCRIPTARSE (HIPAA/PHI Compliance)
// ════════════════════════════════════════════════════════════════════════════
// Solo se encriptan datos médicos de individuals
// Companies y Therapists NO tienen datos médicos que encriptar
const SENSITIVE_FIELDS = {
  individual: {
    'profile.diagnoses': 'array',
    'profile.therapistId': 'string',
    'profile.medicalHistory': 'string',
    'profile.accommodationsNeeded': 'array'
  }
}

/**
 * Obtiene valor anidado de un objeto usando notación de puntos
 * @param {object} obj - Objeto fuente
 * @param {string} path - Ruta en notación de puntos (ej: 'profile.diagnoses')
 * @returns {any} - Valor encontrado o undefined
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((curr, key) => curr?.[key], obj)
}

/**
 * Establece valor anidado en un objeto usando notación de puntos
 * @param {object} obj - Objeto destino
 * @param {string} path - Ruta en notación de puntos
 * @param {any} value - Valor a establecer
 */
function setNestedValue(obj, path, value) {
  const keys = path.split('.')
  const lastKey = keys.pop()
  const target = keys.reduce((curr, key) => {
    if (!(key in curr)) {
      curr[key] = {}
    }
    return curr[key]
  }, obj)
  target[lastKey] = value
}

/**
 * Encripta campos sensibles antes de guardar
 * Solo aplica a userType: 'individual'
 * @param {object} data - Datos a encriptar
 * @returns {object} - Datos con campos sensibles encriptados
 */
function encryptSensitiveFields(data) {
  // Solo encriptar datos de individuals
  if (data.userType !== 'individual') {
    return data
  }

  const cloned = JSON.parse(JSON.stringify(data))
  const key = getEncryptionKey()
  const fields = SENSITIVE_FIELDS.individual

  Object.entries(fields).forEach(([path, type]) => {
    const value = getNestedValue(cloned, path)

    // Si el campo no existe o es null/undefined, saltar
    if (!value) return

    if (type === 'array' && Array.isArray(value)) {
      // Encriptar cada elemento del array
      const encrypted = value.map(item => encryptData(String(item), key))
      setNestedValue(cloned, path, encrypted)
    } else if (type === 'string') {
      // Encriptar string
      const encrypted = encryptData(value, key)
      setNestedValue(cloned, path, encrypted)
    }
  })

  return cloned
}

/**
 * Desencripta campos sensibles después de leer
 * Solo aplica a userType: 'individual'
 * @param {object} data - Datos a desencriptar
 * @returns {object} - Datos con campos sensibles desencriptados
 */
function decryptSensitiveFields(data) {
  // Solo desencriptar datos de individuals
  if (data.userType !== 'individual') {
    return data
  }

  const cloned = JSON.parse(JSON.stringify(data))
  const key = getEncryptionKey()
  const fields = SENSITIVE_FIELDS.individual

  Object.entries(fields).forEach(([path, type]) => {
    const value = getNestedValue(cloned, path)

    // Si el campo no existe o es null/undefined, saltar
    if (!value) return

    if (type === 'array' && Array.isArray(value)) {
      // Desencriptar cada elemento del array
      const decrypted = value.map(item => {
        // Solo desencriptar si está en formato encriptado
        return item.startsWith('encrypted:') ? decryptData(item, key) : item
      })
      setNestedValue(cloned, path, decrypted)
    } else if (type === 'string' && value.startsWith('encrypted:')) {
      // Desencriptar string
      const decrypted = decryptData(value, key)
      setNestedValue(cloned, path, decrypted)
    }
  })

  return cloned
}

/**
 * Ensure directory exists, create if not
 * @param {string} dirPath - Directory path
 */
async function ensureDirectory(dirPath) {
  try {
    await fs.access(dirPath)
  } catch {
    await fs.mkdir(dirPath, { recursive: true })
  }
}

/**
 * Save data to JSON file with atomic write (temp file + rename)
 * Encripta campos sensibles automáticamente antes de guardar
 * @param {string} filePath - Relative path from DATA_DIR
 * @param {object} data - Data to save
 */
export async function saveToFile(filePath, data) {
  const fullPath = path.join(DATA_DIR, filePath)
  const dir = path.dirname(fullPath)

  // Ensure directory exists
  await ensureDirectory(dir)

  // Encriptar campos sensibles ANTES de guardar
  const encryptedData = encryptSensitiveFields(data)

  // Atomic write: write to temp file, then rename
  const tempPath = `${fullPath}.tmp`

  try {
    await fs.writeFile(tempPath, JSON.stringify(encryptedData, null, 2), 'utf-8')
    await fs.rename(tempPath, fullPath)
  } catch (error) {
    // Clean up temp file if rename fails
    try {
      await fs.unlink(tempPath)
    } catch {}
    throw new Error(`Failed to save file ${filePath}: ${error.message}`)
  }
}

/**
 * Read data from JSON file
 * Desencripta campos sensibles automáticamente después de leer
 * @param {string} filePath - Relative path from DATA_DIR
 * @returns {object|null} - Parsed JSON data or null if not found
 */
export async function readFromFile(filePath) {
  const fullPath = path.join(DATA_DIR, filePath)

  try {
    const content = await fs.readFile(fullPath, 'utf-8')
    const data = JSON.parse(content)

    // Desencriptar campos sensibles DESPUÉS de leer
    return decryptSensitiveFields(data)
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null // File not found
    }
    throw new Error(`Failed to read file ${filePath}: ${error.message}`)
  }
}

/**
 * Check if file exists
 * @param {string} filePath - Relative path from DATA_DIR
 * @returns {boolean} - True if file exists
 */
export async function fileExists(filePath) {
  const fullPath = path.join(DATA_DIR, filePath)

  try {
    await fs.access(fullPath)
    return true
  } catch {
    return false
  }
}

/**
 * Delete file
 * @param {string} filePath - Relative path from DATA_DIR
 */
export async function deleteFile(filePath) {
  const fullPath = path.join(DATA_DIR, filePath)

  try {
    await fs.unlink(fullPath)
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw new Error(`Failed to delete file ${filePath}: ${error.message}`)
    }
  }
}

/**
 * List all files in a directory
 * @param {string} dirPath - Relative directory path from DATA_DIR
 * @returns {Array<string>} - Array of file names
 */
export async function listFiles(dirPath) {
  const fullPath = path.join(DATA_DIR, dirPath)

  try {
    await ensureDirectory(fullPath)
    const files = await fs.readdir(fullPath)
    return files.filter(file => file.endsWith('.json'))
  } catch (error) {
    throw new Error(`Failed to list files in ${dirPath}: ${error.message}`)
  }
}

/**
 * Read all files from a directory
 * @param {string} dirPath - Relative directory path from DATA_DIR
 * @returns {Array<object>} - Array of parsed JSON objects
 */
export async function readAllFromDirectory(dirPath) {
  const files = await listFiles(dirPath)

  const data = await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(dirPath, file)
      return await readFromFile(filePath)
    })
  )

  return data.filter(item => item !== null)
}

/**
 * Find file by field value in a directory
 * @param {string} dirPath - Relative directory path from DATA_DIR
 * @param {string} field - Field name to search
 * @param {any} value - Value to match
 * @returns {object|null} - Found object or null
 */
export async function findByField(dirPath, field, value) {
  const allData = await readAllFromDirectory(dirPath)
  return allData.find(item => item[field] === value) || null
}

/**
 * Find all files matching a condition
 * @param {string} dirPath - Relative directory path from DATA_DIR
 * @param {Function} predicate - Filter function
 * @returns {Array<object>} - Array of matching objects
 */
export async function findAll(dirPath, predicate) {
  const allData = await readAllFromDirectory(dirPath)
  return allData.filter(predicate)
}

/**
 * Update file by reading, modifying, and saving
 * @param {string} filePath - Relative path from DATA_DIR
 * @param {Function} updateFn - Function that receives current data and returns updated data
 */
export async function updateFile(filePath, updateFn) {
  const currentData = await readFromFile(filePath)

  if (currentData === null) {
    throw new Error(`File not found: ${filePath}`)
  }

  const updatedData = updateFn(currentData)
  await saveToFile(filePath, updatedData)

  return updatedData
}

/**
 * Get file path for user type
 * @param {string} userType - 'individual', 'company', 'therapist'
 * @param {string} userId - User ID
 * @returns {string} - Relative file path
 */
export function getUserFilePath(userType, userId) {
  const typeMap = {
    'individual': 'users/individuals',
    'company': 'users/companies',
    'therapist': 'users/therapists'
  }

  const dir = typeMap[userType]
  if (!dir) {
    throw new Error(`Invalid user type: ${userType}`)
  }

  return `${dir}/${userId}.json`
}

/**
 * Get file path for job posting
 * @param {string} jobId - Job ID
 * @returns {string} - Relative file path
 */
export function getJobFilePath(jobId) {
  return `jobs/${jobId}.json`
}

/**
 * Get file path for match
 * @param {string} matchId - Match ID
 * @returns {string} - Relative file path
 */
export function getMatchFilePath(matchId) {
  return `matches/${matchId}.json`
}

/**
 * Get file path for connection
 * @param {string} connectionId - Connection ID
 * @returns {string} - Relative file path
 */
export function getConnectionFilePath(connectionId) {
  return `connections/${connectionId}.json`
}

/**
 * Get file path for audit log
 * @param {string} userId - User ID
 * @param {string} logId - Log ID
 * @returns {string} - Relative file path
 */
export function getAuditLogFilePath(userId, logId) {
  // Group audit logs by user for efficient retrieval
  const userHash = userId.substring(0, 2) // First 2 chars for sharding
  return `audit_logs/${userHash}/${userId}_${logId}.json`
}

/**
 * Initialize data directory structure
 */
export async function initializeDataStructure() {
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
    await ensureDirectory(path.join(DATA_DIR, dir))
  }
}

/**
 * Search across multiple directories for a user by email
 * @param {string} email - Email to search for
 * @returns {object|null} - User object with type, or null
 */
export async function findUserByEmail(email) {
  const userTypes = ['individual', 'company', 'therapist']
  const dirMap = {
    'individual': 'users/individuals',
    'company': 'users/companies',
    'therapist': 'users/therapists'
  }

  for (const type of userTypes) {
    const dirPath = dirMap[type]
    const user = await findByField(dirPath, 'email', email)

    if (user) {
      return { ...user, userType: type }
    }
  }

  return null
}

/**
 * Get all matches for a candidate
 * @param {string} userId - Candidate user ID
 * @returns {Array<object>} - Array of match objects
 */
export async function getMatchesForCandidate(userId) {
  return await findAll('matches', match => match.candidateId === userId)
}

/**
 * Get all matches for a job
 * @param {string} jobId - Job ID
 * @returns {Array<object>} - Array of match objects
 */
export async function getMatchesForJob(jobId) {
  return await findAll('matches', match => match.jobId === jobId)
}

/**
 * Get all connections for a user
 * @param {string} userId - User ID
 * @returns {Array<object>} - Array of connection objects
 */
export async function getConnectionsForUser(userId) {
  return await findAll('connections', connection =>
    connection.candidateId === userId || connection.companyId === userId
  )
}

/**
 * Get all audit logs for a user
 * @param {string} userId - User ID
 * @returns {Array<object>} - Array of audit log objects
 */
export async function getAuditLogsForUser(userId) {
  const userHash = userId.substring(0, 2)
  const dirPath = `audit_logs/${userHash}`

  try {
    const files = await listFiles(dirPath)
    const userLogs = files.filter(file => file.startsWith(userId))

    const logs = await Promise.all(
      userLogs.map(async (file) => {
        return await readFromFile(`${dirPath}/${file}`)
      })
    )

    return logs.filter(log => log !== null)
  } catch {
    return []
  }
}

/**
 * Count files in a directory
 * @param {string} dirPath - Relative directory path from DATA_DIR
 * @returns {number} - Number of JSON files
 */
export async function countFiles(dirPath) {
  const files = await listFiles(dirPath)
  return files.length
}
