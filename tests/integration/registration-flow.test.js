/**
 * Integration: Registration Flow Tests (Prisma)
 *
 * Tests the full API route → lib → Prisma flow for all three actor types.
 * Uses the Prisma mock to avoid real DB.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Prisma BEFORE importing API routes
vi.mock('@/lib/prisma', async () => {
  const { getMockPrisma } = await import('../helpers/prisma-mock.js')
  const mock = getMockPrisma()
  return { default: mock, prisma: mock }
})

import { getMockPrisma } from '../helpers/prisma-mock.js'
const mockPrisma = getMockPrisma()

// Mock utils (used by individuals.ts, companies.ts, therapists.ts)
vi.mock('@/lib/utils.js', () => ({
  isValidEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  sanitizeInput: (str) => str,
  generateAnonymizedName: (id) => `Anon_${id.slice(0, 6)}`,
  addYears: (years, date) => {
    const d = new Date(date || new Date())
    d.setFullYear(d.getFullYear() + years)
    return d
  },
}))

// Mock LLM (used by companies.ts analyzeJobInclusivity)
vi.mock('@/lib/llm', () => ({
  analyzeJobInclusivity: vi.fn().mockRejectedValue(new Error('LLM not available')),
}))

// Mock job analysis validation (used by companies.ts)
vi.mock('@/lib/schemas/job-analysis', () => ({
  validateJobAnalysis: vi.fn(),
}))

describe('Integration: Individual Registration Flow (Prisma)', () => {
  beforeEach(() => {
    mockPrisma._reset()
  })

  it('should create a new individual profile via lib module', async () => {
    const { createIndividualProfile } = await import('@/lib/individuals')

    const result = await createIndividualProfile({
      email: 'test@example.com',
      passwordHash: '$2b$10$placeholder',
      profile: {
        name: 'Test User',
        diagnoses: ['ADHD'],
        skills: ['JavaScript', 'React', 'Node.js'],
        accommodationsNeeded: ['Flexible hours'],
      },
    })

    expect(result.userId).toBeDefined()
    expect(result.email).toBe('test@example.com')
    expect(result.profile.name).toBe('Test User')
    expect(result.profile.skills).toContain('JavaScript')
    expect(result.userType).toBe('individual')
    expect(result.status).toBe('active')

    // Verify data persisted to mock store
    expect(mockPrisma._stores.user.size).toBe(1)
    expect(mockPrisma._stores.individual.size).toBe(1)
  })

  it('should reject duplicate email registration', async () => {
    const { createIndividualProfile } = await import('@/lib/individuals')

    await createIndividualProfile({
      email: 'duplicate@example.com',
      passwordHash: '$2b$10$placeholder',
      profile: { name: 'First User', skills: [] },
    })

    await expect(
      createIndividualProfile({
        email: 'duplicate@example.com',
        passwordHash: '$2b$10$placeholder',
        profile: { name: 'Second User', skills: [] },
      })
    ).rejects.toThrow(/already exists/i)
  })

  it('should validate required fields', async () => {
    const { createIndividualProfile } = await import('@/lib/individuals')

    await expect(
      createIndividualProfile({ email: 'test@example.com' })
    ).rejects.toThrow(/required/i)

    await expect(
      createIndividualProfile({ profile: { name: 'Test' } })
    ).rejects.toThrow(/required/i)
  })

  it('should set default privacy settings (most restrictive)', async () => {
    const { createIndividualProfile } = await import('@/lib/individuals')

    const result = await createIndividualProfile({
      email: 'privacy@example.com',
      passwordHash: '$2b$10$placeholder',
      profile: { name: 'Privacy User', skills: [] },
    })

    expect(result.privacy.showRealName).toBe(false)
    expect(result.privacy.shareDiagnosis).toBe(false)
    expect(result.privacy.shareTherapistContact).toBe(false)
    expect(result.privacy.visibleInSearch).toBe(true)
  })

  it('should return redirect and welcome context after creation', async () => {
    const { createIndividualProfile } = await import('@/lib/individuals')

    const result = await createIndividualProfile({
      email: 'welcome@example.com',
      passwordHash: '$2b$10$placeholder',
      profile: { name: 'Welcome User', skills: [] },
    })

    expect(result.redirectTo).toBe('/dashboard/individual')
    expect(result.triggerWelcomeMessage).toBe(true)
    expect(result.welcomeMessageContext).toBeDefined()
    expect(result.welcomeMessageContext.name).toBe('Welcome User')
  })
})

describe('Integration: Company Registration Flow (Prisma)', () => {
  beforeEach(() => {
    mockPrisma._reset()
  })

  it('should create a new company profile', async () => {
    const { createCompany } = await import('@/lib/companies')

    const result = await createCompany({
      email: 'hr@testcorp.com',
      passwordHash: '$2b$10$placeholder',
      name: 'TestCorp',
      industry: 'Technology',
      size: '50-100',
      location: 'Barcelona',
    })

    expect(result.companyId).toBeDefined()
    expect(result.name).toBe('TestCorp')
    expect(result.industry).toBe('Technology')
    expect(result.redirectTo).toBe('/dashboard/company')

    expect(mockPrisma._stores.user.size).toBe(1)
    expect(mockPrisma._stores.company.size).toBe(1)
  })

  it('should reject company without name', async () => {
    const { createCompany } = await import('@/lib/companies')

    await expect(
      createCompany({ email: 'noname@corp.com' })
    ).rejects.toThrow(/name.*required/i)
  })

  it('should reject duplicate company email', async () => {
    const { createCompany } = await import('@/lib/companies')

    await createCompany({
      email: 'dup@corp.com',
      name: 'First Corp',
    })

    await expect(
      createCompany({ email: 'dup@corp.com', name: 'Second Corp' })
    ).rejects.toThrow(/already exists/i)
  })
})

describe('Integration: Therapist Registration Flow (Prisma)', () => {
  beforeEach(() => {
    mockPrisma._reset()
  })

  it('should create a therapist with pending verification', async () => {
    const { createTherapist } = await import('@/lib/therapists')

    const result = await createTherapist({
      email: 'dr.smith@therapy.com',
      profile: {
        name: 'Dr. Smith',
        certifications: [{
          title: 'Licensed Clinical Psychologist',
          licenseNumber: 'PSY12345',
          issuingBody: 'State Board of Psychology',
          expiryDate: '2027-12-31',
        }],
        specializations: ['autism', 'ADHD'],
        neurodiversityExperience: 5,
      },
    })

    expect(result.therapistId).toBeDefined()
    expect(result.profile.name).toBe('Dr. Smith')
    expect(result.status).toBe('pending_verification')
    expect(result.verificationStatus).toBe('pending')
    expect(result.profile.specializations).toContain('autism')

    expect(mockPrisma._stores.user.size).toBe(1)
    expect(mockPrisma._stores.therapist.size).toBe(1)
  })

  it('should require at least one certification', async () => {
    const { createTherapist } = await import('@/lib/therapists')

    await expect(
      createTherapist({
        email: 'nocerts@therapy.com',
        profile: {
          name: 'No Certs',
          certifications: [],
          specializations: ['ADHD'],
        },
      })
    ).rejects.toThrow(/certification.*required/i)
  })

  it('should reject expired certifications', async () => {
    const { createTherapist } = await import('@/lib/therapists')

    await expect(
      createTherapist({
        email: 'expired@therapy.com',
        profile: {
          name: 'Expired Cert',
          certifications: [{
            title: 'Old Cert',
            licenseNumber: 'OLD123',
            issuingBody: 'State Board',
            expiryDate: '2020-01-01',
          }],
          specializations: ['ADHD'],
        },
      })
    ).rejects.toThrow(/expired/i)
  })

  it('should verify and activate therapist', async () => {
    const { createTherapist, verifyTherapist } = await import('@/lib/therapists')

    const therapist = await createTherapist({
      email: 'verify@therapy.com',
      profile: {
        name: 'Dr. Verify',
        certifications: [{
          title: 'Licensed Psychologist',
          licenseNumber: 'PSY999',
          issuingBody: 'State Board of Psychology',
          expiryDate: '2027-12-31',
        }],
        specializations: ['autism'],
      },
    })

    const verified = await verifyTherapist(therapist.therapistId, {
      verifiedBy: 'admin_1',
      notes: 'Credentials verified',
    })

    expect(verified.status).toBe('active')
    expect(verified.verificationStatus).toBe('verified')
    expect(verified.verifiedAt).toBeDefined()
    expect(verified.verifiedBy).toBe('admin_1')
  })
})
