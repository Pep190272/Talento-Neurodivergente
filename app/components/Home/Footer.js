'use client'

import React from 'react';
import Link from 'next/link';
import { FaTwitter, FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/features' },
  { label: 'Forms', href: '/forms' },
  { label: 'Games', href: '/games' },
  { label: 'Quiz', href: '/quiz' }
];

const socialLinks = [
  { icon: <FaTwitter />, href: 'https://twitter.com/', label: 'Twitter' },
  { icon: <FaLinkedin />, href: 'https://linkedin.com/', label: 'LinkedIn' },
  { icon: <FaGithub />, href: 'https://github.com/', label: 'GitHub' },
  { icon: <FaEnvelope />, href: 'mailto:info@neurotalent.com', label: 'Email' }
];

export default function Footer() {
  return (
    <footer style={{
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
      padding: '2.5rem 2rem 1.5rem 2rem',
      borderTop: '2px solid var(--primary-gold)',
      color: '#fff',
      fontFamily: 'Rajdhani, Orbitron, sans-serif',
      marginTop: 40
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 18 }}>
          {navLinks.map((link, idx) => (
            <Link key={idx} href={link.href} style={{
              color: 'var(--primary-gold)',
              fontWeight: 700,
              fontFamily: 'Orbitron, Rajdhani, sans-serif',
              fontSize: '1.08rem',
              textDecoration: 'none',
              letterSpacing: '0.01em',
              transition: 'color 0.2s'
            }}>
              {link.label}
            </Link>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 20, marginBottom: 18 }}>
          {socialLinks.map((s, idx) => (
            <a key={idx} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} style={{
              color: 'var(--primary-purple)',
              fontSize: 26,
              transition: 'color 0.2s',
              display: 'inline-flex',
              alignItems: 'center'
            }}>
              {s.icon}
            </a>
          ))}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', textAlign: 'center', fontFamily: 'Rajdhani, sans-serif' }}>
          &copy; {new Date().getFullYear()} Eternals NeuroTalent Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
} 