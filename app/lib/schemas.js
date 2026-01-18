// app/lib/schemas.js
/**
 * Schemas de validación con Zod
 *
 * Valida input de usuario antes de procesar
 * Previene inyección y datos maliciosos
 */

import { z } from 'zod'

// ════════════════════════════════════════════════════════════════════════════
// ENUMS Y CONSTANTES
// ════════════════════════════════════════════════════════════════════════════

const DIAGNOSES = [
  'ADHD',
  'Autism Level 1',
  'Autism Level 2',
  'Autism Level 3',
  'Dyslexia',
  'Dyscalculia',
  'Dyspraxia',
  'Dysgraphia',
  'Tourette Syndrome',
  'OCD',
  'Sensory Processing Disorder',
  'Other'
]

// ════════════════════════════════════════════════════════════════════════════
// SCHEMAS REUTILIZABLES
// ════════════════════════════════════════════════════════════════════════════

const emailSchema = z
  .string()
  .email('Invalid email format')
  .toLowerCase()
  .trim()
  .max(255, 'Email too long')

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name too long')
  .trim()

const bioSchema = z
  .string()
  .max(500, 'Bio too long (max 500 characters)')
  .optional()

// ════════════════════════════════════════════════════════════════════════════
// INDIVIDUAL (CANDIDATE) SCHEMAS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Schema para crear nuevo individual
 */
export const individualCreateSchema = z.object({
  email: emailSchema,
  password: passwordSchema,

  profile: z.object({
    name: nameSchema,
    location: z.string().max(100, 'Location too long').optional(),
    bio: bioSchema,

    diagnoses: z
      .array(z.enum(DIAGNOSES))
      .max(10, 'Too many diagnoses')
      .optional(),

    skills: z
      .array(z.string().min(1).max(50))
      .max(50, 'Too many skills')
      .optional(),

    experience: z
      .array(z.object({
        title: z.string().max(100),
        company: z.string().max(100),
        years: z.number().min(0).max(100).optional()
      }))
      .max(20, 'Too many experience entries')
      .optional(),

    education: z
      .array(z.object({
        degree: z.string().max(100),
        institution: z.string().max(100),
        year: z.number().min(1900).max(2100).optional()
      }))
      .max(10, 'Too many education entries')
      .optional(),

    accommodationsNeeded: z
      .array(z.string().min(1).max(200))
      .max(20, 'Too many accommodations')
      .optional(),

    preferences: z
      .object({
        remote: z.boolean().optional(),
        partTime: z.boolean().optional(),
        flexibleHours: z.boolean().optional(),
        quietWorkspace: z.boolean().optional()
      })
      .optional(),

    therapistId: z.string().optional(),
    medicalHistory: z.string().max(2000, 'Medical history too long').optional()
  }),

  privacy: z
    .object({
      visibleInSearch: z.boolean().default(true),
      showRealName: z.boolean().default(false),
      shareDiagnosis: z.boolean().default(false),
      shareTherapistContact: z.boolean().default(false),
      shareAssessmentDetails: z.boolean().default(true)
    })
    .optional()
})

/**
 * Schema para actualizar individual
 * Todos los campos son opcionales
 */
export const individualUpdateSchema = z.object({
  profile: z
    .object({
      name: nameSchema.optional(),
      location: z.string().max(100).optional(),
      bio: bioSchema,
      diagnoses: z.array(z.enum(DIAGNOSES)).max(10).optional(),
      skills: z.array(z.string().min(1).max(50)).max(50).optional(),
      experience: z.array(z.object({
        title: z.string().max(100),
        company: z.string().max(100),
        years: z.number().min(0).max(100).optional()
      })).max(20).optional(),
      education: z.array(z.object({
        degree: z.string().max(100),
        institution: z.string().max(100),
        year: z.number().min(1900).max(2100).optional()
      })).max(10).optional(),
      accommodationsNeeded: z.array(z.string().min(1).max(200)).max(20).optional(),
      preferences: z.object({
        remote: z.boolean().optional(),
        partTime: z.boolean().optional(),
        flexibleHours: z.boolean().optional(),
        quietWorkspace: z.boolean().optional()
      }).optional()
    })
    .optional(),

  privacy: z
    .object({
      visibleInSearch: z.boolean().optional(),
      showRealName: z.boolean().optional(),
      shareDiagnosis: z.boolean().optional(),
      shareTherapistContact: z.boolean().optional(),
      shareAssessmentDetails: z.boolean().optional()
    })
    .optional()
})

// ════════════════════════════════════════════════════════════════════════════
// COMPANY SCHEMAS
// ════════════════════════════════════════════════════════════════════════════

export const companyCreateSchema = z.object({
  email: emailSchema,
  password: passwordSchema,

  profile: z.object({
    companyName: z.string().min(2).max(100),
    description: z.string().max(1000, 'Description too long').optional(),
    website: z.string().url('Invalid URL').optional(),
    size: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']).optional(),
    industry: z.string().max(100).optional()
  })
})

// ════════════════════════════════════════════════════════════════════════════
// THERAPIST SCHEMAS
// ════════════════════════════════════════════════════════════════════════════

export const therapistCreateSchema = z.object({
  email: emailSchema,
  password: passwordSchema,

  profile: z.object({
    name: nameSchema,
    specialization: z.string().max(200).optional(),
    licenseNumber: z.string().max(100).optional(),
    bio: bioSchema
  })
})

// ════════════════════════════════════════════════════════════════════════════
// JOB POSTING SCHEMAS
// ════════════════════════════════════════════════════════════════════════════

export const jobCreateSchema = z.object({
  title: z.string().min(3, 'Title too short').max(200, 'Title too long'),
  description: z.string().min(10, 'Description too short').max(5000, 'Description too long'),

  requirements: z.object({
    skills: z.array(z.string().min(1).max(50)).max(50),
    experience: z.number().min(0).max(100).optional(),
    education: z.string().max(200).optional()
  }),

  accommodations: z
    .object({
      remote: z.boolean().default(false),
      flexibleHours: z.boolean().default(false),
      quietWorkspace: z.boolean().default(false),
      other: z.array(z.string().max(200)).max(10).optional()
    })
    .optional(),

  salary: z
    .object({
      min: z.number().min(0).max(10000000).optional(),
      max: z.number().min(0).max(10000000).optional(),
      currency: z.enum(['USD', 'EUR', 'GBP']).default('USD')
    })
    .optional()
})

// ════════════════════════════════════════════════════════════════════════════
// HELPER: VALIDAR SCHEMA
// ════════════════════════════════════════════════════════════════════════════

/**
 * Valida datos contra un schema de Zod
 * @param {z.ZodSchema} schema - Schema de Zod
 * @param {any} data - Datos a validar
 * @returns {object} - { success: boolean, data?: any, errors?: array }
 */
export function validateSchema(schema, data) {
  try {
    const validated = schema.parse(data)
    return {
      success: true,
      data: validated
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message,
          code: e.code
        }))
      }
    }

    // Error inesperado
    throw error
  }
}

/**
 * Middleware de validación para Express/Next.js
 * @param {z.ZodSchema} schema - Schema de Zod
 * @returns {Function} - Middleware function
 */
export function validateRequest(schema) {
  return async (request) => {
    try {
      const body = await request.json()
      const validation = validateSchema(schema, body)

      if (!validation.success) {
        return {
          valid: false,
          errors: validation.errors
        }
      }

      return {
        valid: true,
        data: validation.data
      }
    } catch (error) {
      return {
        valid: false,
        errors: [{ path: 'body', message: 'Invalid JSON', code: 'invalid_json' }]
      }
    }
  }
}
