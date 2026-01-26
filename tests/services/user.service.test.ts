import { describe, it, expect, vi } from 'vitest'
import { UserService } from '../../app/lib/services/users'

// Mock de Prisma para no tocar la DB real durante tests unitarios
vi.mock('../../app/lib/prisma', () => ({
    default: {
        user: {
            findUnique: vi.fn(),
            create: vi.fn()
        }
    }
}))

describe('UserService', () => {
    it('debe encontrar un usuario por email', async () => {
        const mockUser = { id: '1', email: 'test@diversia.com', userType: 'individual' }

        // Configurar el mock para devolver el usuario
        const prisma = (await import('../../app/lib/prisma')).default
        vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any)

        const user = await UserService.findUserByEmail('test@diversia.com')

        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: { email: 'test@diversia.com' },
            include: expect.any(Object)
        })
        expect(user).toBeDefined()
        expect(user?.email).toBe('test@diversia.com')
    })
})
