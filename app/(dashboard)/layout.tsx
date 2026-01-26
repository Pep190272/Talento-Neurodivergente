import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    // 🔒 Security Check: No user -> Login
    if (!session?.user) {
        redirect('/auth/role-selection')
    }

    const userType = session.user.type

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <Link href="/dashboard" className="text-xl font-bold text-blue-900">
                        Diversia
                    </Link>
                    <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        {userType === 'company' ? 'Empresa' : userType === 'individual' ? 'Candidato' : 'Terapeuta'}
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {userType === 'company' && (
                        <>
                            <NavLink href="/dashboard/company" icon="📊" label="Resumen" />
                            <NavLink href="/dashboard/company/jobs" icon="briefcase" label="Mis Ofertas" />
                            <NavLink href="/dashboard/company/candidates" icon="users" label="Buscar Talento" />
                        </>
                    )}

                    {userType === 'individual' && (
                        <>
                            <NavLink href="/dashboard/candidate" icon="👋" label="Inicio" />
                            <NavLink href="/dashboard/candidate/profile" icon="user" label="Mi Perfil" />
                            <NavLink href="/dashboard/candidate/matches" icon="star" label="Mis Matches" />
                        </>
                    )}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {session.user.name?.[0] || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{session.user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                        </div>
                    </div>
                    <form action="/api/auth/signout" method="POST">
                        <button className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left flex items-center gap-2">
                            🚪 Cerrar Sesión
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    )
}

function NavLink({ href, icon, label }: { href: string, icon: string, label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors"
        >
            <span className="text-lg">{icon === 'briefcase' ? '💼' : icon === 'users' ? '👥' : icon === 'user' ? '👤' : icon === 'star' ? '⭐' : icon}</span>
            <span className="font-medium">{label}</span>
        </Link>
    )
}
