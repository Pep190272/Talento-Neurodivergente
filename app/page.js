'use client'
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const Home = dynamic(() => import('./components/Home/Home'), {
  loading: () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '1.5rem',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      color: '#FFD700'
    }}>
      Cargando DiversIA...
    </div>
  ),
  ssr: false
});

export default function HomePage() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.5rem',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        color: '#FFD700'
      }}>
        Inicializando...
      </div>
    }>
      <Home />
    </Suspense>
  );
}
