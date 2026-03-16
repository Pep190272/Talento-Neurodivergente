/**
 * Connections Service — 360 Ecosystem Tests
 *
 * Tests the three-way connection model:
 *   Individual ↔ Company (JOB_MATCH)
 *   Individual ↔ Therapist (THERAPY — confidential)
 *   Company ↔ Therapist (CONSULTING)
 *
 * CRITICAL: Verifies privacy rule — companies cannot see therapy connections.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createTherapyConnection,
  createConsultingConnection,
  getIndividualConnections,
  getCompanyConnections,
  getTherapistConnections,
  revokeConnection,
  canCompanyViewConnection,
} from '@/lib/services/connections.service'

// ─── Prisma Mock ────────────────────────────────────────────────────────────

vi.mock('@/lib/prisma', () => {
  const connectionMock = {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  }
  return {
    default: {
      connection: connectionMock,
    },
  }
})

import prisma from '@/lib/prisma'

// ─── Fixtures ───────────────────────────────────────────────────────────────

const INDIVIDUAL_ID = 'ind-001'
const COMPANY_ID = 'comp-001'
const THERAPIST_ID = 'ther-001'

const mockTherapyConnection = {
  id: 'conn-therapy-001',
  type: 'THERAPY' as const,
  individualId: INDIVIDUAL_ID,
  companyId: null,
  therapistId: THERAPIST_ID,
  status: 'active',
  pipelineStage: 'newMatches',
  sharedData: ['name', 'diagnoses'],
  consentGivenAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockConsultingConnection = {
  id: 'conn-consult-001',
  type: 'CONSULTING' as const,
  individualId: null,
  companyId: COMPANY_ID,
  therapistId: THERAPIST_ID,
  status: 'active',
  pipelineStage: 'newMatches',
  sharedData: ['companyProfile'],
  consentGivenAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockJobMatchConnection = {
  id: 'conn-job-001',
  type: 'JOB_MATCH' as const,
  individualId: INDIVIDUAL_ID,
  companyId: COMPANY_ID,
  therapistId: null,
  status: 'active',
  pipelineStage: 'newMatches',
  sharedData: ['name', 'skills'],
  consentGivenAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
}

// ─── Setup ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('360 Ecosystem — Connections Service', () => {

  describe('Therapy Connections (Individual ↔ Therapist)', () => {
    it('should create a therapy connection', async () => {
      vi.mocked(prisma.connection.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.connection.create).mockResolvedValue(mockTherapyConnection as never)

      const result = await createTherapyConnection(INDIVIDUAL_ID, THERAPIST_ID)

      expect(result.type).toBe('THERAPY')
      expect(result.individualId).toBe(INDIVIDUAL_ID)
      expect(result.therapistId).toBe(THERAPIST_ID)
      expect(result.companyId).toBeNull()
    })

    it('should prevent duplicate active therapy connections', async () => {
      vi.mocked(prisma.connection.findFirst).mockResolvedValue(mockTherapyConnection as never)

      await expect(
        createTherapyConnection(INDIVIDUAL_ID, THERAPIST_ID)
      ).rejects.toThrow('Active therapy connection already exists')
    })
  })

  describe('Consulting Connections (Company ↔ Therapist)', () => {
    it('should create a consulting connection', async () => {
      vi.mocked(prisma.connection.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.connection.create).mockResolvedValue(mockConsultingConnection as never)

      const result = await createConsultingConnection(COMPANY_ID, THERAPIST_ID)

      expect(result.type).toBe('CONSULTING')
      expect(result.companyId).toBe(COMPANY_ID)
      expect(result.therapistId).toBe(THERAPIST_ID)
      expect(result.individualId).toBeNull()
    })

    it('should prevent duplicate active consulting connections', async () => {
      vi.mocked(prisma.connection.findFirst).mockResolvedValue(mockConsultingConnection as never)

      await expect(
        createConsultingConnection(COMPANY_ID, THERAPIST_ID)
      ).rejects.toThrow('Active consulting connection already exists')
    })
  })

  describe('Privacy Enforcement — CRITICAL', () => {
    it('company connections should NEVER include THERAPY type', async () => {
      // Even if the DB had therapy connections with companyId set somehow,
      // the query filter ensures only JOB_MATCH and CONSULTING are returned
      vi.mocked(prisma.connection.findMany).mockResolvedValue([
        mockJobMatchConnection,
        mockConsultingConnection,
      ] as never)

      const connections = await getCompanyConnections(COMPANY_ID)

      // Verify the query filter was correct
      expect(prisma.connection.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: { in: ['JOB_MATCH', 'CONSULTING'] },
          }),
        })
      )

      // None should be THERAPY
      expect(connections.every(c => c.type !== 'THERAPY')).toBe(true)
    })

    it('canCompanyViewConnection should reject THERAPY connections', () => {
      expect(canCompanyViewConnection({
        id: 'test',
        type: 'THERAPY',
        individualId: INDIVIDUAL_ID,
        companyId: null,
        therapistId: THERAPIST_ID,
        status: 'active',
        pipelineStage: 'newMatches',
        createdAt: new Date(),
      })).toBe(false)
    })

    it('canCompanyViewConnection should allow JOB_MATCH connections', () => {
      expect(canCompanyViewConnection({
        id: 'test',
        type: 'JOB_MATCH',
        individualId: INDIVIDUAL_ID,
        companyId: COMPANY_ID,
        therapistId: null,
        status: 'active',
        pipelineStage: 'newMatches',
        createdAt: new Date(),
      })).toBe(true)
    })

    it('canCompanyViewConnection should allow CONSULTING connections', () => {
      expect(canCompanyViewConnection({
        id: 'test',
        type: 'CONSULTING',
        individualId: null,
        companyId: COMPANY_ID,
        therapistId: THERAPIST_ID,
        status: 'active',
        pipelineStage: 'newMatches',
        createdAt: new Date(),
      })).toBe(true)
    })
  })

  describe('Individual Connections', () => {
    it('should return all connection types for individual', async () => {
      vi.mocked(prisma.connection.findMany).mockResolvedValue([
        mockJobMatchConnection,
        mockTherapyConnection,
      ] as never)

      const connections = await getIndividualConnections(INDIVIDUAL_ID)

      expect(connections).toHaveLength(2)
      expect(connections.some(c => c.type === 'JOB_MATCH')).toBe(true)
      expect(connections.some(c => c.type === 'THERAPY')).toBe(true)
    })
  })

  describe('Therapist Connections', () => {
    it('should return THERAPY and CONSULTING connections', async () => {
      vi.mocked(prisma.connection.findMany).mockResolvedValue([
        mockTherapyConnection,
        mockConsultingConnection,
      ] as never)

      const connections = await getTherapistConnections(THERAPIST_ID)

      expect(connections).toHaveLength(2)
      expect(connections.some(c => c.type === 'THERAPY')).toBe(true)
      expect(connections.some(c => c.type === 'CONSULTING')).toBe(true)
    })
  })

  describe('Revoke Connection', () => {
    it('should revoke a connection with reason', async () => {
      vi.mocked(prisma.connection.update).mockResolvedValue({
        ...mockTherapyConnection,
        status: 'revoked',
      } as never)

      const result = await revokeConnection('conn-therapy-001', 'Treatment completed')

      expect(result.status).toBe('revoked')
      expect(prisma.connection.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'revoked',
            revokedReason: 'Treatment completed',
          }),
        })
      )
    })
  })
})
