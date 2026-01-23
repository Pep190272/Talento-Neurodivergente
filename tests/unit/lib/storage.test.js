
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as storage from '@/lib/storage'
import fs from 'fs/promises'
import path from 'path'
import { getEncryptionKey } from '@/lib/encryption'

// Mock environment
process.env.ENCRYPTION_KEY = '1234567890123456789012345678901234567890123456789012345678901234'

const DATA_DIR = path.join(process.cwd(), 'data')

describe('💾 Storage Layer (Unit/Integration)', () => {

    // Cleaning is handled by global setup.js, but we can double check

    describe('Basic CRUD Operations', () => {
        it('should save and read a file', async () => {
            const data = { id: '1', name: 'Test Item' }
            const filePath = 'users/individuals/test_user.json'

            await storage.saveToFile(filePath, data)
            const readData = await storage.readFromFile(filePath)

            expect(readData).toEqual(data)
        })

        it('should return null if file does not exist', async () => {
            const result = await storage.readFromFile('non_existent.json')
            expect(result).toBeNull()
        })

        it('should update an existing file', async () => {
            const filePath = 'users/individuals/update_test.json'
            const initialData = { count: 1 }

            await storage.saveToFile(filePath, initialData)

            const updated = await storage.updateFile(filePath, (data) => {
                data.count += 1
                return data
            })

            expect(updated.count).toBe(2)

            const onDisk = await storage.readFromFile(filePath)
            expect(onDisk.count).toBe(2)
        })

        it('should throw error when updating non-existent file', async () => {
            await expect(storage.updateFile('users/individuals/ghost.json', d => d))
                .rejects.toThrow('File not found')
        })

        it('should delete a file', async () => {
            const filePath = 'users/individuals/delete_test.json'
            await storage.saveToFile(filePath, { a: 1 })

            await storage.deleteFile(filePath)

            const result = await storage.readFromFile(filePath)
            expect(result).toBeNull()
        })
    })

    describe('Encryption Integration', () => {
        it('should encrypt sensitive fields on disk for individuals', async () => {
            const sensitiveData = {
                userType: 'individual',
                id: 'ind_123',
                profile: {
                    name: 'John Doe', // Public
                    diagnoses: ['ADHD', 'ASD'] // Sensitive
                }
            }
            const filePath = 'users/individuals/enc_test.json'

            // 1. Save via storage
            await storage.saveToFile(filePath, sensitiveData)

            // 2. Read RAW file from disk (bypass storage.readFromFile)
            const fullPath = path.join(DATA_DIR, filePath)
            const rawContent = await fs.readFile(fullPath, 'utf-8')
            const rawJson = JSON.parse(rawContent)

            // 3. Verify encryption
            // Name should be plain
            expect(rawJson.profile.name).toBe('John Doe')
            // Diagnoses should be encrypted strings
            expect(rawJson.profile.diagnoses).toHaveLength(2)
            expect(rawJson.profile.diagnoses[0]).not.toBe('ADHD')
            expect(rawJson.profile.diagnoses[0]).toMatch(/^encrypted:/)

            // 4. Read via storage (should transparently decrypt)
            const readData = await storage.readFromFile(filePath)
            expect(readData.profile.diagnoses[0]).toBe('ADHD')
        })

        it('should NOT encrypt fields for other user types', async () => {
            const companyData = {
                userType: 'company',
                profile: {
                    diagnoses: ['Not sensitive for company'] // Hypothetical field
                }
            }
            const filePath = 'users/companies/comp_test.json'

            await storage.saveToFile(filePath, companyData)

            const fullPath = path.join(DATA_DIR, filePath)
            const rawContent = await fs.readFile(fullPath, 'utf-8')
            const rawJson = JSON.parse(rawContent)

            // Should remain plain text
            expect(rawJson.profile.diagnoses[0]).toBe('Not sensitive for company')
        })
    })

    describe('Utility Functions', () => {
        it('should list files in directory', async () => {
            await storage.saveToFile('jobs/job1.json', { id: 1 })
            await storage.saveToFile('jobs/job2.json', { id: 2 })

            const files = await storage.listFiles('jobs')
            expect(files).toHaveLength(2)
            expect(files).toContain('job1.json')
            expect(files).toContain('job2.json')
        })

        it('should find user by email', async () => {
            const email = 'unique@example.com'
            const user = { userType: 'individual', email, profile: { name: 'Unique' } }
            await storage.saveToFile('users/individuals/u1.json', user)

            const found = await storage.findUserByEmail(email)
            expect(found).toBeDefined()
            expect(found.email).toBe(email)
            expect(found.userType).toBe('individual')
        })
    })

})
