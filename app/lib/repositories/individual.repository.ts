/**
 * Individual Repository — Data Access Layer
 * Encapsulates all Prisma operations for User + Individual tables.
 *
 * Sprint 3: Extracted from app/lib/individuals.ts
 * Only contains Prisma queries — no business logic.
 */

import prisma from '../prisma'

// ─── User Queries ────────────────────────────────────────────────────────────

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export async function updateUser(userId: string, data: Record<string, unknown>) {
  return prisma.user.update({ where: { id: userId }, data })
}

// ─── Individual Queries ──────────────────────────────────────────────────────

export async function findIndividualByUserId(userId: string) {
  return prisma.individual.findUnique({
    where: { userId },
    include: { user: true },
  })
}

export async function findActiveIndividuals() {
  return prisma.individual.findMany({
    where: {
      deletedAt: null,
      user: { status: 'active' },
    },
    include: { user: true },
  })
}

export async function updateIndividual(userId: string, data: Record<string, unknown>) {
  return prisma.individual.update({
    where: { userId },
    data,
    include: { user: true },
  })
}

// ─── Transactional Operations ────────────────────────────────────────────────

export async function createUserAndIndividual(
  userData: {
    email: string
    passwordHash: string
    userType: string
    status: string
  },
  individualData: Record<string, unknown>
) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: userData })

    return tx.individual.create({
      data: {
        userId: user.id,
        ...individualData,
      },
      include: { user: true },
    })
  })
}

export async function deactivateIndividualInDb(userId: string) {
  const individual = await prisma.individual.update({
    where: { userId },
    data: { deactivatedAt: new Date(), updatedAt: new Date() },
    include: { user: true },
  })

  await prisma.user.update({
    where: { id: userId },
    data: { status: 'deactivated' },
  })

  return individual
}

/**
 * Anonymize user account — GDPR Art. 17 (Right to Erasure).
 * Soft delete: wipes all PII, retains audit trail (7-year legal obligation).
 *
 * Cascade:
 *   1. Anonymize Individual PII (name, diagnoses, location, medical, skills)
 *   2. Anonymize User record (email → deleted_<id>@anonymized.local)
 *   3. Revoke all active Connections (consent withdrawn)
 *   4. Withdraw all PENDING Matchings + clear candidateData PII snapshots
 */
export async function anonymizeUserAccount(userId: string) {
  const now = new Date()

  return prisma.$transaction(async (tx) => {
    // Find individual record (need internal id for connections/matchings)
    const individual = await tx.individual.findUnique({ where: { userId } })
    if (!individual) return

    // 1. Anonymize Individual PII
    await tx.individual.update({
      where: { userId },
      data: {
        firstName: 'Deleted',
        lastName: 'User',
        bio: null,
        location: null,
        diagnoses: [],
        accommodationsNeeded: null,
        medicalHistory: null,
        skills: [],
        experience: [],
        education: [],
        preferences: {},
        therapistAssignedId: null,
        deletedAt: now,
        updatedAt: now,
      },
    })

    // 2. Anonymize User record
    await tx.user.update({
      where: { id: userId },
      data: {
        email: `deleted_${userId}@anonymized.local`,
        passwordHash: 'DELETED',
        status: 'deleted',
        updatedAt: now,
      },
    })

    // 3. Revoke all active Connections — notify companies consent was withdrawn
    await tx.connection.updateMany({
      where: { individualId: individual.id, status: 'active' },
      data: {
        status: 'revoked',
        revokedAt: now,
        revokedReason: 'gdpr_right_to_erasure',
        sharedData: [],
        customPrivacy: {},
      },
    })

    // 4. Withdraw all pending Matchings and clear candidate PII snapshots
    await tx.matching.updateMany({
      where: { individualId: individual.id },
      data: {
        candidateData: {},
        updatedAt: now,
      },
    })
    await tx.matching.updateMany({
      where: { individualId: individual.id, status: 'PENDING' },
      data: { status: 'WITHDRAWN', updatedAt: now },
    })
  })
}
