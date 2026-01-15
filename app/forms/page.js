'use client'
import React, { useState, useEffect } from 'react';
import { User, Building2, Stethoscope, CheckCircle, ArrowRight, Star, Shield, Clock } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import RealGenericForm from '../components/GenericForm';

const getTabs = (t) => [
  {
    label: t('forms.tabs.individual.label'),
    key: 'individual',
    icon: User,
    description: t('forms.tabs.individual.description'),
    color: 'from-blue-600 to-blue-800'
  },
  {
    label: t('forms.tabs.company.label'),
    key: 'company',
    icon: Building2,
    description: t('forms.tabs.company.description'),
    color: 'from-blue-600 to-blue-800'
  },
  {
    label: t('forms.tabs.therapist.label'),
    key: 'therapist',
    icon: Stethoscope,
    description: t('forms.tabs.therapist.description'),
    color: 'from-blue-500 to-blue-700'
  },
];

const getFeatures = (t) => [
  { icon: Shield, text: t('forms.features.secure') },
  { icon: CheckCircle, text: t('forms.features.quick') },
  { icon: Star, text: t('forms.features.premium') },
  { icon: Clock, text: t('forms.features.available') }
];

// Use the real GenericForm component
const GenericForm = ({ type, t }) => {
  return <RealGenericForm type={type} />;
};

