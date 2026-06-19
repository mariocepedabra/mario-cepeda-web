import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mario Cepeda',
    short_name: 'Mario Cepeda',
    description: 'Sitio personal de Mario Cepeda — director de medios, abogado y periodista.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0a73e6',
    icons: [],
  };
}
