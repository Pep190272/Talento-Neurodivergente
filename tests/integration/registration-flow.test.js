
import { describe, it, expect } from 'vitest'
import { POST } from '@/api/individuals/route.js'
import fs from 'fs/promises'
import path from 'path'
import { findUserByEmail } from '@/lib/storage'

// Mock environment
process.env.ENCRYPTION_KEY = '1234567890123456789012345678901234567890123456789012345678901234'

const DATA_DIR = path.join(process.cwd(), 'data')

describe('🔄 Integration: Individual Registration Flow', () => {

    const testUser = {
        email: 'integration_test@example.com',
        profile: {
            name: 'Integration User',
            diagnoses: ['ADHD', 'Dyslexia'], // Sensitive, should be encrypted
            skills: ['Testing', 'Node.js']
        },
        // Simulating that the hash is passed (or we are just setting it for the user)
        passwordHash: '$2b$10$NotARealHashButFormatIsCorrect'
    }

    it('should successfully register a new individual and encrypt sensitive data', async () => {
        // 1. Prepare Request
        const req = new Request('http://localhost:3000/api/individuals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testUser)
        })

        // 2. Call API Handler
        const res = await POST(req)

        // 3. Verify Response
        expect(res.status).toBe(201)
        const json = await res.json()

        expect(json.success).toBe(true)
        expect(json.data.email).toBe(testUser.email)

        const userId = json.data.userId
        expect(userId).toBeDefined()
        expect(userId).toMatch(/^ind_/)

        // 4. Verification: File System (Disk Inspection)
        const filePath = path.join(DATA_DIR, 'users/individuals', `${userId}.json`)

        // Check file exists
        await expect(fs.access(filePath)).resolves.toBeUndefined()

        // Check content encryption
        const fileContent = await fs.readFile(filePath, 'utf-8')
        const savedJson = JSON.parse(fileContent)

        expect(savedJson.profile.name).toBe(testUser.profile.name) // Should be plain text
        expect(savedJson.profile.diagnoses).toHaveLength(2)
        expect(savedJson.profile.diagnoses[0]).not.toBe('ADHD')
        expect(savedJson.profile.diagnoses[0]).toMatch(/^encrypted:/) // Should be encrypted

        // 5. Verification: Logic Retrieval (Decryption)
        const retrievedUser = await findUserByEmail(testUser.email)

        expect(retrievedUser).toBeDefined()
        expect(retrievedUser.userId).toBe(userId)
        expect(retrievedUser.profile.diagnoses[0]).toBe('ADHD') // Should be decrypted
    })

    it('should reject duplicate email registration', async () => {
        // 1. First Registration
        const req1 = new Request('http://localhost:3000/api/individuals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        })
        const res1 = await POST(req1)
        expect(res1.status).toBe(201)

        // 2. Duplicate Registration
        const req2 = new Request('http://localhost:3000/api/individuals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        })
        const res2 = await POST(req2)

        // 3. Verify Rejection
        expect(res2.status).toBe(409) // Conflict
        const json = await res2.json()
        expect(json.error).toMatch(/exists/i)
    })

    it('should validate required fields', async () => {
        // Missing profile name
        const invalidUser = {
            email: 'invalid@example.com',
            profile: {}
        }

        const req = new Request('http://localhost:3000/api/individuals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invalidUser)
        })

        const res = await POST(req)
        expect(res.status).toBe(400)
        const json = await res.json()
        expect(json.error).toMatch(/required/i)
    })
})
