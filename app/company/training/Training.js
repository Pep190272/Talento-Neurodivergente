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
    name: "Understanding ADHD", 
    progress: 85, 
    certified: true, 
    duration: "45 min",
    type: "video",
    difficulty: "Beginner",
    rating: 4.8,
    enrolled: 124,
    description: "Comprehensive guide to ADHD in workplace environments"
  },
  { 
    id: 2, 
    name: "Inclusive Communication", 
    progress: 60, 
    certified: false, 
    duration: "30 min",
    type: "interactive",
    difficulty: "Intermediate",
    rating: 4.6,
    enrolled: 98,
    description: "Master communication techniques for neurodivergent teams"
  },
  { 
    id: 3, 
    name: "Autism Awareness", 
    progress: 100, 
    certified: true, 
    duration: "1h 15min",
    type: "video",
    difficulty: "Advanced",
    rating: 4.9,
    enrolled: 156,
    description: "Deep dive into autism spectrum and workplace adaptations"
  },
  { 
    id: 4, 
    name: "Dyslexia Support", 
    progress: 30, 
    certified: false, 
    duration: "50 min",
    type: "quiz",
    difficulty: "Beginner",
    rating: 4.7,
    enrolled: 87,
    description: "Supporting dyslexic employees in various work scenarios"
  },
];

const mentorVideos = [
  {
    id: 1,
    title: "Neurodivergent Leadership Strategies",
    thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=225&fit=crop",
    duration: "28:45",
    views: "2.3K",
    likes: 189,
    mentor: "Dr. Sarah Chen",
    specialty: "ADHD Leadership",
    uploaded: "2 days ago",
    rating: 4.9
  },
  {
    id: 2,
    title: "Building Inclusive Teams",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop",
    duration: "35:12",
    views: "1.8K",
    likes: 156,
    mentor: "James Rodriguez",
    specialty: "Team Dynamics",
    uploaded: "1 week ago",
    rating: 4.8
  },
  {
    id: 3,
    title: "Autism Interview Techniques",
    thumbnail: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=225&fit=crop",
    duration: "42:18",
    views: "3.1K",
    likes: 234,
    mentor: "Dr. Emma Watson",
    specialty: "Autism Support",
    uploaded: "3 days ago",
    rating: 4.9
  }
];

