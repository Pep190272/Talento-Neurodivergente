export default function CandidateDashboard() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Hola, Candidato 👋</h1>

            <div className="grid md:grid-cols-3 gap-6">
                {/* KPI Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 mb-2">Matching Score Promedio</div>
                    <div className="text-4xl font-bold text-purple-600">85%</div>
                </div>

                {/* KPI Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 mb-2">Ofertas Disponibles</div>
                    <div className="text-4xl font-bold text-blue-600">5</div>
                </div>

                {/* Action Card */}
                <button className="flex flex-col items-center justify-center p-6 bg-purple-50 border-2 border-dashed border-purple-200 rounded-xl hover:bg-purple-100 hover:border-purple-300 transition-colors">
                    <span className="text-2xl mb-2">📝</span>
                    <span className="font-semibold text-purple-700">Completar Perfil</span>
                </button>
            </div>

            <div className="mt-12">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Ofertas Recomendadas para Ti</h2>
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
                    Completa tu perfil para ver ofertas personalizadas por nuestra IA.
                </div>
            </div>
        </div>
    )
}
