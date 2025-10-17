'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useLanguage } from '../../../hooks/useLanguage'
import { 
  FaBrain, 
  FaRocket, 
  FaUsers, 
  FaChartLine, 
  FaLightbulb, 
  FaHandshake,
  FaStar,
  FaComments,
  FaTimes,
  FaPaperPlane,
  FaRobot,
  FaPlay
} from 'react-icons/fa'
import { IoSparkles, IoStatsChart } from 'react-icons/io5'
import { HiOutlineChevronRight } from 'react-icons/hi'
import { MdPsychology } from 'react-icons/md'
import './Hero.css'

export default function Hero() {
  const { t } = useLanguage()

  // Simplified typewriter effect
  const messages = [
    t('hero.message1'),
    t('hero.message2'),
    t('hero.message3')
  ]
  
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  // Professional stats
  const statsConfig = [
    {
      label: t('hero.stats.untappedTalent.label'),
      end: 85,
      suffix: '%',
      icon: FaChartLine,
      color: '#FFD700',
      description: t('hero.stats.untappedTalent.description')
    },
    {
      label: t('hero.stats.productivity.label'),
      end: 140,
      suffix: '%',
      icon: IoStatsChart,
      color: '#9333EA',
      description: t('hero.stats.productivity.description')
    },
    {
      label: t('hero.stats.partners.label'),
      end: 120,
      suffix: '+',
      icon: FaHandshake,
      color: '#FFD700',
      description: t('hero.stats.partners.description')
    },
    {
      label: t('hero.stats.placements.label'),
      end: 750,
      suffix: '+',
      icon: FaStar,
      color: '#9333EA',
      description: t('hero.stats.placements.description')
    }
  ]
  
  const [stats, setStats] = useState(statsConfig.map(() => 0))
  const [statsVisible, setStatsVisible] = useState(false)

  // Enhanced chat system with user context
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isTypingBot, setIsTypingBot] = useState(false)
  const [userData, setUserData] = useState(null)
  const chatInputRef = useRef()
  const chatBodyRef = useRef()

  // Load user data from localStorage
  useEffect(() => {
    const savedUserData = localStorage.getItem('diversia_user_data')
    if (savedUserData) {
      setUserData(JSON.parse(savedUserData))
    }
  }, [])

  // Initialize chat with personalized welcome message
  useEffect(() => {
    if (userData) {
      const welcomeMessage = userData.userType === 'candidate'
        ? `¡Hola ${userData.firstName}! Soy NeuroDialect, tu asistente de IA. Puedo ayudarte con orientación profesional, desarrollo de habilidades y encontrar oportunidades que coincidan con tus fortalezas únicas. ¿Qué te gustaría saber?`
        : `¡Hola ${userData.firstName}! Soy NeuroDialect, tu asistente de IA. Puedo ayudarte a construir equipos inclusivos, contratar talento neurodivergente y crear entornos laborales de apoyo. ¿Qué te gustaría saber?`
      
      setChatMessages([{ 
        text: welcomeMessage, 
        sender: 'bot', 
        timestamp: Date.now() 
      }])
    } else {
      setChatMessages([{
        text: "¡Hola! Soy NeuroDialect, tu asistente de IA especializado en talento neurodivergente e inclusión laboral. ¿Qué te gustaría saber?",
        sender: 'bot',
        timestamp: Date.now()
      }])
    }
  }, [userData])

  // Key features for professional presentation
  const keyFeatures = [
    {
      icon: FaBrain,
      title: t('hero.features.cognitiveDiversity.title'),
      description: t('hero.features.cognitiveDiversity.description')
    },
    {
      icon: FaLightbulb,
      title: t('hero.features.problemSolving.title'),
      description: t('hero.features.problemSolving.description')
    },
    {
      icon: FaUsers,
      title: t('hero.features.inclusiveCulture.title'),
      description: t('hero.features.inclusiveCulture.description')
    }
  ]

  // Typewriter effect - simplified
  useEffect(() => {
    let timeoutId
    const currentMessageText = messages[currentMessageIndex]
    
    if (isTyping) {
      if (displayed.length < currentMessageText.length) {
        timeoutId = setTimeout(() => {
          setDisplayed(prev => prev + currentMessageText[displayed.length])
        }, 80)
      } else {
        timeoutId = setTimeout(() => {
          setIsTyping(false)
        }, 2000)
      }
    } else {
      if (displayed.length > 0) {
        timeoutId = setTimeout(() => {
          setDisplayed(prev => prev.slice(0, -1))
        }, 50)
      } else {
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length)
        setIsTyping(true)
      }
    }

    return () => clearTimeout(timeoutId)
  }, [displayed, isTyping, currentMessageIndex, messages])

  // Stats animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !statsVisible) {
          setStatsVisible(true)
          
          statsConfig.forEach((stat, idx) => {
            const duration = 1500
            const steps = 30
            const increment = stat.end / steps
            let current = 0
            
            const timer = setInterval(() => {
              current += increment
              if (current >= stat.end) {
                current = stat.end
                clearInterval(timer)
              }
              
              setStats(prev => {
                const newStats = [...prev]
                newStats[idx] = Math.floor(current)
                return newStats
              })
            }, duration / steps)
          })
        }
      },
      { threshold: 0.5 }
    )

    const statsElement = document.querySelector('.stats-grid')
    if (statsElement) observer.observe(statsElement)

    return () => observer.disconnect()
  }, [statsVisible])

  // Enhanced chat functionality with OpenAI API
  const handleSendMessage = async () => {
    if (currentMessage.trim()) {
      const newMessage = {
        text: currentMessage,
        sender: 'user',
        timestamp: Date.now()
      }
      
      setChatMessages(prev => [...prev, newMessage])
      setCurrentMessage('')
      setIsTypingBot(true)
      
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: currentMessage,
            history: chatMessages,
            userData: userData
          }),
        })

        const data = await response.json()

        if (data.response) {
          const botResponse = {
            text: data.response,
            sender: 'bot',
            timestamp: Date.now()
          }

          setChatMessages(prev => [...prev, botResponse])
        } else {
          // Fallback response if API fails
          const fallbackResponses = [
            "Disculpa, estoy teniendo problemas de conexión ahora mismo. Por favor intenta de nuevo en un momento.",
            "¡Gracias por tu mensaje! Actualmente estoy experimentando algunas dificultades técnicas. Por favor intenta de nuevo en breve.",
            "¡Me encantaría ayudarte con eso! Sin embargo, no estoy disponible temporalmente. Por favor intenta de nuevo en unos momentos."
          ]
          
          const fallbackResponse = {
            text: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
            sender: 'bot',
            timestamp: Date.now()
          }
          
          setChatMessages(prev => [...prev, fallbackResponse])
        }
      } catch (error) {
        console.error('Chat API Error:', error)
        
        // Fallback response on error
        const errorResponse = {
          text: "Lo siento, estoy teniendo problemas de conexión ahora mismo. Por favor intenta de nuevo en un momento.",
          sender: 'bot',
          timestamp: Date.now()
        }
        
        setChatMessages(prev => [...prev, errorResponse])
      } finally {
        setIsTypingBot(false)
      }
    }
  }

  // Auto-scroll chat
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
    }
  }, [chatMessages])

  return (
    <section className="hero">
      {/* Background Elements */}
      <div className="hero-background">
        <div className="gradient-overlay" />
        <div className="grid-pattern" />
      </div>

      {/* Navigation Assistant */}
      <div className="ai-assistant" onClick={() => setChatOpen(!chatOpen)}>
        <div className="assistant-icon">
          <FaRobot />
        </div>
        <div className="assistant-tooltip">
          {chatOpen ? t('hero.closeAssistant') : t('hero.askAssistant')}
        </div>
      </div>

      {/* Main Content */}
      <div className="hero-container">
        <div className="hero-content">
          {/* Badge */}
          <div className="company-badge">
            <MdPsychology className="badge-icon" />
            <span>{t('hero.badge')}</span>
          </div>
          
          {/* Main Heading */}
          <h1 className="hero-title">
            <span className="typewriter-text">{displayed}</span>
            <span className="cursor">|</span>
          </h1>
          
          {/* Subtitle */}
          <p className="hero-subtitle">
            {t('hero.subtitle')}
          </p>
          
          {/* CTA Buttons */}
          <div className="hero-actions">
            <Link href="/get-started" className="btn-primary">
              <FaRocket className="btn-icon" />
              {t('hero.getStarted')}
              <HiOutlineChevronRight className="btn-arrow" />
            </Link>

            <Link href="/demo" className="btn-secondary">
              <FaPlay className="btn-icon" />
              {t('hero.watchDemo')}
            </Link>
          </div>

          {/* Key Features */}
          <div className="key-features">
            {keyFeatures.map((feature, index) => (
              <div key={index} className="feature-item">
                <div className="feature-icon">
                  <feature.icon />
                </div>
                <div className="feature-content">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <div className="stats-header">
            <IoSparkles className="stats-icon" />
            <h2>{t('hero.impactByNumbers')}</h2>
          </div>
          
          <div className="stats-grid">
            {statsConfig.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-header">
                  <stat.icon className="stat-icon" style={{ color: stat.color }} />
                  <div className="stat-value" style={{ color: stat.color }}>
                    {stats[index]}{stat.suffix}
                  </div>
                </div>
                <h3 className="stat-label">{stat.label}</h3>
                <p className="stat-description">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      {chatOpen && (
        <div className="chat-overlay" onClick={(e) => e.target.classList.contains('chat-overlay') && setChatOpen(false)}>
          <div className="chat-container">
            <div className="chat-header">
              <div className="chat-info">
                <div className="chat-avatar">
                  <FaRobot />
                </div>
                <div className="chat-details">
                  <h3>{t('hero.chat.assistant')}</h3>
                  <p className="chat-status">
                    {isTypingBot ? t('hero.chat.typing') : t('hero.chat.online')}
                  </p>
                </div>
              </div>
              <button 
                className="chat-close"
                onClick={() => setChatOpen(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="chat-body" ref={chatBodyRef}>
              {chatMessages.map((message, index) => (
                <div key={index} className={`message ${message.sender}`}>
                  <div className="message-content">
                    <p>{message.text}</p>
                    <span className="message-time">
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              ))}
              
              {isTypingBot && (
                <div className="message bot">
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="chat-input-wrapper">
              <input
                ref={chatInputRef}
                type="text"
                className="chat-input"
                placeholder={t('hero.chat.placeholder')}
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button 
                className="chat-send-btn"
                onClick={handleSendMessage}
                disabled={!currentMessage.trim()}
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}