'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RoleSelectionPage() {
    const router = useRouter()

    const selectRole = (role: string) => {
        // Aquí podríamos guardar el rol en localStorage o cookies si fuera necesario
        // Por ahora, redirigimos al login con un query param
        router.push(`/login?role=${role}`)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-blue-900 mb-4">¿Cómo quieres participar?</h1>
                <p className="text-lg text-gray-600">Selecciona tu perfil para continuar</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl w-full">
                {/* Card: Candidato */}
                <RoleCard
                    title="Soy Candidato"
                    desc="Busco oportunidades laborales donde se valore mi talento neurodivergente."
                    icon="🧠"
                    color="blue"
                    onClick={() => selectRole('individual')}
                />

                {/* Card: Empresa */}
                <RoleCard
                    title="Soy Empresa"
                    desc="Quiero publicar ofertas y encontrar talento diverso para mi equipo."
                    icon="🏢"
                    color="indigo"
                    onClick={() => selectRole('company')}
                />

                {/* Card: Terapeuta */}
                <RoleCard
                    title="Soy Terapeuta"
                    desc="Quiero gestionar y apoyar a mis pacientes en su inserción laboral."
                    icon="🤝"
                    color="teal"
                    onClick={() => selectRole('therapist')}
                />
            </div>

            <div className="mt-12 text-gray-500">
                ¿Ya tienes cuenta? <Link href="/login" className="text-blue-600 font-semibold hover:underline">Inicia sesión aquí</Link>
            </div>
        </div>
    )
}

function RoleCard({ title, desc, icon, color, onClick }: any) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 hover:border-blue-500',
        indigo: 'bg-indigo-50 text-indigo-600 hover:border-indigo-500',
        teal: 'bg-teal-50 text-teal-600 hover:border-teal-500'
    }

    return (
        <button
            onClick={onClick}
            className={`p-8 bg-white rounded-2xl shadow-sm border-2 border-transparent transition-all hover:-translate-y-1 hover:shadow-lg text-left group ${colorClasses[color as keyof typeof colorClasses].split(' ')[2]}`}
        >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mb-6 ${colorClasses[color as keyof typeof colorClasses].split(' ').slice(0, 2).join(' ')}`}>
                {icon}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-current transition-colors">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{desc}</p>
        </button>
    )
}
