'use client'

import React from 'react'
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    LineChart, Line, Area, AreaChart,
    RadialBarChart, RadialBar,
    FunnelChart, Funnel, LabelList,
} from 'recharts'

// ═══════════════════════════════════════════════════════════════
// Color palette
// ═══════════════════════════════════════════════════════════════
const COLORS = {
    matching: {
        PENDING: '#f59e0b',
        APPROVED: '#10b981',
        REJECTED: '#ef4444',
        WITHDRAWN: '#6b7280',
        CONTESTED: '#8b5cf6',
    },
    diagnosis: [
        '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
        '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#6366f1',
        '#14b8a6',
    ],
    industry: [
        '#1e40af', '#dc2626', '#059669', '#d97706', '#7c3aed',
        '#db2777', '#0891b2', '#ea580c', '#65a30d', '#4f46e5',
    ],
    pipeline: ['#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#ef4444'],
}

// ═══════════════════════════════════════════════════════════════
// Matching Status Pie Chart
// ═══════════════════════════════════════════════════════════════
export function MatchingStatusChart({ data }: { data: Array<{ status: string; count: number }> }) {
    const statusLabels: Record<string, string> = {
        PENDING: 'Pendiente',
        APPROVED: 'Aprobado',
        REJECTED: 'Rechazado',
        WITHDRAWN: 'Retirado',
        CONTESTED: 'Impugnado',
    }

    const chartData = data.map(d => ({
        name: statusLabels[d.status] || d.status,
        value: d.count,
        color: COLORS.matching[d.status as keyof typeof COLORS.matching] || '#6b7280',
    }))

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1200}
                    animationEasing="ease-out"
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
                    ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value, 'Matches']} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    )
}

// ═══════════════════════════════════════════════════════════════
// Score Distribution Histogram
// ═══════════════════════════════════════════════════════════════
export function ScoreDistributionChart({ data }: { data: Array<{ range: string; count: number }> }) {
    const enriched = data.map((d, i) => ({
        ...d,
        fill: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#059669'][i],
    }))

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={enriched} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(value: number) => [value, 'Matches']} />
                <Bar dataKey="count" animationBegin={200} animationDuration={1000} animationEasing="ease-out" radius={[6, 6, 0, 0]}>
                    {enriched.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}

