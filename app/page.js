'use client'

export default function HomePage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      color: '#FFD700',
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>
        ✅ DiversIA está funcionando
      </h1>
      <p style={{ fontSize: '1.5rem', color: '#9333EA', marginBottom: '30px' }}>
        La aplicación se ha desplegado correctamente
      </p>
      <div style={{
        background: 'rgba(255, 215, 0, 0.1)',
        padding: '30px',
        borderRadius: '10px',
        border: '2px solid #FFD700',
        maxWidth: '600px'
      }}>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
          El servidor está corriendo. Los componentes completos se cargarán a continuación.
        </p>
      </div>
    </div>
  );
}
