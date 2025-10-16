'use client'
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '../../hooks/useLanguage'
import './Navbar.css'

const navItems = [
  { name: 'Home', href: '/', key: 'navbar.home' },
  { name: 'Features', href: '/features', key: 'navbar.features' },
  { name: 'Forms', href: '/forms', key: 'navbar.forms' },
  { name: 'Games', href: '/games', key: 'navbar.games' },
  { name: 'Quiz', href: '/quiz', key: 'navbar.quiz' },
  { name: 'About', href: '/about', key: 'navbar.about' },
]

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [userData, setUserData] = useState(null)
  const pathname = usePathname()
  const langDropdownRef = useRef(null)
  const { currentLang, changeLanguage, t } = useLanguage()

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY
      setScrolled(currentScrollY > 50)
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100)
      setLastScrollY(currentScrollY)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [lastScrollY])

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setLangDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Load user data from localStorage
  useEffect(() => {
    const savedUserData = localStorage.getItem('userData')
    if (savedUserData) {
      try {
        setUserData(JSON.parse(savedUserData))
      } catch (error) {
        console.error('Error loading user data:', error)
      }
    }
  }, [])

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode)
    setLangDropdownOpen(false)
  }

  const logout = () => {
    localStorage.removeItem('userData')
    localStorage.removeItem('chatHistory')
    window.location.href = '/'
  }

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}${isVisible ? ' visible' : ' hidden'}`}>
      <div className="navbar-glow" style={{
        background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(147, 51, 234, 0.1), transparent 40%)`
      }}></div>
      
      <div className="inner">
        {/* Logo - Far Left */}
        <div className="logo-section">
          <Link href="/" className="logo">
            <span className="logo-text">Eternals</span>
            <div className="logo-particles">
              <span className="particle"></span>
              <span className="particle"></span>
              <span className="particle"></span>
            </div>
          </Link>
        </div>

        {/* Center Navigation */}
        <div className="nav-section">
          <div
            className={`hamburger${open ? ' open' : ''}`}
            onClick={() => setOpen(!open)}
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>

          <ul className={`menu${open ? ' open' : ''}`}>
            {navItems.map((item, index) => (
              <li key={item.href} className="menu-item" style={{ '--delay': `${index * 0.1}s` }}>
                <Link
                  href={item.href}
                  className={`link${pathname === item.href ? ' active' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  <span className="link-text">
                    {t(item.key)}
                  </span>
                  <span className="link-bg"></span>
                </Link>
              </li>
            ))}
            {userData && (
              <li className="menu-item" style={{ '--delay': '0.9s' }}>
                <Link
                  href="/dashboard"
                  className={`link${pathname === '/dashboard' ? ' active' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  <span className="link-text">{t('navbar.dashboard')}</span>
                  <span className="link-bg"></span>
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* Actions Section - Far Right */}
        <div className="actions-section">
          {/* Language Switcher */}
          <div className="language-switcher" ref={langDropdownRef}>
            <button
              className="language-toggle"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            >
              <span className="current-lang">
                {languages.find(lang => lang.code === currentLang)?.flag}
                <span className="lang-text">
                  {languages.find(lang => lang.code === currentLang)?.name}
                </span>
              </span>
              <span className={`lang-arrow${langDropdownOpen ? ' open' : ''}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>
            
            <div className={`language-dropdown${langDropdownOpen ? ' open' : ''}`}>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className={`language-option${currentLang === lang.code ? ' active' : ''}`}
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  <span className="lang-flag">{lang.flag}</span>
                  <span className="lang-name">{lang.name}</span>
                  {currentLang === lang.code && (
                    <span className="check-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* User Profile or Get Started Button */}
          {userData ? (
            <div className="user-profile">
              <div className="user-info">
                <span className="user-name">
                  {t('navbar.hi')}, {userData.name || t('navbar.user')}
                </span>
                <span className="user-type">
                  {userData.type === 'individual' ? t('navbar.individual') :
                   userData.type === 'company' ? t('navbar.company') : t('navbar.therapist')}
                </span>
              </div>
              <button onClick={logout} className="logout-btn">
                <span className="logout-text">{t('navbar.logout')}</span>
              </button>
            </div>
          ) : (
            <Link href="/get-started" className="get-started">
              <span className="btn-text">
                {t('navbar.getStarted')}
              </span>
              <span className="btn-glow"></span>
              <span className="btn-particles">
                <span className="btn-particle"></span>
                <span className="btn-particle"></span>
                <span className="btn-particle"></span>
              </span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}