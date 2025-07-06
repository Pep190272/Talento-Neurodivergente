'use client'
import { useParams } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

// Import all feature components
import CognitiveDiversityFeature from './cognitive-diversity';
import MatchingFeature from './matching';
import DevelopmentFeature from './development';
import TrainingFeature from './training';
import AnalyticsFeature from './analytics';
import SupportFeature from './support';
import PartnershipsFeature from './partnerships';
import CareerFeature from './career';
import InnovationFeature from './innovation';
import RecognitionFeature from './recognition';
import ConsultingFeature from './consulting';

// Map route names to components
const featureComponents = {
  'cognitive-diversity': CognitiveDiversityFeature,
  'matching': MatchingFeature,
  'development': DevelopmentFeature,
  'training': TrainingFeature,
  'analytics': AnalyticsFeature,
  'support': SupportFeature,
  'partnerships': PartnershipsFeature,
  'career': CareerFeature,
  'innovation': InnovationFeature,
  'recognition': RecognitionFeature,
  'consulting': ConsultingFeature,
};

export default function FeaturePage() {
  const params = useParams();
  const feature = params.feature;
  const FeatureComponent = featureComponents[feature];

  if (!FeatureComponent) {
    return (
      <div style={{ padding: '2rem', color: 'white', minHeight: '100vh', background: '#181024' }}>
        <Link href="/features" style={{ color: 'var(--primary-purple)', textDecoration: 'underline', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          <FaArrowLeft /> Back to Features
        </Link>
        <h1 style={{ fontFamily: 'Orbitron, Rajdhani, sans-serif', color: 'var(--primary-gold)' }}>Feature Not Found</h1>
        <p style={{ margin: '2rem 0', fontSize: '1.2rem' }}>The requested feature page could not be found.</p>
      </div>
    );
  }

  return <FeatureComponent />;
} 