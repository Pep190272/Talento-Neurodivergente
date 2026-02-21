/**
 * In-memory Prisma mock for unit tests
 *
 * Provides a stateful mock that supports CRUD operations, $transaction,
 * include (joins), { push }, { increment }, and where filtering.
 *
 * Usage in test files:
 *   vi.mock('@/lib/prisma', async () => {
 *     const { getMockPrisma } = await import('../../helpers/prisma-mock.js')
 *     const mock = getMockPrisma()
 *     return { default: mock, prisma: mock }
 *   })
 *   // Then in test body, import to get same singleton:
 *   import { getMockPrisma } from '../../helpers/prisma-mock.js'
 *   const mockPrisma = getMockPrisma()
 *   // In beforeEach: mockPrisma._reset()
 */

// Singleton instance for sharing between vi.mock factory and test code
let _singleton = null

export function getMockPrisma() {
  if (!_singleton) _singleton = createMockPrisma()
  return _singleton
}

export function resetMockPrisma() {
  _singleton = null
}

function genId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function matchesWhere(record, where) {
  for (const [key, val] of Object.entries(where)) {
    if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
      // Nested relation filter, e.g. { user: { status: 'active' } }
      // or Prisma operators like { has: 'value' }
      if ('has' in val) {
        if (!Array.isArray(record[key]) || !record[key].includes(val.has)) return false
      } else {
        // Treat as relation filter — skip (handled at join level)
      }
    } else if (record[key] !== val) {
      return false
    }
  }
  return true
}

