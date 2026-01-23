/**
 * Utility functions for ID generation, validation, and data handling
 * Used across all modules in the marketplace
 */

import crypto from 'crypto'
import DOMPurify from 'isomorphic-dompurify'

/**
 * Generate a unique ID for a given entity type
 * @param {string} type - Entity type: 'individual', 'company', 'therapist', 'job', 'match', 'connection', 'audit'
 * @returns {string} - Formatted ID (e.g., 'ind_abc123xyz')
 */
export function generateUserId(type) {
  const prefixes = {
    'individual': 'ind',
    'company': 'comp',
    'therapist': 'ther'
  }

  const prefix = prefixes[type]
  if (!prefix) {
    throw new Error(`Invalid user type: ${type}`)
  }

  const randomString = crypto.randomBytes(8).toString('hex')
  const timestamp = Date.now().toString(36)

  return `${prefix}_${timestamp}${randomString.substring(0, 8)}`
}

/**
 * Generate a unique job posting ID
 * @returns {string} - Job ID (e.g., 'job_abc123xyz')
 */
export function generateJobId() {
  const randomString = crypto.randomBytes(8).toString('hex')
  const timestamp = Date.now().toString(36)

  return `job_${timestamp}${randomString.substring(0, 8)}`
}

/**
 * Generate a unique match ID
 * @returns {string} - Match ID (e.g., 'match_abc123xyz')
 */
export function generateMatchId() {
  const randomString = crypto.randomBytes(8).toString('hex')
  const timestamp = Date.now().toString(36)

  return `match_${timestamp}${randomString.substring(0, 8)}`
}

/**
 * Generate a unique connection ID
 * @returns {string} - Connection ID (e.g., 'conn_abc123xyz')
 */
export function generateConnectionId() {
  const randomString = crypto.randomBytes(8).toString('hex')
  const timestamp = Date.now().toString(36)

  return `conn_${timestamp}${randomString.substring(0, 8)}`
}

/**
 * Generate a unique audit log ID
 * @returns {string} - Audit log ID (e.g., 'audit_abc123xyz')
 */
export function generateAuditId() {
  const randomString = crypto.randomBytes(8).toString('hex')
  const timestamp = Date.now().toString(36)

  return `audit_${timestamp}${randomString.substring(0, 8)}`
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize user input to prevent XSS using DOMPurify
 * @param {string} input - User input to sanitize
 * @returns {string} - Sanitized string
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input

  // Configure DOMPurify to keep text content but remove dangerous tags/attrs
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // Strip all HTML tags, keep text only
    ALLOWED_ATTR: []  // Strip all attributes
  })
}

/**
 * Generate anonymized name for privacy
 * @param {string} userId - User ID to anonymize
 * @returns {string} - Anonymized name (e.g., 'Anonymous User 1234')
 */
export function generateAnonymizedName(userId) {
  // Extract numeric portion from userId for consistent anonymization
  const numericPart = userId.replace(/\D/g, '').substring(0, 4) || '0000'
  return `Anonymous User ${numericPart}`
}

/**
 * Calculate hash of sensitive data for comparison without exposing data
 * @param {string} data - Data to hash
 * @returns {string} - SHA256 hash
 */
export function hashData(data) {
  return crypto.createHash('sha256').update(data).digest('hex')
}

/**
 * Deep clone object to avoid mutations
 * @param {object} obj - Object to clone
 * @returns {object} - Cloned object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Calculate date N days from now
 * @param {number} days - Number of days to add
 * @returns {Date} - Future date
 */
export function addDays(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

/**
 * Calculate date N years from now
 * @param {number} years - Number of years to add
 * @param {Date} fromDate - Starting date (default: now)
 * @returns {Date} - Future date
 */
export function addYears(years, fromDate = new Date()) {
  const date = new Date(fromDate)
  date.setFullYear(date.getFullYear() + years)
  return date
}

/**
 * Check if two arrays have any common elements
 * @param {Array} arr1 - First array
 * @param {Array} arr2 - Second array
 * @returns {boolean} - True if arrays have common elements
 */
export function hasCommonElements(arr1, arr2) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false
  return arr1.some(item => arr2.includes(item))
}

/**
 * Calculate percentage match between two arrays
 * @param {Array} arr1 - First array
 * @param {Array} arr2 - Second array
 * @returns {number} - Match percentage (0-100)
 */
export function calculateArrayMatch(arr1, arr2) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return 0
  if (arr1.length === 0 || arr2.length === 0) return 0

  const commonElements = arr1.filter(item => arr2.includes(item))
  const uniqueElements = new Set([...arr1, ...arr2])

  return Math.round((commonElements.length / uniqueElements.size) * 100)
}

/**
 * Validate required fields in an object
 * @param {object} obj - Object to validate
 * @param {Array<string>} requiredFields - Array of required field names
 * @throws {Error} - If required fields are missing
 */
export function validateRequiredFields(obj, requiredFields) {
  const missingFields = requiredFields.filter(field => {
    const value = obj[field]
    return value === undefined || value === null || value === ''
  })

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
  }
}

/**
 * Format date for consistent display
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date string (ISO format)
 */
export function formatDate(date) {
  if (!(date instanceof Date)) {
    date = new Date(date)
  }
  return date.toISOString()
}

/**
 * Classify data sensitivity level
 * @param {Array<string>} dataFields - Array of data field names
 * @returns {string} - Sensitivity level: 'high', 'medium', 'low'
 */
export function classifySensitivity(dataFields) {
  const highSensitivity = ['diagnosis', 'diagnoses', 'medicalHistory', 'therapy']
  const mediumSensitivity = ['email', 'phone', 'address', 'assessment']

  const hasHigh = dataFields.some(field =>
    highSensitivity.some(sensitive => field.toLowerCase().includes(sensitive))
  )

  if (hasHigh) return 'high'

  const hasMedium = dataFields.some(field =>
    mediumSensitivity.some(sensitive => field.toLowerCase().includes(sensitive))
  )

  if (hasMedium) return 'medium'

  return 'low'
}

/**
 * Determine data type for audit logging
 * @param {Array<string>} dataFields - Array of data field names
 * @returns {string} - Data type: 'PII', 'Medical', 'Professional', 'General'
 */
export function determineDataType(dataFields) {
  const piiFields = ['email', 'phone', 'address', 'name']
  const medicalFields = ['diagnosis', 'diagnoses', 'medicalHistory', 'therapy', 'accommodations']
  const professionalFields = ['skills', 'experience', 'education', 'assessment']

  const hasMedical = dataFields.some(field =>
    medicalFields.some(medical => field.toLowerCase().includes(medical))
  )
  if (hasMedical) return 'Medical'

  const hasPII = dataFields.some(field =>
    piiFields.some(pii => field.toLowerCase().includes(pii))
  )
  if (hasPII) return 'PII'

  const hasProfessional = dataFields.some(field =>
    professionalFields.some(prof => field.toLowerCase().includes(prof))
  )
  if (hasProfessional) return 'Professional'

  return 'General'
}
