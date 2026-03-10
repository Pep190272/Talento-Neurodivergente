/**
 * Accommodation Normalization Catalog — Issue #62
 *
 * Standard catalog of workplace accommodations for neurodivergent employees.
 * Maps free-text accommodation inputs to canonical IDs.
 *
 * Based on:
 * - JAN (Job Accommodation Network) categories
 * - NICE NG87 guidelines for workplace adjustments
 * - DiversIA clinical advisory input
 *
 * Usage:
 *   import { normalizeAccommodation, ACCOMMODATION_CATALOG } from './accommodations.taxonomy'
 *   const normalized = normalizeAccommodation('work from home')
 *   // → 'remote_work'
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AccommodationDefinition {
  id: string
  label: string
  category: AccommodationCategory
  description: string
  aliases: string[]
  /** Which neurodivergent conditions particularly benefit */
  benefitsConditions: string[]
  /** Implementation cost: low, medium, high */
  implementationCost: 'low' | 'medium' | 'high'
}

export const ACCOMMODATION_CATEGORIES = [
  'schedule',
  'environment',
  'communication',
  'workload',
  'technology',
  'social',
  'physical',
  'management',
] as const

export type AccommodationCategory = typeof ACCOMMODATION_CATEGORIES[number]

// ─── Catalog ─────────────────────────────────────────────────────────────────

