"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  FaUserTie, FaSearch, FaFilter, FaEnvelope, FaBell, FaUser, FaCog, 
  FaHome, FaUsers, FaBullseye, FaChartBar, FaCalendarAlt, FaBriefcase,
  FaBalanceScale, FaChevronLeft, FaChevronRight, FaRobot, FaGraduationCap,
  FaMapMarkerAlt, FaExpand, FaEye, FaHandshake, FaSave, FaEdit,
  FaPlay, FaDownload, FaLightbulb, FaGamepad, FaGripVertical,
  FaStethoscope, FaHeart, FaClipboardList, FaUserMd, FaVideo,
  FaFileAlt, FaUpload, FaShareAlt, FaCheckCircle, FaExclamationTriangle,
  FaStar, FaThumbsUp, FaThumbsDown, FaComments, FaClock, FaFlag,
  FaBrain, FaSync, FaPlus, FaMinus,
  FaChevronDown, FaChevronUp, FaTimes, FaArrowRight, FaArrowLeft,
  FaDatabase, FaChartLine, FaUserCheck, FaBuilding, FaUserClock,
  FaFileSignature, FaClipboard, FaBookOpen, FaHeadphones, FaMicrophone,
  FaHeartbeat, FaShieldAlt, FaRocket, FaCrown, FaGem,
  FaCheckDouble, FaPercentage, FaAward, FaTrophy,
  FaUserFriends, FaNetworkWired, FaCompass, FaTarget, FaMagic,
  FaCogs, FaChartPie, FaUsersCog, FaUserGraduate
} from "react-icons/fa";
import "./therapist.css";

