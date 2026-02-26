/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // El job lint de la CI corre `eslint .` por separado; desactivar aquí evita
  // que `next build` corra ESLint internamente (conflicto con flat config).
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignorar errores de TypeScript durante build hasta completar migración .js → .ts
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Webpack config solo se usa en builds de producción
  // Turbopack (modo dev) maneja automáticamente los polyfills de Node.js
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