export const ACCOMMODATION_CATALOG: AccommodationDefinition[] = [
  // Schedule
  {
    id: 'flexible_hours',
    label: 'Flexible Working Hours',
    category: 'schedule',
    description: 'Ability to adjust start/end times or work during peak productivity hours',
    aliases: ['flexible hours', 'flex time', 'flextime', 'flexible schedule', 'flexible working', 'horario flexible'],
    benefitsConditions: ['ADHD', 'Autism', 'Bipolar', 'Depression', 'Anxiety'],
    implementationCost: 'low',
  },
  {
    id: 'remote_work',
    label: 'Remote Work',
    category: 'schedule',
    description: 'Option to work from home or chosen location',
    aliases: ['work from home', 'wfh', 'remote', 'telecommuting', 'teletrabajo', 'trabajo remoto'],
    benefitsConditions: ['Autism', 'ADHD', 'Anxiety', 'Sensory Processing'],
    implementationCost: 'low',
  },
  {
    id: 'hybrid_work',
    label: 'Hybrid Work Model',
    category: 'schedule',
    description: 'Mix of on-site and remote work',
    aliases: ['hybrid', 'hybrid model', 'part remote', 'modelo híbrido'],
    benefitsConditions: ['Autism', 'ADHD', 'Anxiety'],
    implementationCost: 'low',
  },
  {
    id: 'compressed_week',
    label: 'Compressed Work Week',
    category: 'schedule',
    description: 'Full-time hours in fewer days (e.g., 4×10)',
    aliases: ['compressed schedule', '4 day week', 'four day week', 'semana comprimida'],
    benefitsConditions: ['ADHD', 'Bipolar', 'Chronic Fatigue'],
    implementationCost: 'low',
  },
  {
    id: 'extra_breaks',
    label: 'Extra Breaks',
    category: 'schedule',
    description: 'Additional short breaks throughout the workday for regulation',
    aliases: ['frequent breaks', 'break time', 'rest periods', 'pausas adicionales', 'descansos'],
    benefitsConditions: ['ADHD', 'Autism', 'Anxiety', 'Sensory Processing'],
    implementationCost: 'low',
  },

  // Environment
  {
    id: 'quiet_workspace',
    label: 'Quiet Workspace',
    category: 'environment',
    description: 'Low-noise work area or private office',
    aliases: ['quiet office', 'private office', 'low noise', 'quiet room', 'espacio tranquilo'],
    benefitsConditions: ['Autism', 'ADHD', 'Sensory Processing', 'Misophonia'],
    implementationCost: 'medium',
  },
  {
    id: 'noise_cancelling',
    label: 'Noise-Cancelling Equipment',
    category: 'environment',
    description: 'Noise-cancelling headphones or white noise machines',
    aliases: ['noise cancelling headphones', 'noise reduction', 'white noise', 'auriculares'],
    benefitsConditions: ['Autism', 'ADHD', 'Sensory Processing', 'Misophonia'],
    implementationCost: 'low',
  },
  {
    id: 'sensory_friendly',
    label: 'Sensory-Friendly Environment',
    category: 'environment',
    description: 'Adjustable lighting, minimal visual clutter, temperature control',
    aliases: ['sensory friendly', 'sensory-friendly workspace', 'adjustable lighting', 'low stimulation', 'entorno sensorial'],
    benefitsConditions: ['Autism', 'Sensory Processing', 'ADHD', 'Migraine'],
    implementationCost: 'medium',
  },
  {
    id: 'designated_space',
    label: 'Designated Personal Space',
    category: 'environment',
    description: 'Consistent, assigned workspace (no hot-desking)',
    aliases: ['assigned desk', 'personal desk', 'no hot desking', 'fixed desk', 'espacio asignado'],
    benefitsConditions: ['Autism', 'Anxiety', 'OCD'],
    implementationCost: 'low',
  },

  // Communication
  {
    id: 'async_communication',
    label: 'Asynchronous Communication',
    category: 'communication',
    description: 'Written instructions, no expectation of instant replies',
    aliases: ['async', 'asynchronous', 'written communication', 'no instant messaging pressure', 'comunicación asíncrona'],
    benefitsConditions: ['Autism', 'ADHD', 'Anxiety', 'Social Anxiety'],
    implementationCost: 'low',
  },
  {
    id: 'written_instructions',
    label: 'Written Instructions',
    category: 'communication',
    description: 'Clear, written task briefs rather than verbal-only instructions',
    aliases: ['written briefs', 'documented tasks', 'written documentation', 'instrucciones escritas'],
    benefitsConditions: ['ADHD', 'Dyslexia', 'Autism', 'Auditory Processing'],
    implementationCost: 'low',
  },
  {
    id: 'meeting_agenda',
    label: 'Meeting Agendas in Advance',
    category: 'communication',
    description: 'Meeting agendas shared before the meeting with time to prepare',
    aliases: ['advance agendas', 'pre-meeting notes', 'meeting preparation', 'agendas previas'],
    benefitsConditions: ['Autism', 'ADHD', 'Anxiety'],
    implementationCost: 'low',
  },
  {
    id: 'camera_optional',
    label: 'Camera-Optional Meetings',
    category: 'communication',
    description: 'No requirement to have camera on during video calls',
    aliases: ['camera optional', 'no camera required', 'video optional', 'cámara opcional'],
    benefitsConditions: ['Autism', 'Anxiety', 'Social Anxiety'],
    implementationCost: 'low',
  },
  {
    id: 'clear_expectations',
    label: 'Clear Explicit Expectations',
    category: 'communication',
    description: 'Explicit communication of deadlines, priorities, and evaluation criteria',
    aliases: ['explicit expectations', 'clear deadlines', 'structured feedback', 'expectativas claras'],
    benefitsConditions: ['Autism', 'ADHD', 'Dyslexia'],
    implementationCost: 'low',
  },

  // Workload
  {
    id: 'task_chunking',
    label: 'Task Chunking',
    category: 'workload',
    description: 'Large projects broken down into smaller, manageable tasks',
    aliases: ['task breakdown', 'chunked tasks', 'small tasks', 'micro tasks', 'tareas fragmentadas'],
    benefitsConditions: ['ADHD', 'Autism', 'Executive Function'],
    implementationCost: 'low',
  },
  {
    id: 'extended_deadlines',
    label: 'Extended Deadlines',
    category: 'workload',
    description: 'Additional time for task completion when needed',
    aliases: ['extra time', 'deadline extensions', 'flexible deadlines', 'plazos extendidos'],
    benefitsConditions: ['ADHD', 'Dyslexia', 'Dyspraxia', 'Processing Speed'],
    implementationCost: 'low',
  },
  {
    id: 'reduced_multitasking',
    label: 'Reduced Multitasking',
    category: 'workload',
    description: 'Focus on one task at a time, sequential rather than parallel work',
    aliases: ['single tasking', 'no multitasking', 'one task at a time', 'monotarea'],
    benefitsConditions: ['ADHD', 'Autism', 'Executive Function'],
    implementationCost: 'low',
  },
  {
    id: 'workload_adjustment',
    label: 'Workload Adjustment',
    category: 'workload',
    description: 'Adjusted workload during high-stress periods or transitions',
    aliases: ['reduced workload', 'adjusted workload', 'workload management', 'ajuste de carga'],
    benefitsConditions: ['ADHD', 'Bipolar', 'Depression', 'Anxiety'],
    implementationCost: 'low',
  },

  // Technology
  {
    id: 'assistive_software',
    label: 'Assistive Software',
    category: 'technology',
    description: 'Screen readers, text-to-speech, speech-to-text, or other assistive tools',
    aliases: ['assistive technology', 'screen reader', 'text to speech', 'speech to text', 'software asistivo'],
    benefitsConditions: ['Dyslexia', 'Dyspraxia', 'Visual Processing'],
    implementationCost: 'low',
  },
  {
    id: 'task_management_tools',
    label: 'Task Management Tools',
    category: 'technology',
    description: 'Access to task tracking and organization tools (Trello, Todoist, etc.)',
    aliases: ['task tracker', 'project tools', 'organization tools', 'herramientas de gestión'],
    benefitsConditions: ['ADHD', 'Executive Function', 'Autism'],
    implementationCost: 'low',
  },
  {
    id: 'dual_monitors',
    label: 'Dual Monitor Setup',
    category: 'technology',
    description: 'Multiple screens to reduce cognitive load from window switching',
    aliases: ['dual screens', 'multiple monitors', 'two screens', 'doble monitor'],
    benefitsConditions: ['ADHD', 'Dyslexia', 'Working Memory'],
    implementationCost: 'medium',
  },

  // Social
  {
    id: 'opt_out_social',
    label: 'Optional Social Events',
    category: 'social',
    description: 'No pressure to attend team socials or after-work activities',
    aliases: ['optional socials', 'no mandatory events', 'social opt out', 'eventos sociales opcionales'],
    benefitsConditions: ['Autism', 'Social Anxiety', 'Introversion'],
    implementationCost: 'low',
  },
  {
    id: 'buddy_system',
    label: 'Buddy/Mentor System',
    category: 'social',
    description: 'Assigned workplace buddy or mentor for onboarding and support',
    aliases: ['workplace buddy', 'mentor', 'onboarding buddy', 'mentoring', 'sistema de compañero'],
    benefitsConditions: ['Autism', 'ADHD', 'Anxiety'],
    implementationCost: 'low',
  },
  {
    id: 'structured_onboarding',
    label: 'Structured Onboarding',
    category: 'social',
    description: 'Clear, step-by-step onboarding process with written materials',
    aliases: ['onboarding plan', 'structured induction', 'detailed onboarding', 'incorporación estructurada'],
    benefitsConditions: ['Autism', 'ADHD', 'Anxiety'],
    implementationCost: 'low',
  },

  // Management
  {
    id: 'regular_checkins',
    label: 'Regular 1:1 Check-ins',
    category: 'management',
    description: 'Scheduled one-on-one meetings with manager for support',
    aliases: ['1:1 meetings', 'check-ins', 'regular meetings', 'reuniones regulares'],
    benefitsConditions: ['ADHD', 'Autism', 'Anxiety'],
    implementationCost: 'low',
  },
  {
    id: 'strengths_based_roles',
    label: 'Strengths-Based Role Assignment',
    category: 'management',
    description: 'Tasks assigned based on cognitive strengths rather than deficit-focused',
    aliases: ['strengths based', 'play to strengths', 'strength assignment', 'asignación por fortalezas'],
    benefitsConditions: ['ADHD', 'Autism', 'Dyslexia', 'Dyspraxia'],
    implementationCost: 'low',
  },
  {
    id: 'neurodiversity_training',
    label: 'Neurodiversity Awareness Training',
    category: 'management',
    description: 'Team training on neurodiversity understanding and support',
    aliases: ['nd training', 'neurodiversity training', 'awareness training', 'formación en neurodiversidad'],
    benefitsConditions: ['All'],
    implementationCost: 'medium',
  },
]

