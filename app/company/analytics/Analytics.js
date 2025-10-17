import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, ComposedChart } from 'recharts';
import { TrendingUp, TrendingDown, Users, Target, Award, Brain, Zap, Eye, BarChart3, Activity, Calendar, MapPin, Clock, Filter, Download, RefreshCw, Maximize2, Search, Bell, Settings } from 'lucide-react';
import styles from './Analytics.module.css';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [isRealTime, setIsRealTime] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [expandedChart, setExpandedChart] = useState(null);

  // Advanced KPI Data
  const kpiData = [
    { 
      title: "Pool de Talentos Activo", 
      value: 2847, 
      change: 12.3, 
      trend: "up", 
      icon: Users,
      color: "#8B5CF6",
      description: "Profesionales neurodivergentes listos para emparejamiento"
    },
    { 
      title: "Velocidad de Colocación", 
      value: 18.2, 
      change: 5.7, 
      trend: "up", 
      icon: Zap,
      color: "#EAB308",
      description: "Días promedio desde perfil hasta colocación"
    },
    { 
      title: "Tasa de Match de Superpoderes", 
      value: 94.8, 
      change: 2.1, 
      trend: "up", 
      icon: Target,
      color: "#10B981",
      description: "Compatibilidad talento-rol impulsada por IA"
    },
    { 
      title: "Éxito de Retención", 
      value: 87.3, 
      change: -1.2, 
      trend: "down", 
      icon: Award,
      color: "#F59E0B",
      description: "Tasa de retención a 12 meses"
    },
    { 
      title: "Diversidad de Neurotipos", 
      value: 15.7, 
      change: 8.9, 
      trend: "up", 
      icon: Brain,
      color: "#EF4444",
      description: "Índice de diversidad de Shannon"
    },
    { 
      title: "Puntuación de Compromiso", 
      value: 8.6, 
      change: 0.4, 
      trend: "up", 
      icon: Activity,
      color: "#3B82F6",
      description: "Calidad de interacción en la plataforma"
    }
  ];

  // Time series data for hiring trends
  const hiringTrends = [
    { date: '2024-01', placements: 45, applications: 234, interviews: 89, offers: 52 },
    { date: '2024-02', placements: 52, applications: 267, interviews: 98, offers: 61 },
    { date: '2024-03', placements: 48, applications: 291, interviews: 112, offers: 58 },
    { date: '2024-04', placements: 67, applications: 315, interviews: 125, offers: 73 },
    { date: '2024-05', placements: 71, applications: 342, interviews: 134, offers: 79 },
    { date: '2024-06', placements: 63, applications: 378, interviews: 156, offers: 71 },
    { date: '2024-07', placements: 84, applications: 401, interviews: 178, offers: 92 }
  ];

  // Neurotype distribution
  const neurotypeData = [
    { name: 'ADHD', value: 35, count: 997, color: '#8B5CF6' },
    { name: 'Autism', value: 28, count: 797, color: '#EAB308' },
    { name: 'Dyslexia', value: 22, count: 626, color: '#10B981' },
    { name: 'Dyscalculia', value: 8, count: 228, color: '#F59E0B' },
    { name: 'Tourette\'s', value: 4, count: 114, color: '#EF4444' },
    { name: 'Other', value: 3, count: 85, color: '#6B7280' }
  ];

  // Skill radar data
  const skillRadarData = [
    { skill: 'Problem Solving', score: 92, market: 78 },
    { skill: 'Pattern Recognition', score: 88, market: 65 },
    { skill: 'Attention to Detail', score: 95, market: 72 },
    { skill: 'Creative Thinking', score: 89, market: 68 },
    { skill: 'Logical Reasoning', score: 91, market: 75 },
    { skill: 'Data Analysis', score: 87, market: 71 }
  ];

  // Geographic distribution
  const geoData = [
    { region: 'North America', count: 1245, growth: 15.2 },
    { region: 'Europe', count: 987, growth: 12.8 },
    { region: 'Asia Pacific', count: 456, growth: 23.1 },
    { region: 'Latin America', count: 123, growth: 18.7 },
    { region: 'Middle East', count: 36, growth: 9.3 }
  ];

  // Performance metrics over time
  const performanceData = [
    { month: 'Jan', efficiency: 78, satisfaction: 85, retention: 82 },
    { month: 'Feb', efficiency: 82, satisfaction: 87, retention: 84 },
    { month: 'Mar', efficiency: 79, satisfaction: 89, retention: 86 },
    { month: 'Apr', efficiency: 85, satisfaction: 91, retention: 88 },
    { month: 'May', efficiency: 88, satisfaction: 88, retention: 87 },
    { month: 'Jun', efficiency: 91, satisfaction: 92, retention: 89 },
    { month: 'Jul', efficiency: 94, satisfaction: 94, retention: 91 }
  ];

  // Real-time activity simulation
  useEffect(() => {
    if (isRealTime) {
      const interval = setInterval(() => {
        // Simulate real-time updates
        console.log('Real-time update...');
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isRealTime]);

  const formatValue = (value, type) => {
    if (type === 'percentage') return `${value}%`;
    if (type === 'days') return `${value}d`;
    if (type === 'score') return `${value}/10`;
    return value.toLocaleString();
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-purple-500 rounded-lg p-3 shadow-xl">
          <p className="text-purple-300 font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-white">
              <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.analyticsContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.headerTitle}>
              DiversIA Analytics Command Center
            </h1>
            <p className={styles.headerSubtitle}>
              Neurodivergent talent intelligence & insights
            </p>
          </div>
          <div className={styles.headerControls}>
            <button
              onClick={() => setIsRealTime(!isRealTime)}
              className={`${styles.controlButton} ${isRealTime ? styles.liveButton : styles.staticButton}`}
            >
              <Activity className="w-4 h-4" />
              <span>{isRealTime ? 'Live' : 'Static'}</span>
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={styles.iconButton}
            >
              <Eye className="w-5 h-5" />
            </button>
            <button className={styles.iconButton}>
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.controlsContent}>
          <div className={styles.controlsLeft}>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className={styles.select}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className={styles.select}
            >
              <option value="all">All Metrics</option>
              <option value="placements">Placements</option>
              <option value="diversity">Diversity</option>
              <option value="performance">Performance</option>
            </select>
          </div>
          <div className={styles.controlsRight}>
            <div className={styles.statusIndicator}>
              <div className={styles.liveIndicator}></div>
              <span>
                {isRealTime ? 'Live Data' : 'Updated 5 min ago'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* KPI Grid */}
        <div className={styles.kpiGrid}>
          {kpiData.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <div key={index} className={styles.kpiCard}>
                <div className={styles.kpiHeader}>
                  <div 
                    className={styles.kpiIcon}
                    style={{ backgroundColor: `${kpi.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: kpi.color }} />
                  </div>
                  <div className={`${styles.kpiTrend} ${kpi.trend === 'up' ? styles.trendUp : styles.trendDown}`}>
                    {kpi.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span>{kpi.change}%</span>
                  </div>
                </div>
                <div className={styles.kpiValue}>
                  {formatValue(kpi.value, kpi.title.includes('Rate') ? 'percentage' : kpi.title.includes('Velocity') ? 'days' : kpi.title.includes('Score') ? 'score' : 'number')}
                </div>
                <div className={styles.kpiTitle}>
                  {kpi.title}
                </div>
                <div className={styles.kpiDescription}>
                  {kpi.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Charts Grid */}
        <div className={styles.chartsGrid}>
          {/* Hiring Trends */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>
                Hiring Pipeline Analytics
              </h3>
              <button
                onClick={() => setExpandedChart(expandedChart === 'hiring' ? null : 'hiring')}
                className={styles.chartExpandButton}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={hiringTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="applications" fill="#8B5CF6" opacity={0.6} />
                  <Line type="monotone" dataKey="placements" stroke="#EAB308" strokeWidth={3} dot={{ fill: '#EAB308', strokeWidth: 2, r: 5 }} />
                  <Line type="monotone" dataKey="interviews" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Neurotype Distribution */}
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>
              Neurotype Distribution
            </h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={neurotypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {neurotypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {neurotypeData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-300">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-white">
                      {item.value}%
                    </span>
                    <span className="text-xs text-gray-500">
                      ({item.count})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Secondary Charts */}
        <div className={styles.secondaryChartsGrid}>
          {/* Skill Radar */}
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>
              Superpower Skills Analysis
            </h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillRadarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                  <Radar name="DiversIA Talent" dataKey="score" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} strokeWidth={2} />
                  <Radar name="Market Average" dataKey="market" stroke="#EAB308" fill="#EAB308" fillOpacity={0.1} strokeWidth={2} />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>
              Performance Metrics
            </h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="efficiency" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="satisfaction" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="retention" stackId="1" stroke="#EAB308" fill="#EAB308" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className={styles.geoCard}>
          <h3 className={styles.geoTitle}>
            Global Talent Distribution
          </h3>
          <div className={styles.geoGrid}>
            {geoData.map((region, index) => (
              <div key={index} className={styles.geoItem}>
                <div className={styles.geoHeader}>
                  <MapPin className={styles.geoIcon} />
                  <span className={`${styles.geoGrowth} ${region.growth > 15 ? styles.growthPositive : styles.growthNeutral}`}>
                    +{region.growth}%
                  </span>
                </div>
                <div className={styles.geoCount}>
                  {region.count.toLocaleString()}
                </div>
                <div className={styles.geoRegion}>
                  {region.region}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className={styles.aiInsightsPanel}>
          <h3 className={styles.aiTitle}>
            🧠 AI-Powered Insights
          </h3>
          <div className={styles.aiGrid}>
            <div className={styles.aiCard}>
              <div className={styles.aiCardHeader}>
                <Zap className={`${styles.aiCardIcon} text-yellow-500`} />
                <span className={`${styles.aiCardType} ${styles.typeTrending}`}>Trending Up</span>
              </div>
              <p className={styles.aiCardText}>
                ADHD talent placements increased 23% this quarter, particularly in creative and problem-solving roles.
              </p>
            </div>
            <div className={styles.aiCard}>
              <div className={styles.aiCardHeader}>
                <Target className={`${styles.aiCardIcon} text-green-500`} />
                <span className={`${styles.aiCardType} ${styles.typeOpportunity}`}>Opportunity</span>
              </div>
              <p className={styles.aiCardText}>
                Tech sector shows 89% success rate for autism talent in data analysis and software development.
              </p>
            </div>
            <div className={styles.aiCard}>
              <div className={styles.aiCardHeader}>
                <Brain className={`${styles.aiCardIcon} text-purple-500`} />
                <span className={`${styles.aiCardType} ${styles.typePrediction}`}>Prediction</span>
              </div>
              <p className={styles.aiCardText}>
                AI models predict 31% increase in dyslexic talent demand for strategic and leadership positions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;