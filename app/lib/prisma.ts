/**
 * Prisma Client Singleton — DiversIA Eternals
 *
 * Prisma 7: La conexión a PostgreSQL se establece mediante @prisma/adapter-pg
 * en lugar de la URL directa en el constructor (cambio breaking de Prisma 7).
 *
 * Arquitectura:
 * - prisma.config.ts  → URL para herramientas CLI (migrate, introspect)
 * - @prisma/adapter-pg → Conexión real en runtime (aplicación Next.js)
 *
 * Patrón singleton para Next.js: evita múltiples instancias en hot-reload.
 * @see https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error(
    '[Prisma] DATABASE_URL no está definida. ' +
    'Crea un archivo .env.local con DATABASE_URL=postgresql://user:pass@host:5432/db'
  )
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString })

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