export function createMockPrisma() {
  // In-memory stores keyed by model name
  const stores = {
    user: new Map(),
    therapist: new Map(),
    connection: new Map(),
    matching: new Map(),
    individual: new Map(),
    company: new Map(),
    auditLog: new Map(),
    job: new Map(),
  }

  // Relation mapping: which field links to which store
  const relationMap = {
    user: { store: 'user', fk: 'userId', type: 'one' },
    therapist: { store: 'therapist', fk: 'therapistId', type: 'one' },
    individual: { store: 'individual', fk: 'individualId', type: 'one' },
    company: { store: 'company', fk: 'companyId', type: 'one' },
    job: { store: 'job', fk: 'jobId', type: 'one' },
    // One-to-many relations: find by parent FK
    jobs: { store: 'job', parentFk: 'companyId', type: 'many' },
    matchings: { store: 'matching', parentFk: 'individualId', type: 'many' },
    connections: { store: 'connection', parentFk: 'individualId', type: 'many' },
    auditLogs: { store: 'auditLog', parentFk: 'userId', type: 'many' },
  }

  function resolveIncludes(record, include, modelName) {
    if (!include) return record
    const result = { ...record }

    for (const [key, val] of Object.entries(include)) {
      if (!val) continue

      const rel = relationMap[key]
      if (!rel) continue

      if (rel.type === 'one') {
        const fkValue = record[rel.fk]
        result[key] = fkValue ? (stores[rel.store].get(fkValue) || null) : null
      } else if (rel.type === 'many') {
        // Find all records in the related store that reference this record's id
        let related = [...stores[rel.store].values()].filter(
          r => r[rel.parentFk] === record.id
        )
        // Support { select: { id: true } } pattern
        if (typeof val === 'object' && val.select) {
          related = related.map(r => {
            const selected = {}
            for (const field of Object.keys(val.select)) {
              selected[field] = r[field]
            }
            return selected
          })
        }
        result[key] = related
      }
    }

    return result
  }

  function createModelOps(modelName, idPrefix) {
    return {
      create: async ({ data, include } = {}) => {
        const id = data?.id || genId(idPrefix)
        const now = new Date()
        const record = { id, ...data, createdAt: data?.createdAt || now, updatedAt: data?.updatedAt || now }
        stores[modelName].set(id, record)
        return resolveIncludes(record, include, modelName)
      },

      findUnique: async ({ where, include } = {}) => {
        let record = null

        if (where?.id) {
          record = stores[modelName].get(where.id) || null
        }

        if (!record) {
          // Search by other unique fields
          for (const r of stores[modelName].values()) {
            let match = true
            for (const [key, val] of Object.entries(where)) {
              if (r[key] !== val) { match = false; break }
            }
            if (match) { record = r; break }
          }
        }

        if (!record) return null
        return resolveIncludes(record, include, modelName)
      },

      findFirst: async ({ where, include } = {}) => {
        for (const r of stores[modelName].values()) {
          if (!where || matchesWhere(r, where)) {
            return resolveIncludes(r, include, modelName)
          }
        }
        return null
      },

      findMany: async ({ where, include, orderBy, take, skip } = {}) => {
        let results = [...stores[modelName].values()]
        if (where) results = results.filter(r => matchesWhere(r, where))
        if (skip) results = results.slice(skip)
        if (take) results = results.slice(0, take)
        return results.map(r => resolveIncludes(r, include, modelName))
      },

      update: async ({ where, data, include } = {}) => {
        // Find the record
        const ops = createModelOps(modelName, idPrefix)
        const current = await ops.findUnique({ where })
        if (!current) throw new Error(`Record not found in ${modelName}`)

        const updated = { ...current }
        for (const [key, val] of Object.entries(data)) {
          if (key === 'user' && val?.update) {
            // Nested relation update
            const user = stores.user.get(updated.userId)
            if (user) {
              Object.assign(user, val.update)
              stores.user.set(user.id, user)
            }
          } else if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date) && 'push' in val) {
            // Array push operation
            updated[key] = [...(updated[key] || []), val.push]
          } else if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date) && 'increment' in val) {
            // Numeric increment
            updated[key] = (updated[key] || 0) + val.increment
          } else {
            updated[key] = val
          }
        }
        updated.updatedAt = new Date()
        stores[modelName].set(updated.id, updated)

        return resolveIncludes(updated, include, modelName)
      },

      upsert: async ({ where, create, update, include } = {}) => {
        const ops = createModelOps(modelName, idPrefix)
        const existing = await ops.findUnique({ where })
        if (existing) {
          return ops.update({ where, data: update, include })
        }
        return ops.create({ data: { ...where, ...create }, include })
      },

      delete: async ({ where } = {}) => {
        const ops = createModelOps(modelName, idPrefix)
        const record = await ops.findUnique({ where })
        if (record) stores[modelName].delete(record.id)
        return record
      },

      deleteMany: async ({ where } = {}) => {
        let count = 0
        if (where) {
          for (const [id, r] of stores[modelName]) {
            if (matchesWhere(r, where)) {
              stores[modelName].delete(id)
              count++
            }
          }
        } else {
          count = stores[modelName].size
          stores[modelName].clear()
        }
        return { count }
      },

      count: async ({ where } = {}) => {
        if (!where) return stores[modelName].size
        return [...stores[modelName].values()].filter(r => matchesWhere(r, where)).length
      },
    }
  }

  const mockPrisma = {
    user: createModelOps('user', 'user'),
    therapist: createModelOps('therapist', 'ther'),
    connection: createModelOps('connection', 'conn'),
    matching: createModelOps('matching', 'match'),
    individual: createModelOps('individual', 'ind'),
    company: createModelOps('company', 'comp'),
    auditLog: createModelOps('auditLog', 'audit'),
    job: createModelOps('job', 'job'),

    // $transaction: pass the same mock as the "tx" context
    $transaction: async (fnOrArray) => {
      if (typeof fnOrArray === 'function') {
        return fnOrArray(mockPrisma)
      }
      // Array of promises
      return Promise.all(fnOrArray)
    },

    $connect: async () => {},
    $disconnect: async () => {},

    // Reset all stores (call in beforeEach)
    _reset: () => {
      for (const store of Object.values(stores)) {
        if (store instanceof Map) store.clear()
      }
    },

    // Access stores directly for assertions
    _stores: stores,
  }

  return mockPrisma
}
