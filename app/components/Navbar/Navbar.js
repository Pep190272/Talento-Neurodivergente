'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '../../hooks/useLanguage'
import { useSession, signOut } from 'next-auth/react'
import './Navbar.css'

const navItems = [
  { name: 'Home', href: '/', key: 'navbar.home' },
  { name: 'Features', href: '/features', key: 'navbar.features' },
  { name: 'Forms', href: '/forms', key: 'navbar.forms' },
  { name: 'Games', href: '/games', key: 'navbar.games' },
  { name: 'Quiz', href: '/quiz', key: 'navbar.quiz' },
  { name: 'About', href: '/about', key: 'navbar.about' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const pathname = usePathname()
  const { t } = useLanguage()
  const { data: session, status } = useSession()

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY
      setScrolled(currentScrollY > 50)
      setIsVisible(true) // Always visible - no auto-hide
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

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
    localStorage.removeItem('chatHistory') // Clean up local artifacts
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
            {status === 'authenticated' && (
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
          {status === 'authenticated' && session?.user ? (
            <div className="user-profile">
              <div className="user-info">
                <span className="user-name">
                  {t('navbar.hi')}, {session.user.name || t('navbar.user')}
                </span>
                <span className="user-type">
                  {session.user.type === 'individual' ? t('navbar.individual') :
                    session.user.type === 'company' ? t('navbar.company') : t('navbar.therapist')}
                </span>
              </div>
              <button onClick={handleLogout} className="logout-btn">
                <span className="logout-text">{t('navbar.logout')}</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Link href="/login" className="login-btn">
                Iniciar Sesión
              </Link>
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
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}