// ═══════════════════════════════════════════════════════════════
// Diagnosis Distribution (Horizontal Bar)
// ═══════════════════════════════════════════════════════════════
export function DiagnosisChart({ data }: { data: Array<{ name: string; count: number }> }) {
    const labels: Record<string, string> = {
        'TDAH': 'TDAH',
        'TEA': 'TEA (Autismo)',
        'Dislexia': 'Dislexia',
        'Discalculia': 'Discalculia',
        'Dispraxia_TDC': 'Dispraxia (TDC)',
        'Sindrome_Tourette': 'S. Tourette',
        'TPS_Procesamiento_Sensorial': 'TPS',
        'Altas_Capacidades': 'Altas Capacidades',
        'TANV': 'TANV',
        'TOC': 'TOC',
    }

    const chartData = data.map(d => ({
        name: labels[d.name] || d.name,
        count: d.count,
    }))

    return (
        <ResponsiveContainer width="100%" height={Math.max(300, chartData.length * 40)}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
                <Tooltip formatter={(value: number) => [value, 'Candidatos']} />
                <Bar dataKey="count" animationBegin={400} animationDuration={1200} animationEasing="ease-out" radius={[0, 6, 6, 0]}>
                    {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS.diagnosis[index % COLORS.diagnosis.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}

// ═══════════════════════════════════════════════════════════════
// Industry Distribution (Donut)
// ═══════════════════════════════════════════════════════════════
export function IndustryChart({ data }: { data: Array<{ name: string; count: number }> }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="name"
                    animationBegin={300}
                    animationDuration={1400}
                    animationEasing="ease-out"
                >
                    {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS.industry[index % COLORS.industry.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value, 'Empresas']} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
        </ResponsiveContainer>
    )
}

// ═══════════════════════════════════════════════════════════════
// Pipeline Funnel
// ═══════════════════════════════════════════════════════════════
export function PipelineChart({ data }: { data: Array<{ stage: string; count: number }> }) {
    const stageLabels: Record<string, string> = {
        newMatches: 'Nuevos Matches',
        underReview: 'En Revisión',
        interviewing: 'Entrevistando',
        offered: 'Oferta Enviada',
        hired: 'Contratado',
        rejected: 'Rechazado',
    }
    const stageOrder = ['newMatches', 'underReview', 'interviewing', 'offered', 'hired', 'rejected']

    const chartData = stageOrder
        .map((stage, i) => ({
            name: stageLabels[stage] || stage,
            value: data.find(d => d.stage === stage)?.count || 0,
            fill: COLORS.pipeline[i],
        }))
        .filter(d => d.value > 0)

    return (
        <ResponsiveContainer width="100%" height={300}>
            <FunnelChart>
                <Tooltip formatter={(value: number) => [value, 'Conexiones']} />
                <Funnel
                    dataKey="value"
                    data={chartData}
                    isAnimationActive
                    animationBegin={500}
                    animationDuration={1500}
                    animationEasing="ease-out"
                >
                    <LabelList position="center" fill="#fff" stroke="none" fontSize={12} dataKey="name" />
                </Funnel>
            </FunnelChart>
        </ResponsiveContainer>
    )
}

// ═══════════════════════════════════════════════════════════════
// Acceptance Rate Gauge
// ═══════════════════════════════════════════════════════════════
export function AcceptanceRateGauge({ rate, avgScore }: { rate: number; avgScore: number }) {
    const data = [
        { name: 'Tasa aceptación', value: rate, fill: '#10b981' },
        { name: 'Score medio', value: avgScore, fill: '#3b82f6' },
    ]

    return (
        <ResponsiveContainer width="100%" height={250}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={data} startAngle={180} endAngle={0}>
                <RadialBar
                    background
                    dataKey="value"
                    cornerRadius={10}
                    animationBegin={600}
                    animationDuration={1200}
                    animationEasing="ease-out"
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                <Tooltip formatter={(value: number, name: string) => [`${value}%`, name]} />
            </RadialBarChart>
        </ResponsiveContainer>
    )
}

// ═══════════════════════════════════════════════════════════════
// Connections by Type (Area Chart)
// ═══════════════════════════════════════════════════════════════
export function ConnectionsChart({ data }: { data: Array<{ type: string; count: number }> }) {
    const typeLabels: Record<string, string> = {
        JOB_MATCH: 'Job Match',
        THERAPY: 'Terapia',
        CONSULTING: 'Consultoría',
    }

    const chartData = data.map(d => ({
        name: typeLabels[d.type] || d.type,
        count: d.count,
    }))

    return (
        <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#6366f1"
                    fill="#818cf8"
                    fillOpacity={0.3}
                    animationBegin={400}
                    animationDuration={1200}
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}

// ═══════════════════════════════════════════════════════════════
// Score Timeline (Line Chart)
// ═══════════════════════════════════════════════════════════════
export function ScoreTimelineChart({ data }: { data: Array<{ score: number; status: string; date: string }> }) {
    const sorted = [...data]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((d, i) => ({
            index: i + 1,
            score: d.score,
            status: d.status,
        }))

    return (
        <ResponsiveContainer width="100%" height={250}>
            <LineChart data={sorted}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" label={{ value: 'Match #', position: 'insideBottom', offset: -5 }} />
                <YAxis domain={[0, 100]} label={{ value: 'Score', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                    formatter={(value: number) => [`${value}`, 'AI Score']}
                    labelFormatter={(label) => `Match #${label}`}
                />
                <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#3b82f6' }}
                    activeDot={{ r: 6, fill: '#1d4ed8' }}
                    animationBegin={300}
                    animationDuration={2000}
                    animationEasing="ease-out"
                />
            </LineChart>
        </ResponsiveContainer>
    )
}
