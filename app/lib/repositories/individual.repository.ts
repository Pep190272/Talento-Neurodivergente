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

export async function anonymizeUserAccount(userId: string) {
  const now = new Date()

  return prisma.$transaction(async (tx) => {
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
        deletedAt: now,
        updatedAt: now,
      },
    })

    await tx.user.update({
      where: { id: userId },
      data: {
        email: `deleted_${userId}@anonymized.local`,
        status: 'deleted',
        updatedAt: now,
      },
    })
  })
}
