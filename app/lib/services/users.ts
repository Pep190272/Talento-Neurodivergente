import prisma from '../prisma'

export const UserService = {
    async findUserByEmail(email: string) {
        return await prisma.user.findUnique({
            where: { email },
            include: {
                company: true,
                individual: true,
                therapist: true
            }
        })
    }
}
