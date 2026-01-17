/**
 * TDD MASTERCLASS: Draft Mode Implementation
 *
 * Feature: Guardar progreso de registro automáticamente
 * User Story: Como candidato, quiero que mi progreso se guarde
 *             para no perder datos si cierro el navegador
 *
 * Security: NO guardar datos sensibles (passwords, diagnoses)
 * Privacy: Expirar drafts después de 7 días
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  saveDraft,
  loadDraft,
  clearDraft,
  isDraftExpired,
  sanitizeDraftData
} from '@/lib/draft-manager'

describe('TDD Masterclass: Draft Mode', () => {
  const mockEmail = 'candidate@test.com'

  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('🔴 RED Phase: Escribir tests que fallan', () => {
    /**
     * TEST 1: Guardar draft básico
     *
     * ¿Por qué este test?
     * - Es el caso más simple (happy path)
     * - Define la interfaz de la función saveDraft()
     * - Guía el diseño desde el principio
     */
    it('should save profile draft to localStorage', () => {
      const draftData = {
        email: mockEmail,
        profile: {
          name: 'Test User',
          skills: ['JavaScript', 'React']
        }
      }

      saveDraft('individual', mockEmail, draftData)

      // Verificar que se guardó en localStorage
      const saved = localStorage.getItem(`draft_individual_${mockEmail}`)
      expect(saved).toBeDefined()

      // Verificar que el contenido es correcto
      const parsed = JSON.parse(saved)
      expect(parsed.email).toBe(mockEmail)
      expect(parsed.profile.name).toBe('Test User')
      expect(parsed.profile.skills).toEqual(['JavaScript', 'React'])
    })

    /**
     * TEST 2: Recuperar draft
     *
     * ¿Por qué este test?
     * - Valida que podemos LEER lo que guardamos
     * - Define la interfaz de loadDraft()
     * - Completa el ciclo save/load
     */
    it('should load draft from localStorage', () => {
      const draftData = {
        email: mockEmail,
        profile: {
          name: 'Test User'
        }
      }

      // Primero guardamos
      saveDraft('individual', mockEmail, draftData)

      // Luego cargamos
      const loaded = loadDraft('individual', mockEmail)

      expect(loaded).toBeDefined()
      expect(loaded.email).toBe(mockEmail)
      expect(loaded.profile.name).toBe('Test User')
    })

    /**
     * TEST 3: Limpiar draft después de submit exitoso
     *
     * ¿Por qué este test?
     * - Previene "drafts zombies" (quedarse ahí para siempre)
     * - Libera espacio en localStorage
     * - Importante para UX (no recargar drafts viejos)
     */
    it('should clear draft after successful registration', () => {
      const draftData = {
        email: mockEmail,
        profile: { name: 'Test User' }
      }

      saveDraft('individual', mockEmail, draftData)

      // Usuario completa registro
      clearDraft('individual', mockEmail)

      // Verificar que NO existe
      const loaded = loadDraft('individual', mockEmail)
      expect(loaded).toBeNull()
    })

    /**
     * TEST 4: SEGURIDAD - No guardar datos sensibles
     *
     * ¿Por qué este test es CRÍTICO?
     * - localStorage NO es encriptado
     * - Cualquiera con acceso al navegador puede ver
     * - Extensiones maliciosas pueden leer localStorage
     * - GDPR/Privacy compliance
     *
     * Datos sensibles que NO deben guardarse:
     * - Passwords
     * - Diagnósticos médicos
     * - Documentos de identidad
     * - Información de terapeutas
     */
    it('should NOT save sensitive data in localStorage', () => {
      const draftWithSensitiveData = {
        email: mockEmail,
        password: 'secret123',              // ☠️ NUNCA guardar
        profile: {
          name: 'Test User',
          diagnoses: ['ADHD', 'Autism'],    // ☠️ NUNCA guardar
          ssn: '123-45-6789'                // ☠️ NUNCA guardar
        },
        therapist: {
          name: 'Dr. Smith',                // ☠️ NUNCA guardar
          contact: 'therapist@clinic.com'   // ☠️ NUNCA guardar
        }
      }

      saveDraft('individual', mockEmail, draftWithSensitiveData)

      const loaded = loadDraft('individual', mockEmail)

      // Verificar que datos sensibles NO están
      expect(loaded.password).toBeUndefined()
      expect(loaded.profile.diagnoses).toBeUndefined()
      expect(loaded.profile.ssn).toBeUndefined()
      expect(loaded.therapist).toBeUndefined()

      // Verificar que datos seguros SÍ están
      expect(loaded.email).toBe(mockEmail)
      expect(loaded.profile.name).toBe('Test User')
    })

    /**
     * TEST 5: Expiración de drafts
     *
     * ¿Por qué expirar?
     * - Privacidad: Usuario puede haber cambiado de opinión
     * - Storage: No llenar localStorage indefinidamente
     * - UX: Drafts de hace 6 meses no son útiles
     *
     * ¿Por qué 7 días?
     * - Balance entre conveniencia y privacidad
     * - Suficiente para "volveré mañana"
     * - No tanto como para acumular basura
     */
    it('should expire drafts older than 7 days', () => {
      const draftData = {
        email: mockEmail,
        profile: { name: 'Test User' }
      }

      // Guardar draft con timestamp de hace 8 días
      const eightDaysAgo = new Date()
      eightDaysAgo.setDate(eightDaysAgo.getDate() - 8)

      const draftWithOldTimestamp = {
        ...draftData,
        savedAt: eightDaysAgo.toISOString()
      }

      localStorage.setItem(
        `draft_individual_${mockEmail}`,
        JSON.stringify(draftWithOldTimestamp)
      )

      // Intentar cargar
      const loaded = loadDraft('individual', mockEmail)

      // Debe retornar null porque expiró
      expect(loaded).toBeNull()

      // Debe haber limpiado el draft expirado
      const stillInStorage = localStorage.getItem(`draft_individual_${mockEmail}`)
      expect(stillInStorage).toBeNull()
    })

    /**
     * TEST 6: Sanitización de datos
     *
     * ¿Por qué un test dedicado a sanitización?
     * - Principio de Single Responsibility
     * - Testeable independientemente
     * - Reutilizable en otros contextos
     */
    it('should sanitize draft data before saving', () => {
      const unsafeData = {
        email: mockEmail,
        password: 'unsafe',
        profile: {
          name: 'Test',
          diagnoses: ['ADHD']
        }
      }

      const sanitized = sanitizeDraftData(unsafeData)

      expect(sanitized.password).toBeUndefined()
      expect(sanitized.profile.diagnoses).toBeUndefined()
      expect(sanitized.email).toBe(mockEmail)
    })

    /**
     * TEST 7: Validar límite de localStorage
     *
     * ¿Por qué este test?
     * - localStorage tiene límite ~5-10MB
     * - Si se llena, lanza excepción
     * - Debemos manejarlo gracefully
     */
    it('should handle localStorage quota exceeded error', () => {
      // Mock localStorage.setItem para simular error
      const originalSetItem = localStorage.setItem
      localStorage.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError')
      })

      const result = saveDraft('individual', mockEmail, { email: mockEmail })

      // Debe retornar false indicando que falló
      expect(result).toBe(false)

      // Restaurar
      localStorage.setItem = originalSetItem
    })

    /**
     * TEST 8: Timestamp automático
     *
     * ¿Por qué?
     * - Necesario para calcular expiración
     * - No debe ser responsabilidad del caller
     * - Debe ser automático y consistente
     */
    it('should add savedAt timestamp automatically', () => {
      const now = new Date()
      vi.setSystemTime(now)

      saveDraft('individual', mockEmail, {
        email: mockEmail,
        profile: { name: 'Test' }
      })

      const loaded = loadDraft('individual', mockEmail)

      expect(loaded.savedAt).toBeDefined()
      expect(new Date(loaded.savedAt).getTime()).toBe(now.getTime())

      vi.useRealTimers()
    })
  })

  describe('🟢 GREEN Phase: Implementación mínima', () => {
    /**
     * Estos tests se ejecutarán cuando implementemos las funciones
     * Por ahora, todos fallarán porque las funciones no existen
     */
  })

  describe('🔵 REFACTOR Phase: Mejorar sin romper', () => {
    /**
     * Después de implementar, refactorizaremos
     * Los tests NO cambiarán, solo la implementación
     */
  })
})
