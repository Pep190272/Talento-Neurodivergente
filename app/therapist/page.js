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
    { title: "Active Clients", value: 18, trend: "+3 this month", icon: "👥", color: "purple" },
    { title: "Sessions This Week", value: 24, trend: "+5 this week", icon: "📅", color: "blue" },
    { title: "Success Rate", value: 87, trend: "+2% this month", icon: "📈", color: "green" },
    { title: "Pending Referrals", value: 12, trend: "+4 pending", icon: "⏳", color: "orange" },
    { title: "Accommodations Created", value: 34, trend: "+8 this month", icon: "🎯", color: "pink" },
    { title: "Average Well-being", value: 8.1, trend: "+0.3 this month", icon: "💚", color: "emerald" },
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
          Bookings Calendar
        </h3>
        <div className="therapist-bookings-controls">
          <button className="therapist-btn therapist-btn-active">Week View</button>
          <button className="therapist-btn therapist-btn-secondary">Month View</button>
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
                    <FaVideo className="therapist-btn-icon" /> Join
                  </button>
                  <button className="therapist-btn therapist-btn-remind">
                    <FaEnvelope className="therapist-btn-icon" /> Remind
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
          Add New Session Slot
        </button>
      </div>
    </div>
  );

  // Impact Dashboard Component
  const ImpactDashboard = () => (
    <div className="therapist-impact-section">
      <h3 className="therapist-impact-title">
        <FaChartBar className="therapist-impact-icon" />
        Impact Dashboard
      </h3>
      <div className="therapist-impact-grid">
        <div className="therapist-wellbeing-card">
          <h4 className="therapist-wellbeing-title">Well-being Trends</h4>
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
          <h4 className="therapist-retention-title">Retention Metrics</h4>
          <div className="therapist-retention-content">
            <div className="therapist-retention-rate">94%</div>
            <div className="therapist-retention-label">6-Month Retention Rate</div>
            <div className="therapist-retention-breakdown">
              <div className="therapist-retention-item">
                <span className="therapist-retention-risk">High Risk</span>
                <span className="therapist-retention-count therapist-retention-high">2 clients</span>
              </div>
              <div className="therapist-retention-item">
                <span className="therapist-retention-risk">Medium Risk</span>
                <span className="therapist-retention-count therapist-retention-medium">5 clients</span>
              </div>
              <div className="therapist-retention-item">
                <span className="therapist-retention-risk">Low Risk</span>
                <span className="therapist-retention-count therapist-retention-low">11 clients</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="therapist-success-stories">
        <h4 className="therapist-success-title">Success Stories</h4>
        <div className="therapist-success-quote">
          "The accommodation plan has been life-changing. I'm more productive and less stressed at work." - Alex C.
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
            <p className="therapist-ai-intro-text">Hi Dr. Therapist! I can help you with:</p>
            <ul className="therapist-ai-features">
              <li>• Clinical note suggestions</li>
              <li>• Accommodation planning</li>
              <li>• Assessment analysis</li>
              <li>• Progress tracking</li>
            </ul>
          </div>
          <div className="therapist-ai-input">
            <input 
              type="text" 
              placeholder="Ask me anything..." 
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
            <span className="therapist-video-title">Live Consultation - Alex Chen</span>
            <span className="therapist-video-status">LIVE</span>
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
            <p className="therapist-video-status-text">Connected</p>
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
          Referral Queue
          <span className="therapist-referral-count">{referralQueue.filter(r => r.status === 'Pending').length}</span>
        </h3>
        <div className="therapist-referral-controls">
          <div className="therapist-search-box">
            <FaSearch className="therapist-search-icon" />
            <input 
              type="text" 
              placeholder="Search referrals..." 
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
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Review">In Review</option>
            <option value="Completed">Completed</option>
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
                  <FaEye className="therapist-btn-icon" /> Review
                </button>
                <button className="therapist-btn therapist-btn-secondary">
                  <FaCalendarAlt className="therapist-btn-icon" /> Schedule
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
            <div className="therapist-client-progress-label">Progress</div>
            <div className="therapist-client-wellbeing">
              <span className="therapist-wellbeing-score">Well-being: {client.wellbeingScore}/10</span>
              <span className={`therapist-risk-badge therapist-risk-${client.retentionRisk.toLowerCase()}`}>
                {client.retentionRisk} Risk
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Data */}
      <div className="therapist-assessment-section">
        <h4 className="therapist-section-title">
          <FaGamepad className="therapist-section-icon" />
          Game Assessment Results
        </h4>
        <div className="therapist-game-metrics">
          {Object.entries(client.gameMetrics).map(([game, metrics]) => (
            <div key={game} className="therapist-game-metric-card">
              <h5 className="therapist-game-metric-title">{game.replace(/([A-Z])/g, ' $1').trim()}</h5>
              <div className="therapist-game-metric-stats">
                <div className="therapist-metric-row">
                  <span className="therapist-metric-label">Score</span>
                  <span className="therapist-metric-value therapist-metric-score">{metrics.score}</span>
                </div>
                <div className="therapist-metric-row">
                  <span className="therapist-metric-label">Accuracy</span>
                  <span className="therapist-metric-value therapist-metric-accuracy">{metrics.accuracy}%</span>
                </div>
                <div className="therapist-metric-row">
                  <span className="therapist-metric-label">Reaction Time</span>
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
            AI Analysis Summary
          </h4>
          <div className="therapist-superpower-card">
            <div className="therapist-superpower-header">
              <FaStar className="therapist-superpower-icon" />
              <span className="therapist-superpower-label">Identified Superpower</span>
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
            Clinical Notes
          </h4>
          <textarea 
            className="therapist-notes-textarea"
            placeholder="Add clinical observations, recommendations, or notes..."
            defaultValue="Client shows significant improvement in attention regulation. Recommend continuing current accommodation plan with minor adjustments to break scheduling."
          />
          <div className="therapist-notes-footer">
            <div className="therapist-ai-assistant-hint">
              <FaRobot className="therapist-ai-hint-icon" />
              <span className="therapist-ai-hint-text">AI Assistant can help with phrasing</span>
            </div>
            <button className="therapist-btn therapist-btn-primary">
              <FaSave className="therapist-btn-icon" /> Save Notes
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
          Build Accommodation Plan
        </button>
        <button 
          onClick={() => setVideoCall(true)}
          className="therapist-btn therapist-btn-video"
        >
          <FaVideo className="therapist-btn-icon" />
          Start Video Session
        </button>
        <button className="therapist-btn therapist-btn-schedule">
          <FaCalendarAlt className="therapist-btn-icon" />
          Schedule Follow-up
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
          Accommodation Plan Builder
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
          <h4 className="therapist-template-title">Quick Start Templates</h4>
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
                  Use Template
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Builder */}
        <div className="therapist-custom-builder">
          <div className="therapist-builder-column">
            <h4 className="therapist-builder-title">Environment & Workspace</h4>
            <div className="therapist-builder-group">
              <label className="therapist-builder-label">Noise Level Preference</label>
              <div className="therapist-option-buttons">
                <button className="therapist-option-btn therapist-option-btn-active">Quiet</button>
                <button className="therapist-option-btn">Moderate</button>
                <button className="therapist-option-btn">Background</button>
              </div>
            </div>
            <div className="therapist-builder-group">
              <label className="therapist-builder-label">Lighting Adjustments</label>
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
              <label className="therapist-builder-label">Break Schedule</label>
              <div className="therapist-input-grid">
                <input type="number" placeholder="Duration (min)" className="therapist-input" />
                <input type="number" placeholder="Frequency (hrs)" className="therapist-input" />
              </div>
            </div>
          </div>
          <div className="therapist-builder-column">
            <h4 className="therapist-builder-title">Communication & Support</h4>
            <div className="therapist-builder-group">
              <label className="therapist-builder-label">Preferred Communication Style</label>
              <select className="therapist-select">
                <option>Written instructions</option>
                <option>Verbal with follow-up</option>
                <option>Visual aids</option>
                <option>One-on-one meetings</option>
              </select>
            </div>
            <div className="therapist-builder-group">
              <label className="therapist-builder-label">Technology Accommodations</label>
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
              <label className="therapist-builder-label">Additional Notes</label>
              <textarea 
                className="therapist-textarea"
                placeholder="Any specific accommodations or considerations..."
              />
            </div>
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="therapist-ai-suggestions">
          <div className="therapist-ai-header">
            <FaRobot className="therapist-ai-icon" />
            <span className="therapist-ai-title">AI Recommendations</span>
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
            <span className="therapist-preview-text">Preview accommodation plan</span>
          </div>
          <div className="therapist-footer-actions">
            <button className="therapist-btn therapist-btn-secondary">
              Save Draft
            </button>
            <button className="therapist-btn therapist-btn-export">
              <FaDownload className="therapist-btn-icon" /> Export PDF
            </button>
            <button className="therapist-btn therapist-btn-share">
              <FaShareAlt className="therapist-btn-icon" /> Share Plan
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
          <h2 className="therapist-browse-title">Browse Matches</h2>
          <div className="therapist-browse-controls">
            <div className="therapist-view-toggle">
              <button 
                className={`therapist-toggle-btn ${view === 'candidates' ? 'active' : ''}`}
                onClick={() => setView('candidates')}
              >
                <FaUser className="therapist-toggle-icon" />
                Candidates ({candidates.length})
              </button>
              <button 
                className={`therapist-toggle-btn ${view === 'companies' ? 'active' : ''}`}
                onClick={() => setView('companies')}
              >
                <FaBuilding className="therapist-toggle-icon" />
                Companies ({companies.length})
              </button>
            </div>
            <div className="therapist-search-controls">
              <div className="therapist-search-box">
                <FaSearch className="therapist-search-icon" />
                <input 
                  type="text" 
                  placeholder={`Search ${view}...`}
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
                  <option value="all">All Conditions</option>
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
                    <h4>Key Skills:</h4>
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
                      View Details
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedCandidate(candidate);
                        setMatchingMode('candidate-detail');
                      }}
                      className="therapist-btn therapist-btn-secondary"
                    >
                      <FaHandshake className="therapist-btn-icon" />
                      Start Matching
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
                      <span className="therapist-positions-label">Open Positions</span>
                    </div>
                  </div>
                  <div className="therapist-company-culture">
                    <h4>Culture:</h4>
                    <p>{company.culture}</p>
                  </div>
                  <div className="therapist-company-support">
                    <h4>Neurodiversity Support:</h4>
                    <p>{company.neurodiversitySupport}</p>
                  </div>
                  <div className="therapist-company-actions">
                    <button 
                      onClick={() => setSelectedCompany(company)}
                      className="therapist-btn therapist-btn-primary"
                    >
                      <FaEye className="therapist-btn-icon" />
                      View Details
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedCompany(company);
                        setMatchingMode('company-detail');
                      }}
                      className="therapist-btn therapist-btn-secondary"
                    >
                      <FaHandshake className="therapist-btn-icon" />
                      Find Candidates
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
            Back to Browse
          </button>
          <h2 className="therapist-matching-title">Match Candidate: {candidate.name}</h2>
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
              Select Company to Match
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
                Select Position at {selectedCompany.name}
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
                      <h5>Requirements:</h5>
                      <div className="therapist-requirements-tags">
                        {position.requirements.map((req, index) => (
                          <span key={index} className="therapist-requirement-tag-matching">{req}</span>
                        ))}
                      </div>
                    </div>
                    <div className="therapist-position-accommodations-matching">
                      <h5>Available Accommodations:</h5>
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
                Application Message
              </h3>
              <div className="therapist-message-container">
                <textarea
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  placeholder={`Write a personalized message introducing ${candidate.name} to ${selectedCompany.name} for the ${selectedPosition.title} position. Highlight their unique strengths and how they align with the company's needs...`}
                  className="therapist-message-textarea"
                  rows={6}
                />
                <div className="therapist-message-preview">
                  <h4>Message Preview:</h4>
                  <div className="therapist-message-content">
                    {applicationMessage || "Your message will appear here..."}
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
                  <span className="therapist-match-label">Candidate:</span>
                  <span className="therapist-match-value">{candidate.name}</span>
                </div>
                <div className="therapist-match-summary-item">
                  <span className="therapist-match-label">Company:</span>
                  <span className="therapist-match-value">{selectedCompany.name}</span>
                </div>
                <div className="therapist-match-summary-item">
                  <span className="therapist-match-label">Position:</span>
                  <span className="therapist-match-value">{selectedPosition.title}</span>
                </div>
                <div className="therapist-match-summary-item">
                  <span className="therapist-match-label">Match Score:</span>
                  <span className="therapist-match-value therapist-match-score-highlight">{matchScore}%</span>
                </div>
              </div>
              <button 
                onClick={handleSendApplication}
                className="therapist-btn therapist-btn-send-application"
              >
                <FaEnvelope className="therapist-btn-icon" />
                Send Candidate Application
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
            Back to Browse
          </button>
          <h2 className="therapist-matching-title">Find Candidates for: {company.name}</h2>
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
              Select Position to Fill
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
                    <h5>Requirements:</h5>
                    <div className="therapist-requirements-tags">
                      {position.requirements.map((req, index) => (
                        <span key={index} className="therapist-requirement-tag-matching">{req}</span>
                      ))}
                    </div>
                  </div>
                  <div className="therapist-position-accommodations-matching">
                    <h5>Available Accommodations:</h5>
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
                Select Candidate for {selectedPosition.title}
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
                Application Message
              </h3>
              <div className="therapist-message-container">
                <textarea
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  placeholder={`Write a personalized message introducing ${selectedCandidate.name} to ${company.name} for the ${selectedPosition.title} position. Highlight their unique strengths and how they align with the company's needs...`}
                  className="therapist-message-textarea"
                  rows={6}
                />
                <div className="therapist-message-preview">
                  <h4>Message Preview:</h4>
                  <div className="therapist-message-content">
                    {applicationMessage || "Your message will appear here..."}
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
                  <span className="therapist-match-label">Candidate:</span>
                  <span className="therapist-match-value">{selectedCandidate.name}</span>
                </div>
                <div className="therapist-match-summary-item">
                  <span className="therapist-match-label">Company:</span>
                  <span className="therapist-match-value">{company.name}</span>
                </div>
                <div className="therapist-match-summary-item">
                  <span className="therapist-match-label">Position:</span>
                  <span className="therapist-match-value">{selectedPosition.title}</span>
                </div>
                <div className="therapist-match-summary-item">
                  <span className="therapist-match-label">Match Score:</span>
                  <span className="therapist-match-value therapist-match-score-highlight">{matchScore}%</span>
                </div>
              </div>
              <button 
                onClick={handleSendApplication}
                className="therapist-btn therapist-btn-send-application"
              >
                <FaEnvelope className="therapist-btn-icon" />
                Send Candidate Application
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
            { icon: FaHome, label: 'Overview', view: 'overview' },
            { icon: FaUsers, label: 'Referral Queue', view: 'referrals' },
            { icon: FaUserCheck, label: 'Client Profiles', view: 'clients' },
            { icon: FaHandshake, label: 'Perfect Matches', view: 'matching' },
            { icon: FaBullseye, label: 'Accommodations', view: 'accommodations' },
            { icon: FaCalendarAlt, label: 'Bookings', view: 'bookings' },
            { icon: FaClipboardList, label: 'Resources', view: 'resources' },
            { icon: FaChartBar, label: 'Impact', view: 'impact' },
            { icon: FaCog, label: 'Settings', view: 'settings' },
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
        return selectedClient ? <ClientProfileReview client={selectedClient} /> : <div className="therapist-empty-state">Select a client to view their profile</div>;
      case 'matching':
        return renderMatchingContent();
      case 'accommodations':
        return <AccommodationBuilder />;
      case 'bookings':
        return <BookingsCalendar />;
      case 'impact':
        return <ImpactDashboard />;
      default:
        return <div className="therapist-empty-state">View under development</div>;
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
              <h1 className="therapist-page-title">Dr. Therapist Portal</h1>
              <p className="therapist-page-subtitle">Clinical expertise for neurodivergent talent matching & workplace success</p>
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
                <span className="therapist-user-status">Online</span>
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
        <h2 className="therapist-matching-title">Candidate Details</h2>
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