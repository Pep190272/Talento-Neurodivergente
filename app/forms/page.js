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
    color: 'from-purple-600 to-purple-800'
  },
  {
    label: t('forms.tabs.company.label'),
    key: 'company',
    icon: Building2,
    description: t('forms.tabs.company.description'),
    color: 'from-yellow-600 to-yellow-800'
  },
  {
    label: t('forms.tabs.therapist.label'),
    key: 'therapist',
    icon: Stethoscope,
    description: t('forms.tabs.therapist.description'),
    color: 'from-purple-500 to-indigo-600'
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
          border-color: #9333ea !important;
          box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.2) !important;
        }
        button:hover:not(:disabled) {
          background: linear-gradient(45deg, #7c3aed, #6d28d9) !important;
          transform: scale(1.05) !important;
          box-shadow: 0 10px 25px -5px rgba(147, 51, 234, 0.4) !important;
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
    background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 50%, #1a1a1a 100%)',
    position: 'relative',
  },
  backgroundPattern: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at top right, rgba(147, 51, 234, 0.2) 0%, transparent 50%, rgba(234, 179, 8, 0.2) 100%)',
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
    background: 'linear-gradient(45deg, #9333ea, #eab308)',
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
    color: 'white',
    marginBottom: '1rem',
    background: 'linear-gradient(45deg, #a855f7, #eab308)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  mainDescription: {
    fontSize: '1.25rem',
    color: '#d1d5db',
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
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    backdropFilter: 'blur(12px)',
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    border: '1px solid #374151',
  },
  featureIcon: {
    width: '1rem',
    height: '1rem',
    color: '#eab308',
  },
  featureText: {
    fontSize: '0.875rem',
    color: '#d1d5db',
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
    border: '2px solid #374151',
    background: 'rgba(31, 41, 55, 0.5)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    transform: 'scale(1)',
    minWidth: '280px',
  },
  tabButtonActive: {
    borderColor: '#9333ea',
    background: 'rgba(147, 51, 234, 0.2)',
    boxShadow: '0 25px 50px -12px rgba(147, 51, 234, 0.2)',
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
    backgroundColor: '#374151',
    marginBottom: '1rem',
  },
  tabIconContainerActive: {
    background: 'linear-gradient(45deg, #9333ea, #7c3aed)',
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
    color: '#d1d5db',
  },
  tabTitleActive: {
    color: 'white',
  },
  tabDescription: {
    fontSize: '0.875rem',
    color: '#9ca3af',
  },
  tabDescriptionActive: {
    color: '#e9d5ff',
  },
  tabActiveOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(45deg, rgba(147, 51, 234, 0.1), rgba(124, 58, 237, 0.1))',
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
    background: 'linear-gradient(45deg, rgba(147, 51, 234, 0.2), rgba(234, 179, 8, 0.2))',
    backdropFilter: 'blur(12px)',
    padding: '0.75rem 1.5rem',
    borderRadius: '9999px',
    border: '1px solid rgba(147, 51, 234, 0.3)',
  },
  activeTabIcon: {
    width: '1.25rem',
    height: '1.25rem',
    color: '#a855f7',
  },
  activeTabText: {
    color: 'white',
    fontWeight: '500',
  },
  formContentWrapper: {
    marginBottom: '3rem',
  },
  formContainer: {
    backgroundColor: '#111827',
    borderRadius: '1rem',
    padding: '2rem',
    border: '1px solid #1f2937',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  formHeader: {
    marginBottom: '1.5rem',
  },
  formTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '0.5rem',
  },
  formDescription: {
    color: '#9ca3af',
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
    color: '#e5e7eb',
    marginBottom: '0.5rem',
  },
  requiredStar: {
    color: '#eab308',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '0.5rem',
    color: 'white',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    outline: 'none',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem 1rem',
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '0.5rem',
    color: 'white',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  submitButton: {
    width: '100%',
    background: 'linear-gradient(45deg, #9333ea, #7c3aed)',
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
    boxShadow: '0 4px 14px 0 rgba(147, 51, 234, 0.3)',
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
    borderTop: '1px solid #1f2937',
  },
  footerText: {
    color: '#9ca3af',
    margin: 0,
  },
  footerLink: {
    color: '#eab308',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
  },
};