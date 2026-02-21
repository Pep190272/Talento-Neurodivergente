import { describe, it, expect, beforeAll, afterAll } from 'vitest'

// This test requires a real PostgreSQL connection — skip in environments without DATABASE_URL
const hasDatabase = !!process.env.DATABASE_URL

describe.skipIf(!hasDatabase)('Prisma Connectivity Test', () => {
  // Lazy import — only resolve prisma module when DATABASE_URL is present
  let prisma
  beforeAll(async () => {
    prisma = (await import('../../app/lib/prisma')).default
  })
    it('should be able to query the database version (checks connection)', async () => {
        try {
            // Intentamos una consulta simple que no dependa de tablas
            const result = await prisma.$queryRaw`SELECT version();`
            expect(result).toBeDefined()
            console.log('✅ Conexión a Base de Datos exitosa:', result[0].version)
        } catch (error) {
            console.error('❌ Error de conexión a Base de Datos:', error.message)
            throw error
        }
    })

    it('should have the correct models defined in the client', () => {
        expect(prisma.user).toBeDefined()
        expect(prisma.individual).toBeDefined()
        expect(prisma.company).toBeDefined()
        expect(prisma.job).toBeDefined()
        expect(prisma.auditLog).toBeDefined()
    })
})
