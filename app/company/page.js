"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  FaUserTie, FaSearch, FaFilter, FaEnvelope, FaBell, FaUser, FaCog, 
  FaHome, FaUsers, FaBullseye, FaChartBar, FaCalendarAlt, FaBriefcase,
  FaBalanceScale, FaChevronLeft, FaChevronRight, FaRobot, FaGraduationCap,
  FaMapMarkerAlt, FaExpand, FaEye, FaHandshake, FaSave,
  FaPlay, FaDownload, FaLightbulb, FaGamepad, FaGripVertical
} from "react-icons/fa";
import "./company.css";

// No component imports needed since we're using separate route pages

const sampleTalents = [
  { id: 1, name: "Alex Kim", skills: ["Pattern Recognition", "Data Analysis"], match: 98, superpower: "🧠", stage: "Applied", location: "San Francisco" },
  { id: 2, name: "Jordan Lee", skills: ["Creative Problem Solving", "UX Design"], match: 94, superpower: "🎨", stage: "Interviewing", location: "New York" },
  { id: 3, name: "Morgan Patel", skills: ["Attention to Detail", "QA Testing"], match: 91, superpower: "⚙️", stage: "Assessed", location: "Austin" },
  { id: 4, name: "Casey Rodriguez", skills: ["Hyperfocus", "Code Architecture"], match: 96, superpower: "💻", stage: "Offer", location: "Seattle" },
  { id: 5, name: "River Chen", skills: ["Systems Thinking", "Process Optimization"], match: 89, superpower: "🔧", stage: "Applied", location: "Boston" },
];

const kpiData = [
  { title: "Búsquedas Activas", value: 12, trend: "+2 esta semana", icon: "🎯" },
  { title: "Candidatos en el Pipeline", value: 45, trend: "+8 esta semana", icon: "👥" },
  { title: "Tasa de Éxito en Colocaciones", value: 92, trend: "+3% este mes", icon: "🏆" },
];

const trainingModules = [
  { name: "Entendiendo el TDAH", progress: 85, certified: true },
  { name: "Comunicación Inclusiva", progress: 60, certified: false },
  { name: "Conciencia sobre Autismo", progress: 100, certified: true },
  { name: "Apoyo para Dislexia", progress: 30, certified: false },
];

