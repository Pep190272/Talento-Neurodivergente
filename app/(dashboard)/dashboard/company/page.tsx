export default function CompanyDashboard() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Empresa</h1>

            <div className="grid md:grid-cols-3 gap-6">
                {/* KPI Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 mb-2">Ofertas Activas</div>
                    <div className="text-4xl font-bold text-blue-600">3</div>
                </div>

                {/* KPI Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 mb-2">Candidatos Nuevos</div>
                    <div className="text-4xl font-bold text-green-600">12</div>
                </div>

                {/* Action Card */}
                <button className="flex flex-col items-center justify-center p-6 bg-blue-50 border-2 border-dashed border-blue-200 rounded-xl hover:bg-blue-100 hover:border-blue-300 transition-colors">
                    <span className="text-2xl mb-2">➕</span>
                    <span className="font-semibold text-blue-700">Publicar Oferta</span>
                </button>
            </div>

            <div className="mt-12">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Candidatos Sugeridos (AI Matching)</h2>
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
                    No hay candidatos nuevos para revisar hoy.
                </div>
            </div>
        </div>
    )
}
