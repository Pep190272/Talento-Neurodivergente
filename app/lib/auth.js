import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { UserService } from './services/users'
import bcrypt from 'bcryptjs'

/**
 * Configuración de NextAuth.js v5 (Auth.js)
 *
 * Características:
 * - Autenticación con credenciales (email + password)
 * - JWT session strategy (sin base de datos)
 * - 3 tipos de usuario: individual, therapist, company
 * - Session incluye userId y userType
 */
export const authConfig = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'tu@email.com'
        },
        password: {
          label: 'Password',
          type: 'password'
        }
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
  ],

  callbacks: {
    /**
     * JWT callback - se ejecuta cada vez que se crea/actualiza un JWT
     * Aquí agregamos campos personalizados al token
     */
    async jwt({ token, user }) {
      // Solo en el primer login (cuando 'user' existe)
      if (user) {
        token.userId = user.id
        token.userType = user.type
        token.email = user.email
      }
      return token
    },

    /**
     * Session callback - se ejecuta cada vez que se accede a la session
     * Aquí agregamos campos del token a la session
     */
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId
        session.user.type = token.userType
        session.user.email = token.email
      }
      return session
    }
  },

  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
    newUser: '/register'
  },

  session: {
    // Usar JWT en lugar de database sessions
    strategy: 'jwt',

    // Session dura 30 días
    maxAge: 30 * 24 * 60 * 60, // 30 days

    // Actualizar session cada 24 horas
    updateAge: 24 * 60 * 60 // 24 hours
  },

  // Habilitar debug en desarrollo
  debug: process.env.NODE_ENV === 'development'
}

// NextAuth v5 (Auth.js) - exporta handlers y funciones de auth
const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

export { handlers, auth, signIn, signOut }
