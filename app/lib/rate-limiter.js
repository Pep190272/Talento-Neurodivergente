// app/lib/rate-limiter.js
/**
 * In-Memory Rate Limiter
 *
 * Implementa rate limiting simple basado en memoria.
 * Para producción con múltiples instancias, considerar Redis.
 *
 * Algoritmo: Sliding Window (ventana deslizante)
 * - Mantiene timestamps de requests en una ventana de tiempo
 * - Limpia automáticamente requests antiguos
 */

// Mapa de identificador -> array de timestamps
const requests = new Map()

/**
 * Limpia requests antiguos fuera de la ventana de tiempo
 * @param {string} identifier - Identificador único (IP, userId, etc.)
 * @param {number} windowMs - Ventana de tiempo en milisegundos
 */
function cleanOldRequests(identifier, windowMs) {
  const now = Date.now()
  const windowStart = now - windowMs

  if (!requests.has(identifier)) {
    return []
  }

  const userRequests = requests.get(identifier)
  const recentRequests = userRequests.filter(time => time > windowStart)

  if (recentRequests.length === 0) {
    requests.delete(identifier)
    return []
  }

  requests.set(identifier, recentRequests)
  return recentRequests
}

/**
 * Rate limiter principal
 * @param {string} identifier - Identificador único (IP, userId, email)
 * @param {object} options - Opciones de configuración
 * @param {number} options.windowMs - Ventana de tiempo en ms (default: 60000 = 1 min)
 * @param {number} options.maxRequests - Máximo de requests en la ventana (default: 60)
 * @returns {object} - { allowed, remaining, resetTime }
 */
export function rateLimit(identifier, options = {}) {
  const {
    windowMs = 60000, // 1 minuto por defecto
    maxRequests = 60  // 60 requests por minuto por defecto
  } = options

  const now = Date.now()

  // Limpiar requests antiguos
  const recentRequests = cleanOldRequests(identifier, windowMs)

  // Verificar si excede el límite
  if (recentRequests.length >= maxRequests) {
    const oldestRequest = recentRequests[0]
    const resetTime = oldestRequest + windowMs

    return {
      allowed: false,
      remaining: 0,
      resetTime,
      retryAfter: Math.ceil((resetTime - now) / 1000) // segundos
    }
  }

  // Agregar nuevo request
  recentRequests.push(now)
  requests.set(identifier, recentRequests)

  return {
    allowed: true,
    remaining: maxRequests - recentRequests.length,
    resetTime: now + windowMs
  }
}

/**
 * Limpia todos los rate limits (útil para tests)
 */
export function clearAllRateLimits() {
  requests.clear()
}

/**
 * Obtiene estadísticas del rate limiter
 * @returns {object} - { totalIdentifiers, totalRequests }
 */
export function getRateLimiterStats() {
  let totalRequests = 0

  for (const [, userRequests] of requests) {
    totalRequests += userRequests.length
  }

  return {
    totalIdentifiers: requests.size,
    totalRequests
  }
}

/**
 * Rate limit presets comunes
 */
export const RATE_LIMITS = {
  // Auth endpoints (muy restrictivo)
  AUTH: {
    windowMs: 60000,   // 1 minuto
    maxRequests: 5     // 5 intentos/min
  },

  // API general (moderado)
  API: {
    windowMs: 60000,   // 1 minuto
    maxRequests: 60    // 60 requests/min
  },

  // Endpoints de lectura (permisivo)
  READ: {
    windowMs: 60000,   // 1 minuto
    maxRequests: 100   // 100 requests/min
  },

  // Endpoints de escritura (restrictivo)
  WRITE: {
    windowMs: 60000,   // 1 minuto
    maxRequests: 30    // 30 requests/min
  }
}
