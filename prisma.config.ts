/**
 * Prisma Configuration — DiversIA Eternals
 *
 * Prisma 7 TypeScript-first configuration.
 * Centralizes datasource, schema path, and migration settings.
 *
 * Architecture notes:
 * - Configuration lives here (TypeScript, type-safe)
 * - Schema lives in prisma/schema.prisma (pure schema definition)
 * - Client singleton lives in app/lib/prisma.ts
 *
 * @see https://www.prisma.io/docs/orm/reference/prisma-config-reference
 */

import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  // Single schema file — extend to folder if we add multi-schema later
  schema: 'prisma/schema.prisma',

  // Datasource — env var is the single source of truth for the connection URL
  // Overrides the url in schema.prisma when both are present
  datasource: {
    url: env('DATABASE_URL'),
  },
})
