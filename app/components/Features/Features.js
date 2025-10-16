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
import { useLanguage } from '../../hooks/useLanguage'

export default function Features() {
  const { t } = useLanguage();

  const features = [
    {
      icon: FaBrain,
      title: t('features.items.cognitive.title'),
      description: t('features.items.cognitive.description'),
      route: "cognitive-diversity"
    },
    {
      icon: FaSearch,
      title: t('features.items.matching.title'),
      description: t('features.items.matching.description'),
      route: "matching"
    },
    {
      icon: FaGraduationCap,
      title: t('features.items.development.title'),
      description: t('features.items.development.description'),
      route: "development"
    },
    {
      icon: FaUsers,
      title: t('features.items.training.title'),
      description: t('features.items.training.description'),
      route: "training"
    },
    {
      icon: IoAnalytics,
      title: t('features.items.analytics.title'),
      description: t('features.items.analytics.description'),
      route: "analytics"
    },
    {
      icon: FaShieldAlt,
      title: t('features.items.support.title'),
      description: t('features.items.support.description'),
      route: "support"
    },
    {
      icon: FaComments,
      title: t('features.items.aiSupport.title'),
      description: t('features.items.aiSupport.description'),
      route: "support"
    },
    {
      icon: FaHandshake,
      title: t('features.items.partnerships.title'),
      description: t('features.items.partnerships.description'),
      route: "partnerships"
    },
    {
      icon: FaRocket,
      title: t('features.items.career.title'),
      description: t('features.items.career.description'),
      route: "career"
    },
    {
      icon: FaLightbulb,
      title: t('features.items.innovation.title'),
      description: t('features.items.innovation.description'),
      route: "innovation"
    },
    {
      icon: FaStar,
      title: t('features.items.recognition.title'),
      description: t('features.items.recognition.description'),
      route: "recognition"
    },
    {
      icon: FaCog,
      title: t('features.items.consulting.title'),
      description: t('features.items.consulting.description'),
      route: "consulting"
    }
  ]

  const stats = [
    { number: t('features.stats.productivity.number'), label: t('features.stats.productivity.label'), description: t('features.stats.productivity.description') },
    { number: t('features.stats.placements.number'), label: t('features.stats.placements.label'), description: t('features.stats.placements.description') },
    { number: t('features.stats.partners.number'), label: t('features.stats.partners.label'), description: t('features.stats.partners.description') },
    { number: t('features.stats.satisfaction.number'), label: t('features.stats.satisfaction.label'), description: t('features.stats.satisfaction.description') }
  ]

  const categories = [
    { id: "all", name: t('features.categories.all'), icon: IoSparkles },
    { id: "assessment", name: t('features.categories.assessment'), icon: FaBrain },
    { id: "matching", name: t('features.categories.matching'), icon: FaSearch },
    { id: "development", name: t('features.categories.development'), icon: FaGraduationCap },
    { id: "training", name: t('features.categories.training'), icon: FaUsers },
    { id: "analytics", name: t('features.categories.analytics'), icon: IoAnalytics },
    { id: "support", name: t('features.categories.support'), icon: FaShieldAlt }
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
            {t('features.title')} <span className="highlight">{t('features.titleHighlight')}</span> {t('features.titleEnd')}Page
          </h1>
          <p className="subtitle">
            {t('features.subtitle')}
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
              {t('features.learnMore')}
              <FaPlay className="btn-icon" />
            </Link>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="features-cta">
        <div className="cta-content">
          <h2 className="cta-title">{t('features.cta.title')}</h2>
          <p className="cta-subtitle">
            {t('features.cta.subtitle')}
          </p>
          <div className="cta-buttons">
            <button className="cta-btn primary">
              <FaRocket className="btn-icon" />
              {t('features.cta.getStarted')}
            </button>
            <button className="cta-btn secondary">
              <FaPlay className="btn-icon" />
              {t('features.cta.watchDemo')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 