import React, { useState, useEffect } from 'react';
import { 
  FaUserTie, FaGamepad, FaDownload, FaPlay, FaPause, FaVideo, 
  FaUpload, FaCalendarAlt, FaChartLine, FaUsers, FaBrain, 
  FaAward, FaBookOpen, FaLightbulb, FaRocket, FaGraduationCap,
  FaEye, FaHeart, FaComment, FaShare, FaStar, FaFilter,
  FaPlus, FaEdit, FaTrash, FaSearch, FaClock, FaCheckCircle,
  FaSpinner, FaExpand, FaVolumeUp, FaClosedCaptioning
} from 'react-icons/fa';
import styles from './Training.module.css';

const trainingModules = [
  { 
    id: 1, 
    name: "Entendiendo el TDAH", 
    progress: 85, 
    certified: true, 
    duration: "45 min",
    type: "video",
    difficulty: "Principiante",
    rating: 4.8,
    enrolled: 124,
    description: "Guía completa sobre el TDAH en entornos laborales"
  },
  { 
    id: 2, 
    name: "Comunicación Inclusiva", 
    progress: 60, 
    certified: false, 
    duration: "30 min",
    type: "interactive",
    difficulty: "Intermedio",
    rating: 4.6,
    enrolled: 98,
    description: "Domina técnicas de comunicación para equipos neurodivergentes"
  },
  { 
    id: 3, 
    name: "Conciencia sobre Autismo", 
    progress: 100, 
    certified: true, 
    duration: "1h 15min",
    type: "video",
    difficulty: "Avanzado",
    rating: 4.9,
    enrolled: 156,
    description: "Profundización en el espectro autista y adaptaciones laborales"
  },
  { 
    id: 4, 
    name: "Apoyo para Dislexia", 
    progress: 30, 
    certified: false, 
    duration: "50 min",
    type: "quiz",
    difficulty: "Principiante",
    rating: 4.7,
    enrolled: 87,
    description: "Apoyando a empleados disléxicos en diversos escenarios laborales"
  },
];

const mentorVideos = [
  {
    id: 1,
    title: "Estrategias de Liderazgo Neurodivergente",
    thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=225&fit=crop",
    duration: "28:45",
    views: "2.3K",
    likes: 189,
    mentor: "Dr. Sarah Chen",
    specialty: "Liderazgo con TDAH",
    uploaded: "2 days ago",
    rating: 4.9
  },
  {
    id: 2,
    title: "Construyendo Equipos Inclusivos",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop",
    duration: "35:12",
    views: "1.8K",
    likes: 156,
    mentor: "James Rodriguez",
    specialty: "Dinámicas de Equipo",
    uploaded: "1 week ago",
    rating: 4.8
  },
  {
    id: 3,
    title: "Técnicas de Entrevista para Autismo",
    thumbnail: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=225&fit=crop",
    duration: "42:18",
    views: "3.1K",
    likes: 234,
    mentor: "Dr. Emma Watson",
    specialty: "Apoyo para Autismo",
    uploaded: "3 days ago",
    rating: 4.9
  }
];

const upcomingEvents = [
  {
    id: 1,
    title: "Taller de Contratación Neurodiversa",
    date: "July 15, 2025",
    time: "2:00 PM",
    attendees: 45,
    type: "taller"
  },
  {
    id: 2,
    title: "Sesión de Mentoría 1-a-1",
    date: "July 12, 2025",
    time: "10:00 AM",
    attendees: 1,
    type: "mentoría"
  },
  {
    id: 3,
    title: "Desafío de Construcción de Equipo",
    date: "July 20, 2025",
    time: "3:30 PM",
    attendees: 28,
    type: "desafío"
  }
];