// ─── Normalization Index ─────────────────────────────────────────────────────

const _index = new Map<string, string>()

function buildIndex(): void {
  if (_index.size > 0) return
  for (const acc of ACCOMMODATION_CATALOG) {
    _index.set(acc.id, acc.id)
    _index.set(acc.label.toLowerCase(), acc.id)
    for (const alias of acc.aliases) {
      _index.set(alias.toLowerCase(), acc.id)
    }
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Normalize a single accommodation string to its canonical ID.
 * Returns the original (lowercased, trimmed) if no match found.
 */
export function normalizeAccommodation(raw: string): string {
  buildIndex()
  const key = raw.toLowerCase().trim()
  return _index.get(key) ?? key
}

/**
 * Normalize an array of accommodation strings, deduplicating results.
 */
export function normalizeAccommodations(rawList: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const raw of rawList) {
    const normalized = normalizeAccommodation(raw)
    if (!seen.has(normalized)) {
      seen.add(normalized)
      result.push(normalized)
    }
  }
  return result
}

/**
 * Get the display label for a canonical accommodation ID.
 */
export function getAccommodationLabel(accId: string): string {
  const acc = ACCOMMODATION_CATALOG.find(a => a.id === accId)
  return acc?.label ?? accId
}

/**
 * Get accommodations by category.
 */
export function getAccommodationsByCategory(category: AccommodationCategory): AccommodationDefinition[] {
  return ACCOMMODATION_CATALOG.filter(a => a.category === category)
}

/**
 * Get accommodations that benefit a specific condition.
 */
export function getAccommodationsForCondition(condition: string): AccommodationDefinition[] {
  const q = condition.toLowerCase()
  return ACCOMMODATION_CATALOG.filter(a =>
    a.benefitsConditions.some(c => c.toLowerCase() === q || c.toLowerCase() === 'all')
  )
}

/**
 * Search accommodations by partial match (for autocomplete).
 */
export function searchAccommodations(query: string, limit = 10): AccommodationDefinition[] {
  const q = query.toLowerCase().trim()
  if (!q) return []

  return ACCOMMODATION_CATALOG
    .filter(a =>
      a.label.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.aliases.some(alias => alias.includes(q))
    )
    .slice(0, limit)
}
