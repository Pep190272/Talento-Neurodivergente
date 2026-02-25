/**
 * Unit tests for LLM client (Ollama integration)
 * 
 * Tests the Ollama client with complete mocking - NO real API calls
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generateCompletion, analyzeJobInclusivity, checkOllamaHealth } from '@/lib/services/llm.service'

// Mock environment variables (must match current model — llama3.2:3b)
process.env.OLLAMA_HOST = 'http://localhost:11434'
process.env.OLLAMA_MODEL = 'llama3.2:3b'

describe('🤖 LLM Client - Ollama Integration', () => {

    beforeEach(() => {
        // Clear all mocks before each test
        vi.clearAllMocks()
    })

    afterEach(() => {
        // Restore mocks
        vi.restoreAllMocks()
    })

    describe('generateCompletion', () => {

        it('should call Ollama API with correct payload', async () => {
            const mockResponse = {
                response: 'Test response from LLM'
            }

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            })

            const result = await generateCompletion('Test prompt')

            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:11434/api/generate',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                })
            )

            expect(result).toBe('Test response from LLM')
        })

        it('should include model and format in request body', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ response: 'test' })
            })

            await generateCompletion('Test prompt')

            const callArgs = global.fetch.mock.calls[0]
            const requestBody = JSON.parse(callArgs[1].body)

            expect(requestBody).toMatchObject({
                model: 'llama3.2:3b',
                prompt: 'Test prompt',
                format: 'json',
                stream: false
            })
        })

        it.skip('should timeout after 10 seconds', async () => {
            // Skipped: timeout tests cause suite to hang
            // Real timeout is tested via integration tests
        })

        it('should handle API errors', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            })

            await expect(
                generateCompletion('Test prompt')
            ).rejects.toThrow('Ollama error: 500')
        })

        it('should handle network failures', async () => {
            global.fetch = vi.fn().mockRejectedValue(
                new Error('Network error: ECONNREFUSED')
            )

            await expect(
                generateCompletion('Test prompt')
            ).rejects.toThrow('Network error: ECONNREFUSED')
        })
    })

    describe('analyzeJobInclusivity', () => {

        const testJob = {
            title: 'Senior Software Engineer',
            description: 'We are looking for a talented developer',
            requiredSkills: ['JavaScript', 'React', 'Node.js'],
            accommodations: ['Remote work', 'Flexible hours', 'Async communication']
        }

        it('should analyze job and return valid structure', async () => {
            const mockLLMResponse = {
                response: JSON.stringify({
                    score: 95,
                    discriminatoryLanguage: false,
                    issues: [],
                    accommodations: {
                        count: 3,
                        quality: 'excellent'
                    },
                    suggestions: 'Great job posting!'
                })
            }

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockLLMResponse)
            })

            const result = await analyzeJobInclusivity(testJob)

            expect(result).toMatchObject({
                score: expect.any(Number),
                discriminatoryLanguage: expect.any(Boolean),
                issues: expect.any(Array),
                accommodations: expect.objectContaining({
                    count: expect.any(Number),
                    quality: expect.any(String)
                }),
                suggestions: expect.any(String)
            })
        })

        it('should detect discriminatory language', async () => {
            const discriminatoryJob = {
                title: 'Rockstar Developer',
                description: 'Looking for young and energetic team member',
                requiredSkills: ['JavaScript'],
                accommodations: ['Remote work']
            }

            const mockLLMResponse = {
                response: JSON.stringify({
                    score: 60,
                    discriminatoryLanguage: true,
                    issues: [
                        { type: 'gender', term: 'rockstar', severity: 'high' },
                        { type: 'age', term: 'young', severity: 'high' }
                    ],
                    accommodations: {
                        count: 1,
                        quality: 'poor'
                    },
                    suggestions: 'Remove age and gender biased terms'
                })
            }

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockLLMResponse)
            })

            const result = await analyzeJobInclusivity(discriminatoryJob)

            expect(result.discriminatoryLanguage).toBe(true)
            expect(result.issues.length).toBeGreaterThan(0)
            expect(result.score).toBeLessThan(80)
        })

        it('should score higher with more accommodations', async () => {
            const jobWithManyAccommodations = {
                ...testJob,
                accommodations: [
                    'Remote work',
                    'Flexible hours',
                    'Async communication',
                    'Quiet workspace',
                    'Written documentation',
                    'Pair programming support'
                ]
            }

            const mockLLMResponse = {
                response: JSON.stringify({
                    score: 100,
                    discriminatoryLanguage: false,
                    issues: [],
                    accommodations: {
                        count: 6,
                        quality: 'excellent'
                    },
                    suggestions: 'Excellent inclusivity!'
                })
            }

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockLLMResponse)
            })

            const result = await analyzeJobInclusivity(jobWithManyAccommodations)

            expect(result.score).toBeGreaterThanOrEqual(90)
            expect(result.accommodations.quality).toBe('excellent')
        })

        it('should use fallback when LLM fails', async () => {
            // Simulate LLM failure
            global.fetch = vi.fn().mockRejectedValue(new Error('Connection timeout'))

            const result = await analyzeJobInclusivity(testJob)

            // Fallback should still return valid structure
            expect(result).toHaveProperty('score')
            expect(result).toHaveProperty('discriminatoryLanguage')
            expect(result).toHaveProperty('issues')
            expect(result.fallback).toBe(true)
        })

        it('should handle invalid JSON response from LLM', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ response: 'Not valid JSON {[' })
            })

            const result = await analyzeJobInclusivity(testJob)

            // Should use fallback
            expect(result.fallback).toBe(true)
        })

        it.skip('should validate LLM response with Zod', async () => {
            // Skipped: Zod validation tested via integration tests
            // The actual validation happens in companies.js wrapper
        })

    })

    describe('checkOllamaHealth', () => {

        it('should return true when Ollama is healthy', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ models: [] })
            })

            const isHealthy = await checkOllamaHealth()

            expect(isHealthy).toBe(true)
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:11434/api/tags',
                expect.objectContaining({ method: 'GET' })
            )
        })

        it('should return false when Ollama is down', async () => {
            global.fetch = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'))

            const isHealthy = await checkOllamaHealth()

            expect(isHealthy).toBe(false)
        })

        it.skip('should return false on timeout', async () => {
            // Skipped: timeout tests cause suite to hang
            // Real timeout is tested via integration tests
        })
    })
})
