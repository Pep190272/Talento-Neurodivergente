import React, { useState, useEffect } from 'react';
import { 
  FaEnvelope, FaCalendarAlt, FaSave, FaFilter, FaChartBar, FaEye, 
  FaDownload, FaShare, FaStar, FaGamepad, FaBrain, FaLightbulb,
  FaRocket, FaCog, FaHeart, FaUsers, FaSearch, FaSort, FaExpand,
  FaPlay, FaUserGraduate, FaAward, FaTrophy, FaClipboardCheck
} from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import styles from './Candidates.module.css';

const extendedTalents = [
  { 
    id: 1, 
    name: "Alex Kim", 
    avatar: "👨‍💻",
    skills: ["Reconocimiento de Patrones", "Análisis de Datos", "Aprendizaje Automático", "Modelado Estadístico"], 
    match: 98, 
    superpower: "🧠", 
    stage: "Postulado", 
    location: "San Francisco",
    neurodivergence: "ADHD + Autism",
    iq: 142,
    eq: 85,
    experience: "5 years",
    education: "MIT - Computer Science",
    gameScores: { memory: 95, pattern: 98, logic: 92, creativity: 87, focus: 94 },
    quizResults: { technical: 96, behavioral: 88, cultural: 91 },
    strengths: ["Hyperfocus", "Systems Thinking", "Detail Orientation"],
    accommodations: ["Quiet workspace", "Flexible hours", "Written instructions"],
    salary: "$120,000 - $140,000",
    availability: "2 weeks",
    portfolio: "github.com/alexkim",
    lastActive: "2 hours ago",
    interviewHistory: [
      { company: "Google", result: "Passed", score: 94 },
      { company: "Apple", result: "Passed", score: 91 }
    ]
  },
  { 
    id: 2, 
    name: "Jordan Lee", 
    avatar: "👩‍🎨",
    skills: ["Resolución Creativa de Problemas", "Diseño UX", "Investigación de Usuarios", "Prototipado"], 
    match: 94, 
    superpower: "🎨", 
    stage: "Entrevistando", 
    location: "New York",
    neurodivergence: "Dyslexia",
    iq: 128,
    eq: 132,
    experience: "3 years",
    education: "Stanford - Design",
    gameScores: { memory: 88, pattern: 91, logic: 85, creativity: 98, focus: 89 },
    quizResults: { technical: 89, behavioral: 95, cultural: 92 },
    strengths: ["Creative Thinking", "Visual Processing", "Empathy"],
    accommodations: ["Text-to-speech", "Visual aids", "Extended time"],
    salary: "$85,000 - $100,000",
    availability: "Immediate",
    portfolio: "dribbble.com/jordanlee",
    lastActive: "30 minutes ago",
    interviewHistory: [
      { company: "Adobe", result: "Pending", score: 92 }
    ]
  },
  { 
    id: 3, 
    name: "Morgan Patel", 
    avatar: "👨‍🔬",
    skills: ["Atención al Detalle", "Pruebas QA", "Detección de Errores", "Mejora de Procesos"], 
    match: 91, 
    superpower: "⚙️", 
    stage: "Evaluado", 
    location: "Austin",
    neurodivergence: "OCD",
    iq: 135,
    eq: 79,
    experience: "4 years",
    education: "UT Austin - Engineering",
    gameScores: { memory: 92, pattern: 94, logic: 96, creativity: 78, focus: 97 },
    quizResults: { technical: 94, behavioral: 82, cultural: 87 },
    strengths: ["Perfectionism", "Systematic Approach", "Quality Focus"],
    accommodations: ["Structured tasks", "Clear deadlines", "Regular check-ins"],
    salary: "$75,000 - $90,000",
    availability: "1 month",
    portfolio: "linkedin.com/in/morganpatel",
    lastActive: "1 day ago",
    interviewHistory: []
  },
  { 
    id: 4, 
    name: "Casey Rodriguez", 
    avatar: "👩‍💻",
    skills: ["Hiperconcentración", "Arquitectura de Código", "Diseño de Sistemas", "Optimización de Rendimiento"], 
    match: 96, 
    superpower: "💻", 
    stage: "Oferta", 
    location: "Seattle",
    neurodivergence: "ADHD",
    iq: 148,
    eq: 91,
    experience: "6 years",
    education: "Carnegie Mellon - CS",
    gameScores: { memory: 89, pattern: 95, logic: 97, creativity: 91, focus: 98 },
    quizResults: { technical: 97, behavioral: 89, cultural: 94 },
    strengths: ["Deep Focus", "Problem Solving", "Innovation"],
    accommodations: ["Noise-cancelling headphones", "Flexible schedule", "Minimal meetings"],
    salary: "$140,000 - $160,000",
    availability: "3 weeks",
    portfolio: "github.com/caseyrod",
    lastActive: "45 minutes ago",
    interviewHistory: [
      { company: "Microsoft", result: "Passed", score: 96 },
      { company: "Netflix", result: "Passed", score: 94 }
    ]
  },
  { 
    id: 5, 
    name: "River Chen", 
    avatar: "👨‍🔧",
    skills: ["Pensamiento Sistémico", "Optimización de Procesos", "Ingeniería de Datos", "Analítica"], 
    match: 89, 
    superpower: "🔧", 
    stage: "Postulado", 
    location: "Boston",
    neurodivergence: "Autism",
    iq: 139,
    eq: 76,
    experience: "7 years",
    education: "Harvard - Mathematics",
    gameScores: { memory: 94, pattern: 97, logic: 95, creativity: 82, focus: 92 },
    quizResults: { technical: 95, behavioral: 79, cultural: 85 },
    strengths: ["Logical Thinking", "Pattern Recognition", "Consistency"],
    accommodations: ["Predictable routine", "Written communication", "Solo work"],
    salary: "$110,000 - $130,000",
    availability: "6 weeks",
    portfolio: "medium.com/@riverchen",
    lastActive: "3 hours ago",
    interviewHistory: []
  },
  { 
    id: 6, 
    name: "Sage Williams", 
    avatar: "👩‍🎓",
    skills: ["Investigación", "Análisis", "Documentación", "Gestión del Conocimiento"], 
    match: 87, 
    superpower: "📚", 
    stage: "Evaluado", 
    location: "Chicago",
    neurodivergence: "Dyspraxia",
    iq: 144,
    eq: 88,
    experience: "2 years",
    education: "Northwestern - Psychology",
    gameScores: { memory: 96, pattern: 89, logic: 91, creativity: 94, focus: 87 },
    quizResults: { technical: 88, behavioral: 92, cultural: 89 },
    strengths: ["Memory", "Research Skills", "Attention to Detail"],
    accommodations: ["Ergonomic setup", "Voice recognition", "Flexible input methods"],
    salary: "$65,000 - $80,000",
    availability: "Immediate",
    portfolio: "researchgate.net/sage-williams",
    lastActive: "5 hours ago",
    interviewHistory: []
  },
  { 
    id: 7, 
    name: "Avery Johnson", 
    avatar: "👨‍🎯",
    skills: ["Estrategia", "Planificación", "Evaluación de Riesgos", "Análisis de Negoc ios"], 
    match: 93, 
    superpower: "🎯", 
    stage: "Entrevistando", 
    location: "Denver",
    neurodivergence: "ADHD + Dyslexia",
    iq: 133,
    eq: 95,
    experience: "8 years",
    education: "Wharton - Business",
    gameScores: { memory: 86, pattern: 92, logic: 94, creativity: 96, focus: 88 },
    quizResults: { technical: 91, behavioral: 94, cultural: 96 },
    strengths: ["Strategic Thinking", "Leadership", "Innovation"],
    accommodations: ["Mind mapping tools", "Recording meetings", "Visual presentations"],
    salary: "$95,000 - $115,000",
    availability: "4 weeks",
    portfolio: "avery-johnson.com",
    lastActive: "1 hour ago",
    interviewHistory: [
      { company: "Salesforce", result: "Passed", score: 89 }
    ]
  },
  { 
    id: 8, 
    name: "Quinn Torres", 
    avatar: "👩‍🔬",
    skills: ["Innovación", "Experimentación", "Desarrollo de Productos", "Investigación"], 
    match: 90, 
    superpower: "🔬", 
    stage: "Postulado", 
    location: "Portland",
    neurodivergence: "Autism + ADHD",
    iq: 151,
    eq: 82,
    experience: "4 years",
    education: "Caltech - Chemistry",
    gameScores: { memory: 93, pattern: 96, logic: 98, creativity: 89, focus: 95 },
    quizResults: { technical: 96, behavioral: 85, cultural: 88 },
    strengths: ["Innovation", "Problem Solving", "Analytical Thinking"],
    accommodations: ["Lab environment", "Minimal interruptions", "Detailed protocols"],
    salary: "$105,000 - $125,000",
    availability: "2 months",
    portfolio: "quinn-research.com",
    lastActive: "6 hours ago",
    interviewHistory: []
  }
];

