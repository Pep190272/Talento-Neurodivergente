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
  { name: 'Settings', href: '/settings', key: 'navbar.settings' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [userData, setUserData] = useState(null)
  const pathname = usePathname()
  const { t } = useLanguage()

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
            <span className="logo-text">Diversia Eternals</span>
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