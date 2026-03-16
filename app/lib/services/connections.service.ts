/**
 * Connections Service — 360 Ecosystem
 *
 * Manages connections between all three actor types:
 *   - Individual + Company  = JOB_MATCH  (employment)
 *   - Individual + Therapist = THERAPY   (confidential)
 *   - Company + Therapist    = CONSULTING (training/consulting)
 *
 * PRIVACY RULE: A company MUST NEVER see which therapists a candidate connects with.
 * This is enforced at the service layer — all queries filter by actor type.
 *
 * Dispatch #7: Ecosistema 360 (Terapeutas)
 */

import prisma from '../prisma'
import type { ConnectionType } from '@prisma/client'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ConnectionRecord {
  id: string
  type: ConnectionType
  individualId: string | null
  companyId: string | null
  therapistId: string | null
  status: string
  pipelineStage: string
  createdAt: Date
}

export interface TherapistConnectionView {
  connectionId: string
  type: 'THERAPY' | 'CONSULTING'
  partnerName: string
  partnerId: string
  status: string
  createdAt: Date
}

// ─── Create Connections ─────────────────────────────────────────────────────

/**
 * Create a therapy connection between individual and therapist.
 * CONFIDENTIAL: Not visible to companies.
 */
export async function createTherapyConnection(
  individualId: string,
  therapistId: string
): Promise<ConnectionRecord> {
  // Prevent duplicate connections
  const existing = await prisma.connection.findFirst({
    where: {
      individualId,
      therapistId,
      type: 'THERAPY',
      status: 'active',
    },
  })
  if (existing) throw new Error('Active therapy connection already exists')

  const connection = await prisma.connection.create({
    data: {
      type: 'THERAPY',
      individualId,
      therapistId,
      status: 'active',
      sharedData: ['name', 'diagnoses', 'accommodationsNeeded'],
      consentGivenAt: new Date(),
    },
  })

  return normalizeConnection(connection)
}

/**
 * Create a consulting connection between company and therapist.
 */
export async function createConsultingConnection(
  companyId: string,
  therapistId: string
): Promise<ConnectionRecord> {
  const existing = await prisma.connection.findFirst({
    where: {
      companyId,
      therapistId,
      type: 'CONSULTING',
      status: 'active',
    },
  })
  if (existing) throw new Error('Active consulting connection already exists')

  const connection = await prisma.connection.create({
    data: {
      type: 'CONSULTING',
      companyId,
      therapistId,
      status: 'active',
      sharedData: ['companyProfile', 'jobPostings'],
      consentGivenAt: new Date(),
    },
  })

  return normalizeConnection(connection)
}

// ─── Query Connections (with privacy enforcement) ───────────────────────────

/**
 * Get connections for an individual.
 * Returns ALL connection types (JOB_MATCH, THERAPY).
 */
export async function getIndividualConnections(individualId: string): Promise<ConnectionRecord[]> {
  const connections = await prisma.connection.findMany({
    where: { individualId, status: 'active' },
    orderBy: { createdAt: 'desc' },
  })
  return connections.map(normalizeConnection)
}

/**
 * Get connections for a company.
 * PRIVACY: Only returns JOB_MATCH and CONSULTING — NEVER THERAPY connections.
 */
export async function getCompanyConnections(companyId: string): Promise<ConnectionRecord[]> {
  const connections = await prisma.connection.findMany({
    where: {
      companyId,
      status: 'active',
      type: { in: ['JOB_MATCH', 'CONSULTING'] },
    },
    orderBy: { createdAt: 'desc' },
  })
  return connections.map(normalizeConnection)
}

/**
 * Get connections for a therapist.
 * Returns both THERAPY (individual) and CONSULTING (company) connections.
 */
export async function getTherapistConnections(therapistId: string): Promise<ConnectionRecord[]> {
  const connections = await prisma.connection.findMany({
    where: {
      therapistId,
      status: 'active',
      type: { in: ['THERAPY', 'CONSULTING'] },
    },
    orderBy: { createdAt: 'desc' },
  })
  return connections.map(normalizeConnection)
}

// ─── Revoke Connection ──────────────────────────────────────────────────────

/**
 * Revoke a connection. Either party can revoke.
 */
export async function revokeConnection(
  connectionId: string,
  reason?: string
): Promise<ConnectionRecord> {
  const connection = await prisma.connection.update({
    where: { id: connectionId },
    data: {
      status: 'revoked',
      revokedAt: new Date(),
      revokedReason: reason ?? null,
    },
  })
  return normalizeConnection(connection)
}

// ─── Privacy Check ──────────────────────────────────────────────────────────

/**
 * Check if a company can see a specific connection.
 * Companies can NEVER see THERAPY connections.
 */
export function canCompanyViewConnection(connection: ConnectionRecord): boolean {
  return connection.type !== 'THERAPY'
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function normalizeConnection(connection: {
  id: string
  type: ConnectionType
  individualId: string | null
  companyId: string | null
  therapistId: string | null
  status: string
  pipelineStage: string
  createdAt: Date
}): ConnectionRecord {
  return {
    id: connection.id,
    type: connection.type,
    individualId: connection.individualId,
    companyId: connection.companyId,
    therapistId: connection.therapistId,
    status: connection.status,
    pipelineStage: connection.pipelineStage,
    createdAt: connection.createdAt,
  }
}
