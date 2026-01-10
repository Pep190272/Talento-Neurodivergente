import "./globals.css";
import Navbar from "./components/Navbar/Navbar";

export const metadata = {
  title: "Diversia Eternals - Neurodivergent Talent Platform",
  description: "Unlock neurodivergent superpowers and build inclusive, high-performing organizations with Diversia Eternals",
};

export default function RootLayout({ children }) {
  const maintenanceMode = true;

  if (maintenanceMode) {
    return (
      <html lang="es">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        </head>
        <body>
          <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
            color: '#fff',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              padding: '60px 40px',
              maxWidth: '600px',
              boxShadow: '0 8px 32px rgba(147, 51, 234, 0.2)'
            }}>
              <h1 style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '3rem',
                background: 'linear-gradient(135deg, #FFD700 0%, #9333EA 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '20px'
              }}>
                🚧 En Mantenimiento
              </h1>
              <p style={{
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '1.3rem',
                color: '#ccc',
                marginBottom: '30px',
                lineHeight: '1.6'
              }}>
                Estamos trabajando para mejorar tu experiencia.
                <br />
                Volvemos pronto con nuevas funcionalidades.
              </p>
              <div style={{
                display: 'inline-block',
                padding: '12px 24px',
                background: 'rgba(255, 215, 0, 0.1)',
                border: '1px solid #FFD700',
                borderRadius: '10px',
                color: '#FFD700',
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '0.9rem'
              }}>
                Regresa en unos momentos
              </div>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Navbar />
        <main style={{ paddingTop: '80px', minHeight: '100vh' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
