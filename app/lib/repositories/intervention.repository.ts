/**
 * InterventionRepository + AccommodationCatalog — Issue #82
 *
 * Repository layer for workplace interventions and accommodations.
 * Provides a queryable interface over the accommodations taxonomy
 * and tracks accommodation usage/effectiveness per company.
 *
 * Architecture:
 *   API Route → Service → InterventionRepository → Prisma / Taxonomy
 */

import prisma from '../prisma'
import {
  ACCOMMODATION_CATALOG,
  normalizeAccommodation,
  getAccommodationsForCondition,
  type AccommodationDefinition,
  type AccommodationCategory,
} from '../taxonomies/accommodations.taxonomy'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface InterventionRecord {
  accommodationId: string
  label: string
  category: AccommodationCategory
  description: string
  implementationCost: 'low' | 'medium' | 'high'
  benefitsConditions: string[]
  /** How many jobs in the system offer this accommodation */
  adoptionCount: number
}

export interface AccommodationRecommendation {
  accommodation: AccommodationDefinition
  reason: string
  priority: 'essential' | 'recommended' | 'nice_to_have'
}

// ─── Catalog Queries ─────────────────────────────────────────────────────────

/**
 * Get the full accommodation catalog with adoption stats.
 */
export async function getCatalogWithStats(): Promise<InterventionRecord[]> {
  // Count how many jobs offer each accommodation
  const jobs = await prisma.job.findMany({
    where: { status: 'PUBLISHED' },
    select: { accommodations: true },
  })

  const counts = new Map<string, number>()
  for (const job of jobs) {
    for (const raw of job.accommodations) {
      const normalized = normalizeAccommodation(raw)
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1)
    }
  }

  return ACCOMMODATION_CATALOG.map(acc => ({
    accommodationId: acc.id,
    label: acc.label,
    category: acc.category,
    description: acc.description,
    implementationCost: acc.implementationCost,
    benefitsConditions: acc.benefitsConditions,
    adoptionCount: counts.get(acc.id) ?? 0,
  }))
}

/**
 * Recommend accommodations for a candidate based on their conditions.
 */
export function recommendForCandidate(
  diagnoses: string[],
  existingAccommodations: string[] = []
): AccommodationRecommendation[] {
  const existingSet = new Set(existingAccommodations.map(normalizeAccommodation))
  const recommendations: AccommodationRecommendation[] = []

  for (const diagnosis of diagnoses) {
    const matching = getAccommodationsForCondition(diagnosis)
    for (const acc of matching) {
      if (existingSet.has(acc.id)) continue
      // Avoid duplicates in recommendations
      if (recommendations.some(r => r.accommodation.id === acc.id)) continue

      recommendations.push({
        accommodation: acc,
        reason: `Commonly beneficial for ${diagnosis}`,
        priority: acc.implementationCost === 'low' ? 'essential' : 'recommended',
      })
    }
  }

  // Sort: essential first, then recommended, then nice_to_have
  const priorityOrder = { essential: 0, recommended: 1, nice_to_have: 2 }
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return recommendations
}

/**
 * Get accommodation gaps for a job posting.
 * Compares job's offered accommodations against best practices for the target audience.
 */
export function getAccommodationGaps(
  jobAccommodations: string[],
  targetConditions: string[] = ['ADHD', 'Autism', 'Dyslexia']
): AccommodationRecommendation[] {
  const offeredSet = new Set(jobAccommodations.map(normalizeAccommodation))
  const gaps: AccommodationRecommendation[] = []

  for (const condition of targetConditions) {
    const recommended = getAccommodationsForCondition(condition)
    for (const acc of recommended) {
      if (offeredSet.has(acc.id)) continue
      if (gaps.some(g => g.accommodation.id === acc.id)) continue

      gaps.push({
        accommodation: acc,
        reason: `Missing accommodation that benefits ${condition} candidates`,
        priority: acc.implementationCost === 'low' ? 'essential' : 'nice_to_have',
      })
    }
  }

  return gaps
}

/**
 * Get company accommodation profile — what accommodations does a company typically offer.
 */
export async function getCompanyAccommodationProfile(companyId: string) {
  const jobs = await prisma.job.findMany({
    where: { companyId },
    select: { accommodations: true, status: true },
  })

  const accommodationFrequency = new Map<string, number>()
  for (const job of jobs) {
    for (const raw of job.accommodations) {
      const normalized = normalizeAccommodation(raw)
      accommodationFrequency.set(normalized, (accommodationFrequency.get(normalized) ?? 0) + 1)
    }
  }

  const offered = Array.from(accommodationFrequency.entries())
    .map(([id, count]) => ({
      accommodationId: id,
      label: ACCOMMODATION_CATALOG.find(a => a.id === id)?.label ?? id,
      frequency: count,
      percentOfJobs: jobs.length > 0 ? Math.round((count / jobs.length) * 100) : 0,
    }))
    .sort((a, b) => b.frequency - a.frequency)

  const gaps = getAccommodationGaps(
    Array.from(accommodationFrequency.keys())
  )

  return {
    companyId,
    totalJobs: jobs.length,
    accommodationsOffered: offered,
    gaps: gaps.slice(0, 5),
    score: offered.length > 0
      ? Math.min(100, Math.round((offered.length / ACCOMMODATION_CATALOG.length) * 100) + 20)
      : 0,
  }
}
