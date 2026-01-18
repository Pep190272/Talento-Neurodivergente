// tests/lib/storage.test.js
import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { saveToFile, readFromFile } from '@/lib/storage'
import fs from 'fs/promises'
import path from 'path'

describe('Storage with Encryption', () => {
  const testDir = 'test_encryption'
  const testFile = 'individual_test.json'
  const testPath = `${testDir}/${testFile}`

  beforeAll(() => {
    // Asegurar que hay una clave de encriptación para los tests
    if (!process.env.ENCRYPTION_KEY) {
      process.env.ENCRYPTION_KEY = '0'.repeat(64)
    }
  })

  afterEach(async () => {
    // Limpiar archivos de prueba
    try {
      const fullPath = path.join(process.cwd(), 'data', testPath)
      await fs.unlink(fullPath)
    } catch {}
  })

  describe('Encriptación de campos sensibles', () => {
    it('debe encriptar diagnoses al guardar individual', async () => {
      const individual = {
        userId: 'ind_test123',
        userType: 'individual',
        email: 'test@test.com',
        profile: {
          name: 'Test User',
          diagnoses: ['ADHD', 'Autism Level 1'],
          skills: ['JavaScript', 'React']
        }
      }

      await saveToFile(testPath, individual)

      // Leer archivo crudo (sin desencriptar)
      const fullPath = path.join(process.cwd(), 'data', testPath)
      const rawContent = await fs.readFile(fullPath, 'utf-8')
      const rawData = JSON.parse(rawContent)

      // Verificar que diagnoses está encriptado
      expect(rawData.profile.diagnoses).toBeDefined()
      expect(Array.isArray(rawData.profile.diagnoses)).toBe(true)
      expect(rawData.profile.diagnoses[0]).toMatch(/^encrypted:/)
      expect(rawData.profile.diagnoses[0]).not.toContain('ADHD')
      expect(rawData.profile.diagnoses[1]).toMatch(/^encrypted:/)
      expect(rawData.profile.diagnoses[1]).not.toContain('Autism')

      // Verificar que skills NO está encriptado
      expect(rawData.profile.skills[0]).toBe('JavaScript')
      expect(rawData.profile.skills[1]).toBe('React')
    })

    it('debe desencriptar automáticamente al leer', async () => {
      const individual = {
        userId: 'ind_test123',
        userType: 'individual',
        email: 'test@test.com',
        profile: {
          name: 'Test User',
          diagnoses: ['ADHD', 'Autism Level 1']
        }
      }

      await saveToFile(testPath, individual)

      // Leer con readFromFile (debe desencriptar automáticamente)
      const retrieved = await readFromFile(testPath)

      expect(retrieved.profile.diagnoses).toEqual(['ADHD', 'Autism Level 1'])
      expect(retrieved.profile.name).toBe('Test User')
    })

    it('debe encriptar therapistId', async () => {
      const individual = {
        userId: 'ind_test123',
        userType: 'individual',
        email: 'test@test.com',
        profile: {
          name: 'Test User',
          therapistId: 'ther_xyz789'
        }
      }

      await saveToFile(testPath, individual)

      // Leer archivo crudo
      const fullPath = path.join(process.cwd(), 'data', testPath)
      const rawContent = await fs.readFile(fullPath, 'utf-8')
      const rawData = JSON.parse(rawContent)

      expect(rawData.profile.therapistId).toMatch(/^encrypted:/)
      expect(rawData.profile.therapistId).not.toContain('ther_xyz789')

      // Verificar desencriptación
      const retrieved = await readFromFile(testPath)
      expect(retrieved.profile.therapistId).toBe('ther_xyz789')
    })

    it('debe encriptar accommodationsNeeded', async () => {
      const individual = {
        userId: 'ind_test123',
        userType: 'individual',
        profile: {
          accommodationsNeeded: ['Flexible schedule', 'Quiet workspace']
        }
      }

      await saveToFile(testPath, individual)

      const fullPath = path.join(process.cwd(), 'data', testPath)
      const rawContent = await fs.readFile(fullPath, 'utf-8')
      const rawData = JSON.parse(rawContent)

      expect(rawData.profile.accommodationsNeeded[0]).toMatch(/^encrypted:/)
      expect(rawData.profile.accommodationsNeeded[0]).not.toContain('Flexible')

      const retrieved = await readFromFile(testPath)
      expect(retrieved.profile.accommodationsNeeded).toEqual(['Flexible schedule', 'Quiet workspace'])
    })

    it('debe encriptar medicalHistory', async () => {
      const individual = {
        userId: 'ind_test123',
        userType: 'individual',
        profile: {
          medicalHistory: 'Patient has been diagnosed with ADHD since 2020'
        }
      }

      await saveToFile(testPath, individual)

      const fullPath = path.join(process.cwd(), 'data', testPath)
      const rawContent = await fs.readFile(fullPath, 'utf-8')
      const rawData = JSON.parse(rawContent)

      expect(rawData.profile.medicalHistory).toMatch(/^encrypted:/)
      expect(rawData.profile.medicalHistory).not.toContain('ADHD')

      const retrieved = await readFromFile(testPath)
      expect(retrieved.profile.medicalHistory).toBe('Patient has been diagnosed with ADHD since 2020')
    })
  })

  describe('NO encriptar campos no sensibles', () => {
    it('NO debe encriptar campos públicos', async () => {
      const individual = {
        userId: 'ind_test123',
        userType: 'individual',
        email: 'test@test.com',
        profile: {
          name: 'Test User',
          bio: 'Software developer',
          location: 'Madrid',
          skills: ['React', 'Node.js'],
          experience: '5 years'
        }
      }

      await saveToFile(testPath, individual)

      const fullPath = path.join(process.cwd(), 'data', testPath)
      const rawContent = await fs.readFile(fullPath, 'utf-8')
      const rawData = JSON.parse(rawContent)

      // Todos estos campos deben estar en texto plano
      expect(rawData.email).toBe('test@test.com')
      expect(rawData.profile.name).toBe('Test User')
      expect(rawData.profile.bio).toBe('Software developer')
      expect(rawData.profile.location).toBe('Madrid')
      expect(rawData.profile.skills).toEqual(['React', 'Node.js'])
      expect(rawData.profile.experience).toBe('5 years')
    })
  })

  describe('Otros tipos de usuario', () => {
    it('NO debe encriptar datos de company', async () => {
      const company = {
        companyId: 'comp_test123',
        userType: 'company',
        email: 'company@test.com',
        profile: {
          companyName: 'Test Corp',
          description: 'A test company'
        }
      }

      await saveToFile(testPath, company)

      const fullPath = path.join(process.cwd(), 'data', testPath)
      const rawContent = await fs.readFile(fullPath, 'utf-8')
      const rawData = JSON.parse(rawContent)

      // Ningún campo debe estar encriptado
      expect(rawData.profile.companyName).toBe('Test Corp')
      expect(rawData.profile.description).toBe('A test company')
      expect(rawData.profile.companyName).not.toMatch(/^encrypted:/)
    })

    it('NO debe encriptar datos de therapist', async () => {
      const therapist = {
        userId: 'ther_test123',
        userType: 'therapist',
        email: 'therapist@test.com',
        profile: {
          name: 'Dr. Therapist',
          specialization: 'ADHD specialist'
        }
      }

      await saveToFile(testPath, therapist)

      const fullPath = path.join(process.cwd(), 'data', testPath)
      const rawContent = await fs.readFile(fullPath, 'utf-8')
      const rawData = JSON.parse(rawContent)

      expect(rawData.profile.name).toBe('Dr. Therapist')
      expect(rawData.profile.specialization).toBe('ADHD specialist')
      expect(rawData.profile.name).not.toMatch(/^encrypted:/)
    })
  })

  describe('Manejo de valores undefined/null', () => {
    it('debe manejar diagnoses undefined sin error', async () => {
      const individual = {
        userId: 'ind_test123',
        userType: 'individual',
        profile: {
          name: 'Test User'
          // diagnoses no definido
        }
      }

      await saveToFile(testPath, individual)
      const retrieved = await readFromFile(testPath)

      expect(retrieved.profile.diagnoses).toBeUndefined()
    })

    it('debe manejar diagnoses vacío', async () => {
      const individual = {
        userId: 'ind_test123',
        userType: 'individual',
        profile: {
          name: 'Test User',
          diagnoses: []
        }
      }

      await saveToFile(testPath, individual)
      const retrieved = await readFromFile(testPath)

      expect(retrieved.profile.diagnoses).toEqual([])
    })
  })
})