export default function FormsPage() {
  const [activeTab, setActiveTab] = useState('individual');
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();
  const TABS = getTabs(t);
  const FEATURES = getFeatures(t);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Inject spinner and focus CSS on client only
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const styleSheet = document.createElement('style');
      styleSheet.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        input:focus, textarea:focus {
          border-color: #046BD2 !important;
          box-shadow: 0 0 0 2px rgba(4, 107, 210, 0.2) !important;
        }
        button:hover:not(:disabled) {
          background: #045CB4 !important;
          transform: scale(1.05) !important;
          box-shadow: 0 10px 25px -5px rgba(4, 107, 210, 0.4) !important;
        }
        .tab-button:hover:not(.tab-button-active) {
          border-color: #4b5563 !important;
          background: rgba(55, 65, 81, 0.5) !important;
        }
      `;
      document.head.appendChild(styleSheet);
      return () => {
        if (styleSheet.parentNode) styleSheet.parentNode.removeChild(styleSheet);
      };
    }
  }, []);

  if (!mounted) return null;

  const activeTabData = TABS.find(tab => tab.key === activeTab);

  return (
    <div style={styles.pageContainer}>
      <div style={styles.backgroundPattern}></div>
      
      <div style={styles.contentWrapper}>
        {/* Header Section */}
        <div style={styles.header}>
          <div style={styles.headerIcon}>
            <User style={styles.headerIconSvg} />
          </div>
          <h1 style={styles.mainTitle}>
            {t('forms.title')}
          </h1>
          <p style={styles.mainDescription}>
            {t('forms.subtitle')}
          </p>
        </div>

        {/* Features Bar */}
        <div style={styles.featuresContainer}>
          {FEATURES.map((feature, index) => (
            <div key={index} style={styles.featureItem}>
              <feature.icon style={styles.featureIcon} />
              <span style={styles.featureText}>{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div style={styles.tabsContainer}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  ...styles.tabButton,
                  ...(isActive ? styles.tabButtonActive : {}),
                }}
              >
                <div style={styles.tabContent}>
                  <div style={{
                    ...styles.tabIconContainer,
                    ...(isActive ? styles.tabIconContainerActive : {}),
                  }}>
                    <Icon style={styles.tabIcon} />
                  </div>
                  <h3 style={{
                    ...styles.tabTitle,
                    ...(isActive ? styles.tabTitleActive : {}),
                  }}>
                    {tab.label}
                  </h3>
                  <p style={{
                    ...styles.tabDescription,
                    ...(isActive ? styles.tabDescriptionActive : {}),
                  }}>
                    {tab.description}
                  </p>
                </div>
                
                {isActive && (
                  <div style={styles.tabActiveOverlay}></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Tab Indicator */}
        {activeTabData && (
          <div style={styles.activeTabIndicator}>
            <div style={styles.activeTabBadge}>
              <activeTabData.icon style={styles.activeTabIcon} />
              <span style={styles.activeTabText}>
                {t('forms.settingUp')} {activeTabData.label}
              </span>
            </div>
          </div>
        )}

        {/* Form Content */}
        <div style={styles.formContentWrapper}>
          <GenericForm type={activeTab} t={t} />
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            {t('forms.needHelp')}{' '}
            <a href="mailto:diversiaeternals@gmail.com" style={styles.footerLink}>
              {t('forms.supportEmail')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: '#FFFFFF',
    position: 'relative',
  },
  backgroundPattern: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at top right, rgba(4, 107, 210, 0.06) 0%, transparent 50%, rgba(4, 92, 180, 0.04) 100%)',
  },
  contentWrapper: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '3rem 1rem',
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
  },
  headerIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '4rem',
    height: '4rem',
    background: '#046BD2',
    borderRadius: '50%',
    marginBottom: '1.5rem',
  },
  headerIconSvg: {
    width: '2rem',
    height: '2rem',
    color: 'white',
  },
  mainTitle: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#046BD2',
    marginBottom: '1rem',
    fontFamily: 'Orbitron, monospace',
  },
  mainDescription: {
    fontSize: '1.25rem',
    color: '#334155',
    maxWidth: '32rem',
    margin: '0 auto',
    lineHeight: 1.6,
  },
  featuresContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '1.5rem',
    marginBottom: '3rem',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#F0F5FA',
    backdropFilter: 'blur(12px)',
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    border: '1px solid #E5E7EB',
  },
  featureIcon: {
    width: '1rem',
    height: '1rem',
    color: '#046BD2',
  },
  featureText: {
    fontSize: '0.875rem',
    color: '#334155',
  },
  tabsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '3rem',
  },
  tabButton: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    border: '2px solid #E5E7EB',
    background: '#FFFFFF',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    transform: 'scale(1)',
    minWidth: '280px',
  },
  tabButtonActive: {
    borderColor: '#046BD2',
    background: 'rgba(4, 107, 210, 0.08)',
    boxShadow: '0 25px 50px -12px rgba(4, 107, 210, 0.15)',
    transform: 'scale(1.05)',
  },
  tabContent: {
    position: 'relative',
    zIndex: 10,
  },
  tabIconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '3rem',
    height: '3rem',
    borderRadius: '0.5rem',
    backgroundColor: '#F0F5FA',
    marginBottom: '1rem',
  },
  tabIconContainerActive: {
    background: '#046BD2',
  },
  tabIcon: {
    width: '1.5rem',
    height: '1.5rem',
    color: 'white',
  },
  tabTitle: {
    fontWeight: 'bold',
    fontSize: '1.125rem',
    marginBottom: '0.5rem',
    color: '#334155',
  },
  tabTitleActive: {
    color: '#1E293B',
  },
  tabDescription: {
    fontSize: '0.875rem',
    color: '#64748B',
  },
  tabDescriptionActive: {
    color: '#046BD2',
  },
  tabActiveOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(4, 107, 210, 0.04)',
    borderRadius: '0.75rem',
  },
  activeTabIndicator: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  activeTabBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(4, 107, 210, 0.08)',
    backdropFilter: 'blur(12px)',
    padding: '0.75rem 1.5rem',
    borderRadius: '9999px',
    border: '1px solid rgba(4, 107, 210, 0.2)',
  },
  activeTabIcon: {
    width: '1.25rem',
    height: '1.25rem',
    color: '#046BD2',
  },
  activeTabText: {
    color: '#1E293B',
    fontWeight: '500',
  },
  formContentWrapper: {
    marginBottom: '3rem',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: '1rem',
    padding: '2rem',
    border: '1px solid #E5E7EB',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
  },
  formHeader: {
    marginBottom: '1.5rem',
  },
  formTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: '0.5rem',
  },
  formDescription: {
    color: '#64748B',
  },
  formContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  fieldLabel: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#334155',
    marginBottom: '0.5rem',
  },
  requiredStar: {
    color: '#046BD2',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    backgroundColor: '#F0F5FA',
    border: '1px solid #E5E7EB',
    borderRadius: '0.5rem',
    color: '#1E293B',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    outline: 'none',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem 1rem',
    backgroundColor: '#F0F5FA',
    border: '1px solid #E5E7EB',
    borderRadius: '0.5rem',
    color: '#1E293B',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  submitButton: {
    width: '100%',
    background: '#046BD2',
    color: 'white',
    fontWeight: 'bold',
    padding: '1rem 1.5rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontSize: '1rem',
    transform: 'scale(1)',
    boxShadow: '0 4px 14px 0 rgba(4, 107, 210, 0.3)',
  },
  submitButtonDisabled: {
    background: 'linear-gradient(45deg, #4b5563, #6b7280)',
    cursor: 'not-allowed',
    transform: 'scale(1)',
    boxShadow: 'none',
  },
  buttonIcon: {
    width: '1.25rem',
    height: '1.25rem',
  },
  spinner: {
    width: '1.25rem',
    height: '1.25rem',
    border: '2px solid transparent',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  footer: {
    textAlign: 'center',
    marginTop: '3rem',
    paddingTop: '2rem',
    borderTop: '1px solid #E5E7EB',
  },
  footerText: {
    color: '#64748B',
    margin: 0,
  },
  footerLink: {
    color: '#046BD2',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
  },
};