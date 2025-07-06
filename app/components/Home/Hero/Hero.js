'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
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
  // Simplified typewriter effect
  const messages = [
    "Transform neurodivergent talent into competitive advantage",
    "Unlock hidden potential in your organization",
    "Build inclusive teams that drive innovation"
  ]
  
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  // Professional stats
  const statsConfig = [
    { 
      label: 'Untapped Talent Pool', 
      end: 85, 
      suffix: '%', 
      icon: FaChartLine, 
      color: '#FFD700',
      description: 'Of neurodivergent individuals remain unemployed'
    },
    { 
      label: 'Productivity Increase', 
      end: 140, 
      suffix: '%', 
      icon: IoStatsChart, 
      color: '#9333EA',
      description: 'In companies with inclusive practices'
    },
    { 
      label: 'Partner Organizations', 
      end: 120, 
      suffix: '+', 
      icon: FaHandshake, 
      color: '#FFD700',
      description: 'Trust our neurodivergent talent solutions'
    },
    { 
      label: 'Successful Placements', 
      end: 750, 
      suffix: '+', 
      icon: FaStar, 
      color: '#9333EA',
      description: 'Neurodivergent professionals placed'
    }
  ]
  
  const [stats, setStats] = useState(statsConfig.map(() => 0))
  const [statsVisible, setStatsVisible] = useState(false)

  // Simplified chat system
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { 
      text: "Hello! I'm here to help you understand how neurodivergent talent can benefit your organization. What would you like to know?", 
      sender: 'bot', 
      timestamp: Date.now() 
    }
  ])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isTypingBot, setIsTypingBot] = useState(false)
  const chatInputRef = useRef()
  const chatBodyRef = useRef()

  // Key features for professional presentation
  const keyFeatures = [
    {
      icon: FaBrain,
      title: "Cognitive Diversity",
      description: "Leverage unique thinking patterns for innovation"
    },
    {
      icon: FaLightbulb,
      title: "Problem Solving",
      description: "Access different approaches to complex challenges"
    },
    {
      icon: FaUsers,
      title: "Inclusive Culture",
      description: "Build teams that value neurodiversity"
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

  // Chat functionality
  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      const newMessage = {
        text: currentMessage,
        sender: 'user',
        timestamp: Date.now()
      }
      
      setChatMessages(prev => [...prev, newMessage])
      setCurrentMessage('')
      setIsTypingBot(true)
      
      setTimeout(() => {
        const botResponses = [
          "Neurodivergent individuals often excel in pattern recognition, attention to detail, and systematic thinking. These skills are highly valuable in technology, finance, and research roles.",
          "Studies show that teams with neurodivergent members can be up to 30% more productive when properly supported. We help organizations create those supportive environments.",
          "Our talent acquisition process focuses on skills-based assessment rather than traditional interviews, helping you identify the best candidates regardless of communication style.",
          "We provide ongoing support for both employers and employees to ensure successful long-term placements and career growth."
        ]
        
        const response = {
          text: botResponses[Math.floor(Math.random() * botResponses.length)],
          sender: 'bot',
          timestamp: Date.now()
        }
        
        setChatMessages(prev => [...prev, response])
        setIsTypingBot(false)
      }, 1200)
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
          {chatOpen ? 'Close Assistant' : 'Ask Our AI Assistant'}
        </div>
      </div>

      {/* Main Content */}
      <div className="hero-container">
        <div className="hero-content">
          {/* Badge */}
          <div className="company-badge">
            <MdPsychology className="badge-icon" />
            <span>Powered by Neurodivergent Intelligence</span>
          </div>
          
          {/* Main Heading */}
          <h1 className="hero-title">
            <span className="typewriter-text">{displayed}</span>
            <span className="cursor">|</span>
          </h1>
          
          {/* Subtitle */}
          <p className="hero-subtitle">
            Partner with us to unlock the extraordinary potential of neurodivergent talent. 
            Build more innovative, productive, and inclusive teams.
          </p>
          
          {/* CTA Buttons */}
          <div className="hero-actions">
            <Link href="/get-started" className="btn-primary">
              <FaRocket className="btn-icon" />
              Get Started
              <HiOutlineChevronRight className="btn-arrow" />
            </Link>
            
            <Link href="/demo" className="btn-secondary">
              <FaPlay className="btn-icon" />
              Watch Demo
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
            <h2>Impact by Numbers</h2>
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
                  <h3>NeuroDialect Assistant</h3>
                  <p className="chat-status">
                    {isTypingBot ? 'Typing...' : 'Online'}
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
                placeholder="Ask about neurodivergent talent solutions..."
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