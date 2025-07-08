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
  { title: "Active Searches", value: 12, trend: "+2 this week", icon: "🎯" },
  { title: "Candidates in Pipeline", value: 45, trend: "+8 this week", icon: "👥" },
  { title: "Placement Success Rate", value: 92, trend: "+3% this month", icon: "🏆" },
];

const trainingModules = [
  { name: "Understanding ADHD", progress: 85, certified: true },
  { name: "Inclusive Communication", progress: 60, certified: false },
  { name: "Autism Awareness", progress: 100, certified: true },
  { name: "Dyslexia Support", progress: 30, certified: false },
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

  const stages = ['Applied', 'Assessed', 'Interviewing', 'Offer', 'Hired'];

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {kpiData.map((kpi, index) => (
        <div key={index} className="bg-zinc-800 rounded-xl p-6 border border-purple-500/20 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">{kpi.icon}</span>
            <FaExpand className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-3xl font-bold text-yellow-400 mb-2">
            {index === 2 ? `${animatedKPIs[index]}%` : animatedKPIs[index]}
          </div>
          <div className="text-white font-semibold mb-1">{kpi.title}</div>
          <div className="text-green-400 text-sm">{kpi.trend}</div>
        </div>
      ))}
    </div>
  );

  const renderAIRecommendations = () => (
    <div className="bg-zinc-800 rounded-xl p-6 border border-purple-500/20 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
          <FaRobot className="text-purple-400" />
          AI Superpower Matches
        </h3>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          What-If Simulator
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {candidates.slice(0, 5).map((candidate) => (
          <div key={candidate.id} className="bg-zinc-900 rounded-lg p-4 border border-yellow-500/20 hover:border-yellow-500/50 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-2xl">{candidate.superpower}</div>
              <div>
                <div className="font-semibold text-white">{candidate.name}</div>
                <div className="text-sm text-gray-400">{candidate.location}</div>
              </div>
            </div>
            <div className="text-green-400 font-bold mb-3">Match: {candidate.match}%</div>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors">
                <FaEnvelope className="inline mr-1" /> Invite
              </button>
              <button className="flex-1 px-3 py-1 bg-yellow-600 text-black rounded text-sm hover:bg-yellow-700 transition-colors">
                <FaCalendarAlt className="inline mr-1" /> Schedule
              </button>
              <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors">
                <FaSave />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderKanbanBoard = () => (
    <div className="bg-zinc-800 rounded-xl p-6 border border-purple-500/20 mb-8">
      <h3 className="text-xl font-bold text-yellow-400 mb-6 flex items-center gap-2">
        <FaUsers className="text-purple-400" />
        Candidate Pipeline
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stages.map((stage) => (
          <div 
            key={stage}
            className="bg-zinc-900 rounded-lg p-4 min-h-96"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage)}
          >
            <h4 className="font-semibold text-white mb-4 text-center">{stage}</h4>
            <div className="space-y-3">
              {candidates.filter(c => c.stage === stage).map((candidate) => (
                <div
                  key={candidate.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, candidate)}
                  className="bg-zinc-800 rounded-lg p-3 border border-purple-500/20 cursor-move hover:border-yellow-500/50 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-lg">{candidate.superpower}</div>
                    <div className="font-semibold text-white text-sm">{candidate.name}</div>
                    <FaGripVertical className="text-gray-500 ml-auto" />
                  </div>
                  <div className="text-green-400 text-sm font-bold mb-2">Match: {candidate.match}%</div>
                  <div className="text-gray-400 text-xs mb-2">{candidate.skills.join(', ')}</div>
                  <button className="w-full px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors">
                    <FaRobot className="inline mr-1" /> Ask NeuroAgent
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
                <span className="nav-text">Overview</span>
              </a>
            </div>
            <div className="nav-item">
              <a href="#" className={`nav-link ${selectedView === 'candidates' ? 'active' : ''}`} onClick={() => handleNavigation('candidates')}>
                <FaUsers className="nav-icon" />
                <span className="nav-text">Candidates</span>
              </a>
            </div>
            <div className="nav-item">
              <a href="#" className={`nav-link ${selectedView === 'analytics' ? 'active' : ''}`} onClick={() => handleNavigation('analytics')}>
                <FaChartBar className="nav-icon" />
                <span className="nav-text">Analytics</span>
              </a>
            </div>
            <div className="nav-item">
              <a href="#" className={`nav-link ${selectedView === 'training' ? 'active' : ''}`} onClick={() => handleNavigation('training')}>
                <FaGraduationCap className="nav-icon" />
                <span className="nav-text">Training</span>
              </a>
            </div>
            <div className="nav-item">
              <a href="#" className={`nav-link ${selectedView === 'settings' ? 'active' : ''}`} onClick={() => handleNavigation('settings')}>
                <FaCog className="nav-icon" />
                <span className="nav-text">Settings</span>
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
              Company Dashboard
            </h1>
            
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Search talent..." 
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
                AI Superpower Matches
              </h3>
              <button className="simulator-btn">
                What-If Simulator
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
                  <div className="talent-match">Match: {candidate.match}%</div>
                  <div className="talent-actions">
                    <button className="action-btn btn-invite">
                      <FaEnvelope /> Invite
                    </button>
                    <button className="action-btn btn-schedule">
                      <FaCalendarAlt /> Schedule
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
                Candidate Pipeline
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
                        <div className="card-match">Match: {candidate.match}%</div>
                        <div className="card-skills">{candidate.skills.join(', ')}</div>
                        <button className="neuroagent-btn">
                          <FaRobot /> Ask NeuroAgent
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