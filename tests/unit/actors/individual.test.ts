/**
 * UC-001: Individual Registration and Profile Management
 * TDD Tests — Prisma-backed implementation
 *
 * Methodology: Red → Green → Refactor
 * DB isolation: vi.mock('@/lib/prisma') — no real DB in unit tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createIndividualProfile,
  validateIndividualData,
  getIndividualProfile,
  getPublicProfileView,
} from '@/lib/individuals'

// ─── Prisma Mock ─────────────────────────────────────────────────────────────
// Factory is hoisted: define tx inside so mocks are accessible
vi.mock('@/lib/prisma', () => {
  const tx = {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    individual: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
  }
  return {
    default: {
      ...tx,
      $transaction: vi.fn().mockImplementation(
        (fn: (tx: typeof tx) => unknown) => fn(tx)
      ),
    },
  }
})

// ─── Test fixtures ────────────────────────────────────────────────────────────

const USER_ID = 'test-user-cuid-001'
const INDIVIDUAL_ID = 'test-individual-cuid-001'

const DEFAULT_PRIVACY = {
  visibleInSearch: true,
  showRealName: false,
  shareDiagnosis: false,
  shareTherapistContact: false,
  shareAssessmentDetails: true,
}

const DEFAULT_ASSESSMENT = {
  completed: false,
  completedAt: null,
  strengths: [],
  challenges: [],
  score: null,
  technicalSkills: [],
  softSkills: [],
  workStyle: {},
}

const DEFAULT_METADATA = {
  lastLogin: null,
  profileViews: 0,
  matchesReceived: 0,
  applicationsSubmitted: 0,
}

const mockUser = {
  id: USER_ID,
  email: 'john.doe@example.com',
  passwordHash: '$2b$10$hashedpassword',
  userType: 'individual' as const,
  status: 'active',
  createdAt: new Date('2026-02-20T10:00:00Z'),
  updatedAt: new Date('2026-02-20T10:00:00Z'),
}

const mockIndividual = {
  id: INDIVIDUAL_ID,
  userId: USER_ID,
  firstName: 'John',
  lastName: 'Doe',
  diagnoses: [],
  accommodationsNeeded: null,
  medicalHistory: null,
  bio: null,
  location: 'Madrid, Spain',
  skills: [],
  experienceYears: null,
  cvUrl: null,
  experience: [],
  education: [],
  preferences: {},
  therapistAssignedId: null,
  privacy: DEFAULT_PRIVACY,
  assessment: DEFAULT_ASSESSMENT,
  metadata: DEFAULT_METADATA,
  lastActive: new Date('2026-02-20T10:00:00Z'),
  deactivatedAt: null,
  deletedAt: null,
  validationStatus: 'pending',
  createdAt: new Date('2026-02-20T10:00:00Z'),
  updatedAt: new Date('2026-02-20T10:00:00Z'),
  user: mockUser,
}

// ─── Setup ────────────────────────────────────────────────────────────────────

// Import prisma AFTER vi.mock so we get the mocked version
import prisma from '@/lib/prisma'

beforeEach(() => {
  vi.clearAllMocks()

  if (!process.env.ENCRYPTION_KEY) {
    process.env.ENCRYPTION_KEY = '0'.repeat(64)
  }

  // Default: no existing user (allows creation)
  vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

  // Default transaction: creates user then individual
  vi.mocked(prisma.$transaction).mockImplementation(async (fn: unknown) => {
    const tx = {
      user: {
        create: vi.fn().mockResolvedValue(mockUser),
        findUnique: vi.fn().mockResolvedValue(null),
        update: vi.fn().mockResolvedValue(mockUser),
      },
      individual: {
        create: vi.fn().mockResolvedValue(mockIndividual),
        findUnique: vi.fn().mockResolvedValue(mockIndividual),
        update: vi.fn().mockResolvedValue(mockIndividual),
        findMany: vi.fn().mockResolvedValue([mockIndividual]),
      },
    }
    return (fn as (tx: typeof tx) => unknown)(tx)
  })

  // findUnique for getIndividualProfile
  vi.mocked(prisma.individual.findUnique).mockResolvedValue(mockIndividual as never)
})

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('UC-001: Individual Registration', () => {
  let mockInputData: Parameters<typeof createIndividualProfile>[0]

  beforeEach(() => {
    mockInputData = {
      email: 'john.doe@example.com',
      passwordHash: '$2b$10$hashedpassword',
      profile: {
        name: 'John Doe',
        location: 'Madrid, Spain',
        diagnoses: ['ADHD', 'Autism Level 1'],
        experience: [{ title: 'Software Developer', company: 'TechCorp', years: 3 }],
        preferences: { workMode: 'remote', flexibleHours: true, teamSize: 'small' },
        accommodationsNeeded: ['Quiet workspace', 'Written instructions'],
      },
      privacy: {
        visibleInSearch: true,
        showRealName: false,
        shareDiagnosis: false,
        shareTherapistContact: true,
        shareAssessmentDetails: true,
      },
    }
  })

  describe('Profile Creation', () => {
    it('should create individual profile with privacy settings applied', async () => {
      const result = await createIndividualProfile(mockInputData)

      expect(result).toBeDefined()
      expect(result.userId).toBe(USER_ID)
      expect(result.profile.name).toBe('John Doe')
      expect(result.privacy.showRealName).toBe(false)
      expect(result.privacy.shareDiagnosis).toBe(false)
      expect(result.status).toBe('active')
      expect(result.createdAt).toBeDefined()
      expect(result.passwordHash).toBeDefined()
    })

    it('should normalize profile.name from firstName + lastName (DB split)', async () => {
      const result = await createIndividualProfile(mockInputData)
      // The name is reconstructed from firstName + lastName stored in DB
      expect(result.profile.name).toBe('John Doe')
    })

    it('should include integration metadata (redirectTo, triggerWelcomeMessage)', async () => {
      const result = await createIndividualProfile(mockInputData)

      expect(result.redirectTo).toBe('/dashboard/individual')
      expect(result.triggerWelcomeMessage).toBe(true)
      expect(result.welcomeMessageContext).toEqual({
        userId: USER_ID,
        name: 'John Doe',
      })
    })

    it('should reject creation without profile data', async () => {
      await expect(
        createIndividualProfile({ email: 'test@example.com' })
      ).rejects.toThrow('Profile data is required')
    })

    it('should reject creation with invalid email format', async () => {
      await expect(
        createIndividualProfile({ email: 'not-an-email', profile: { name: 'Test' } })
      ).rejects.toThrow('Invalid email format')
    })

    it('should reject duplicate email (Prisma findUnique returns existing user)', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

      await expect(createIndividualProfile(mockInputData)).rejects.toThrow('Email already exists')
    })

    it('should initialize empty matches structure', async () => {
      const result = await createIndividualProfile(mockInputData)

      expect(result.matches).toEqual({ pending: [], accepted: [], rejected: [] })
    })

    it('should set initial status as "active"', async () => {
      const result = await createIndividualProfile(mockInputData)
      expect(result.status).toBe('active')
    })

    it('should store timestamps (createdAt, lastActive)', async () => {
      const result = await createIndividualProfile(mockInputData)

      expect(result.createdAt).toBeDefined()
      expect(result.lastActive).toBeDefined()
    })
  })

  describe('Draft Mode', () => {
    it('should return draft object without hitting DB', async () => {
      const partialData = {
        email: 'partial@example.com',
        profile: { name: 'Partial User' },
      }

      const draft = await createIndividualProfile(partialData, { draft: true })

      expect(draft.isDraft).toBe(true)
      expect(draft.savedToLocalStorage).toBe(true)
      // No DB calls
      expect(prisma.user.findUnique).not.toHaveBeenCalled()
      expect(prisma.$transaction).not.toHaveBeenCalled()
    })
  })

  describe('Privacy Settings', () => {
    it('should apply DEFAULT_PRIVACY when none provided', async () => {
      const dataWithoutPrivacy = {
        email: 'no-privacy@example.com',
        profile: { name: 'No Privacy User', location: 'Madrid' },
      }

      // Mock individual with default privacy
      vi.mocked(prisma.$transaction).mockImplementation(async (fn: unknown) => {
        const tx = {
          user: { create: vi.fn().mockResolvedValue(mockUser) },
          individual: {
            create: vi.fn().mockResolvedValue({
              ...mockIndividual,
              privacy: { visibleInSearch: true, showRealName: false, shareDiagnosis: false, shareTherapistContact: false, shareAssessmentDetails: true },
            }),
          },
        }
        return (fn as (tx: typeof tx) => unknown)(tx)
      })

      const result = await createIndividualProfile(dataWithoutPrivacy)

      expect(result.privacy.visibleInSearch).toBe(true)
      expect(result.privacy.showRealName).toBe(false)
      expect(result.privacy.shareDiagnosis).toBe(false)
    })

    it('should merge custom privacy overrides with defaults', async () => {
      const customPrivacyData = {
        ...mockInputData,
        email: 'custom-privacy@example.com',
        privacy: {
          visibleInSearch: false,
          showRealName: true,
          shareDiagnosis: true,
          shareTherapistContact: false,
          shareAssessmentDetails: false,
        },
      }

      vi.mocked(prisma.$transaction).mockImplementation(async (fn: unknown) => {
        const tx = {
          user: { create: vi.fn().mockResolvedValue(mockUser) },
          individual: {
            create: vi.fn().mockResolvedValue({
              ...mockIndividual,
              privacy: customPrivacyData.privacy,
            }),
          },
        }
        return (fn as (tx: typeof tx) => unknown)(tx)
      })

      const result = await createIndividualProfile(customPrivacyData)

      expect(result.privacy.visibleInSearch).toBe(false)
      expect(result.privacy.showRealName).toBe(true)
      expect(result.privacy.shareDiagnosis).toBe(true)
    })

    it('should warn when all privacy settings are restrictive', async () => {
      const lowVisibilityData = {
        ...mockInputData,
        email: 'low-visibility@example.com',
        privacy: {
          visibleInSearch: false,
          showRealName: false,
          shareDiagnosis: false,
          shareTherapistContact: false,
          shareAssessmentDetails: false,
        },
      }

      vi.mocked(prisma.$transaction).mockImplementation(async (fn: unknown) => {
        const tx = {
          user: { create: vi.fn().mockResolvedValue(mockUser) },
          individual: {
            create: vi.fn().mockResolvedValue({
              ...mockIndividual,
              privacy: lowVisibilityData.privacy,
            }),
          },
        }
        return (fn as (tx: typeof tx) => unknown)(tx)
      })

      const result = await createIndividualProfile(lowVisibilityData)

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          type: 'low_visibility',
          message: 'Low visibility settings may reduce matching opportunities',
        })
      )
    })
  })

  describe('Public Profile View', () => {
    it('should hide real name when showRealName is false', async () => {
      const result = await createIndividualProfile(mockInputData)
      const publicView = getPublicProfileView(result)

      expect((publicView as { name: string }).name).not.toBe('John Doe')
      expect((publicView as { name: string }).name).toMatch(/Anonymous User \d+/)
    })

    it('should never include diagnoses in public view', async () => {
      const profileWithDiagnosis = await createIndividualProfile(mockInputData)
      // Simulate diagnoses stored
      profileWithDiagnosis.profile.diagnoses = ['ADHD', 'Autism Level 1']
      profileWithDiagnosis.privacy.shareDiagnosis = false

      const publicView = getPublicProfileView(profileWithDiagnosis)

      expect((publicView as Record<string, unknown>).diagnoses).toBeUndefined()
    })

    it('should show real name when showRealName is true', async () => {
      const profileWithRealName = {
        ...mockIndividual,
        privacy: { ...DEFAULT_PRIVACY, showRealName: true },
        user: mockUser,
      }
      vi.mocked(prisma.individual.findUnique).mockResolvedValue(profileWithRealName as never)

      const profile = await getIndividualProfile(USER_ID)
      const publicView = getPublicProfileView(profile!)

      expect((publicView as { name: string }).name).toBe('John Doe')
    })
  })

  describe('Data Retrieval', () => {
    it('should retrieve individual profile by userId', async () => {
      const profile = await getIndividualProfile(USER_ID)

      expect(profile).toBeDefined()
      expect(profile!.userId).toBe(USER_ID)
      expect(profile!.email).toBe('john.doe@example.com')
    })

    it('should return null when profile not found', async () => {
      vi.mocked(prisma.individual.findUnique).mockResolvedValue(null)

      const profile = await getIndividualProfile('nonexistent-id')

      expect(profile).toBeNull()
    })

    it('should include profile data in normalized structure', async () => {
      const profile = await getIndividualProfile(USER_ID)

      expect(profile!.profile.name).toBe('John Doe')
      expect(profile!.profile.location).toBe('Madrid, Spain')
      expect(profile!.privacy).toMatchObject({
        visibleInSearch: true,
        showRealName: false,
      })
    })
  })

  describe('Validation', () => {
    it('should validate and return suggestions for non-standard diagnoses', async () => {
      const result = await validateIndividualData({
        profile: { diagnoses: ['ADD'] },
      })

      expect(result.validated).toBe(true)
      expect(result.suggestions).toContainEqual(
        expect.objectContaining({
          field: 'diagnoses',
          suggestion: 'ADHD',
        })
      )
    })

    it('should detect sensitive information in public fields', async () => {
      const result = await validateIndividualData({
        profile: {
          experience: [{ title: 'I have ADHD and autism', company: 'TechCorp' }],
        },
      })

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          field: 'experience',
          message: 'Sensitive information detected in public field',
        })
      )
    })

    it('should suggest adding bio when missing or too short', async () => {
      const result = await validateIndividualData({
        profile: { bio: 'Short bio' },
      })

      expect(result.suggestions).toContainEqual(
        expect.objectContaining({ field: 'bio' })
      )
    })

    it('should return normalized data alongside suggestions', async () => {
      const data = { profile: { diagnoses: ['ADHD'], skills: ['TypeScript', 'React', 'Node'] } }
      const result = await validateIndividualData(data)

      expect(result.normalized).toBeDefined()
    })
  })
})
