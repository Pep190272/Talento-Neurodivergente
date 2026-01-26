'use client'
import React from 'react'

export default function AdminDashboard() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Panel de Super Admin 🛡️</h1>
            <p className="mb-4">Bienvenido al centro de control de Diversia Eternals.</p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
                <div className="flex">
                    <div className="flex-shrink-0">
                        {/* Warning Icon */}
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                            Este panel está en construcción. Próximamente incluirá métricas de Stripe, auditoría de IA y gestión de usuarios.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h2 className="text-xl font-semibold mb-2">Usuarios</h2>
                    <p className="text-gray-600">Gestión de Candidatos, Empresas y Terapeutas.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h2 className="text-xl font-semibold mb-2">Finanzas (Stripe)</h2>
                    <p className="text-gray-600">Control de suscripciones y pagos.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h2 className="text-xl font-semibold mb-2">Auditoría IA</h2>
                    <p className="text-gray-600">Logs de transparencia y cumplimiento EU AI Act.</p>
                </div>
            </div>
        </div>
    )
}
