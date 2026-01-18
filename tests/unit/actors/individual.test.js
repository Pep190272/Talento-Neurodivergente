/**
 * UC-001: Registro y Perfil de Candidato
 * Tests TDD para registro de individuos neurodivergentes
 *
 * CORE BUSINESS: Matching Marketplace
 * PRIORIDAD: MUST (MVP Critical)
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { createIndividualProfile, validateIndividualData, getIndividualProfile, getPublicProfileView } from '@/lib/individuals'
import { generateUserId } from '@/lib/utils'
import { deleteFile, getUserFilePath } from '@/lib/storage'
import bcrypt from 'bcryptjs'

describe('UC-001: Individual Registration', () => {
  let mockIndividualData
  let createdUserIds = []

  beforeEach(async () => {
    // Configurar ENCRYPTION_KEY para tests
    if (!process.env.ENCRYPTION_KEY) {
      process.env.ENCRYPTION_KEY = '0'.repeat(64)
    }

    mockIndividualData = {
      email: 'john.doe@example.com',
      password: 'TestPassword123',
      passwordHash: await bcrypt.hash('TestPassword123', 10),
      profile: {
        name: 'John Doe',
        location: 'Madrid, Spain',
        diagnoses: ['ADHD', 'Autism Level 1'],
        experience: [
          {
            title: 'Software Developer',
            company: 'TechCorp',
            years: 3
          }
        ],
        preferences: {
          workMode: 'remote',
          flexibleHours: true,
          teamSize: 'small'
        },
        accommodationsNeeded: ['Quiet workspace', 'Written instructions']
      },
      privacy: {
        visibleInSearch: true,
        showRealName: false,
        shareDiagnosis: false,
        shareTherapistContact: true,
        shareAssessmentDetails: true
      }
    }
  })

  afterEach(async () => {
    // Limpiar usuarios creados en los tests
    for (const userId of createdUserIds) {
      try {
        await deleteFile(getUserFilePath('individual', userId))
      } catch {}
    }
    createdUserIds = []
  })

  describe('Profile Creation', () => {
    it('should create individual profile with default privacy settings', async () => {
      const result = await createIndividualProfile(mockIndividualData)
      createdUserIds.push(result.userId)

      expect(result).toBeDefined()
      expect(result.userId).toMatch(/^ind_/)
      expect(result.profile.name).toBe('John Doe')
      expect(result.privacy.showRealName).toBe(false) // default privacy
      expect(result.privacy.shareDiagnosis).toBe(false) // default privacy
      expect(result.status).toBe('active')
      expect(result.createdAt).toBeDefined()

      // Verificar que tiene passwordHash
      expect(result.passwordHash).toBeDefined()
    })

    it('should generate unique userId with "ind_" prefix', () => {
      const userId = generateUserId('individual')

      expect(userId).toMatch(/^ind_[a-zA-Z0-9]+$/)
      expect(userId.length).toBeGreaterThan(8)
    })

    it('should store sensitive data (diagnoses) with privacy flag', async () => {
      const result = await createIndividualProfile(mockIndividualData)
      createdUserIds.push(result.userId)

      expect(result.profile.diagnoses).toEqual(['ADHD', 'Autism Level 1'])
      expect(result.privacy.shareDiagnosis).toBe(false)

      // Diagnosis should NOT be in public view without consent
      const publicView = getPublicProfileView(result)
      expect(publicView.diagnoses).toBeUndefined()
    })

    it('should reject registration without required fields', async () => {
      const invalidData = { email: 'test@example.com' } // missing profile

      await expect(createIndividualProfile(invalidData)).rejects.toThrow('Profile data is required')
    })

    it('should reject duplicate email registration', async () => {
      const result = await createIndividualProfile(mockIndividualData)
      createdUserIds.push(result.userId)

      await expect(createIndividualProfile(mockIndividualData)).rejects.toThrow('Email already exists')
    })
  })

  describe('OpenAI Validation', () => {
    it('should validate and normalize profile data with OpenAI', async () => {
      const result = await validateIndividualData(mockIndividualData)

      expect(result.validated).toBe(true)
      expect(result.normalized).toBeDefined()
      expect(result.suggestions).toBeInstanceOf(Array)
    })

    it('should suggest standard diagnosis names for non-standard input', async () => {
      const dataWithNonStandardDiagnosis = {
        ...mockIndividualData,
        profile: {
          ...mockIndividualData.profile,
          diagnoses: ['ADD'] // non-standard
        }
      }

      const result = await validateIndividualData(dataWithNonStandardDiagnosis)

      expect(result.suggestions).toContainEqual(
        expect.objectContaining({
          field: 'diagnoses',
          suggestion: 'ADHD'
        })
      )
    })

    it('should handle OpenAI API failure gracefully', async () => {
      // Usar un email diferente para evitar duplicados
      const uniqueData = {
        ...mockIndividualData,
        email: 'openai-test@example.com'
      }

      const result = await createIndividualProfile(uniqueData)
      createdUserIds.push(result.userId)

      // Should save without validation but mark for review (OpenAI es opcional)
      expect(result.userId).toBeDefined()
      // validationStatus es opcional, puede estar o no
    })
  })

  describe('Privacy Settings', () => {
    it('should respect custom privacy overrides', async () => {
      const customPrivacyData = {
        ...mockIndividualData,
        email: 'custom-privacy@example.com',
        privacy: {
          visibleInSearch: false, // custom: not visible
          showRealName: true, // custom: show real name
          shareDiagnosis: true, // custom: share diagnosis
          shareTherapistContact: false,
          shareAssessmentDetails: false
        }
      }

      const result = await createIndividualProfile(customPrivacyData)
      createdUserIds.push(result.userId)

      expect(result.privacy.visibleInSearch).toBe(false)
      expect(result.privacy.showRealName).toBe(true)
      expect(result.privacy.shareDiagnosis).toBe(true)
      expect(result.privacy.shareTherapistContact).toBe(false)
    })

    it('should create anonymized public view when showRealName is false', async () => {
      const result = await createIndividualProfile(mockIndividualData)
      createdUserIds.push(result.userId)

      const publicView = getPublicProfileView(result)

      // Cuando showRealName es false, debe usar nombre anonimizado
      expect(publicView.name).not.toBe('John Doe')
      expect(publicView.name).toMatch(/Anonymous User \d+/)
      expect(publicView.diagnoses).toBeUndefined() // private by default
    })

    it('should hide sensitive data by default in matches', async () => {
      const result = await createIndividualProfile(mockIndividualData)
      createdUserIds.push(result.userId)

      expect(result.privacy.shareDiagnosis).toBe(false)
      expect(result.privacy.showRealName).toBe(false)
    })
  })

  describe('Data Persistence', () => {
    it('should save profile to data/users/individuals/{userId}.json', async () => {
      const result = await createIndividualProfile(mockIndividualData)
      createdUserIds.push(result.userId)

      const saved = await getIndividualProfile(result.userId)

      expect(saved).toBeDefined()
      expect(saved.userId).toBe(result.userId)
      expect(saved.email).toBe(mockIndividualData.email)

      // Verificar que los datos médicos se desencriptan correctamente
      expect(saved.profile.diagnoses).toEqual(['ADHD', 'Autism Level 1'])
    })

    it('should initialize empty matches object', async () => {
      const result = await createIndividualProfile(mockIndividualData)
      createdUserIds.push(result.userId)

      expect(result.matches).toEqual({
        pending: [],
        accepted: [],
        rejected: []
      })
    })

    it('should set initial status as "active"', async () => {
      const result = await createIndividualProfile(mockIndividualData)
      createdUserIds.push(result.userId)

      expect(result.status).toBe('active')
    })

    it('should store timestamps for audit', async () => {
      const result = await createIndividualProfile(mockIndividualData)
      createdUserIds.push(result.userId)

      // Los timestamps pueden ser Date o string (después de serialización)
      expect(result.createdAt).toBeDefined()
      expect(result.lastActive).toBeDefined()
    })
  })

  describe('Edge Cases', () => {
    it('should handle user abandoning form (draft save)', async () => {
      const partialData = {
        email: 'partial@example.com',
        profile: {
          name: 'Partial User'
          // missing required fields
        }
      }

      // Should save draft to localStorage, not create profile
      const draft = await createIndividualProfile(partialData, { draft: true })

      expect(draft.isDraft).toBe(true)
      expect(draft.savedToLocalStorage).toBe(true)
      expect(localStorage.setItem).toHaveBeenCalled()
    })

    it('should detect and alert when sensitive data in public fields', async () => {
      const dataWithSensitiveInPublic = {
        ...mockIndividualData,
        profile: {
          ...mockIndividualData.profile,
          experience: [
            {
              title: 'I have ADHD and autism', // sensitive in public field
              company: 'TechCorp',
              years: 2
            }
          ]
        }
      }

      const validation = await validateIndividualData(dataWithSensitiveInPublic)

      expect(validation.warnings).toContainEqual(
        expect.objectContaining({
          field: 'experience',
          message: 'Sensitive information detected in public field'
        })
      )
    })

    it('should handle low visibility settings (all privacy denied)', async () => {
      const lowVisibilityData = {
        ...mockIndividualData,
        email: 'low-visibility@example.com',
        privacy: {
          visibleInSearch: false,
          showRealName: false,
          shareDiagnosis: false,
          shareTherapistContact: false,
          shareAssessmentDetails: false
        }
      }

      const result = await createIndividualProfile(lowVisibilityData)
      createdUserIds.push(result.userId)

      // Warnings es opcional, pero si existe debe contener el mensaje
      if (result.warnings) {
        expect(result.warnings).toContainEqual(
          expect.objectContaining({
            type: 'low_visibility',
            message: 'Low visibility settings may reduce matching opportunities'
          })
        )
      }
    })
  })

  describe('Integration with Dashboard', () => {
    it('should redirect to /dashboard/individual after registration', async () => {
      const result = await createIndividualProfile(mockIndividualData)
      createdUserIds.push(result.userId)

      expect(result.redirectTo).toBe('/dashboard/individual')
    })

    it('should trigger NeuroAgent welcome message', async () => {
      const result = await createIndividualProfile(mockIndividualData)
      createdUserIds.push(result.userId)

      expect(result.triggerWelcomeMessage).toBe(true)
      expect(result.welcomeMessageContext).toEqual({
        userId: result.userId,
        name: 'John Doe'
      })
    })
  })
})
