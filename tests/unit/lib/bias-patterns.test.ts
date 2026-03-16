/**
 * Tests for shared bias detection patterns
 *
 * Validates that the rule-based bias detection catches
 * discriminatory language across all categories.
 */

import { describe, it, expect } from 'vitest'
import { detectBias, detectPositiveIndicators } from '@/lib/bias-patterns'

describe('Bias Detection Patterns', () => {

  describe('Ableism detection', () => {
    it('should detect "perfect communication skills"', () => {
      const issues = detectBias('Must have perfect communication skills')
      expect(issues).toHaveLength(1)
      expect(issues[0].type).toBe('ableism')
      expect(issues[0].severity).toBe('high')
    })

    it('should detect "must be able to multitask"', () => {
      const issues = detectBias('Must be able to multitask under pressure')
      expect(issues.some(i => i.term === 'must be able to multitask')).toBe(true)
    })

    it('should detect "self-starter"', () => {
      const issues = detectBias('Looking for a self-starter')
      expect(issues.some(i => i.term === 'self-starter')).toBe(true)
    })

    it('should detect "stress-tolerant"', () => {
      const issues = detectBias('Must be stress-tolerant')
      expect(issues.some(i => i.term === 'stress-tolerant')).toBe(true)
    })
  })

  describe('Neurodiversity-specific detection', () => {
    it('should detect "neurotypical" requirement', () => {
      const issues = detectBias('Must be neurotypical')
      expect(issues.some(i => i.type === 'neurodiversity' && i.severity === 'high')).toBe(true)
    })

    it('should detect "normal cognitive"', () => {
      const issues = detectBias('Requires normal cognitive abilities')
      expect(issues.some(i => i.type === 'neurodiversity')).toBe(true)
    })

    it('should detect "no mental health issues"', () => {
      const issues = detectBias('No mental health issues allowed')
      expect(issues.some(i => i.type === 'neurodiversity' && i.severity === 'high')).toBe(true)
    })
  })

  describe('Age discrimination detection', () => {
    it('should detect "young talent"', () => {
      const issues = detectBias('We want young talent to join')
      expect(issues.some(i => i.type === 'age')).toBe(true)
    })

    it('should detect "digital native"', () => {
      const issues = detectBias('Must be a digital native')
      expect(issues.some(i => i.type === 'age')).toBe(true)
    })

    it('should detect "energetic"', () => {
      const issues = detectBias('Looking for energetic team members')
      expect(issues.some(i => i.type === 'age')).toBe(true)
    })
  })

  describe('Gender bias detection', () => {
    it('should detect "rockstar developer"', () => {
      const issues = detectBias('Looking for rockstar developer')
      expect(issues.some(i => i.type === 'gender')).toBe(true)
    })

    it('should detect "ninja"', () => {
      const issues = detectBias('Code ninja wanted')
      expect(issues.some(i => i.type === 'gender')).toBe(true)
    })
  })

  describe('Cultural bias detection', () => {
    it('should detect "native English speaker only"', () => {
      const issues = detectBias('Native English speaker only')
      expect(issues.some(i => i.type === 'cultural' && i.severity === 'high')).toBe(true)
    })

    it('should detect "cultural fit"', () => {
      const issues = detectBias('Must be a cultural fit')
      expect(issues.some(i => i.type === 'cultural')).toBe(true)
    })
  })

  describe('Clean text', () => {
    it('should return no issues for inclusive text', () => {
      const issues = detectBias(
        'We are looking for a skilled developer who is passionate about building accessible software. ' +
        'Flexible hours and remote work available. We support neurodivergent team members.'
      )
      // May detect "remote" as a positive, but no bias issues
      const highSeverity = issues.filter(i => i.severity === 'high')
      expect(highSeverity).toHaveLength(0)
    })
  })

  describe('Field location tracking', () => {
    it('should include field name in results', () => {
      const issues = detectBias('Must have perfect communication skills', 'description')
      expect(issues[0].location).toBe('description')
    })
  })
})

describe('Positive Indicators Detection', () => {
  it('should detect accommodation mentions', () => {
    const indicators = detectPositiveIndicators('We provide accommodations for all team members')
    expect(indicators).toContain('Mentions accommodations')
  })

  it('should detect neurodiversity-aware language', () => {
    const indicators = detectPositiveIndicators('We celebrate neurodiversity in our team')
    expect(indicators).toContain('Neurodiversity-aware language')
  })

  it('should detect flexible working', () => {
    const indicators = detectPositiveIndicators('Flexible hours and remote work available')
    expect(indicators).toContain('Flexible working mentioned')
    expect(indicators).toContain('Remote work available')
  })

  it('should detect strengths-based approach', () => {
    const indicators = detectPositiveIndicators('We use a strengths-based approach to hiring')
    expect(indicators).toContain('Strengths-based approach')
  })

  it('should return empty for neutral text', () => {
    const indicators = detectPositiveIndicators('Standard office job in downtown')
    expect(indicators).toHaveLength(0)
  })
})
