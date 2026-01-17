/**
 * 🟢 GREEN PHASE: Draft Manager - Implementación Mínima
 *
 * Filosofía: Escribir SOLO lo necesario para pasar los tests
 * No añadir features "por si acaso"
 * KISS: Keep It Simple, Stupid
 */

/**
 * Save draft to localStorage
 * @param {string} userType - 'individual', 'company', 'therapist'
 * @param {string} email - User email (usado como key)
 * @param {object} data - Draft data
 * @returns {boolean} - True si guardó correctamente, false si falló
 */
export function saveDraft(userType, email, data) {
  try {
    // 1. Sanitizar datos sensibles
    const sanitized = sanitizeDraftData(data)

    // 2. Añadir timestamp automático
    const draftWithTimestamp = {
      ...sanitized,
      savedAt: new Date().toISOString()
    }

    // 3. Guardar en localStorage
    const key = `draft_${userType}_${email}`
    localStorage.setItem(key, JSON.stringify(draftWithTimestamp))

    return true
  } catch (error) {
    // Manejo de QuotaExceededError u otros errores
    console.warn('Failed to save draft:', error.message)
    return false
  }
}

/**
 * Load draft from localStorage
 * @param {string} userType - 'individual', 'company', 'therapist'
 * @param {string} email - User email
 * @returns {object|null} - Draft data o null si no existe/expiró
 */
export function loadDraft(userType, email) {
  try {
    const key = `draft_${userType}_${email}`
    const stored = localStorage.getItem(key)

    if (!stored) {
      return null
    }

    const draft = JSON.parse(stored)

    // Verificar si expiró
    if (isDraftExpired(draft.savedAt)) {
      // Limpiar draft expirado
      clearDraft(userType, email)
      return null
    }

    return draft
  } catch (error) {
    console.warn('Failed to load draft:', error.message)
    return null
  }
}

/**
 * Clear draft from localStorage
 * @param {string} userType - 'individual', 'company', 'therapist'
 * @param {string} email - User email
 */
export function clearDraft(userType, email) {
  const key = `draft_${userType}_${email}`
  localStorage.removeItem(key)
}

/**
 * Check if draft is expired (older than 7 days)
 * @param {string} savedAt - ISO timestamp
 * @returns {boolean} - True si expiró
 */
export function isDraftExpired(savedAt) {
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

  const savedDate = new Date(savedAt)
  const now = new Date()
  const diff = now - savedDate

  return diff > SEVEN_DAYS_MS
}

/**
 * Sanitize draft data - Remove sensitive information
 *
 * 🔒 SEGURIDAD: Esta función es CRÍTICA
 *
 * localStorage NO es seguro:
 * - No está encriptado
 * - Visible en DevTools
 * - Accesible por extensiones
 * - Vulnerable a XSS
 *
 * NUNCA guardar:
 * - Passwords
 * - Tokens de autenticación
 * - Diagnósticos médicos
 * - SSN / documentos identidad
 * - Información de terapeutas
 * - Cualquier PII (Personally Identifiable Information) sensible
 *
 * @param {object} data - Raw draft data
 * @returns {object} - Sanitized data
 */
export function sanitizeDraftData(data) {
  // Lista de campos sensibles que NUNCA deben guardarse
  const SENSITIVE_FIELDS = [
    'password',
    'token',
    'accessToken',
    'refreshToken',
    'authToken',
    'ssn',
    'socialSecurityNumber',
    'passport',
    'drivingLicense'
  ]

  // Lista de campos sensibles en objetos anidados
  const SENSITIVE_NESTED_FIELDS = {
    profile: ['diagnoses', 'diagnosis', 'medicalHistory', 'ssn'],
    therapist: true, // Toda la información del terapeuta es sensible
    medical: true,
    private: true
  }

  // Crear copia para no mutar original
  const sanitized = { ...data }

  // 1. Eliminar campos sensibles de nivel superior
  SENSITIVE_FIELDS.forEach(field => {
    delete sanitized[field]
  })

  // 2. Eliminar campos sensibles anidados
  Object.keys(SENSITIVE_NESTED_FIELDS).forEach(key => {
    if (sanitized[key]) {
      if (SENSITIVE_NESTED_FIELDS[key] === true) {
        // Eliminar objeto completo
        delete sanitized[key]
      } else if (Array.isArray(SENSITIVE_NESTED_FIELDS[key])) {
        // Eliminar campos específicos del objeto
        SENSITIVE_NESTED_FIELDS[key].forEach(field => {
          if (sanitized[key]) {
            delete sanitized[key][field]
          }
        })
      }
    }
  })

  return sanitized
}

/**
 * 🎁 BONUS: Funciones de utilidad adicionales
 */

/**
 * Get all drafts for a user (útil para "recover all" feature)
 * @param {string} userType - 'individual', 'company', 'therapist'
 * @returns {Array<object>} - Array de drafts
 */
export function getAllDrafts(userType) {
  const drafts = []
  const prefix = `draft_${userType}_`

  // Iterar sobre todas las keys de localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(prefix)) {
      try {
        const draft = JSON.parse(localStorage.getItem(key))
        if (!isDraftExpired(draft.savedAt)) {
          drafts.push(draft)
        } else {
          // Limpiar drafts expirados mientras iteramos
          localStorage.removeItem(key)
        }
      } catch (error) {
        // Skip invalid drafts
        console.warn('Invalid draft found:', key)
      }
    }
  }

  return drafts
}

/**
 * Clear all expired drafts (limpieza periódica)
 * @param {string} userType - 'individual', 'company', 'therapist'
 * @returns {number} - Cantidad de drafts limpiados
 */
export function clearExpiredDrafts(userType) {
  let cleared = 0
  const prefix = `draft_${userType}_`

  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i)
    if (key && key.startsWith(prefix)) {
      try {
        const draft = JSON.parse(localStorage.getItem(key))
        if (isDraftExpired(draft.savedAt)) {
          localStorage.removeItem(key)
          cleared++
        }
      } catch (error) {
        // Limpiar drafts inválidos también
        localStorage.removeItem(key)
        cleared++
      }
    }
  }

  return cleared
}

/**
 * Get draft storage size (para debug/monitoring)
 * @param {string} userType - 'individual', 'company', 'therapist'
 * @returns {number} - Size en bytes
 */
export function getDraftStorageSize(userType) {
  let size = 0
  const prefix = `draft_${userType}_`

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(prefix)) {
      const value = localStorage.getItem(key)
      if (value) {
        // Calcular tamaño en bytes (UTF-16 encoding)
        size += key.length * 2 + value.length * 2
      }
    }
  }

  return size
}
