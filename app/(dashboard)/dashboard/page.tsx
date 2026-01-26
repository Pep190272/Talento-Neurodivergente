import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardRootPage() {
    const session = await auth()

    if (!session?.user) {
        redirect('/auth/role-selection')
    }

    const role = session.user.type

    if (role === 'company') {
        redirect('/dashboard/company')
    } else if (role === 'individual') {
        redirect('/dashboard/candidate')
    } else if (role === 'therapist') {
        redirect('/dashboard/therapist') // Asumiendo que existirá
    }

    // Fallback
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-red-600">Error de Rol</h1>
            <p>Tu usuario no tiene un rol válido asignado.</p>
        </div>
    )
}
