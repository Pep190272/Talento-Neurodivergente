'use client'
import React from 'react'
import { 
  FaBrain, 
  FaRocket, 
  FaUsers, 
  FaChartLine, 
  FaLightbulb, 
  FaHandshake,
  FaStar,
  FaComments,
  FaRobot,
  FaPlay,
  FaShieldAlt,
  FaGraduationCap,
  FaSearch,
  FaCog,
  FaHeart
} from 'react-icons/fa'
import { IoSparkles, IoStatsChart, IoAnalytics } from 'react-icons/io5'
import { MdPsychology, MdWork, MdSchool } from 'react-icons/md'
import './Features.css'
import Link from 'next/link'

export default function Features() {
  const features = [
    {
      icon: FaBrain,
      title: "Cognitive Diversity Assessment",
      description: "Advanced AI-powered assessment tools to identify and leverage unique cognitive strengths and neurodivergent superpowers.",
      route: "cognitive-diversity"
    },
    {
      icon: FaSearch,
      title: "Smart Talent Matching",
      description: "AI-driven matching algorithm that connects neurodivergent candidates with roles that align with their strengths and preferences.",
      route: "matching"
    },
    {
      icon: FaGraduationCap,
      title: "Skills Development",
      description: "Personalized learning paths and skill development programs tailored to individual neurodivergent profiles.",
      route: "development"
    },
    {
      icon: FaUsers,
      title: "Inclusive Team Building",
      description: "Comprehensive training and resources for companies to build diverse, inclusive, and high-performing teams.",
      route: "training"
    },
    {
      icon: IoAnalytics,
      title: "Performance Analytics",
      description: "Data-driven insights into team performance, productivity gains, and diversity impact metrics.",
      route: "analytics"
    },
    {
      icon: FaShieldAlt,
      title: "Workplace Accommodations",
      description: "Expert guidance on implementing effective workplace accommodations and support systems.",
      route: "support"
    },
    {
      icon: FaComments,
      title: "AI-Powered Support",
      description: "24/7 AI assistant providing personalized guidance for both candidates and employers.",
      route: "support"
    },
    {
      icon: FaHandshake,
      title: "Employer Partnerships",
      description: "Strategic partnerships with forward-thinking companies committed to neurodiversity inclusion.",
      route: "partnerships"
    },
    {
      icon: FaRocket,
      title: "Career Acceleration",
      description: "Fast-track career development programs designed for neurodivergent professionals.",
      route: "career"
    },
    {
      icon: FaLightbulb,
      title: "Innovation Labs",
      description: "Collaborative spaces where neurodivergent talent can showcase their unique problem-solving approaches.",
      route: "innovation"
    },
    {
      icon: FaStar,
      title: "Recognition Programs",
      description: "Awards and recognition for companies and individuals leading in neurodiversity inclusion.",
      route: "recognition"
    },
    {
      icon: FaCog,
      title: "Custom Solutions",
      description: "Tailored solutions and consulting services for organizations of all sizes.",
      route: "consulting"
    }
  ]

  const stats = [
    { number: "85%", label: "Productivity Increase", description: "Average productivity boost in inclusive teams" },
    { number: "750+", label: "Successful Placements", description: "Neurodivergent professionals placed" },
    { number: "120+", label: "Partner Companies", description: "Organizations trust our solutions" },
    { number: "95%", label: "Satisfaction Rate", description: "Candidate and employer satisfaction" }
  ]

  const categories = [
    { id: "all", name: "All Features", icon: IoSparkles },
    { id: "assessment", name: "Assessment", icon: FaBrain },
    { id: "matching", name: "Matching", icon: FaSearch },
    { id: "development", name: "Development", icon: FaGraduationCap },
    { id: "training", name: "Training", icon: FaUsers },
    { id: "analytics", name: "Analytics", icon: IoAnalytics },
    { id: "support", name: "Support", icon: FaShieldAlt }
  ]

  const [activeCategory, setActiveCategory] = React.useState("all")

  const filteredFeatures = activeCategory === "all" 
    ? features 
    : features.filter(feature => feature.route === activeCategory)

  return (
    <div className="features-container">
      {/* Background Elements */}
      <div className="features-background">
        <div className="bg-shape-1"></div>
        <div className="bg-shape-2"></div>
        <div className="bg-shape-3"></div>
      </div>

      {/* Header Section */}
      <div className="features-header">
        <div className="header-content">
          <h1 className="main-title">
            Welcome to the <span className="highlight">Feature</span> Page
          </h1>
          <p className="subtitle">
            Discover the comprehensive suite of tools and services designed to unlock neurodivergent potential 
            and build inclusive, high-performing organizations.
          </p>
          <div className="header-stats">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-description">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        <div className="filter-container">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`filter-btn ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              <category.icon className="filter-icon" />
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="features-grid">
        {filteredFeatures.map((feature, index) => (
          <div key={index} className="feature-card" data-category={feature.route}>
            <div className="feature-icon">
              <feature.icon />
            </div>
            <div className="feature-content">
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
            <Link
              href={`/features/${feature.route}`}
              className="learn-more-btn"
              aria-label={`Learn more about ${feature.title}`}
              tabIndex={0}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
            >
              Learn More
              <FaPlay className="btn-icon" />
            </Link>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="features-cta">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Transform Your Organization?</h2>
          <p className="cta-subtitle">
            Join hundreds of companies already leveraging neurodivergent talent to drive innovation and growth.
          </p>
          <div className="cta-buttons">
            <button className="cta-btn primary">
              <FaRocket className="btn-icon" />
              Get Started Today
            </button>
            <button className="cta-btn secondary">
              <FaPlay className="btn-icon" />
              Watch Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 