'use client'
import React, { useState, useEffect } from 'react';
import NeuroAgent from '../components/NeuroAgent';
import { useLanguage } from '../hooks/useLanguage';

export default function DashboardPage() {
  const [userData, setUserData] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [insights, setInsights] = useState([]);
  const { t } = useLanguage();

  useEffect(() => {
    // Load user data from localStorage
    if (typeof window !== 'undefined') {
      const savedUserData = localStorage.getItem('userData');
      if (savedUserData) {
        try {
          setUserData(JSON.parse(savedUserData));
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    }

    // Load recent activity (placeholder)
    setRecentActivity([
      { type: 'form', action: 'Completed profile', timestamp: '2 hours ago' },
      { type: 'chat', action: 'Asked about accommodations', timestamp: '1 day ago' },
      { type: 'game', action: 'Played Memory Grid', timestamp: '3 days ago' }
    ]);

    // Load AI insights (placeholder)
    setInsights([
      'You show strong pattern recognition skills',
      'Consider exploring visual processing games',
      'Your communication preferences align with remote work'
    ]);
  }, []);

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userData');
      localStorage.removeItem('chatHistory');
      window.location.href = '/';
    }
  };

  if (!userData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: '#046BD2', fontFamily: 'var(--font-heading, Orbitron, monospace)' }}>{t('dashboard.noProfile.title')}</h2>
        <p style={{ color: '#334155' }}>{t('dashboard.noProfile.description')}</p>
        <a href="/forms" style={{
          padding: '12px 24px',
          background: '#046BD2',
          color: '#FFFFFF',
          textDecoration: 'none',
          borderRadius: '8px',
          display: 'inline-block',
          marginTop: '16px',
          fontWeight: 700
        }}>
          {t('dashboard.noProfile.button')}
        </a>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #D1D5DB'
      }}>
        <div>
          <h1 style={{ color: '#046BD2', fontFamily: 'var(--font-heading, Orbitron, monospace)' }}>{t('dashboard.welcome')}, {userData.name || 'User'}!</h1>
          <p style={{ color: '#64748B', margin: 0 }}>
            {userData.type === 'individual' ? t('dashboard.subtitle.individual') :
             userData.type === 'company' ? t('dashboard.subtitle.company') :
             t('dashboard.subtitle.therapist')}
          </p>
        </div>
        <button
          onClick={logout}
          style={{
            padding: '8px 16px',
            background: '#FFFFFF',
            color: '#046BD2',
            border: '2px solid #046BD2',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 700,
            fontFamily: 'var(--font-body, Rajdhani, sans-serif)'
          }}
        >
          {t('dashboard.logout')}
        </button>
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Quick Actions */}
          <div style={{
            border: '1px solid #D1D5DB',
            borderRadius: '12px',
            padding: '24px',
            background: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#046BD2', fontFamily: 'var(--font-heading, Orbitron, monospace)' }}>{t('dashboard.quickActions.title')}</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              <a href="/forms" style={{
                padding: '16px',
                background: '#F0F5FA',
                color: '#046BD2',
                textDecoration: 'none',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: 'bold',
                border: '2px solid #046BD2',
                fontFamily: 'var(--font-body, Rajdhani, sans-serif)'
              }}>
                📝 {t('dashboard.quickActions.update')}
              </a>
              <a href="/games" style={{
                padding: '16px',
                background: '#F0F5FA',
                color: '#046BD2',
                textDecoration: 'none',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: 'bold',
                border: '2px solid #046BD2',
                fontFamily: 'var(--font-body, Rajdhani, sans-serif)'
              }}>
                🎮 {t('dashboard.quickActions.games')}
              </a>
              <a href="/quiz" style={{
                padding: '16px',
                background: '#F0F5FA',
                color: '#046BD2',
                textDecoration: 'none',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: 'bold',
                border: '2px solid #046BD2',
                fontFamily: 'var(--font-body, Rajdhani, sans-serif)'
              }}>
                📊 {t('dashboard.quickActions.assessment')}
              </a>
            </div>
          </div>

          {/* AI Insights */}
          <div style={{
            border: '1px solid #D1D5DB',
            borderRadius: '12px',
            padding: '24px',
            background: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#046BD2', fontFamily: 'var(--font-heading, Orbitron, monospace)' }}>🤖 {t('dashboard.aiInsights.title')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {insights.map((insight, index) => (
                <div key={index} style={{
                  padding: '12px',
                  background: '#F0F5FA',
                  borderRadius: '8px',
                  borderLeft: '4px solid #046BD2',
                  color: '#334155',
                  fontFamily: 'var(--font-body, Rajdhani, sans-serif)'
                }}>
                  {insight}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{
            border: '1px solid #D1D5DB',
            borderRadius: '12px',
            padding: '24px',
            background: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#046BD2', fontFamily: 'var(--font-heading, Orbitron, monospace)' }}>📈 {t('dashboard.recentActivity.title')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentActivity.map((activity, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: index < recentActivity.length - 1 ? '1px solid #E5E7EB' : 'none',
                  color: '#334155',
                  fontFamily: 'var(--font-body, Rajdhani, sans-serif)'
                }}>
                  <span>{activity.action}</span>
                  <span style={{ color: '#64748B', fontSize: '14px' }}>{activity.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - NeuroAgent Chat */}
        <div style={{
          border: '1px solid #D1D5DB',
          borderRadius: '12px',
          background: '#FFFFFF',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          <NeuroAgent userData={userData} />
        </div>
      </div>

      {/* Profile Summary */}
      {userData.summary && (
        <div style={{
          marginTop: '2rem',
          border: '1px solid #D1D5DB',
          borderRadius: '12px',
          padding: '24px',
          background: '#FFFFFF',
          color: '#334155',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#046BD2', fontFamily: 'var(--font-heading, Orbitron, monospace)' }}>📋 {t('dashboard.profileSummary.title')}</h3>
          <p style={{ color: '#334155', lineHeight: '1.6', fontFamily: 'var(--font-body, Rajdhani, sans-serif)' }}>{userData.summary}</p>
        </div>
      )}
    </div>
  );
} 