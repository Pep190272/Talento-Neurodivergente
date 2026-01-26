import { describe, it, expect } from 'vitest'
import { getRedirectUrlByRole } from '../../app/lib/auth-redirect'

describe('Auth Redirection Logic', () => {
    it('redirects INDIVIDUAL users to /dashboard/individual', () => {
        const url = getRedirectUrlByRole('individual')
        expect(url).toBe('/dashboard/individual')
    })

    it('redirects COMPANY users to /dashboard/company', () => {
        const url = getRedirectUrlByRole('company')
        expect(url).toBe('/dashboard/company')
    })

    it('redirects THERAPIST users to /dashboard/therapist', () => {
        const url = getRedirectUrlByRole('therapist')
        expect(url).toBe('/dashboard/therapist')
    })

    it('redirects ADMIN users to /admin', () => {
        const url = getRedirectUrlByRole('admin')
        expect(url).toBe('/admin')
    })

    it('redirects unknown roles to /dashboard', () => {
        const url = getRedirectUrlByRole('unknown')
        expect(url).toBe('/dashboard')
    })

    it('redirects null/undefined roles to /', () => {
        const url = getRedirectUrlByRole(null)
        expect(url).toBe('/')
    })
})