const COLORS = {
  primary: '#8B5CF6',
  secondary: '#F59E0B',
  accent: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  dark: '#1F2937'
};

const pieColors = ['#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#3B82F6'];

export default function AdvancedCandidates() {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid, table, analytics
  const [filters, setFilters] = useState({
    search: '',
    stage: 'all',
    neurodivergence: 'all',
    minMatch: 0,
    location: 'all',
    sortBy: 'match'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [savedCandidates, setSavedCandidates] = useState([]);

  // Filter and sort candidates
  const filteredCandidates = extendedTalents
    .filter(candidate => {
      const matchesSearch = candidate.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                          candidate.skills.some(skill => skill.toLowerCase().includes(filters.search.toLowerCase())) ||
                          candidate.location.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStage = filters.stage === 'all' || candidate.stage === filters.stage;
      const matchesNeurodivergence = filters.neurodivergence === 'all' || candidate.neurodivergence.includes(filters.neurodivergence);
      const matchesMinMatch = candidate.match >= filters.minMatch;
      const matchesLocation = filters.location === 'all' || candidate.location === filters.location;
      
      return matchesSearch && matchesStage && matchesNeurodivergence && matchesMinMatch && matchesLocation;
    })
    .sort((a, b) => {
      switch(filters.sortBy) {
        case 'match': return b.match - a.match;
        case 'name': return a.name.localeCompare(b.name);
        case 'iq': return b.iq - a.iq;
        case 'experience': return parseInt(b.experience) - parseInt(a.experience);
        default: return 0;
      }
    });

  // Analytics data
  const analyticsData = {
    byStage: [
      { name: 'Applied', value: filteredCandidates.filter(c => c.stage === 'Applied').length },
      { name: 'Assessed', value: filteredCandidates.filter(c => c.stage === 'Assessed').length },
      { name: 'Interviewing', value: filteredCandidates.filter(c => c.stage === 'Interviewing').length },
      { name: 'Offer', value: filteredCandidates.filter(c => c.stage === 'Offer').length }
    ],
    byNeurodivergence: [
      { name: 'ADHD', value: filteredCandidates.filter(c => c.neurodivergence.includes('ADHD')).length },
      { name: 'Autism', value: filteredCandidates.filter(c => c.neurodivergence.includes('Autism')).length },
      { name: 'Dyslexia', value: filteredCandidates.filter(c => c.neurodivergence.includes('Dyslexia')).length },
      { name: 'OCD', value: filteredCandidates.filter(c => c.neurodivergence.includes('OCD')).length }
    ],
    avgScores: {
      iq: Math.round(filteredCandidates.reduce((sum, c) => sum + c.iq, 0) / filteredCandidates.length),
      match: Math.round(filteredCandidates.reduce((sum, c) => sum + c.match, 0) / filteredCandidates.length),
      technical: Math.round(filteredCandidates.reduce((sum, c) => sum + c.quizResults.technical, 0) / filteredCandidates.length)
    }
  };

  const handleSaveCandidate = (candidateId) => {
    setSavedCandidates(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const CandidateCard = ({ candidate }) => (
    <div className={styles.candidateCard}>
      <div className={styles.candidateHeader}>
        <div className={styles.candidateInfo}>
          <div className={styles.candidateAvatar}>{candidate.avatar}</div>
          <div className={styles.candidateDetails}>
            <h3>{candidate.name}</h3>
            <p className={styles.candidateLocation}>{candidate.location}</p>
            <p className={styles.candidateType}>{candidate.neurodivergence}</p>
          </div>
        </div>
        <div className={styles.candidateMatch}>
          <div className={styles.candidateSuperpower}>{candidate.superpower}</div>
          <div className={styles.matchScore}>{candidate.match}%</div>
          <div className={styles.matchLabel}>Match</div>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <div className={`${styles.statValue} ${styles.iq}`}>{candidate.iq}</div>
          <div className={styles.statLabel}>IQ</div>
        </div>
        <div className={styles.statItem}>
          <div className={`${styles.statValue} ${styles.eq}`}>{candidate.eq}</div>
          <div className={styles.statLabel}>EQ</div>
        </div>
        <div className={styles.statItem}>
          <div className={`${styles.statValue} ${styles.exp}`}>{candidate.experience}</div>
          <div className={styles.statLabel}>Exp</div>
        </div>
      </div>

      <div className={styles.gamePerformance}>
        <div className={styles.performanceHeader}>
          <span className={styles.performanceTitle}>Rendimiento en Juegos</span>
          <span className={styles.performanceAverage}>
            Prom: {Math.round(Object.values(candidate.gameScores).reduce((a, b) => a + b) / Object.values(candidate.gameScores).length)}
          </span>
        </div>
        <div className={styles.performanceBars}>
          {Object.entries(candidate.gameScores).map(([key, value]) => (
            <div key={key} className={styles.performanceBar}>
              <div className={styles.barContainer}>
                <div 
                  className={styles.barFill}
                  style={{ width: `${value}%` }}
                />
              </div>
              <div className={styles.barLabel}>{key}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.skillsSection}>
        <div className={styles.skillsHeader}>
          <span className={styles.skillsTitle}>Habilidades</span>
          <span className={`${styles.stageBadge} ${
            candidate.stage === 'Applied' ? styles.applied :
            candidate.stage === 'Assessed' ? styles.assessed :
            candidate.stage === 'Interviewing' ? styles.interviewing :
            styles.offer
          }`}>
            {candidate.stage}
          </span>
        </div>
        <div className={styles.skillsList}>
          {candidate.skills.slice(0, 2).map((skill, idx) => (
            <span key={idx} className={styles.skillTag}>
              {skill}
            </span>
          ))}
          {candidate.skills.length > 2 && (
            <span className={styles.moreSkills}>+{candidate.skills.length - 2} más</span>
          )}
        </div>
      </div>

      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <div className={`${styles.infoValue} ${styles.salary}`}>{candidate.salary}</div>
          <div className={styles.infoLabel}>Rango Salarial</div>
        </div>
        <div className={styles.infoItem}>
          <div className={`${styles.infoValue} ${styles.availability}`}>{candidate.availability}</div>
          <div className={styles.infoLabel}>Disponible</div>
        </div>
      </div>

      <div className={styles.actionButtons}>
        <button 
          onClick={() => setSelectedCandidate(candidate)}
          className={`${styles.actionButton} ${styles.view}`}
        >
          <FaEye /> <span>Ver</span>
        </button>
        <button className={`${styles.actionButton} ${styles.invite}`}>
          <FaEnvelope /> <span>Invitar</span>
        </button>
        <button className={`${styles.actionButton} ${styles.schedule}`}>
          <FaCalendarAlt /> <span>Agendar</span>
        </button>
        <button 
          onClick={() => handleSaveCandidate(candidate.id)}
          className={`${styles.actionButton} ${styles.save} ${savedCandidates.includes(candidate.id) ? styles.saved : ''}`}
        >
          <FaSave />
        </button>
      </div>

      <div className={styles.lastActive}>
        Última actividad: {candidate.lastActive}
      </div>
    </div>
  );

  const CandidateDetailModal = ({ candidate, onClose }) => (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderContent}>
            <div className={styles.modalTitle}>
              <div className={styles.modalAvatar}>{candidate.avatar}</div>
              <div className={styles.modalInfo}>
                <h2>{candidate.name}</h2>
                <p className="education">{candidate.education}</p>
                <p className="neurodivergence">{candidate.neurodivergence}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className={styles.modalClose}
            >
              ×
            </button>
          </div>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.modalGrid}>
            {/* Performance Radar Chart */}
            <div className={styles.modalSection}>
              <h3 className={styles.modalSectionTitle}>Perfil de Rendimiento</h3>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={Object.entries(candidate.gameScores).map(([key, value]) => ({
                  subject: key,
                  score: value,
                  fullMark: 100
                }))}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Score" dataKey="score" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Quiz Results */}
            <div className={styles.modalSection}>
              <h3 className={styles.modalSectionTitle}>Resultados de Evaluación</h3>
              <div className="space-y-3">
                {Object.entries(candidate.quizResults).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                      <span className="capitalize">{key}</span>
                      <span>{value}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-yellow-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills & Strengths */}
            <div className={styles.modalSection}>
              <h3 className={styles.modalSectionTitle}>Habilidades y Fortalezas</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Habilidades Técnicas</h4>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill, idx) => (
                      <span key={idx} className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Fortalezas Principales</h4>
                  <div className="flex flex-wrap gap-2">
                    {candidate.strengths.map((strength, idx) => (
                      <span key={idx} className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Accommodations */}
            <div className={styles.modalSection}>
              <h3 className={styles.modalSectionTitle}>Adaptaciones</h3>
              <ul className="space-y-2">
                {candidate.accommodations.map((accommodation, idx) => (
                  <li key={idx} className="text-sm text-gray-300 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span>{accommodation}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Interview History */}
            <div className={styles.modalSection}>
              <h3 className={styles.modalSectionTitle}>Historial de Entrevistas</h3>
              {candidate.interviewHistory.length > 0 ? (
                <div className="space-y-2">
                  {candidate.interviewHistory.map((interview, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">{interview.company}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          interview.result === 'Passed' ? 'bg-green-500/20 text-green-400' :
                          interview.result === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {interview.result}
                        </span>
                        <span className="text-gray-400">{interview.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No hay historial de entrevistas disponible</p>
              )}
            </div>

            {/* Additional Info */}
            <div className={styles.modalSection}>
              <h3 className={styles.modalSectionTitle}>Información Adicional</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Experiencia:</span>
                  <span className="text-white ml-2">{candidate.experience}</span>
                </div>
                <div>
                  <span className="text-gray-400">Disponibilidad:</span>
                  <span className="text-white ml-2">{candidate.availability}</span>
                </div>
                <div>
                  <span className="text-gray-400">Portafolio:</span>
                  <a href={`https://${candidate.portfolio}`} className="text-blue-400 ml-2 hover:underline">
                    {candidate.portfolio}
                  </a>
                </div>
                <div>
                  <span className="text-gray-400">Salario:</span>
                  <span className="text-green-400 ml-2">{candidate.salary}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.modalActions}>
            <button className={`${styles.modalActionButton} ${styles.primary}`}>
              <FaEnvelope /> <span>Enviar Invitación</span>
            </button>
            <button className={`${styles.modalActionButton} ${styles.secondary}`}>
              <FaCalendarAlt /> <span>Agendar Entrevista</span>
            </button>
            <button className={`${styles.modalActionButton} ${styles.success}`}>
              <FaDownload /> <span>Descargar Informe</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.candidatesContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.headerTitle}>
              🧠 Neurodivergent Talent Hub
            </h1>
            <p className={styles.headerSubtitle}>
              Descubre mentes excepcionales • {filteredCandidates.length} candidatos •
              IQ Prom: {analyticsData.avgScores.iq} • Match Prom: {analyticsData.avgScores.match}%
            </p>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.statCard}>
              <FaUsers className={styles.statIcon} style={{color: '#9333EA'}} />
              <span className={styles.statValue}>{filteredCandidates.length}</span>
            </div>
            <div className={styles.statCard}>
              <FaSave className={styles.statIcon} style={{color: '#F59E0B'}} />
              <span className={styles.statValue}>{savedCandidates.length}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className={styles.quickStats}>
          <div className={`${styles.statCardLarge} ${styles.statCardPurple}`}>
            <div className={styles.statCardContent}>
              <div className={styles.statCardInfo}>
                <h3>Mejores Talentos</h3>
                <div className={styles.statValue}>
                  {filteredCandidates.filter(c => c.match >= 95).length}
                </div>
              </div>
              <FaTrophy className={styles.statCardIcon} style={{color: '#FFD700'}} />
            </div>
          </div>
          <div className={`${styles.statCardLarge} ${styles.statCardBlue}`}>
            <div className={styles.statCardContent}>
              <div className={styles.statCardInfo}>
                <h3>Listos para Entrevistar</h3>
                <div className={styles.statValue}>
                  {filteredCandidates.filter(c => c.stage === 'Assessed').length}
                </div>
              </div>
              <FaUserGraduate className={styles.statCardIcon} style={{color: '#E0E7FF'}} />
            </div>
          </div>
          <div className={`${styles.statCardLarge} ${styles.statCardGreen}`}>
            <div className={styles.statCardContent}>
              <div className={styles.statCardInfo}>
                <h3>IQ Alto (140+)</h3>
                <div className={styles.statValue}>
                  {filteredCandidates.filter(c => c.iq >= 140).length}
                </div>
              </div>
              <FaBrain className={styles.statCardIcon} style={{color: '#D1FAE5'}} />
            </div>
          </div>
          <div className={`${styles.statCardLarge} ${styles.statCardYellow}`}>
            <div className={styles.statCardContent}>
              <div className={styles.statCardInfo}>
                <h3>Disponibilidad Inmediata</h3>
                <div className={styles.statValue}>
                  {filteredCandidates.filter(c => c.availability === 'Immediate').length}
                </div>
              </div>
              <FaRocket className={styles.statCardIcon} style={{color: '#FEF3C7'}} />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.controlsContent}>
            <div className={styles.controlsLeft}>
              <div className={styles.searchContainer}>
                <FaSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Buscar candidatos..."
                  className={styles.searchInput}
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={styles.filterButton}
              >
                <FaFilter /> <span>Filtros</span>
              </button>
            </div>
            
            <div className={styles.viewModeButtons}>
              <button
                onClick={() => setViewMode('grid')}
                className={`${styles.viewModeButton} ${viewMode === 'grid' ? styles.active : ''}`}
              >
                Cuadrícula
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`${styles.viewModeButton} ${viewMode === 'table' ? styles.active : ''}`}
              >
                Tabla
              </button>
              <button
                onClick={() => setViewMode('analytics')}
                className={`${styles.viewModeButton} ${viewMode === 'analytics' ? styles.active : ''}`}
              >
                Análisis
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className={styles.advancedFilters}>
            <h3 className={styles.filtersTitle}>Filtros Avanzados</h3>
            <div className={styles.filtersGrid}>
              <select
                className={styles.filterSelect}
                value={filters.stage}
                onChange={(e) => setFilters({...filters, stage: e.target.value})}
              >
                <option value="all">Todas las Etapas</option>
                <option value="Postulado">Postulado</option>
                <option value="Evaluado">Evaluado</option>
                <option value="Entrevistando">Entrevistando</option>
                <option value="Oferta">Oferta</option>
              </select>
              
              <select
                className={styles.filterSelect}
                value={filters.neurodivergence}
                onChange={(e) => setFilters({...filters, neurodivergence: e.target.value})}
              >
                <option value="all">Todos los Tipos</option>
                <option value="ADHD">ADHD</option>
                <option value="Autism">Autism</option>
                <option value="Dyslexia">Dyslexia</option>
                <option value="OCD">OCD</option>
                <option value="Dyspraxia">Dyspraxia</option>
              </select>
              
              <select
                className={styles.filterSelect}
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
              >
                <option value="all">Todas las Ubicaciones</option>
                <option value="San Francisco">San Francisco</option>
                <option value="New York">New York</option>
                <option value="Austin">Austin</option>
                <option value="Seattle">Seattle</option>
                <option value="Boston">Boston</option>
              </select>
              
              <div className={styles.rangeContainer}>
                <label className={styles.rangeLabel}>Match Mínimo:</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.minMatch}
                  onChange={(e) => setFilters({...filters, minMatch: parseInt(e.target.value)})}
                  className={styles.rangeInput}
                />
                <span className={styles.rangeValue}>{filters.minMatch}%</span>
              </div>
              
              <select
                className={styles.filterSelect}
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
              >
                <option value="match">Ordenar por Match</option>
                <option value="name">Ordenar por Nombre</option>
                <option value="iq">Ordenar por IQ</option>
                <option value="experience">Ordenar por Experiencia</option>
              </select>
              
              <button
                onClick={() => setFilters({
                  search: '',
                  stage: 'all',
                  neurodivergence: 'all',
                  minMatch: 0,
                  location: 'all',
                  sortBy: 'match'
                })}
                className={styles.clearButton}
              >
                Limpiar Todo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      {viewMode === 'grid' && (
        <div className={styles.candidatesGrid}>
          {filteredCandidates.map(candidate => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      )}

      {viewMode === 'table' && (
        <div className={styles.tableContainer}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th>Candidato</th>
                  <th>Match</th>
                  <th>IQ/EQ</th>
                  <th>Etapa</th>
                  <th>Tipo</th>
                  <th>Experiencia</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map(candidate => (
                  <tr key={candidate.id} className={styles.tableRow}>
                    <td className={`${styles.tableCell} ${styles.candidate}`}>
                      <div className={styles.candidateAvatar}>{candidate.avatar}</div>
                      <div>
                        <div className={styles.candidateDetails}>{candidate.name}</div>
                        <div className={styles.candidateLocation}>{candidate.location}</div>
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.candidateMatch}>
                        <div className={styles.matchScore}>{candidate.match}%</div>
                        <div className={styles.candidateSuperpower}>{candidate.superpower}</div>
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={`${styles.statValue} ${styles.iq}`}>{candidate.iq}</div>
                      <div className={`${styles.statValue} ${styles.eq}`}>{candidate.eq}</div>
                    </td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.stageBadge} ${
                        candidate.stage === 'Applied' ? styles.applied :
                        candidate.stage === 'Assessed' ? styles.assessed :
                        candidate.stage === 'Interviewing' ? styles.interviewing :
                        styles.offer
                      }`}>
                        {candidate.stage}
                      </span>
                    </td>
                    <td className={styles.tableCell} style={{color: '#9333EA'}}>
                      {candidate.neurodivergence}
                    </td>
                    <td className={styles.tableCell} style={{color: 'rgba(255, 255, 255, 0.7)'}}>
                      {candidate.experience}
                    </td>
                    <td className={`${styles.tableCell} ${styles.actions}`}>
                      <button 
                        onClick={() => setSelectedCandidate(candidate)}
                        className={`${styles.tableActionButton} ${styles.view}`}
                      >
                        <FaEye />
                      </button>
                      <button className={`${styles.tableActionButton} ${styles.invite}`}>
                        <FaEnvelope />
                      </button>
                      <button className={`${styles.tableActionButton} ${styles.schedule}`}>
                        <FaCalendarAlt />
                      </button>
                      <button 
                        onClick={() => handleSaveCandidate(candidate.id)}
                        className={`${styles.tableActionButton} ${styles.save} ${savedCandidates.includes(candidate.id) ? styles.saved : ''}`}
                      >
                        <FaSave />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewMode === 'analytics' && (
        <div className={styles.analyticsGrid}>
          {/* Pipeline Distribution */}
          <div className={styles.analyticsCard}>
            <h3 className={styles.analyticsTitle}>Distribución del Pipeline</h3>
            <div className={styles.analyticsContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.byStage}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analyticsData.byStage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Neurodivergence Types */}
          <div className={styles.analyticsCard}>
            <h3 className={styles.analyticsTitle}>Tipos de Neurodivergencia</h3>
            <div className={styles.analyticsContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.byNeurodivergence}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* IQ Distribution */}
          <div className={styles.analyticsCard}>
            <h3 className={styles.analyticsTitle}>Distribución de IQ</h3>
            <div className={styles.analyticsContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { range: '120-130', count: filteredCandidates.filter(c => c.iq >= 120 && c.iq < 130).length },
                  { range: '130-140', count: filteredCandidates.filter(c => c.iq >= 130 && c.iq < 140).length },
                  { range: '140-150', count: filteredCandidates.filter(c => c.iq >= 140 && c.iq < 150).length },
                  { range: '150+', count: filteredCandidates.filter(c => c.iq >= 150).length }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Match Score Trends */}
          <div className={styles.analyticsCard}>
            <h3 className={styles.analyticsTitle}>Distribución de Puntuaciones Match</h3>
            <div className={styles.analyticsContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { score: '80-85', count: filteredCandidates.filter(c => c.match >= 80 && c.match < 85).length },
                  { score: '85-90', count: filteredCandidates.filter(c => c.match >= 85 && c.match < 90).length },
                  { score: '90-95', count: filteredCandidates.filter(c => c.match >= 90 && c.match < 95).length },
                  { score: '95-100', count: filteredCandidates.filter(c => c.match >= 95).length }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="score" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <CandidateDetailModal 
          candidate={selectedCandidate} 
          onClose={() => setSelectedCandidate(null)} 
        />
      )}

      {/* Floating Action Button */}
      <div className={styles.floatingActions}>
        <button className={`${styles.floatingButton} ${styles.download}`}>
          <FaDownload />
        </button>
        <button className={`${styles.floatingButton} ${styles.share}`}>
          <FaShare />
        </button>
        <button className={`${styles.floatingButton} ${styles.users}`}>
          <FaUsers />
        </button>
      </div>
    </div>
  );
}