const TherapistDashboard = ({ defaultView = 'overview' }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedView, setSelectedView] = useState(defaultView);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [accommodationBuilder, setAccommodationBuilder] = useState(false);
  const [animatedKPIs, setAnimatedKPIs] = useState([0, 0, 0, 0, 0, 0]);
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [aiAssistant, setAiAssistant] = useState(false);
  const [videoCall, setVideoCall] = useState(false);
  const [liveConsultation, setLiveConsultation] = useState(false);
  
  // New state for matching system
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [matchingMode, setMatchingMode] = useState('browse'); // browse, candidate-detail, company-detail, create-match
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [matchInProgress, setMatchInProgress] = useState(null);

  // Enhanced sample data with comprehensive company and candidate information
  const companies = [
    {
      id: 1,
      name: "TechCorp Solutions",
      industry: "Technology",
      size: "500-1000 employees",
      location: "San Francisco, CA",
      culture: "Innovation-driven, flexible work environment",
      neurodiversitySupport: "Comprehensive accommodation program",
      openPositions: [
        {
          id: 1,
          title: "Software Engineer",
          department: "Engineering",
          requirements: ["JavaScript", "React", "Node.js", "Problem-solving"],
          accommodations: ["Flexible hours", "Quiet workspace", "Written instructions"],
          matchScore: 0
        },
        {
          id: 2,
          title: "UX Designer",
          department: "Design",
          requirements: ["Figma", "User research", "Creativity", "Communication"],
          accommodations: ["Visual aids", "Structured feedback", "Remote work options"],
          matchScore: 0
        }
      ],
      benefits: ["Health insurance", "Flexible PTO", "Professional development", "Mental health support"],
      contactPerson: "Sarah Johnson",
      contactEmail: "sarah.johnson@techcorp.com"
    },
    {
      id: 2,
      name: "InnovateLabs",
      industry: "Research & Development",
      size: "100-250 employees",
      location: "Austin, TX",
      culture: "Collaborative, research-focused, inclusive",
      neurodiversitySupport: "Dedicated neurodiversity coordinator",
      openPositions: [
        {
          id: 3,
          title: "Data Analyst",
          department: "Analytics",
          requirements: ["Python", "SQL", "Statistical analysis", "Attention to detail"],
          accommodations: ["Structured environment", "Extended deadlines", "Clear documentation"],
          matchScore: 0
        },
        {
          id: 4,
          title: "Research Assistant",
          department: "R&D",
          requirements: ["Research methodology", "Data collection", "Report writing", "Organization"],
          accommodations: ["Task management tools", "Regular check-ins", "Written protocols"],
          matchScore: 0
        }
      ],
      benefits: ["Competitive salary", "Research opportunities", "Conference attendance", "Flexible scheduling"],
      contactPerson: "Michael Chen",
      contactEmail: "michael.chen@innovatelabs.com"
    },
    {
      id: 3,
      name: "DataFlow Systems",
      industry: "Data & Analytics",
      size: "250-500 employees",
      location: "Seattle, WA",
      culture: "Data-driven, supportive, growth-oriented",
      neurodiversitySupport: "Neurodiversity employee resource group",
      openPositions: [
        {
          id: 5,
          title: "UX Designer",
          department: "Product",
          requirements: ["Design thinking", "Prototyping", "User testing", "Collaboration"],
          accommodations: ["Visual project management", "Structured design reviews", "Remote collaboration tools"],
          matchScore: 0
        }
      ],
      benefits: ["Stock options", "Health benefits", "Learning budget", "Work-life balance"],
      contactPerson: "Emma Thompson",
      contactEmail: "emma.thompson@dataflow.com"
    }
  ];

  const candidates = [
    {
      id: 1,
      name: "Alex Chen",
      age: 28,
      condition: "ADHD",
      location: "San Francisco, CA",
      education: "BS Computer Science, Stanford University",
      experience: "3 years software development",
      skills: ["JavaScript", "React", "Node.js", "Problem-solving", "Innovation"],
      strengths: ["Hyperfocus on complex problems", "Creative solutions", "Quick learning", "Adaptability"],
      challenges: ["Time management", "Distraction sensitivity", "Organization"],
      accommodations: ["Flexible work hours", "Quiet workspace", "Written task lists", "Regular breaks"],
      interests: ["AI/ML", "Gaming", "Music production"],
      availability: "Immediate",
      salaryExpectation: "$80,000 - $100,000",
      preferredWorkStyle: "Hybrid",
      communicationStyle: "Written preferred",
      lastAssessment: "2024-01-10",
      assessmentScores: {
        attention: 85,
        creativity: 95,
        problemSolving: 90,
        communication: 75,
        organization: 70
      },
      gameMetrics: {
        patternMatrix: { score: 92, accuracy: 88, reactionTime: 1.2 },
        memoryGrid: { score: 87, accuracy: 91, reactionTime: 0.9 },
        operacion: { score: 95, accuracy: 93, reactionTime: 1.1 }
      },
      superpower: "Hyperfocus Innovation",
      wellbeingScore: 8.2,
      retentionRisk: "Low"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      age: 32,
      condition: "Autism Spectrum",
      location: "Austin, TX",
      education: "MS Data Science, University of Texas",
      experience: "5 years data analysis",
      skills: ["Python", "SQL", "Statistical analysis", "Data visualization", "Research"],
      strengths: ["Pattern recognition", "Attention to detail", "Logical thinking", "Consistency"],
      challenges: ["Social communication", "Change management", "Sensory sensitivity"],
      accommodations: ["Structured environment", "Written instructions", "Quiet workspace", "Clear expectations"],
      interests: ["Data science", "Research", "Puzzles"],
      availability: "2 weeks notice",
      salaryExpectation: "$70,000 - $90,000",
      preferredWorkStyle: "Remote",
      communicationStyle: "Written and structured",
      lastAssessment: "2024-01-08",
      assessmentScores: {
        attention: 95,
        creativity: 80,
        problemSolving: 92,
        communication: 65,
        organization: 90
      },
      gameMetrics: {
        patternMatrix: { score: 98, accuracy: 95, reactionTime: 0.8 },
        memoryGrid: { score: 89, accuracy: 92, reactionTime: 1.0 },
        operacion: { score: 91, accuracy: 89, reactionTime: 1.3 }
      },
      superpower: "Pattern Recognition Master",
      wellbeingScore: 7.8,
      retentionRisk: "Medium"
    },
    {
      id: 3,
      name: "Marcus Rodriguez",
      age: 25,
      condition: "Dyslexia",
      location: "Seattle, WA",
      education: "BFA Design, Art Institute",
      experience: "2 years UX/UI design",
      skills: ["Figma", "User research", "Prototyping", "Creativity", "Empathy"],
      strengths: ["Visual thinking", "Creative problem-solving", "User empathy", "Innovation"],
      challenges: ["Reading speed", "Written communication", "Spelling"],
      accommodations: ["Text-to-speech software", "Visual aids", "Extra time for reading", "Spell-check tools"],
      interests: ["Design", "Art", "User experience"],
      availability: "Immediate",
      salaryExpectation: "$60,000 - $80,000",
      preferredWorkStyle: "Hybrid",
      communicationStyle: "Visual and verbal",
      lastAssessment: "2024-01-05",
      assessmentScores: {
        attention: 75,
        creativity: 95,
        problemSolving: 85,
        communication: 80,
        organization: 70
      },
      gameMetrics: {
        patternMatrix: { score: 78, accuracy: 82, reactionTime: 1.5 },
        memoryGrid: { score: 85, accuracy: 88, reactionTime: 1.2 },
        operacion: { score: 88, accuracy: 85, reactionTime: 1.4 }
      },
      superpower: "Creative Problem Solver",
      wellbeingScore: 6.9,
      retentionRisk: "High"
    }
  ];

  const kpiData = [
    { title: "Clientes Activos", value: 18, trend: "+3 este mes", icon: "👥", color: "purple" },
    { title: "Sesiones Esta Semana", value: 24, trend: "+5 esta semana", icon: "📅", color: "blue" },
    { title: "Tasa de Éxito", value: 87, trend: "+2% este mes", icon: "📈", color: "green" },
    { title: "Referencias Pendientes", value: 12, trend: "+4 pendientes", icon: "⏳", color: "orange" },
    { title: "Acomodaciones Creadas", value: 34, trend: "+8 este mes", icon: "🎯", color: "pink" },
    { title: "Bienestar Promedio", value: 8.1, trend: "+0.3 este mes", icon: "💚", color: "emerald" },
  ];

  const upcomingSessions = [
    { id: 1, client: "Alex Chen", time: "Today, 2:00 PM", type: "ADHD Assessment", status: "Confirmed", platform: "Zoom" },
    { id: 2, client: "Sarah Johnson", time: "Tomorrow, 10:00 AM", type: "Progress Review", status: "Pending", platform: "Teams" },
    { id: 3, client: "Marcus Rodriguez", time: "Wednesday, 3:30 PM", type: "Therapy Session", status: "Confirmed", platform: "In-person" },
    { id: 4, client: "Emma Thompson", time: "Friday, 11:00 AM", type: "Accommodation Planning", status: "Tentative", platform: "Zoom" },
  ];

  const accommodationTemplates = [
    { name: "ADHD Workplace Support", category: "Attention", features: ["Flexible breaks", "Noise control", "Task management tools"] },
    { name: "Autism Communication Kit", category: "Communication", features: ["Written instructions", "Structured meetings", "Sensory accommodations"] },
    { name: "Dyslexia Reading Support", category: "Learning", features: ["Text-to-speech", "Extended time", "Alternative formats"] },
    { name: "Executive Function Booster", category: "Organization", features: ["Task prioritization", "Time management", "Reminder systems"] },
  ];

  // Animation effects
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
            newValues[index] = Math.floor(current * 10) / 10;
            return newValues;
          });
        }, 30);
      }, index * 200);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  // Navigation function
  const handleNavigation = (view) => {
    setSelectedView(view);
    setModalOpen(false);
    setSelectedClient(null);
    setSelectedCandidate(null);
    setSelectedCompany(null);
    setMatchingMode('browse');
  };

  // Modal functions
  const openModal = (content, title) => {
    setModalContent({ content, title });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  // Matching system functions
  const handleStartMatching = (candidate, company) => {
    setSelectedCandidate(candidate);
    setSelectedCompany(company);
    setMatchingMode('create-match');
  };

  const handleCreateMatch = (match) => {
    setMatches(prev => [...prev, match]);
    setMatchingMode('browse');
    setSelectedCandidate(null);
    setSelectedCompany(null);
    // Show success notification
    setNotifications(prev => [...prev, {
      id: Date.now(),
      type: 'success',
      message: `Perfect match created: ${match.candidate.name} → ${match.company.name}`,
      timestamp: new Date()
    }]);
  };

  const handleSendApplication = (candidate, company, position, message) => {
    const application = {
      id: Date.now(),
      candidate: candidate,
      company: company,
      position: position,
      message: message,
      status: 'sent',
      sentAt: new Date().toISOString(),
      therapist: "Dr. Therapist"
    };
    
    setMatches(prev => [...prev, application]);
    setMatchingMode('browse');
    setSelectedCandidate(null);
    setSelectedCompany(null);
    
    // Show success notification
    setNotifications(prev => [...prev, {
      id: Date.now(),
      type: 'success',
      message: `Candidate Application match sent: ${candidate.name} → ${company.name}`,
      timestamp: new Date()
    }]);
  };

  // Bookings Calendar Component
  const BookingsCalendar = () => (
    <div className="therapist-bookings-section">
      <div className="therapist-bookings-header">
        <h3 className="therapist-bookings-title">
          <FaCalendarAlt className="therapist-bookings-icon" />
          Calendario de Reservas
        </h3>
        <div className="therapist-bookings-controls">
          <button className="therapist-btn therapist-btn-active">Vista Semanal</button>
          <button className="therapist-btn therapist-btn-secondary">Vista Mensual</button>
        </div>
      </div>
      <div className="therapist-bookings-list">
        {upcomingSessions.map((session, index) => (
          <div key={session.id} className="therapist-booking-item">
            <div className="therapist-booking-content">
              <div className="therapist-booking-info">
                <div className={`therapist-booking-status therapist-booking-status-${session.status.toLowerCase()}`}></div>
                <div className="therapist-booking-details">
                  <div className="therapist-booking-details-header">
                    <span className="therapist-booking-details-name">{session.client}</span>
                    <span className="therapist-booking-platform">via {session.platform}</span>
                  </div>
                  <div className="therapist-booking-type">{session.type}</div>
                </div>
              </div>
              <div className="therapist-booking-actions">
                <div className="therapist-booking-time">{session.time}</div>
                <div className="therapist-booking-buttons">
                  <button className="therapist-btn therapist-btn-join">
                    <FaVideo className="therapist-btn-icon" /> Unirse
                  </button>
                  <button className="therapist-btn therapist-btn-remind">
                    <FaEnvelope className="therapist-btn-icon" /> Recordar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="therapist-bookings-footer">
        <button className="therapist-btn therapist-btn-add-session">
          <FaPlus className="therapist-btn-icon" />
          Agregar Nuevo Espacio de Sesión
        </button>
      </div>
    </div>
  );

  // Impact Dashboard Component
  const ImpactDashboard = () => (
    <div className="therapist-impact-section">
      <h3 className="therapist-impact-title">
        <FaChartBar className="therapist-impact-icon" />
        Panel de Impacto
      </h3>
      <div className="therapist-impact-grid">
        <div className="therapist-wellbeing-card">
          <h4 className="therapist-wellbeing-title">Tendencias de Bienestar</h4>
          <div className="therapist-wellbeing-chart">
            {[
              { month: "Jan", score: 7.2 },
              { month: "Feb", score: 7.8 },
              { month: "Mar", score: 8.1 },
              { month: "Apr", score: 8.4 },
            ].map((data, index) => (
              <div key={index} className="therapist-wellbeing-row">
                <span className="therapist-wellbeing-month">{data.month}</span>
                <div className="therapist-wellbeing-progress-container">
                  <div className="therapist-wellbeing-progress">
                    <div 
                      className="therapist-wellbeing-progress-bar"
                      style={{ width: `${(data.score / 10) * 100}%` }}
                    ></div>
                  </div>
                  <span className="therapist-wellbeing-score">{data.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="therapist-retention-card">
          <h4 className="therapist-retention-title">Métricas de Retención</h4>
          <div className="therapist-retention-content">
            <div className="therapist-retention-rate">94%</div>
            <div className="therapist-retention-label">Tasa de Retención a 6 Meses</div>
            <div className="therapist-retention-breakdown">
              <div className="therapist-retention-item">
                <span className="therapist-retention-risk">Riesgo Alto</span>
                <span className="therapist-retention-count therapist-retention-high">2 clientes</span>
              </div>
              <div className="therapist-retention-item">
                <span className="therapist-retention-risk">Riesgo Medio</span>
                <span className="therapist-retention-count therapist-retention-medium">5 clientes</span>
              </div>
              <div className="therapist-retention-item">
                <span className="therapist-retention-risk">Riesgo Bajo</span>
                <span className="therapist-retention-count therapist-retention-low">11 clientes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="therapist-success-stories">
        <h4 className="therapist-success-title">Historias de Éxito</h4>
        <div className="therapist-success-quote">
          "El plan de acomodaciones ha cambiado mi vida. Soy más productivo y menos estresado en el trabajo." - Alex C.
        </div>
      </div>
    </div>
  );

  // AI Assistant Component
  const AIAssistant = () => (
    <div className={`therapist-ai-assistant${aiAssistant ? ' expanded' : ''}`}>
      <div className="therapist-ai-header">
        <div className="therapist-ai-title">
          <FaRobot className="therapist-ai-robot-icon" />
          {aiAssistant && <span className="therapist-ai-name">NeuroAgent</span>}
        </div>
        <button 
          onClick={() => setAiAssistant(!aiAssistant)}
          className="therapist-ai-toggle"
        >
          {aiAssistant ? <FaTimes /> : <FaComments />}
        </button>
      </div>
      {aiAssistant && (
        <div className="therapist-ai-content">
          <div className="therapist-ai-intro">
            <p className="therapist-ai-intro-text">¡Hola Dr. Terapeuta! Puedo ayudarte con:</p>
            <ul className="therapist-ai-features">
              <li>• Sugerencias de notas clínicas</li>
              <li>• Planificación de acomodaciones</li>
              <li>• Análisis de evaluaciones</li>
              <li>• Seguimiento de progreso</li>
            </ul>
          </div>
          <div className="therapist-ai-input">
            <input 
              type="text" 
              placeholder="Pregúntame cualquier cosa..." 
              className="therapist-ai-text-input"
            />
            <button className="therapist-ai-send-btn">
              <FaArrowRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Video Call Interface Component
  const VideoCallInterface = () => (
    <div className="therapist-video-overlay">
      <div className="therapist-video-container">
        <div className="therapist-video-header">
          <div className="therapist-video-info">
            <FaVideo className="therapist-video-icon" />
            <span className="therapist-video-title">Consulta en Vivo - Alex Chen</span>
            <span className="therapist-video-status">EN VIVO</span>
          </div>
          <button 
            onClick={() => setVideoCall(false)}
            className="therapist-video-close"
          >
            <FaTimes />
          </button>
        </div>
        <div className="therapist-video-main">
          <div className="therapist-video-placeholder">
            <div className="therapist-video-avatar">
              <FaUser className="therapist-video-avatar-icon" />
            </div>
            <p className="therapist-video-client-name">Alex Chen</p>
            <p className="therapist-video-status-text">Conectado</p>
          </div>
        </div>
        <div className="therapist-video-controls">
          <button className="therapist-video-control therapist-video-mute">
            <FaMicrophone />
          </button>
          <button className="therapist-video-control therapist-video-camera">
            <FaVideo />
          </button>
          <button className="therapist-video-control therapist-video-chat">
            <FaComments />
          </button>
          <button className="therapist-video-control therapist-video-share">
            <FaShareAlt />
          </button>
          <button className="therapist-video-control therapist-video-end">
            <FaTimes />
          </button>
        </div>
      </div>
    </div>
  );

  // KPI Cards Component
  const KPICards = () => (
    <div className="therapist-kpi-grid">
      {kpiData.map((kpi, index) => (
        <div key={index} className="therapist-kpi-card">
          <div className="therapist-kpi-header">
            <span className="therapist-kpi-icon">{kpi.icon}</span>
            <FaExpand className="therapist-kpi-expand" />
          </div>
          <div className="therapist-kpi-value">
            {index === 2 || index === 5 ? `${animatedKPIs[index]}${index === 2 ? '%' : ''}` : Math.floor(animatedKPIs[index])}
          </div>
          <div className="therapist-kpi-title">{kpi.title}</div>
          <div className="therapist-kpi-trend">
            <FaChartLine className="therapist-kpi-trend-icon" />
            {kpi.trend}
          </div>
          <div className="therapist-kpi-progress">
            <div 
              className="therapist-kpi-progress-bar"
              style={{ width: `${(animatedKPIs[index] / kpi.value) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Referral Queue Component
  const ReferralQueue = () => (
    <div className="therapist-referral-section">
      <div className="therapist-referral-header">
        <h3 className="therapist-referral-title">
          <FaClipboard className="therapist-referral-icon" />
          Cola de Referencias
          <span className="therapist-referral-count">{referralQueue.filter(r => r.status === 'Pending').length}</span>
        </h3>
        <div className="therapist-referral-controls">
          <div className="therapist-search-box">
            <FaSearch className="therapist-search-icon" />
            <input 
              type="text" 
              placeholder="Buscar referencias..." 
              className="therapist-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="therapist-filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Todos los Estados</option>
            <option value="Pending">Pendiente</option>
            <option value="In Review">En Revisión</option>
            <option value="Completed">Completado</option>
          </select>
        </div>
      </div>
      <div className="therapist-referral-list">
        {referralQueue.map((referral) => (
          <div key={referral.id} className="therapist-referral-item">
            <div className="therapist-referral-content">
              <div className="therapist-referral-info">
                <div className={`therapist-urgency-indicator therapist-urgency-${referral.urgency.toLowerCase()}`}></div>
                <div className="therapist-referral-details">
                  <div className="therapist-referral-details-header">
                    <span className="therapist-referral-details-name">{referral.name}</span>
                    <span className={`therapist-referral-type therapist-referral-type-${referral.type.toLowerCase()}`}>{referral.type}</span>
                  </div>
                  <div className="therapist-referral-meta">
                    {referral.company} • {referral.condition} • {referral.date}
                  </div>
                </div>
              </div>
              <div className="therapist-referral-actions">
                <span className={`therapist-status-badge therapist-status-${referral.status.replace(' ', '').toLowerCase()}`}>{referral.status}</span>
                <button 
                  onClick={() => setSelectedClient(referral)}
                  className="therapist-btn therapist-btn-primary"
                >
                  <FaEye className="therapist-btn-icon" /> Revisar
                </button>
                <button className="therapist-btn therapist-btn-secondary">
                  <FaCalendarAlt className="therapist-btn-icon" /> Programar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Updated referral queue data
  const referralQueue = [
    { id: 1, type: "Candidate", name: "Alex Chen", company: "TechCorp", priority: "High", date: "2024-01-15", status: "Pending", condition: "ADHD", urgency: "Critical" },
    { id: 2, type: "Company", name: "Sarah Johnson", company: "InnovateLabs", priority: "Medium", date: "2024-01-14", status: "In Review", condition: "Autism", urgency: "Standard" },
    { id: 3, type: "Candidate", name: "Marcus Rodriguez", company: "DataFlow", priority: "High", date: "2024-01-13", status: "Pending", condition: "Dyslexia", urgency: "High" },
    { id: 4, type: "Company", name: "Emma Thompson", company: "CloudTech", priority: "Low", date: "2024-01-12", status: "Completed", condition: "Dyspraxia", urgency: "Low" },
  ];

  // Client Profile Review Component
  const ClientProfileReview = ({ client }) => (
    <div className="therapist-client-profile">
      {/* Client Header */}
      <div className="therapist-client-header">
        <div className="therapist-client-header-content">
          <div className="therapist-client-info">
            <div className="therapist-client-avatar">
              <FaUser className="therapist-client-avatar-icon" />
            </div>
            <div className="therapist-client-details">
              <h3 className="therapist-client-name">{client.name}</h3>
              <p className="therapist-client-meta">{client.age} years • {client.condition}</p>
              <p className="therapist-client-company">{client.company} • {client.role}</p>
            </div>
          </div>
          <div className="therapist-client-stats">
            <div className="therapist-client-progress-value">{client.progress}%</div>
            <div className="therapist-client-progress-label">Progreso</div>
            <div className="therapist-client-wellbeing">
              <span className="therapist-wellbeing-score">Bienestar: {client.wellbeingScore}/10</span>
              <span className={`therapist-risk-badge therapist-risk-${client.retentionRisk.toLowerCase()}`}>
                Riesgo {client.retentionRisk}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Data */}
      <div className="therapist-assessment-section">
        <h4 className="therapist-section-title">
          <FaGamepad className="therapist-section-icon" />
          Resultados de Evaluación de Juegos
        </h4>
        <div className="therapist-game-metrics">
          {Object.entries(client.gameMetrics).map(([game, metrics]) => (
            <div key={game} className="therapist-game-metric-card">
              <h5 className="therapist-game-metric-title">{game.replace(/([A-Z])/g, ' $1').trim()}</h5>
              <div className="therapist-game-metric-stats">
                <div className="therapist-metric-row">
                  <span className="therapist-metric-label">Puntuación</span>
                  <span className="therapist-metric-value therapist-metric-score">{metrics.score}</span>
                </div>
                <div className="therapist-metric-row">
                  <span className="therapist-metric-label">Precisión</span>
                  <span className="therapist-metric-value therapist-metric-accuracy">{metrics.accuracy}%</span>
                </div>
                <div className="therapist-metric-row">
                  <span className="therapist-metric-label">Tiempo de Reacción</span>
                  <span className="therapist-metric-value therapist-metric-reaction">{metrics.reactionTime}s</span>
                </div>
              </div>
              <div className="therapist-game-progress">
                <div 
                  className="therapist-game-progress-bar"
                  style={{ width: `${metrics.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Summary & Clinical Notes */}
      <div className="therapist-analysis-grid">
        <div className="therapist-ai-analysis">
          <h4 className="therapist-section-title">
            <FaRobot className="therapist-section-icon" />
            Resumen de Análisis de IA
          </h4>
          <div className="therapist-superpower-card">
            <div className="therapist-superpower-header">
              <FaStar className="therapist-superpower-icon" />
              <span className="therapist-superpower-label">Superpoder Identificado</span>
            </div>
            <p className="therapist-superpower-value">{client.superpower}</p>
          </div>
          <div className="therapist-analysis-content">
            <div className="therapist-analysis-item">
              <p className="therapist-analysis-text">
                <strong>Cognitive Profile:</strong> Shows exceptional pattern recognition abilities with strong visual-spatial processing. ADHD traits include hyperfocus periods that enhance deep work productivity.
              </p>
            </div>
            <div className="therapist-analysis-item">
              <p className="therapist-analysis-text">
                <strong>Workplace Strengths:</strong> Innovation during hyperfocus states, creative problem-solving, ability to see unique solutions others miss.
              </p>
            </div>
          </div>
        </div>
        <div className="therapist-clinical-notes">
          <h4 className="therapist-section-title">
            <FaEdit className="therapist-section-icon" />
            Notas Clínicas
          </h4>
          <textarea 
            className="therapist-notes-textarea"
            placeholder="Agregar observaciones clínicas, recomendaciones o notas..."
            defaultValue="Client shows significant improvement in attention regulation. Recommend continuing current accommodation plan with minor adjustments to break scheduling."
          />
          <div className="therapist-notes-footer">
            <div className="therapist-ai-assistant-hint">
              <FaRobot className="therapist-ai-hint-icon" />
              <span className="therapist-ai-hint-text">AI Assistant can help with phrasing</span>
            </div>
            <button className="therapist-btn therapist-btn-primary">
              <FaSave className="therapist-btn-icon" /> Guardar Notas
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="therapist-action-buttons">
        <button 
          onClick={() => setAccommodationBuilder(true)}
          className="therapist-btn therapist-btn-accommodation"
        >
          <FaBullseye className="therapist-btn-icon" />
          Crear Plan de Acomodaciones
        </button>
        <button 
          onClick={() => setVideoCall(true)}
          className="therapist-btn therapist-btn-video"
        >
          <FaVideo className="therapist-btn-icon" />
          Iniciar Sesión de Video
        </button>
        <button className="therapist-btn therapist-btn-schedule">
          <FaCalendarAlt className="therapist-btn-icon" />
          Programar Seguimiento
        </button>
      </div>
    </div>
  );

  // Accommodation Builder Component
  const AccommodationBuilder = () => (
    <div className="therapist-accommodation-builder">
      <div className="therapist-accommodation-header">
        <h3 className="therapist-accommodation-title">
          <FaBullseye className="therapist-accommodation-icon" />
          Constructor de Plan de Acomodaciones
        </h3>
        <button 
          onClick={() => setAccommodationBuilder(false)}
          className="therapist-close-btn"
        >
          <FaTimes />
        </button>
      </div>
      <div className="therapist-accommodation-content">
        {/* Template Selection */}
        <div className="therapist-template-section">
          <h4 className="therapist-template-title">Plantillas de Inicio Rápido</h4>
          <div className="therapist-template-grid">
            {accommodationTemplates.map((template, index) => (
              <div key={index} className="therapist-template-card">
                <div className="therapist-template-header">
                  <h5 className="therapist-template-name">{template.name}</h5>
                  <span className="therapist-template-category">{template.category}</span>
                </div>
                <div className="therapist-template-features">
                  {template.features.join(" • ")}
                </div>
                <button className="therapist-btn therapist-btn-template">
                  Usar Plantilla
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Builder */}
        <div className="therapist-custom-builder">
          <div className="therapist-builder-column">
            <h4 className="therapist-builder-title">Entorno y Espacio de Trabajo</h4>
            <div className="therapist-builder-group">
              <label className="therapist-builder-label">Preferencia de Nivel de Ruido</label>
              <div className="therapist-option-buttons">
                <button className="therapist-option-btn therapist-option-btn-active">Silencioso</button>
                <button className="therapist-option-btn">Moderado</button>
                <button className="therapist-option-btn">Fondo</button>
              </div>
            </div>
            <div className="therapist-builder-group">
              <label className="therapist-builder-label">Ajustes de Iluminación</label>
              <div className="therapist-checkbox-group">
                <label className="therapist-checkbox-item">
                  <input type="checkbox" className="therapist-checkbox" />
                  <span className="therapist-checkbox-label">Reduced fluorescent lighting</span>
                </label>
                <label className="therapist-checkbox-item">
                  <input type="checkbox" className="therapist-checkbox" />
                  <span className="therapist-checkbox-label">Natural light access</span>
                </label>
                <label className="therapist-checkbox-item">
                  <input type="checkbox" className="therapist-checkbox" />
                  <span className="therapist-checkbox-label">Task lighting</span>
                </label>
              </div>
            </div>
            <div className="therapist-builder-group">
              <label className="therapist-builder-label">Horario de Descansos</label>
              <div className="therapist-input-grid">
                <input type="number" placeholder="Duración (min)" className="therapist-input" />
                <input type="number" placeholder="Frecuencia (hrs)" className="therapist-input" />
              </div>
            </div>
          </div>
          <div className="therapist-builder-column">
            <h4 className="therapist-builder-title">Comunicación y Soporte</h4>
            <div className="therapist-builder-group">
              <label className="therapist-builder-label">Estilo de Comunicación Preferido</label>
              <select className="therapist-select">
                <option>Instrucciones escritas</option>
                <option>Verbal con seguimiento</option>
                <option>Ayudas visuales</option>
                <option>Reuniones uno a uno</option>
              </select>
            </div>
            <div className="therapist-builder-group">
              <label className="therapist-builder-label">Acomodaciones Tecnológicas</label>
              <div className="therapist-checkbox-group">
                <label className="therapist-checkbox-item">
                  <input type="checkbox" className="therapist-checkbox" />
                  <span className="therapist-checkbox-label">Screen reader software</span>
                </label>
                <label className="therapist-checkbox-item">
                  <input type="checkbox" className="therapist-checkbox" />
                  <span className="therapist-checkbox-label">Voice-to-text tools</span>
                </label>
                <label className="therapist-checkbox-item">
                  <input type="checkbox" className="therapist-checkbox" />
                  <span className="therapist-checkbox-label">Task management apps</span>
                </label>
              </div>
            </div>
            <div className="therapist-builder-group">
              <label className="therapist-builder-label">Notas Adicionales</label>
              <textarea 
                className="therapist-textarea"
                placeholder="Acomodaciones o consideraciones específicas..."
              />
            </div>
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="therapist-ai-suggestions">
          <div className="therapist-ai-header">
            <FaRobot className="therapist-ai-icon" />
            <span className="therapist-ai-title">Recomendaciones de IA</span>
          </div>
          <div className="therapist-ai-content">
            <div className="therapist-ai-recommendation">
              <p className="therapist-ai-text">
                <strong>Productivity Tip:</strong> Based on assessment data, suggest 90-minute focused work blocks with 15-minute breaks.
              </p>
            </div>
            <div className="therapist-ai-recommendation">
              <p className="therapist-ai-text">
                <strong>Communication:</strong> Client responds best to structured, bullet-point style instructions with clear deadlines.
              </p>
            </div>
          </div>
        </div>

        {/* Preview & Actions */}
        <div className="therapist-accommodation-footer">
          <div className="therapist-preview-info">
            <FaFileAlt className="therapist-preview-icon" />
            <span className="therapist-preview-text">Vista previa del plan de acomodaciones</span>
          </div>
          <div className="therapist-footer-actions">
            <button className="therapist-btn therapist-btn-secondary">
              Guardar Borrador
            </button>
            <button className="therapist-btn therapist-btn-export">
              <FaDownload className="therapist-btn-icon" /> Export PDF
            </button>
            <button className="therapist-btn therapist-btn-share">
              <FaShareAlt className="therapist-btn-icon" /> Compartir Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Browse Candidates and Companies Component
  const BrowseMatches = () => {
    const [view, setView] = useState('candidates'); // candidates, companies
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCondition, setFilterCondition] = useState('all');

    const filteredCandidates = candidates.filter(candidate => {
      const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCondition = filterCondition === 'all' || candidate.condition.toLowerCase().includes(filterCondition.toLowerCase());
      return matchesSearch && matchesCondition;
    });

    const filteredCompanies = companies.filter(company => {
      return company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             company.industry.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
      <div className="therapist-browse-section">
        <div className="therapist-browse-header">
          <h2 className="therapist-browse-title">Explorar Coincidencias</h2>
          <div className="therapist-browse-controls">
            <div className="therapist-view-toggle">
              <button 
                className={`therapist-toggle-btn ${view === 'candidates' ? 'active' : ''}`}
                onClick={() => setView('candidates')}
              >
                <FaUser className="therapist-toggle-icon" />
                Candidatos ({candidates.length})
              </button>
              <button 
                className={`therapist-toggle-btn ${view === 'companies' ? 'active' : ''}`}
                onClick={() => setView('companies')}
              >
                <FaBuilding className="therapist-toggle-icon" />
                Empresas ({companies.length})
              </button>
            </div>
            <div className="therapist-search-controls">
              <div className="therapist-search-box">
                <FaSearch className="therapist-search-icon" />
                <input 
                  type="text" 
                  placeholder={`Buscar ${view}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="therapist-search-input"
                />
              </div>
              {view === 'candidates' && (
                <select 
                  value={filterCondition}
                  onChange={(e) => setFilterCondition(e.target.value)}
                  className="therapist-filter-select"
                >
                  <option value="all">Todas las Condiciones</option>
                  <option value="ADHD">ADHD</option>
                  <option value="Autism">Autism</option>
                  <option value="Dyslexia">Dyslexia</option>
                </select>
              )}
            </div>
          </div>
        </div>

        <div className="therapist-browse-content">
          {view === 'candidates' ? (
            <div className="therapist-candidates-grid">
              {filteredCandidates.map(candidate => (
                <div key={candidate.id} className="therapist-candidate-card">
                  <div className="therapist-candidate-header">
                    <FaUser className="therapist-candidate-icon" />
                    <div className="therapist-candidate-info">
                      <h3 className="therapist-candidate-name">{candidate.name}</h3>
                      <p className="therapist-candidate-meta">{candidate.condition} • {candidate.age} years</p>
                      <p className="therapist-candidate-location">{candidate.location}</p>
                    </div>
                    <div className="therapist-candidate-score">
                      <span className="therapist-score-value">{candidate.wellbeingScore}</span>
                      <span className="therapist-score-label">Well-being</span>
                    </div>
                  </div>
                  <div className="therapist-candidate-skills">
                    <h4>Habilidades Clave:</h4>
                    <div className="therapist-skills-tags">
                      {candidate.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="therapist-skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div className="therapist-candidate-superpower">
                    <FaStar className="therapist-superpower-icon" />
                    <span>{candidate.superpower}</span>
                  </div>
                  <div className="therapist-candidate-actions">
                    <button 
                      onClick={() => setSelectedCandidate(candidate)}
                      className="therapist-btn therapist-btn-primary"
                    >
                      <FaEye className="therapist-btn-icon" />
                      Ver Detalles
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedCandidate(candidate);
                        setMatchingMode('candidate-detail');
                      }}
                      className="therapist-btn therapist-btn-secondary"
                    >
                      <FaHandshake className="therapist-btn-icon" />
                      Iniciar Emparejamiento
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="therapist-companies-grid">
              {filteredCompanies.map(company => (
                <div key={company.id} className="therapist-company-card">
                  <div className="therapist-company-header">
                    <FaBuilding className="therapist-company-icon" />
                    <div className="therapist-company-info">
                      <h3 className="therapist-company-name">{company.name}</h3>
                      <p className="therapist-company-meta">{company.industry} • {company.size}</p>
                      <p className="therapist-company-location">{company.location}</p>
                    </div>
                    <div className="therapist-company-positions">
                      <span className="therapist-positions-count">{company.openPositions.length}</span>
                      <span className="therapist-positions-label">Posiciones Abiertas</span>
                    </div>
                  </div>
                  <div className="therapist-company-culture">
                    <h4>Cultura:</h4>
                    <p>{company.culture}</p>
                  </div>
                  <div className="therapist-company-support">
                    <h4>Soporte de Neurodiversidad:</h4>
                    <p>{company.neurodiversitySupport}</p>
                  </div>
                  <div className="therapist-company-actions">
                    <button 
                      onClick={() => setSelectedCompany(company)}
                      className="therapist-btn therapist-btn-primary"
                    >
                      <FaEye className="therapist-btn-icon" />
                      Ver Detalles
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedCompany(company);
                        setMatchingMode('company-detail');
                      }}
                      className="therapist-btn therapist-btn-secondary"
                    >
                      <FaHandshake className="therapist-btn-icon" />
                      Encontrar Candidatos
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Candidate Matching Interface Component
  const CandidateMatchingInterface = ({ candidate, companies, onBack, onSendApplication }) => {
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [applicationMessage, setApplicationMessage] = useState('');
    const [matchScore, setMatchScore] = useState(0);

    const calculateMatchScore = (candidate, company, position) => {
      let score = 0;
      
      // Skill match (40%)
      const skillMatch = candidate.skills.filter(skill => 
        position.requirements.some(req => req.toLowerCase().includes(skill.toLowerCase()))
      ).length / position.requirements.length;
      score += skillMatch * 40;
      
      // Accommodation match (30%)
      const accommodationMatch = candidate.accommodations.filter(acc => 
        position.accommodations.some(posAcc => posAcc.toLowerCase().includes(acc.toLowerCase()))
      ).length / candidate.accommodations.length;
      score += accommodationMatch * 30;
      
      // Location match (15%)
      if (candidate.location.includes(company.location.split(',')[0])) {
        score += 15;
      }
      
      // Salary match (15%)
      const candidateMin = parseInt(candidate.salaryExpectation.split('$')[1].split(' ')[0]);
      const candidateMax = parseInt(candidate.salaryExpectation.split('$')[1].split(' ')[2]);
      if (candidateMin >= 60000 && candidateMax <= 120000) {
        score += 15;
      }
      
      return Math.round(score);
    };

    const handleCompanySelect = (company) => {
      setSelectedCompany(company);
      setSelectedPosition(company.openPositions[0]);
      setMatchScore(calculateMatchScore(candidate, company, company.openPositions[0]));
    };

    const handlePositionSelect = (position) => {
      setSelectedPosition(position);
      setMatchScore(calculateMatchScore(candidate, selectedCompany, position));
    };

    const handleSendApplication = () => {
      if (selectedCompany && selectedPosition && applicationMessage.trim()) {
        onSendApplication(candidate, selectedCompany, selectedPosition, applicationMessage);
      }
    };

    return (
      <div className="therapist-candidate-matching">
        <div className="therapist-matching-header">
          <button onClick={onBack} className="therapist-back-btn">
            <FaArrowLeft className="therapist-back-icon" />
            Volver a Explorar
          </button>
          <h2 className="therapist-matching-title">Emparejar Candidato: {candidate.name}</h2>
        </div>

        <div className="therapist-matching-content">
          {/* Candidate Profile Summary */}
          <div className="therapist-candidate-summary">
            <div className="therapist-candidate-card-large">
              <div className="therapist-candidate-header-large">
                <FaUser className="therapist-candidate-icon-large" />
                <div className="therapist-candidate-info-large">
                  <h3 className="therapist-candidate-name-large">{candidate.name}</h3>
                  <p className="therapist-candidate-meta-large">{candidate.condition} • {candidate.age} years • {candidate.location}</p>
                  <p className="therapist-candidate-education">{candidate.education}</p>
                  <p className="therapist-candidate-experience">{candidate.experience}</p>
                </div>
                <div className="therapist-candidate-stats-large">
                  <div className="therapist-stat-item">
                    <span className="therapist-stat-value">{candidate.wellbeingScore}</span>
                    <span className="therapist-stat-label">Well-being</span>
                  </div>
                  <div className="therapist-stat-item">
                    <span className="therapist-stat-value">{candidate.assessmentScores.attention}%</span>
                    <span className="therapist-stat-label">Attention</span>
                  </div>
                  <div className="therapist-stat-item">
                    <span className="therapist-stat-value">{candidate.assessmentScores.creativity}%</span>
                    <span className="therapist-stat-label">Creativity</span>
                  </div>
                </div>
              </div>
              <div className="therapist-candidate-skills-large">
                <h4>Key Skills:</h4>
                <div className="therapist-skills-tags-large">
                  {candidate.skills.map((skill, index) => (
                    <span key={index} className="therapist-skill-tag-large">{skill}</span>
                  ))}
                </div>
              </div>
              <div className="therapist-candidate-superpower-large">
                <FaStar className="therapist-superpower-icon-large" />
                <span className="therapist-superpower-text">{candidate.superpower}</span>
              </div>
            </div>
          </div>

          {/* Company Selection */}
          <div className="therapist-company-selection">
            <h3 className="therapist-section-title">
              <FaBuilding className="therapist-section-icon" />
              Seleccionar Empresa para Emparejar
            </h3>
            <div className="therapist-companies-grid-matching">
              {companies.map(company => (
                <div 
                  key={company.id} 
                  className={`therapist-company-card-matching ${selectedCompany?.id === company.id ? 'selected' : ''}`}
                  onClick={() => handleCompanySelect(company)}
                >
                  <div className="therapist-company-header-matching">
                    <FaBuilding className="therapist-company-icon-matching" />
                    <div className="therapist-company-info-matching">
                      <h4 className="therapist-company-name-matching">{company.name}</h4>
                      <p className="therapist-company-meta-matching">{company.industry} • {company.size}</p>
                      <p className="therapist-company-location-matching">{company.location}</p>
                    </div>
                    <div className="therapist-company-score">
                      <span className="therapist-company-score-value">
                        {selectedCompany?.id === company.id ? matchScore : '--'}
                      </span>
                      <span className="therapist-company-score-label">Match %</span>
                    </div>
                  </div>
                  <div className="therapist-company-culture-matching">
                    <p>{company.culture}</p>
                  </div>
                  <div className="therapist-company-support-matching">
                    <p><strong>Neurodiversity Support:</strong> {company.neurodiversitySupport}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Position Selection */}
          {selectedCompany && (
            <div className="therapist-position-selection-matching">
              <h3 className="therapist-section-title">
                <FaBriefcase className="therapist-section-icon" />
                Seleccionar Posición en {selectedCompany.name}
              </h3>
              <div className="therapist-positions-grid">
                {selectedCompany.openPositions.map(position => (
                  <div 
                    key={position.id} 
                    className={`therapist-position-card-matching ${selectedPosition?.id === position.id ? 'selected' : ''}`}
                    onClick={() => handlePositionSelect(position)}
                  >
                    <div className="therapist-position-header-matching">
                      <h4 className="therapist-position-title-matching">{position.title}</h4>
                      <span className="therapist-position-department-matching">{position.department}</span>
                    </div>
                    <div className="therapist-position-requirements-matching">
                      <h5>Requisitos:</h5>
                      <div className="therapist-requirements-tags">
                        {position.requirements.map((req, index) => (
                          <span key={index} className="therapist-requirement-tag-matching">{req}</span>
                        ))}
                      </div>
                    </div>
                    <div className="therapist-position-accommodations-matching">
                      <h5>Acomodaciones Disponibles:</h5>
                      <div className="therapist-accommodations-tags">
                        {position.accommodations.map((acc, index) => (
                          <span key={index} className="therapist-accommodation-tag-matching">{acc}</span>
                        ))}
                      </div>
                    </div>
                    <div className="therapist-position-match-score">
                      <span className="therapist-position-score-value">
                        {selectedPosition?.id === position.id ? matchScore : '--'}
                      </span>
                      <span className="therapist-position-score-label">Match %</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Application Message */}
          {selectedCompany && selectedPosition && (
            <div className="therapist-application-message">
              <h3 className="therapist-section-title">
                <FaEnvelope className="therapist-section-icon" />
                Mensaje de Aplicación
              </h3>
              <div className="therapist-message-container">
                <textarea
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  placeholder={`Escribe un mensaje personalizado presentando a ${candidate.name} a ${selectedCompany.name} para el puesto de ${selectedPosition.title}. Destaca sus fortalezas únicas y cómo se alinean con las necesidades de la empresa...`}
                  className="therapist-message-textarea"
                  rows={6}
                />
                <div className="therapist-message-preview">
                  <h4>Vista Previa del Mensaje:</h4>
                  <div className="therapist-message-content">
                    {applicationMessage || "Tu mensaje aparecerá aquí..."}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Send Application Button */}
          {selectedCompany && selectedPosition && applicationMessage.trim() && (
            <div className="therapist-send-application">
              <div className="therapist-match-summary">
                <div className="therapist-match-summary-item">
                  <span className="therapist-match-label">Candidato:</span>
                  <span className="therapist-match-value">{candidate.name}</span>
                </div>
                <div className="therapist-match-summary-item">
                  <span className="therapist-match-label">Empresa:</span>
                  <span className="therapist-match-value">{selectedCompany.name}</span>
                </div>
                <div className="therapist-match-summary-item">
                  <span className="therapist-match-label">Posición:</span>
                  <span className="therapist-match-value">{selectedPosition.title}</span>
                </div>
                <div className="therapist-match-summary-item">
                  <span className="therapist-match-label">Puntuación de Coincidencia:</span>
                  <span className="therapist-match-value therapist-match-score-highlight">{matchScore}%</span>
                </div>
              </div>
              <button 
                onClick={handleSendApplication}
                className="therapist-btn therapist-btn-send-application"
              >
                <FaEnvelope className="therapist-btn-icon" />
                Enviar Aplicación de Candidato
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Company Matching Interface Component
  const CompanyMatchingInterface = ({ company, candidates, onBack, onSendApplication }) => {
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [applicationMessage, setApplicationMessage] = useState('');
    const [matchScore, setMatchScore] = useState(0);

    const calculateMatchScore = (candidate, company, position) => {
      let score = 0;
      
      // Skill match (40%)
      const skillMatch = candidate.skills.filter(skill => 
        position.requirements.some(req => req.toLowerCase().includes(skill.toLowerCase()))
      ).length / position.requirements.length;
      score += skillMatch * 40;
      
      // Accommodation match (30%)
      const accommodationMatch = candidate.accommodations.filter(acc => 
        position.accommodations.some(posAcc => posAcc.toLowerCase().includes(acc.toLowerCase()))
      ).length / candidate.accommodations.length;
      score += accommodationMatch * 30;
      
      // Location match (15%)
      if (candidate.location.includes(company.location.split(',')[0])) {
        score += 15;
      }
      
      // Salary match (15%)
      const candidateMin = parseInt(candidate.salaryExpectation.split('$')[1].split(' ')[0]);
      const candidateMax = parseInt(candidate.salaryExpectation.split('$')[1].split(' ')[2]);
      if (candidateMin >= 60000 && candidateMax <= 120000) {
        score += 15;
      }
      
      return Math.round(score);
    };

    const handleCandidateSelect = (candidate) => {
      setSelectedCandidate(candidate);
      setSelectedPosition(company.openPositions[0]);
      setMatchScore(calculateMatchScore(candidate, company, company.openPositions[0]));
    };

    const handlePositionSelect = (position) => {
      setSelectedPosition(position);
      setMatchScore(calculateMatchScore(selectedCandidate, company, position));
    };

    const handleSendApplication = () => {
      if (selectedCandidate && selectedPosition && applicationMessage.trim()) {
        onSendApplication(selectedCandidate, company, selectedPosition, applicationMessage);
      }
    };

    return (
      <div className="therapist-company-matching">
        <div className="therapist-matching-header">
          <button onClick={onBack} className="therapist-back-btn">
            <FaArrowLeft className="therapist-back-icon" />
            Volver a Explorar
          </button>
          <h2 className="therapist-matching-title">Encontrar Candidatos para: {company.name}</h2>
        </div>

        <div className="therapist-matching-content">
          {/* Company Profile Summary */}
          <div className="therapist-company-summary">
            <div className="therapist-company-card-large">
              <div className="therapist-company-header-large">
                <FaBuilding className="therapist-company-icon-large" />
                <div className="therapist-company-info-large">
                  <h3 className="therapist-company-name-large">{company.name}</h3>
                  <p className="therapist-company-meta-large">{company.industry} • {company.size} • {company.location}</p>
                  <p className="therapist-company-culture-large">{company.culture}</p>
                </div>
                <div className="therapist-company-stats-large">
                  <div className="therapist-stat-item">
                    <span className="therapist-stat-value">{company.openPositions.length}</span>
                    <span className="therapist-stat-label">Open Positions</span>
                  </div>
                  <div className="therapist-stat-item">
                    <span className="therapist-stat-value">✓</span>
                    <span className="therapist-stat-label">Neurodiversity Support</span>
                  </div>
                </div>
              </div>
              <div className="therapist-company-support-large">
                <h4>Neurodiversity Support:</h4>
                <p>{company.neurodiversitySupport}</p>
              </div>
              <div className="therapist-company-benefits-large">
                <h4>Benefits:</h4>
                <div className="therapist-benefits-tags">
                  {company.benefits.map((benefit, index) => (
                    <span key={index} className="therapist-benefit-tag-large">{benefit}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Position Selection */}
          <div className="therapist-position-selection-matching">
            <h3 className="therapist-section-title">
              <FaBriefcase className="therapist-section-icon" />
              Seleccionar Posición a Llenar
            </h3>
            <div className="therapist-positions-grid">
              {company.openPositions.map(position => (
                <div 
                  key={position.id} 
                  className={`therapist-position-card-matching ${selectedPosition?.id === position.id ? 'selected' : ''}`}
                  onClick={() => handlePositionSelect(position)}
                >
                  <div className="therapist-position-header-matching">
                    <h4 className="therapist-position-title-matching">{position.title}</h4>
                    <span className="therapist-position-department-matching">{position.department}</span>
                  </div>
                  <div className="therapist-position-requirements-matching">
                    <h5>Requisitos:</h5>
                    <div className="therapist-requirements-tags">
                      {position.requirements.map((req, index) => (
                        <span key={index} className="therapist-requirement-tag-matching">{req}</span>
                      ))}
                    </div>
                  </div>
                  <div className="therapist-position-accommodations-matching">
                    <h5>Acomodaciones Disponibles:</h5>
                    <div className="therapist-accommodations-tags">
                      {position.accommodations.map((acc, index) => (
                        <span key={index} className="therapist-accommodation-tag-matching">{acc}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Candidate Selection */}
          {selectedPosition && (
            <div className="therapist-candidate-selection">
              <h3 className="therapist-section-title">
                <FaUser className="therapist-section-icon" />
                Seleccionar Candidato para {selectedPosition.title}
              </h3>
              <div className="therapist-candidates-grid-matching">
                {candidates.map(candidate => (
                  <div 
                    key={candidate.id} 
                    className={`therapist-candidate-card-matching ${selectedCandidate?.id === candidate.id ? 'selected' : ''}`}
                    onClick={() => handleCandidateSelect(candidate)}
                  >
                    <div className="therapist-candidate-header-matching">
                      <FaUser className="therapist-candidate-icon-matching" />
                      <div className="therapist-candidate-info-matching">
                        <h4 className="therapist-candidate-name-matching">{candidate.name}</h4>
                        <p className="therapist-candidate-meta-matching">{candidate.condition} • {candidate.age} years</p>
                        <p className="therapist-candidate-location-matching">{candidate.location}</p>
                      </div>
                      <div className="therapist-candidate-score-matching">
                        <span className="therapist-candidate-score-value">
                          {selectedCandidate?.id === candidate.id ? matchScore : '--'}
                        </span>
                        <span className="therapist-candidate-score-label">Match %</span>
                      </div>
                    </div>
                    <div className="therapist-candidate-skills-matching">
                      <h5>Key Skills:</h5>
                      <div className="therapist-skills-tags-matching">
                        {candidate.skills.slice(0, 4).map((skill, index) => (
                          <span key={index} className="therapist-skill-tag-matching">{skill}</span>
                        ))}
                      </div>
                    </div>
                    <div className="therapist-candidate-superpower-matching">
                      <FaStar className="therapist-superpower-icon-matching" />
                      <span>{candidate.superpower}</span>
                    </div>
                    <div className="therapist-candidate-assessment-matching">
                      <div className="therapist-assessment-mini">
                        <span>Attention: {candidate.assessmentScores.attention}%</span>
                        <span>Creativity: {candidate.assessmentScores.creativity}%</span>
                        <span>Well-being: {candidate.wellbeingScore}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Application Message */}
          {selectedCandidate && selectedPosition && (
            <div className="therapist-application-message">
              <h3 className="therapist-section-title">
                <FaEnvelope className="therapist-section-icon" />
                Mensaje de Aplicación
              </h3>
              <div className="therapist-message-container">
                <textarea
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  placeholder={`Escribe un mensaje personalizado presentando a ${selectedCandidate.name} a ${company.name} para el puesto de ${selectedPosition.title}. Destaca sus fortalezas únicas y cómo se alinean con las necesidades de la empresa...`}
                  className="therapist-message-textarea"
                  rows={6}
                />
                <div className="therapist-message-preview">
                  <h4>Vista Previa del Mensaje:</h4>
                  <div className="therapist-message-content">
                    {applicationMessage || "Tu mensaje aparecerá aquí..."}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Send Application Button */}
          {selectedCandidate && selectedPosition && applicationMessage.trim() && (
            <div className="therapist-send-application">
              <div className="therapist-match-summary">
                <div className="therapist-match-summary-item">
                  <span className="therapist-match-label">Candidato:</span>
                  <span className="therapist-match-value">{selectedCandidate.name}</span>
                </div>
                <div className="therapist-match-summary-item">
                  <span className="therapist-match-label">Empresa:</span>
                  <span className="therapist-match-value">{company.name}</span>
                </div>
                <div className="therapist-match-summary-item">
                  <span className="therapist-match-label">Posición:</span>
                  <span className="therapist-match-value">{selectedPosition.title}</span>
                </div>
                <div className="therapist-match-summary-item">
                  <span className="therapist-match-label">Puntuación de Coincidencia:</span>
                  <span className="therapist-match-value therapist-match-score-highlight">{matchScore}%</span>
                </div>
              </div>
              <button 
                onClick={handleSendApplication}
                className="therapist-btn therapist-btn-send-application"
              >
                <FaEnvelope className="therapist-btn-icon" />
                Enviar Aplicación de Candidato
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Sidebar Component
  const Sidebar = () => (
    <div className={`therapist-sidebar${sidebarCollapsed ? ' collapsed' : ''}`}> 
      <div className="therapist-sidebar-content">
        <div className="therapist-sidebar-header">
          {!sidebarCollapsed && (
            <div className="therapist-logo">
              <FaBrain className="therapist-logo-icon" />
              <h2 className="therapist-logo-text">DiversIA</h2>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="therapist-collapse-btn"
          >
            {sidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        </div>
        <nav className="therapist-nav">
          {[
            { icon: FaHome, label: 'Resumen', view: 'overview' },
            { icon: FaUsers, label: 'Cola de Referencias', view: 'referrals' },
            { icon: FaUserCheck, label: 'Perfiles de Clientes', view: 'clients' },
            { icon: FaHandshake, label: 'Coincidencias Perfectas', view: 'matching' },
            { icon: FaBullseye, label: 'Acomodaciones', view: 'accommodations' },
            { icon: FaCalendarAlt, label: 'Reservas', view: 'bookings' },
            { icon: FaClipboardList, label: 'Recursos', view: 'resources' },
            { icon: FaChartBar, label: 'Impacto', view: 'impact' },
            { icon: FaCog, label: 'Configuración', view: 'settings' },
          ].map((item) => (
            <button
              key={item.view}
              onClick={() => handleNavigation(item.view)}
              className={`therapist-nav-item${selectedView === item.view ? ' active' : ''}`}
            >
              <item.icon className="therapist-nav-icon" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );

  // Main Content Renderer
  const renderMainContent = () => {
    switch (selectedView) {
      case 'overview':
        return (
          <div className="therapist-overview">
            <KPICards />
            <ReferralQueue />
            <div className="therapist-overview-grid">
              <BookingsCalendar />
              <ImpactDashboard />
            </div>
          </div>
        );
      case 'referrals':
        return <ReferralQueue />;
      case 'clients':
        return selectedClient ? <ClientProfileReview client={selectedClient} /> : <div className="therapist-empty-state">Selecciona un cliente para ver su perfil</div>;
      case 'matching':
        return renderMatchingContent();
      case 'accommodations':
        return <AccommodationBuilder />;
      case 'bookings':
        return <BookingsCalendar />;
      case 'impact':
        return <ImpactDashboard />;
      default:
        return <div className="therapist-empty-state">Vista en desarrollo</div>;
    }
  };

  // Matching Content Renderer
  const renderMatchingContent = () => {
    switch (matchingMode) {
      case 'browse':
        return <BrowseMatches />;
      case 'candidate-detail':
        return selectedCandidate ? (
          <CandidateDetail 
            candidate={selectedCandidate} 
            onBack={() => setMatchingMode('browse')}
            onMatch={(candidate) => {
              setSelectedCandidate(candidate);
              setMatchingMode('candidate-matching');
            }}
          />
        ) : <BrowseMatches />;
      case 'company-detail':
        return selectedCompany ? (
          <CompanyDetail 
            company={selectedCompany} 
            onBack={() => setMatchingMode('browse')}
            onMatch={(company) => {
              setSelectedCompany(company);
              setMatchingMode('company-matching');
            }}
          />
        ) : <BrowseMatches />;
      case 'candidate-matching':
        return selectedCandidate ? (
          <CandidateMatchingInterface 
            candidate={selectedCandidate}
            companies={companies}
            onBack={() => setMatchingMode('browse')}
            onSendApplication={handleSendApplication}
          />
        ) : <BrowseMatches />;
      case 'company-matching':
        return selectedCompany ? (
          <CompanyMatchingInterface 
            company={selectedCompany}
            candidates={candidates}
            onBack={() => setMatchingMode('browse')}
            onSendApplication={handleSendApplication}
          />
        ) : <BrowseMatches />;
      case 'create-match':
        return selectedCandidate && selectedCompany ? (
          <MatchingInterface 
            candidate={selectedCandidate}
            company={selectedCompany}
            onBack={() => setMatchingMode('browse')}
            onCreateMatch={handleCreateMatch}
          />
        ) : <BrowseMatches />;
      default:
        return <BrowseMatches />;
    }
  };

  return (
    <div className="therapist-container">
      <Sidebar />
      <div className={`therapist-main${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}> 
        <div className="therapist-content">
          {/* Header */}
          <div className="therapist-page-header">
            <div>
              <h1 className="therapist-page-title">Portal del Dr. Terapeuta</h1>
              <p className="therapist-page-subtitle">Experiencia clínica para el emparejamiento de talento neurodivergente y el éxito laboral</p>
            </div>
            <div className="therapist-header-actions">
              <button className="therapist-notification-btn">
                <FaBell className="text-xl" />
                <span className="therapist-notification-dot"></span>
              </button>
              <button className="therapist-notification-btn">
                <FaEnvelope className="text-xl" />
              </button>
              <div className="therapist-user-profile">
                <FaUserMd className="therapist-user-icon" />
                <span className="therapist-user-name">Dr. Therapist</span>
                <span className="therapist-user-status">En línea</span>
              </div>
            </div>
          </div>
          {/* Main Content */}
          {renderMainContent()}
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setLiveConsultation(!liveConsultation)}
        className="therapist-floating-btn"
      >
        <FaVideo className="therapist-floating-btn-icon" />
      </button>

      {/* AI Assistant */}
      <AIAssistant />

      {/* Video Call Interface */}
      {videoCall && <VideoCallInterface />}

      {/* Accommodation Builder Modal */}
      {accommodationBuilder && (
        <div className="therapist-modal-overlay">
          <div className="therapist-modal-container">
            <AccommodationBuilder />
          </div>
        </div>
      )}
    </div>
  );
};

// Candidate Detail Component
const CandidateDetail = ({ candidate, onBack, onMatch }) => {
  if (!candidate) return null;
  return (
    <div className="therapist-candidate-detail">
      <div className="therapist-matching-header">
        <button onClick={onBack} className="therapist-back-btn">
          <FaArrowLeft className="therapist-back-icon" />
          Back to Browse
        </button>
        <h2 className="therapist-matching-title">Detalles del Candidato</h2>
      </div>
      <div className="therapist-candidate-card-large">
        <div className="therapist-candidate-header-large">
          <FaUser className="therapist-candidate-icon-large" />
          <div className="therapist-candidate-info-large">
            <h3 className="therapist-candidate-name-large">{candidate.name}</h3>
            <p className="therapist-candidate-meta-large">{candidate.condition} • {candidate.age} years • {candidate.location}</p>
            <p className="therapist-candidate-education">{candidate.education}</p>
            <p className="therapist-candidate-experience">{candidate.experience}</p>
          </div>
          <div className="therapist-candidate-stats-large">
            <div className="therapist-stat-item">
              <span className="therapist-stat-value">{candidate.wellbeingScore}</span>
              <span className="therapist-stat-label">Well-being</span>
            </div>
            <div className="therapist-stat-item">
              <span className="therapist-stat-value">{candidate.assessmentScores.attention}%</span>
              <span className="therapist-stat-label">Attention</span>
            </div>
            <div className="therapist-stat-item">
              <span className="therapist-stat-value">{candidate.assessmentScores.creativity}%</span>
              <span className="therapist-stat-label">Creativity</span>
            </div>
          </div>
        </div>
        <div className="therapist-candidate-skills-large">
          <h4>Key Skills:</h4>
          <div className="therapist-skills-tags-large">
            {candidate.skills.map((skill, index) => (
              <span key={index} className="therapist-skill-tag-large">{skill}</span>
            ))}
          </div>
        </div>
        <div className="therapist-candidate-superpower-large">
          <FaStar className="therapist-superpower-icon-large" />
          <span className="therapist-superpower-text">{candidate.superpower}</span>
        </div>
        <div className="therapist-candidate-accommodations">
          <h4>Accommodations:</h4>
          <div className="therapist-skills-tags-large">
            {candidate.accommodations.map((acc, idx) => (
              <span key={idx} className="therapist-skill-tag-large">{acc}</span>
            ))}
          </div>
        </div>
        <div className="therapist-candidate-salary">
          <h4>Salary Expectation:</h4>
          <span className="therapist-skill-tag-large">{candidate.salaryExpectation}</span>
        </div>
        <div className="therapist-candidate-detail-actions">
          <button onClick={() => onMatch(candidate)} className="therapist-btn therapist-btn-send-application">
            <FaHandshake className="therapist-btn-icon" />
            Start Matching
          </button>
        </div>
      </div>
    </div>
  );
};

export default TherapistDashboard;