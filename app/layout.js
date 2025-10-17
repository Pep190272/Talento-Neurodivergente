import "./globals.css";
import Navbar from "./components/Navbar/Navbar";

export const metadata = {
  title: "DiversIA - Neurodivergent Talent Platform",
  description: "Unlock neurodivergent superpowers and build inclusive, high-performing organizations",
};

export default function RootLayout({ children }) {
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