export default function Training() {
  const [selectedModule, setSelectedModule] = useState(null);
  const [activeTab, setActiveTab] = useState('modules');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isUploading, setIsUploading] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [progress, setProgress] = useState(0);

  // Simulate progress animation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => prev < 100 ? prev + 1 : 0);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = () => {
    setIsUploading(true);
    setTimeout(() => setIsUploading(false), 3000);
  };

  const VideoPlayer = ({ video, onClose }) => (
    <div className={styles.videoPlayerOverlay}>
      <div className={styles.videoPlayerContent}>
        <button 
          onClick={onClose}
          className={styles.videoPlayerClose}
        >
          ×
        </button>
        <div className={styles.videoPlayerContainer}>
          <img 
            src={video.thumbnail} 
            alt={video.title}
            className={styles.videoPlayerThumbnail}
          />
          <div className={styles.videoPlayerOverlay}>
            <div className={styles.videoPlayerPlayButton}>
              <FaPlay />
            </div>
          </div>
          <div className={styles.videoPlayerControls}>
            <div className={styles.videoPlayerControlsContent}>
              <div className={styles.videoPlayerControlsLeft}>
                <button className={styles.videoPlayerControlButton}>
                  <FaPlay />
                </button>
                <button className={styles.videoPlayerControlButton}>
                  <FaVolumeUp />
                </button>
                <button className={styles.videoPlayerControlButton}>
                  <FaClosedCaptioning />
                </button>
              </div>
              <button className={styles.videoPlayerControlButton}>
                <FaExpand />
              </button>
            </div>
          </div>
        </div>
        <div className={styles.videoPlayerInfo}>
          <h3 className={styles.videoPlayerTitle}>{video.title}</h3>
          <p className={styles.videoPlayerMeta}>by {video.mentor} • {video.views} views • {video.uploaded}</p>
        </div>
      </div>
    </div>
  );

  const filteredModules = trainingModules.filter(module => 
    module.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterType === 'all' || module.type === filterType)
  );

  return (
    <div className={styles.trainingContainer}>
      {/* Animated Background Elements */}
      <div className={styles.backgroundElements}>
        <div className={`${styles.backgroundElement} ${styles.purple}`}></div>
        <div className={`${styles.backgroundElement} ${styles.yellow}`}></div>
        <div className={`${styles.backgroundElement} ${styles.purple2}`}></div>
      </div>

      <div className={styles.mainContent}>
        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div>
              <h1 className={styles.headerTitle}>
                🧠 Hub de Capacitación y Mentoría
              </h1>
              <p className={styles.headerSubtitle}>Empodera a tu equipo con excelencia en neurodiversidad</p>
            </div>
            <div className={styles.headerStats}>
              <div className={styles.brainIcon}>
                <FaBrain />
              </div>
              <div className={styles.completionRate}>
                <div className={styles.completionValue}>94%</div>
                <div className={styles.completionLabel}>Tasa de Finalización</div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className={styles.quickStats}>
            <div className={`${styles.statCard} ${styles.purple}`}>
              <div className={styles.statContent}>
                <div className={styles.statInfo}>
                  <div className={`${styles.statValue} ${styles.purple}`}>124</div>
                  <div className={styles.statLabel}>Aprendices Activos</div>
                </div>
                <FaUsers className={`${styles.statIcon} ${styles.purple}`} />
              </div>
            </div>
            <div className={`${styles.statCard} ${styles.yellow}`}>
              <div className={styles.statContent}>
                <div className={styles.statInfo}>
                  <div className={`${styles.statValue} ${styles.yellow}`}>48</div>
                  <div className={styles.statLabel}>Certificaciones</div>
                </div>
                <FaAward className={`${styles.statIcon} ${styles.yellow}`} />
              </div>
            </div>
            <div className={`${styles.statCard} ${styles.green}`}>
              <div className={styles.statContent}>
                <div className={styles.statInfo}>
                  <div className={`${styles.statValue} ${styles.green}`}>89%</div>
                  <div className={styles.statLabel}>Satisfacción</div>
                </div>
                <FaHeart className={`${styles.statIcon} ${styles.green}`} />
              </div>
            </div>
            <div className={`${styles.statCard} ${styles.blue}`}>
              <div className={styles.statContent}>
                <div className={styles.statInfo}>
                  <div className={`${styles.statValue} ${styles.blue}`}>156h</div>
                  <div className={styles.statLabel}>Horas Totales</div>
                </div>
                <FaClock className={`${styles.statIcon} ${styles.blue}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={styles.navigationTabs}>
          {[
            { id: 'modules', label: 'Módulos de Capacitación', icon: FaBookOpen },
            { id: 'videos', label: 'Videos de Mentores', icon: FaVideo },
            { id: 'events', label: 'Eventos Próximos', icon: FaCalendarAlt },
            { id: 'analytics', label: 'Análisis', icon: FaChartLine },
            { id: 'upload', label: 'Subir Contenido', icon: FaUpload }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
            >
              <tab.icon />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        {activeTab === 'modules' && (
          <div>
            {/* Search and Filter */}
            <div className={styles.searchFilter}>
              <div className={styles.searchContainer}>
                <FaSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Buscar módulos de capacitación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">Todos los Tipos</option>
                <option value="video">Video</option>
                <option value="interactive">Interactivo</option>
                <option value="quiz">Cuestionario</option>
              </select>
            </div>

            {/* Modules Grid */}
            <div className={styles.modulesGrid}>
              {filteredModules.map((module) => (
                <div key={module.id} className={styles.moduleCard}>
                  <div className={styles.moduleHeader}>
                    <div className={styles.moduleInfo}>
                      <h3 className={styles.moduleTitle}>{module.name}</h3>
                      <p className={styles.moduleDescription}>{module.description}</p>
                      <div className={styles.moduleMeta}>
                        <span className={styles.metaItem}>
                          <FaClock />
                          <span>{module.duration}</span>
                        </span>
                        <span className={styles.metaItem}>
                          <FaUsers />
                          <span>{module.enrolled} inscritos</span>
                        </span>
                        <span className={`${styles.metaItem} ${styles.rating}`}>
                          <FaStar />
                          <span>{module.rating}</span>
                        </span>
                      </div>
                    </div>
                    <div className={styles.moduleBadges}>
                      {module.certified && (
                        <div className={styles.certifiedBadge}>
                          <FaCheckCircle />
                          Certificado
                        </div>
                      )}
                      <div className={`${styles.difficultyBadge} ${
                        module.difficulty === 'Beginner' ? styles.beginner :
                        module.difficulty === 'Intermediate' ? styles.intermediate :
                        styles.advanced
                      }`}>
                        {module.difficulty}
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.progressSection}>
                    <div className={styles.progressHeader}>
                      <span className={styles.progressLabel}>Progreso</span>
                      <span className={styles.progressValue}>{module.progress}%</span>
                    </div>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill}
                        style={{ width: `${module.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className={styles.moduleActions}>
                    <div className={styles.actionButtons}>
                      <button className={styles.primaryButton}>
                        <FaPlay />
                        Continuar
                      </button>
                      <button className={styles.secondaryButton}>
                        <FaShare />
                      </button>
                    </div>
                    <div className={styles.actionButtons}>
                      <button className={styles.iconButton}>
                        <FaEdit />
                      </button>
                      <button className={`${styles.iconButton} ${styles.danger}`}>
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div>
            <div className={styles.videosHeader}>
              <h2 className={styles.sectionTitle}>Biblioteca de Videos de Mentores</h2>
              <button className={styles.primaryButton}>
                <FaPlus />
                Agregar Nuevo Video
              </button>
            </div>
            
            <div className={styles.videosGrid}>
              {mentorVideos.map((video) => (
                <div key={video.id} className={styles.videoCard}>
                  <div className={styles.videoThumbnail} onClick={() => {setSelectedVideo(video); setShowVideoPlayer(true)}}>
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                    />
                    <div className={styles.videoOverlay}>
                      <div className={styles.playButton}>
                        <FaPlay />
                      </div>
                    </div>
                    <div className={styles.videoDuration}>
                      {video.duration}
                    </div>
                  </div>
                  
                  <div className={styles.videoContent}>
                    <h3 className={styles.videoTitle}>{video.title}</h3>
                    <p className={styles.videoAuthor}>by {video.mentor}</p>
                    <div className={styles.videoStats}>
                      <span className={styles.videoStat}>
                        <FaEye />
                        <span>{video.views}</span>
                      </span>
                      <span className={styles.videoStat}>
                        <FaHeart />
                        <span>{video.likes}</span>
                      </span>
                      <span className={`${styles.videoStat} ${styles.rating}`}>
                        <FaStar />
                        <span>{video.rating}</span>
                      </span>
                    </div>
                    <div className={styles.videoFooter}>
                      <span className={styles.videoDate}>{video.uploaded}</span>
                      <div className={styles.videoActions}>
                        <button className={styles.iconButton}>
                          <FaComment />
                        </button>
                        <button className={styles.iconButton}>
                          <FaShare />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div>
            <div className={styles.videosHeader}>
              <h2 className={styles.sectionTitle}>Eventos de Capacitación Próximos</h2>
              <button className={styles.primaryButton}>
                <FaPlus />
                Programar Evento
              </button>
            </div>
            
            <div className={styles.eventsList}>
              {upcomingEvents.map((event) => (
                <div key={event.id} className={styles.eventCard}>
                  <div className={styles.eventContent}>
                    <div className={styles.eventInfo}>
                      <div className={`${styles.eventIcon} ${
                        event.type === 'workshop' ? styles.workshop :
                        event.type === 'mentoring' ? styles.mentoring :
                        styles.challenge
                      }`}>
                        {event.type === 'workshop' ? <FaGraduationCap /> :
                         event.type === 'mentoring' ? <FaUserTie /> :
                         <FaGamepad />}
                      </div>
                      <div className={styles.eventDetails}>
                        <h3>{event.title}</h3>
                        <p>{event.date} at {event.time}</p>
                      </div>
                    </div>
                    <div className={styles.eventActions}>
                      <span className={styles.eventAttendees}>{event.attendees} asistirán</span>
                      <button className={styles.primaryButton}>
                        Unirse
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <h2 className={styles.sectionTitle}>Análisis de Capacitación</h2>
            <div className={styles.analyticsGrid}>
              <div className={styles.analyticsCard}>
                <h3 className={styles.analyticsTitle}>Tasas de Finalización</h3>
                <div className={styles.analyticsList}>
                  {trainingModules.map((module) => (
                    <div key={module.id}>
                      <div className={styles.progressItem}>
                        <span className={styles.progressLabel}>{module.name}</span>
                        <span className={styles.progressValue}>{module.progress}%</span>
                      </div>
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progressFill}
                          style={{ width: `${module.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className={styles.analyticsCard}>
                <h3 className={styles.analyticsTitle}>Métricas de Participación</h3>
                <div className={styles.analyticsList}>
                  <div className={styles.analyticsItem}>
                    <span className={styles.analyticsLabel}>Tiempo Promedio de Sesión</span>
                    <span className={styles.analyticsValue}>32 min</span>
                  </div>
                  <div className={styles.analyticsItem}>
                    <span className={styles.analyticsLabel}>Tasa de Visualización de Videos</span>
                    <span className={styles.analyticsValue}>87%</span>
                  </div>
                  <div className={styles.analyticsItem}>
                    <span className={styles.analyticsLabel}>Tasa de Éxito en Cuestionarios</span>
                    <span className={styles.analyticsValue}>94%</span>
                  </div>
                  <div className={styles.analyticsItem}>
                    <span className={styles.analyticsLabel}>Tasa de Certificación</span>
                    <span className={styles.analyticsValue}>76%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div>
            <h2 className={styles.sectionTitle}>Centro de Subida de Contenido</h2>
            <div className={styles.uploadGrid}>
              <div className={styles.uploadCard}>
                <h3 className={styles.uploadTitle}>Subir Nuevo Material de Capacitación</h3>
                <div className={styles.uploadForm}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Tipo de Contenido</label>
                    <select className={styles.formInput}>
                      <option>Módulo de Capacitación</option>
                      <option>Video de Mentor</option>
                      <option>Cuestionario Interactivo</option>
                      <option>Material de Taller</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Título</label>
                    <input 
                      type="text" 
                      className={styles.formInput}
                      placeholder="Ingresa el título del contenido..."
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Descripción</label>
                    <textarea 
                      className={`${styles.formInput} ${styles.formTextarea}`}
                      placeholder="Ingresa la descripción..."
                    />
                  </div>
                  <div className={styles.dropZone}>
                    <FaUpload className={styles.uploadIcon} />
                    <p className={styles.uploadText}>Arrastra y suelta tus archivos aquí o haz clic para buscar</p>
                    <button 
                      onClick={handleFileUpload}
                      className={styles.uploadButton}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <FaSpinner />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <FaUpload />
                          Seleccionar Archivos
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className={styles.uploadCard}>
                <h3 className={styles.uploadTitle}>Progreso de Subida</h3>
                <div className={styles.analyticsList}>
                  <div className={styles.analyticsItem}>
                    <span className={styles.analyticsLabel}>Estado de Procesamiento</span>
                    <span className={styles.progressValue}>
                      {progress < 100 ? `${progress}%` : 'Completo'}
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  
                  <div className={styles.recentUploads}>
                    <h4 className={styles.recentTitle}>Subidas Recientes</h4>
                    <div className={styles.uploadList}>
                      <div className={styles.uploadItem}>
                        <div className={styles.uploadItemInfo}>
                          <FaVideo className={`${styles.uploadItemIcon} ${styles.video}`} />
                          <div className={styles.uploadItemDetails}>
                            <h4>ADHD Leadership.mp4</h4>
                            <p>Subido hace 2 horas</p>
                          </div>
                        </div>
                        <div className={styles.uploadItemStatus}>
                          <span className={`${styles.statusText} ${styles.processed}`}>✓ Procesado</span>
                          <button className={styles.iconButton}>
                            <FaEye />
                          </button>
                        </div>
                      </div>
                      <div className={styles.uploadItem}>
                        <div className={styles.uploadItemInfo}>
                          <FaBookOpen className={`${styles.uploadItemIcon} ${styles.document}`} />
                          <div className={styles.uploadItemDetails}>
                            <h4>Módulo de Cuestionario sobre Autismo</h4>
                            <p>Subido hace 5 horas</p>
                          </div>
                        </div>
                        <div className={styles.uploadItemStatus}>
                          <span className={`${styles.statusText} ${styles.processing}`}>⏳ Procesando</span>
                          <button className={styles.iconButton}>
                            <FaEdit />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions Floating Panel */}
        <div className={styles.quickActions}>
          <h4 className={styles.quickActionsTitle}>Acciones Rápidas</h4>
          <div className={styles.quickActionsList}>
            <button className={`${styles.quickActionButton} ${styles.purple}`}>
              <FaUserTie />
              <span>Reservar Mentor</span>
            </button>
            <button className={`${styles.quickActionButton} ${styles.yellow}`}>
              <FaGamepad />
              <span>Lanzar Desafío</span>
            </button>
            <button className={`${styles.quickActionButton} ${styles.green}`}>
              <FaDownload />
              <span>Exportar Reporte</span>
            </button>
            <button className={`${styles.quickActionButton} ${styles.blue}`}>
              <FaRocket />
              <span>Insights de IA</span>
            </button>
          </div>
        </div>

        {/* Achievement Notification */}
        <div className={styles.achievementNotification}>
          <div className={styles.achievementContent}>
            <FaAward className={styles.achievementIcon} />
            <div className={styles.achievementText}>
              <h4>¡Nuevo Logro!</h4>
              <p>100 empleados certificados este mes</p>
            </div>
          </div>
        </div>

        {/* Video Player Modal */}
        {showVideoPlayer && selectedVideo && (
          <VideoPlayer 
            video={selectedVideo} 
            onClose={() => setShowVideoPlayer(false)} 
          />
        )}

        {/* AI Assistant Chat Bubble */}
        <div className={styles.aiAssistant}>
          <div className="relative">
            <FaBrain />
            <div className={styles.aiNotification}></div>
          </div>
        </div>

        {/* Progress Ring Animation */}
        <div className={styles.progressRing}>
          <svg viewBox="0 0 36 36">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgba(147, 51, 234, 0.3)"
              strokeWidth="2"
              className={styles.progressRingPath}
            />
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgb(147, 51, 234)"
              strokeWidth="2"
              strokeDasharray={`${progress}, 100`}
              className={styles.progressRingFill}
            />
          </svg>
          <div className={styles.progressRingText}>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Gamification Elements */}
        <div className={styles.gamificationElements}>
          <div className={`${styles.gamificationCard} ${styles.yellow}`}>
            <div className={styles.gamificationContent}>
              <FaLightbulb className={`${styles.gamificationIcon} ${styles.yellow}`} />
              <div className={`${styles.gamificationText} ${styles.yellow}`}>
                <h5>Nivel 5</h5>
                <p>Maestro de Capacitación</p>
              </div>
            </div>
          </div>
          <div className={`${styles.gamificationCard} ${styles.purple}`}>
            <div className={styles.gamificationContent}>
              <FaRocket className={`${styles.gamificationIcon} ${styles.purple}`} />
              <div className={`${styles.gamificationText} ${styles.purple}`}>
                <h5>Racha: 7 días</h5>
                <p>¡Sigue así!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}