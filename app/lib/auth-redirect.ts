/**
 * Determines the redirect URL based on the user's role.
 * Used by Middleware and Login Actions to route users correctly.
 * 
 * @param role - The user's role (candidate, company, therapist, admin)
 * @returns The absolute path to redirect to.
 */
export function getRedirectUrlByRole(role: string | null | undefined): string {
    if (!role) return '/'

    // Normalize logic just in case
    const safeRole = role.toLowerCase()

    switch (safeRole) {
        case 'individual':
        case 'candidate': // Alias for consistency
            return '/dashboard/individual'
        case 'company':
            return '/dashboard/company'
        case 'therapist':
        case 'specialist': // Alias for consistency
            return '/dashboard/therapist'
        case 'admin':
            return '/admin'
        default:
            return '/dashboard'
    }
}
