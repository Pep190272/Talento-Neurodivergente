'use client'
import React, { useState, useEffect } from 'react';
import NeuroAgent from '../components/NeuroAgent';

export default function DashboardPage() {
  const [userData, setUserData] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    // Load user data from localStorage
    const savedUserData = localStorage.getItem('userData');
    if (savedUserData) {
      try {
        setUserData(JSON.parse(savedUserData));
      } catch (error) {
        console.error('Error loading user data:', error);
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
    localStorage.removeItem('userData');
    localStorage.removeItem('chatHistory');
    window.location.href = '/';
  };

  if (!userData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--primary-gold)' }}>Welcome to the Dashboard</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)' }}>Please complete your profile to access personalized features.</p>
        <a href="/forms" style={{
          padding: '12px 24px',
          background: 'linear-gradient(135deg, #23213a 0%, #181024 100%)',
          color: 'var(--primary-gold)',
          textDecoration: 'none',
          borderRadius: '8px',
          display: 'inline-block',
          marginTop: '16px',
          fontWeight: 700
        }}>
          Complete Profile
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
        borderBottom: '1px solid var(--primary-purple)'
      }}>
        <div>
          <h1 style={{ color: 'var(--primary-gold)' }}>Welcome back, {userData.name || 'User'}!</h1>
          <p style={{ color: 'var(--primary-purple)', margin: 0 }}>
            {userData.type === 'individual' ? 'Neurodivergent Individual' : 
             userData.type === 'company' ? 'Company Placement Manager' : 
             'Therapist / Specialist'}
          </p>
        </div>
        <button
          onClick={logout}
          style={{
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #23213a 0%, #181024 100%)',
            color: 'var(--primary-gold)',
            border: '1px solid rgba(255, 215, 0, 0.12)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 700
          }}
        >
          Logout
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
            border: '1px solid var(--primary-purple)',
            borderRadius: '12px',
            padding: '24px',
            background: 'linear-gradient(135deg, #23213a 0%, #181024 100%)',
            boxShadow: '0 4px 24px rgba(147, 51, 234, 0.08)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--primary-gold)' }}>Quick Actions</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              <a href="/forms" style={{
                padding: '16px',
                background: 'rgba(26, 10, 40, 0.7)',
                color: 'var(--primary-gold)',
                textDecoration: 'none',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: 'bold',
                border: '1px solid var(--primary-gold)'
              }}>
                📝 Update Profile
              </a>
              <a href="/games" style={{
                padding: '16px',
                background: 'rgba(26, 10, 40, 0.7)',
                color: 'var(--primary-purple)',
                textDecoration: 'none',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: 'bold',
                border: '1px solid var(--primary-purple)'
              }}>
                🎮 Play Games
              </a>
              <a href="/quiz" style={{
                padding: '16px',
                background: 'rgba(26, 10, 40, 0.7)',
                color: '#8bc34a',
                textDecoration: 'none',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: 'bold',
                border: '1px solid #8bc34a'
              }}>
                📊 Take Assessment
              </a>
            </div>
          </div>

          {/* AI Insights */}
          <div style={{
            border: '1px solid var(--primary-purple)',
            borderRadius: '12px',
            padding: '24px',
            background: 'linear-gradient(135deg, #23213a 0%, #181024 100%)',
            boxShadow: '0 4px 24px rgba(147, 51, 234, 0.08)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--primary-gold)' }}>🤖 AI Insights</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {insights.map((insight, index) => (
                <div key={index} style={{
                  padding: '12px',
                  background: 'rgba(26, 10, 40, 0.7)',
                  borderRadius: '8px',
                  borderLeft: '4px solid var(--primary-gold)',
                  color: 'rgba(255,255,255,0.9)'
                }}>
                  {insight}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{
            border: '1px solid var(--primary-purple)',
            borderRadius: '12px',
            padding: '24px',
            background: 'linear-gradient(135deg, #23213a 0%, #181024 100%)',
            boxShadow: '0 4px 24px rgba(147, 51, 234, 0.08)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--primary-gold)' }}>📈 Recent Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentActivity.map((activity, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: index < recentActivity.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  color: 'rgba(255,255,255,0.8)'
                }}>
                  <span>{activity.action}</span>
                  <span style={{ color: 'var(--primary-gold)', fontSize: '14px' }}>{activity.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - NeuroAgent Chat */}
        <div style={{
          border: '1px solid var(--primary-purple)',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #23213a 0%, #181024 100%)',
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(147, 51, 234, 0.08)'
        }}>
          <NeuroAgent userData={userData} />
        </div>
      </div>

      {/* Profile Summary */}
      {userData.summary && (
        <div style={{
          marginTop: '2rem',
          border: '1px solid var(--primary-gold)',
          borderRadius: '12px',
          padding: '24px',
          background: 'linear-gradient(135deg, #23213a 0%, #181024 100%)',
          color: 'rgba(255,255,255,0.9)',
          boxShadow: '0 4px 24px rgba(147, 51, 234, 0.08)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: 'var(--primary-gold)' }}>📋 Profile Summary</h3>
          <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>{userData.summary}</p>
        </div>
      )}
    </div>
  );
} 