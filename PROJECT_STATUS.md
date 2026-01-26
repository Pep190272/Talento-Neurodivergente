# Project Status - Diversia Eternals

> **Last Updated**: 2026-01-22
> **Version**: 2.0.0
> **Maintainer**: GACE Architecture

---

## 🌿 Branch Strategy

| Branch | Purpose | Status |
|--------|---------|--------|
| `main` | Production-ready code | ✅ Active |
| `develop` | Integration branch (synced with main) | ✅ Active |
| `archive/pre-cleanup-20260122` | Safety backup of uncommitted work | 📦 Archive |

### Archive Branches (Do Not Delete)
The `archive/*` branches contain historical snapshots. They are **NOT for merging** but for reference/recovery.

---

## 📊 Current State

### ✅ Completed Features
- **Authentication System**: Login, session management with NextAuth v5 beta
- **Forms System**: Generic form builder with schema-driven validation
- **NeuroAgent Chatbot**: AI-powered assistant (OpenAI integration)
- **Dashboard**: User personalized view with insights
- **Portfolio/Blog**: Static content pages
- **Therapist Registration (UC-008)**
- **Therapist Dashboard with Clients (UC-009)**

### ⏳ In Progress (Archived)
The following were in development and are preserved in `archive/pre-cleanup-20260122`:

| Feature | Status | Location in Archive |
|---------|--------|---------------------|
| Prisma Database Schema | Draft | `prisma/schema.prisma` |
| Change Password API | Test written | `app/api/auth/change-password/`, `tests/api/` |
| Database Migration Script | Draft | `scripts/migrate-json-to-db.js` |
| GACE Agent Definitions | In progress | `.gace/`, `.agent/` |

### 🚫 Removed (Stale)
- `copilot/na` - Empty/unused branch
- `dependabot/*` - Old dependency updates (will regenerate if needed)
- `feature/marketplace-core-implementation` - Already merged to main

---

## 🔧 Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | 15.3.8 |
| Runtime | React | 19.0.0 |
| Auth | NextAuth | 5.0.0-beta.30 |
| Validation | Zod | 4.3.5 |
| Database (Future) | Prisma | 7.2.0 |
| Testing | Vitest | 4.0.17 |
| CSS | Vanilla CSS | - |

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm run test
```

---

## 📋 Next Steps (Roadmap)

1. **Database Migration**: Implement Prisma schema and migrate from JSON storage
2. **Security Hardening**: Complete EU AI Act compliance layer
3. **Testing Coverage**: Increase to 80%+ with integration tests
4. **Marketplace MVP**: Resume marketplace feature development

---

## 📁 Important Files

- `README.md` - User-facing documentation
- `CHANGELOG.md` - Version history
- `package.json` - Dependencies and scripts
- `app/` - Next.js application code
- `data/` - JSON storage (to be deprecated with DB migration)

---

**Note for Team**: When resuming archived work, cherry-pick from `archive/pre-cleanup-20260122` rather than merging the entire branch.