export default function CompanyDashboard({ defaultView = 'overview' }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedView, setSelectedView] = useState(defaultView);
  const [chatOpen, setChatOpen] = useState(false);
  const [draggedCandidate, setDraggedCandidate] = useState(null);
  const [candidates, setCandidates] = useState(sampleTalents);
  const [animatedKPIs, setAnimatedKPIs] = useState([0, 0, 0]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync selected view with pathname
  useEffect(() => {
    const path = pathname.split('/').pop();
    if (path && ['analytics', 'training', 'settings'].includes(path)) {
      setSelectedView(path);
    } else if (pathname.includes('/candidates')) {
      // Don't set selectedView for candidates since it's a separate route
      return;
    } else {
      setSelectedView('overview');
    }
  }, [pathname]);

  // Animate KPI counters
  useEffect(() => {
    const timers = kpiData.map((kpi, index) => {
      return setTimeout(() => {
        let current = 0;
        const increment = kpi.value / 50;
        const timer = setInterval(() => {
          current += increment;
          if (current >= kpi.value) {
            current = kpi.value;
            clearInterval(timer);
          }
          setAnimatedKPIs(prev => {
            const newValues = [...prev];
            newValues[index] = Math.floor(current);
            return newValues;
          });
        }, 30);
      }, index * 200);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  const handleDragStart = (e, candidate) => {
    setDraggedCandidate(candidate);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, newStage) => {
    e.preventDefault();
    if (draggedCandidate) {
      setCandidates(prev => 
        prev.map(candidate => 
          candidate.id === draggedCandidate.id 
            ? { ...candidate, stage: newStage }
            : candidate
        )
      );
      setDraggedCandidate(null);
    }
  };

  const stages = ['Postulado', 'Evaluado', 'Entrevistando', 'Oferta', 'Contratado'];

  // Navigation function
  const handleNavigation = (view) => {
    if (view === 'overview') {
      setSelectedView('overview');
      router.push('/company');
    } else if (view === 'candidates') {
      router.push('/company/candidates');
    } else {
      setSelectedView(view);
      router.push(`/company/${view}`);
    }
  };

  const renderKPICards = () => (
    <div className="kpi-grid">
      {kpiData.map((kpi, index) => (
        <div key={index} className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-icon">{kpi.icon}</span>
            <FaExpand className="kpi-expand" />
          </div>
          <div className="kpi-value">
            {index === 2 ? `${animatedKPIs[index]}%` : animatedKPIs[index]}
          </div>
          <div className="kpi-title">{kpi.title}</div>
          <div className="kpi-trend">{kpi.trend}</div>
        </div>
      ))}
    </div>
  );

  const renderAIRecommendations = () => (
    <div className="ai-section">
      <div className="ai-header">
        <h3 className="ai-title">
          <FaRobot className="ai-robot-icon" />
          Coincidencias de Superpoderes IA
        </h3>
        <button className="simulator-btn">
          Simulador de Escenarios
        </button>
      </div>
      <div className="talent-grid">
        {candidates.slice(0, 5).map((candidate) => (
          <div key={candidate.id} className="talent-card">
            <div className="talent-header">
              <div className="talent-superpower">{candidate.superpower}</div>
              <div className="talent-info">
                <h4>{candidate.name}</h4>
                <div className="talent-location">{candidate.location}</div>
              </div>
            </div>
            <div className="talent-match">Coincidencia: {candidate.match}%</div>
            <div className="talent-actions">
              <button className="action-btn btn-invite">
                <FaEnvelope /> Invitar
              </button>
              <button className="action-btn btn-schedule">
                <FaCalendarAlt /> Agendar
              </button>
              <button className="action-btn btn-save">
                <FaSave />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderKanbanBoard = () => (
    <div className="kanban-section">
      <div className="kanban-header">
        <FaUsers className="kanban-users-icon" />
        <h3 className="kanban-title">Pipeline de Candidatos</h3>
      </div>
      <div className="kanban-grid">
        {stages.map((stage) => (
          <div
            key={stage}
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage)}
          >
            <h4 className="kanban-column-title">{stage}</h4>
            <div className="kanban-cards">
              {candidates.filter(c => c.stage === stage).map((candidate) => (
                <div
                  key={candidate.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, candidate)}
                  className="kanban-card"
                >
                  <div className="card-header">
                    <div className="card-superpower">{candidate.superpower}</div>
                    <div className="card-name">{candidate.name}</div>
                    <FaGripVertical className="card-drag-handle" />
                  </div>
                  <div className="card-match">Coincidencia: {candidate.match}%</div>
                  <div className="card-skills">{candidate.skills.join(', ')}</div>
                  <button className="neuroagent-btn">
                    <FaRobot /> Preguntar a NeuroAgent
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );







  return (
    <div className="company-dashboard-area">
      <div className="dashboard-container">
        {/* Sidebar */}
        <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarOpen ? 'open' : ''}`}>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <FaChevronLeft />
          </button>
          
          <div className="sidebar-logo">
            <div className="logo-text">DiversIA</div>
          </div>
          
          <nav className="nav-menu">
            <div className="nav-item">
              <a href="#" className={`nav-link ${selectedView === 'overview' ? 'active' : ''}`} onClick={() => handleNavigation('overview')}>
                <FaHome className="nav-icon" />
                <span className="nav-text">Resumen</span>
              </a>
            </div>
            <div className="nav-item">
              <a href="#" className={`nav-link ${selectedView === 'candidates' ? 'active' : ''}`} onClick={() => handleNavigation('candidates')}>
                <FaUsers className="nav-icon" />
                <span className="nav-text">Candidatos</span>
              </a>
            </div>
            <div className="nav-item">
              <a href="#" className={`nav-link ${selectedView === 'analytics' ? 'active' : ''}`} onClick={() => handleNavigation('analytics')}>
                <FaChartBar className="nav-icon" />
                <span className="nav-text">Análisis</span>
              </a>
            </div>
            <div className="nav-item">
              <a href="#" className={`nav-link ${selectedView === 'training' ? 'active' : ''}`} onClick={() => handleNavigation('training')}>
                <FaGraduationCap className="nav-icon" />
                <span className="nav-text">Capacitación</span>
              </a>
            </div>
            <div className="nav-item">
              <a href="#" className={`nav-link ${selectedView === 'settings' ? 'active' : ''}`} onClick={() => handleNavigation('settings')}>
                <FaCog className="nav-icon" />
                <span className="nav-text">Configuración</span>
              </a>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Top Bar */}
          <div className="top-bar">
            <h1 className="page-title">
              <FaUserTie className="page-title-icon" />
              Panel de Empresa
            </h1>
            
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Buscar talento..." 
                className="search-input focus-ring"
              />
              <button className="action-btn">
                <FaFilter />
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="kpi-grid">
            {kpiData.map((kpi, index) => (
              <div key={index} className="kpi-card hover-lift">
                <div className="kpi-header">
                  <span className="kpi-icon">{kpi.icon}</span>
                  <FaExpand className="kpi-expand" />
                </div>
                <div className="kpi-value">
                  {index === 2 ? `${animatedKPIs[index]}%` : animatedKPIs[index]}
                </div>
                <div className="kpi-title">{kpi.title}</div>
                <div className="kpi-trend">{kpi.trend}</div>
              </div>
            ))}
          </div>

          {/* AI Recommendations */}
          <div className="ai-section">
            <div className="ai-header">
              <h3 className="ai-title">
                <FaRobot className="ai-robot-icon" />
                Coincidencias de Superpoderes IA
              </h3>
              <button className="simulator-btn">
                Simulador de Escenarios
              </button>
            </div>
            <div className="talent-grid">
              {candidates.slice(0, 5).map((candidate) => (
                <div key={candidate.id} className="talent-card hover-lift">
                  <div className="talent-header">
                    <div className="talent-superpower">{candidate.superpower}</div>
                    <div className="talent-info">
                      <h4>{candidate.name}</h4>
                      <div className="talent-location">{candidate.location}</div>
                    </div>
                  </div>
                  <div className="talent-match">Coincidencia: {candidate.match}%</div>
                  <div className="talent-actions">
                    <button className="action-btn btn-invite">
                      <FaEnvelope /> Invitar
                    </button>
                    <button className="action-btn btn-schedule">
                      <FaCalendarAlt /> Agendar
                    </button>
                    <button className="action-btn btn-save">
                      <FaSave />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kanban Board */}
          <div className="kanban-section">
            <div className="kanban-header">
              <h3 className="kanban-title">
                <FaUsers className="kanban-users-icon" />
                Pipeline de Candidatos
              </h3>
            </div>
            <div className="kanban-grid">
              {stages.map((stage) => (
                <div 
                  key={stage}
                  className="kanban-column"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage)}
                >
                  <h4 className="kanban-column-title">{stage}</h4>
                  <div className="kanban-cards">
                    {candidates.filter(c => c.stage === stage).map((candidate) => (
                      <div
                        key={candidate.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, candidate)}
                        className="kanban-card hover-lift"
                      >
                        <div className="card-header">
                          <div className="card-superpower">{candidate.superpower}</div>
                          <div className="card-name">{candidate.name}</div>
                          <FaGripVertical className="card-drag-handle" />
                        </div>
                        <div className="card-match">Coincidencia: {candidate.match}%</div>
                        <div className="card-skills">{candidate.skills.join(', ')}</div>
                        <button className="neuroagent-btn">
                          <FaRobot /> Preguntar a NeuroAgent
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Widget */}
      <div className="chat-widget">
        <button className="chat-toggle" onClick={() => setChatOpen(!chatOpen)}>
          <FaRobot />
        </button>
      </div>
    </div>
  );
}