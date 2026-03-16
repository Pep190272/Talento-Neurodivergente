import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { UserService } from './services/users'
import bcrypt from 'bcryptjs'
import { authConfig } from './auth.config'

/**
 * Main Auth Configuration (Node.js Runtime)
 * Extends edge-safe config with Node-only providers (Bcrypt/Prisma)
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Validar que se proporcionaron las credenciales
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials')
        }

        // Buscar usuario por email usando Servicio Prisma
        const user = await UserService.findUserByEmail(credentials.email)

        if (!user) {
          throw new Error('Invalid credentials')
        }

        // Verificar que el usuario tenga passwordHash
        if (!user.passwordHash) {
          throw new Error('Invalid credentials')
        }

        // Comparar password con hash almacenado
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)

        if (!isValid) {
          throw new Error('Invalid credentials')
        }

        // Determinar nombre a mostrar según tipo
        let name = 'User'
        if (user.userType === 'company' && user.company) {
          name = user.company.name
        } else if (user.userType === 'individual' && user.individual) {
          name = `${user.individual.firstName} ${user.individual.lastName}`.trim()
        } else if (user.userType === 'therapist' && user.therapist) {
          name = user.therapist.name
        }

        // Retornar objeto de usuario para la session
        return {
          id: user.id,
          email: user.email,
          type: user.userType,
          name: name
        }
      }
    })
  ]
})
