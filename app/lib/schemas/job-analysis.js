/**
 * Zod schemas for LLM job analysis validation
 * 
 * Ensures that responses from Ollama conform to expected structure
 * and contain valid data types.
 */

import { z } from 'zod'

/**
 * Individual issue found in job posting
 */
export const IssueSchema = z.object({
    type: z.enum(['age', 'ableism', 'gender', 'cultural']),
    term: z.string(),
    severity: z.enum(['low', 'medium', 'high'])
})

/**
 * Accommodations analysis
 */
export const AccommodationsSchema = z.object({
    count: z.number().int().min(0),
    quality: z.enum(['poor', 'good', 'excellent'])
})

/**
 * Complete job analysis response from LLM
 */
export const JobAnalysisSchema = z.object({
    score: z.number().min(0).max(100),
    discriminatoryLanguage: z.boolean(),
    issues: z.array(IssueSchema),
    accommodations: AccommodationsSchema,
    suggestions: z.string(),
    fallback: z.boolean().optional() // True if this is a fallback response
})

/**
 * Validate and parse job analysis response
 * 
 * @param {any} data - Raw data to validate
 * @returns {object} Validated job analysis
 * @throws {z.ZodError} If validation fails
 */
export function validateJobAnalysis(data) {
    return JobAnalysisSchema.parse(data)
}
