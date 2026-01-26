/**
 * Auth Configuration (Edge Compatible)
 * Separated from auth.js to avoid loading "bcrypt" in middleware
 */
export const authConfig = {
    providers: [], // Providers added in auth.js for Node runtime
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
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;

            // We handle complex redirection logic in middleware.js file itself
            // This simple callback is just to satisfy NextAuth type requirements
            return true;
        },
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
