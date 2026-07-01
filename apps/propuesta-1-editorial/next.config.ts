import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Compilamos el código TS de los packages compartidos del monorepo.
  transpilePackages: ['@mario/core', '@mario/database', '@mario/config'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'fastly.picsum.photos' },
      { protocol: 'https', hostname: '**.supabase.co' },
      // Portadas de los artículos importados (Pensamiento).
      { protocol: 'https', hostname: 'pagina10.com' },
      { protocol: 'https', hostname: 'www.lasillavacia.com' },
    ],
  },
};

export default nextConfig;