const upcomingEvents = [
  {
    id: 1,
    title: "Neurodiversity Hiring Workshop",
    date: "July 15, 2025",
    time: "2:00 PM",
    attendees: 45,
    type: "workshop"
  },
  {
    id: 2,
    title: "1-on-1 Mentor Session",
    date: "July 12, 2025",
    time: "10:00 AM",
    attendees: 1,
    type: "mentoring"
  },
  {
    id: 3,
    title: "Team Building Challenge",
    date: "July 20, 2025",
    time: "3:30 PM",
    attendees: 28,
    type: "challenge"
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
                🧠 Training & Mentoring Hub
              </h1>
              <p className={styles.headerSubtitle}>Empower your team with neurodiversity excellence</p>
            </div>
            <div className={styles.headerStats}>
              <div className={styles.brainIcon}>
                <FaBrain />
              </div>
              <div className={styles.completionRate}>
                <div className={styles.completionValue}>94%</div>
                <div className={styles.completionLabel}>Completion Rate</div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className={styles.quickStats}>
            <div className={`${styles.statCard} ${styles.purple}`}>
              <div className={styles.statContent}>
                <div className={styles.statInfo}>
                  <div className={`${styles.statValue} ${styles.purple}`}>124</div>
                  <div className={styles.statLabel}>Active Learners</div>
                </div>
                <FaUsers className={`${styles.statIcon} ${styles.purple}`} />
              </div>
            </div>
            <div className={`${styles.statCard} ${styles.yellow}`}>
              <div className={styles.statContent}>
                <div className={styles.statInfo}>
                  <div className={`${styles.statValue} ${styles.yellow}`}>48</div>
                  <div className={styles.statLabel}>Certifications</div>
                </div>
                <FaAward className={`${styles.statIcon} ${styles.yellow}`} />
              </div>
            </div>
            <div className={`${styles.statCard} ${styles.green}`}>
              <div className={styles.statContent}>
                <div className={styles.statInfo}>
                  <div className={`${styles.statValue} ${styles.green}`}>89%</div>
                  <div className={styles.statLabel}>Satisfaction</div>
                </div>
                <FaHeart className={`${styles.statIcon} ${styles.green}`} />
              </div>
            </div>
            <div className={`${styles.statCard} ${styles.blue}`}>
              <div className={styles.statContent}>
                <div className={styles.statInfo}>
                  <div className={`${styles.statValue} ${styles.blue}`}>156h</div>
                  <div className={styles.statLabel}>Total Hours</div>
                </div>
                <FaClock className={`${styles.statIcon} ${styles.blue}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={styles.navigationTabs}>
          {[
            { id: 'modules', label: 'Training Modules', icon: FaBookOpen },
            { id: 'videos', label: 'Mentor Videos', icon: FaVideo },
            { id: 'events', label: 'Upcoming Events', icon: FaCalendarAlt },
            { id: 'analytics', label: 'Analytics', icon: FaChartLine },
            { id: 'upload', label: 'Content Upload', icon: FaUpload }
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
                  placeholder="Search training modules..."
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
                <option value="all">All Types</option>
                <option value="video">Video</option>
                <option value="interactive">Interactive</option>
                <option value="quiz">Quiz</option>
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
                          <span>{module.enrolled} enrolled</span>
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
                          Certified
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
                      <span className={styles.progressLabel}>Progress</span>
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
                        Continue
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
              <h2 className={styles.sectionTitle}>Mentor Video Library</h2>
              <button className={styles.primaryButton}>
                <FaPlus />
                Add New Video
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
              <h2 className={styles.sectionTitle}>Upcoming Training Events</h2>
              <button className={styles.primaryButton}>
                <FaPlus />
                Schedule Event
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
                      <span className={styles.eventAttendees}>{event.attendees} attending</span>
                      <button className={styles.primaryButton}>
                        Join
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
            <h2 className={styles.sectionTitle}>Training Analytics</h2>
            <div className={styles.analyticsGrid}>
              <div className={styles.analyticsCard}>
                <h3 className={styles.analyticsTitle}>Completion Rates</h3>
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
                <h3 className={styles.analyticsTitle}>Engagement Metrics</h3>
                <div className={styles.analyticsList}>
                  <div className={styles.analyticsItem}>
                    <span className={styles.analyticsLabel}>Average Session Time</span>
                    <span className={styles.analyticsValue}>32 min</span>
                  </div>
                  <div className={styles.analyticsItem}>
                    <span className={styles.analyticsLabel}>Video Watch Rate</span>
                    <span className={styles.analyticsValue}>87%</span>
                  </div>
                  <div className={styles.analyticsItem}>
                    <span className={styles.analyticsLabel}>Quiz Success Rate</span>
                    <span className={styles.analyticsValue}>94%</span>
                  </div>
                  <div className={styles.analyticsItem}>
                    <span className={styles.analyticsLabel}>Certification Rate</span>
                    <span className={styles.analyticsValue}>76%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div>
            <h2 className={styles.sectionTitle}>Content Upload Center</h2>
            <div className={styles.uploadGrid}>
              <div className={styles.uploadCard}>
                <h3 className={styles.uploadTitle}>Upload New Training Material</h3>
                <div className={styles.uploadForm}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Content Type</label>
                    <select className={styles.formInput}>
                      <option>Training Module</option>
                      <option>Mentor Video</option>
                      <option>Interactive Quiz</option>
                      <option>Workshop Material</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Title</label>
                    <input 
                      type="text" 
                      className={styles.formInput}
                      placeholder="Enter content title..."
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Description</label>
                    <textarea 
                      className={`${styles.formInput} ${styles.formTextarea}`}
                      placeholder="Enter description..."
                    />
                  </div>
                  <div className={styles.dropZone}>
                    <FaUpload className={styles.uploadIcon} />
                    <p className={styles.uploadText}>Drag & drop your files here or click to browse</p>
                    <button 
                      onClick={handleFileUpload}
                      className={styles.uploadButton}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <FaSpinner />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FaUpload />
                          Select Files
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className={styles.uploadCard}>
                <h3 className={styles.uploadTitle}>Upload Progress</h3>
                <div className={styles.analyticsList}>
                  <div className={styles.analyticsItem}>
                    <span className={styles.analyticsLabel}>Processing Status</span>
                    <span className={styles.progressValue}>
                      {progress < 100 ? `${progress}%` : 'Complete'}
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  
                  <div className={styles.recentUploads}>
                    <h4 className={styles.recentTitle}>Recent Uploads</h4>
                    <div className={styles.uploadList}>
                      <div className={styles.uploadItem}>
                        <div className={styles.uploadItemInfo}>
                          <FaVideo className={`${styles.uploadItemIcon} ${styles.video}`} />
                          <div className={styles.uploadItemDetails}>
                            <h4>ADHD Leadership.mp4</h4>
                            <p>Uploaded 2 hours ago</p>
                          </div>
                        </div>
                        <div className={styles.uploadItemStatus}>
                          <span className={`${styles.statusText} ${styles.processed}`}>✓ Processed</span>
                          <button className={styles.iconButton}>
                            <FaEye />
                          </button>
                        </div>
                      </div>
                      <div className={styles.uploadItem}>
                        <div className={styles.uploadItemInfo}>
                          <FaBookOpen className={`${styles.uploadItemIcon} ${styles.document}`} />
                          <div className={styles.uploadItemDetails}>
                            <h4>Autism Quiz Module</h4>
                            <p>Uploaded 5 hours ago</p>
                          </div>
                        </div>
                        <div className={styles.uploadItemStatus}>
                          <span className={`${styles.statusText} ${styles.processing}`}>⏳ Processing</span>
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
          <h4 className={styles.quickActionsTitle}>Quick Actions</h4>
          <div className={styles.quickActionsList}>
            <button className={`${styles.quickActionButton} ${styles.purple}`}>
              <FaUserTie />
              <span>Book Mentor</span>
            </button>
            <button className={`${styles.quickActionButton} ${styles.yellow}`}>
              <FaGamepad />
              <span>Launch Challenge</span>
            </button>
            <button className={`${styles.quickActionButton} ${styles.green}`}>
              <FaDownload />
              <span>Export Report</span>
            </button>
            <button className={`${styles.quickActionButton} ${styles.blue}`}>
              <FaRocket />
              <span>AI Insights</span>
            </button>
          </div>
        </div>

        {/* Achievement Notification */}
        <div className={styles.achievementNotification}>
          <div className={styles.achievementContent}>
            <FaAward className={styles.achievementIcon} />
            <div className={styles.achievementText}>
              <h4>New Achievement!</h4>
              <p>100 employees certified this month</p>
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
                <h5>Level 5</h5>
                <p>Training Master</p>
              </div>
            </div>
          </div>
          <div className={`${styles.gamificationCard} ${styles.purple}`}>
            <div className={styles.gamificationContent}>
              <FaRocket className={`${styles.gamificationIcon} ${styles.purple}`} />
              <div className={`${styles.gamificationText} ${styles.purple}`}>
                <h5>Streak: 7 days</h5>
                <p>Keep it up!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}