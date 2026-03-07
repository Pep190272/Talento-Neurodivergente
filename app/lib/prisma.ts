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

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error(
      '[Prisma] DATABASE_URL no está definida. ' +
      'Crea un archivo .env.local con DATABASE_URL=postgresql://user:pass@host:5432/db'
    )
  }

  const adapter = new PrismaPg({ connectionString })

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

// Lazy initialization: only creates the client when first accessed at runtime,
// allowing Next.js to build without DATABASE_URL configured.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient()
    }
    return Reflect.get(globalForPrisma.prisma, prop)
  },
})

export default prisma
