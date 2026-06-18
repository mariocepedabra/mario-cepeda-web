/**
 * ============================================================================
 *  DATOS DE EJEMPLO (PLACEHOLDER) — NO SON DATOS REALES DE MARIO CEPEDA
 * ============================================================================
 *  Se usan para que las webs públicas se vean completas mientras NO haya un
 *  proyecto Supabase configurado. En cuanto se configura Supabase y se corre
 *  el seed, estos datos dejan de utilizarse.
 *
 *  Texto: «lorem» en español.  Imágenes: https://picsum.photos (con semilla).
 * ============================================================================
 */

import type {
  Award,
  ContactMessage,
  Experience,
  Link,
  Media,
  Post,
  Press,
  Profile,
  Setting,
  Video,
} from './types';

const now = '2025-01-01T00:00:00.000Z';

/** Imagen placeholder determinista de picsum. */
export function placeholderImage(seed: string, w = 1200, h = 800): string {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor ' +
  'incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud ' +
  'exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';

export const placeholderProfile: Profile = {
  id: '00000000-0000-0000-0000-000000000001',
  nombre: 'Mario Cepeda',
  titular: 'Director de medios · Abogado · Periodista',
  bio:
    '[CONTENIDO DE EJEMPLO] ' +
    LOREM +
    ' Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu ' +
    'fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.',
  foto_url: placeholderImage('mario-retrato', 900, 1100),
  redes: {
    twitter: 'https://twitter.com/ejemplo',
    facebook: 'https://facebook.com/ejemplo',
    instagram: 'https://instagram.com/ejemplo',
    linkedin: 'https://linkedin.com/in/ejemplo',
    youtube: 'https://youtube.com/@ejemplo',
    website: 'https://pagina10.com',
  },
  created_at: now,
  updated_at: now,
};

export const placeholderExperiences: Experience[] = [
  {
    id: 'exp-1',
    titulo: 'Director General',
    organizacion: 'Página 10 (EJEMPLO)',
    periodo: '2018 — Presente',
    descripcion: '[EJEMPLO] ' + LOREM,
    orden: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'exp-2',
    titulo: 'Fundador y Director',
    organizacion: 'Colombia Positiva (EJEMPLO)',
    periodo: '2020 — Presente',
    descripcion: '[EJEMPLO] ' + LOREM,
    orden: 2,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'exp-3',
    titulo: 'Abogado litigante',
    organizacion: 'Ejercicio independiente (EJEMPLO)',
    periodo: '2012 — 2018',
    descripcion: '[EJEMPLO] ' + LOREM,
    orden: 3,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'exp-4',
    titulo: 'Columnista invitado',
    organizacion: 'Diversos medios regionales (EJEMPLO)',
    periodo: '2010 — Presente',
    descripcion: '[EJEMPLO] ' + LOREM,
    orden: 4,
    created_at: now,
    updated_at: now,
  },
];

export const placeholderPosts: Post[] = Array.from({ length: 6 }, (_, i) => {
  const n = i + 1;
  return {
    id: `post-${n}`,
    titulo: `Título de columna de ejemplo n.º ${n}`,
    slug: `columna-de-ejemplo-${n}`,
    resumen: '[EJEMPLO] ' + LOREM.slice(0, 140) + '…',
    contenido:
      `<p><strong>[CONTENIDO DE EJEMPLO]</strong> ${LOREM}</p>` +
      `<p>${LOREM}</p><blockquote>${LOREM.slice(0, 90)}</blockquote><p>${LOREM}</p>`,
    portada_url: placeholderImage(`columna-${n}`, 1200, 800),
    publicado: true,
    fecha: `2025-0${((i % 9) + 1)}-15`,
    created_at: now,
    updated_at: now,
  } satisfies Post;
});

export const placeholderPress: Press[] = Array.from({ length: 5 }, (_, i) => {
  const n = i + 1;
  return {
    id: `press-${n}`,
    titulo: `Aparición en prensa de ejemplo n.º ${n}`,
    medio: ['El Tiempo', 'Caracol Radio', 'RCN', 'Semana', 'La Silla Vacía'][i] ?? 'Medio',
    url: 'https://example.com/nota',
    fecha: `2024-1${i % 3}-0${n}`,
    imagen_url: placeholderImage(`prensa-${n}`, 800, 600),
    created_at: now,
    updated_at: now,
  } satisfies Press;
});

export const placeholderVideos: Video[] = [
  {
    id: 'video-1',
    titulo: 'Entrevista de ejemplo',
    url_embed: 'https://www.youtube.com/embed/ScMzIvxBSi4',
    plataforma: 'youtube',
    descripcion: '[EJEMPLO] ' + LOREM.slice(0, 100),
    orden: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'video-2',
    titulo: 'Foro regional (ejemplo)',
    url_embed: 'https://www.youtube.com/embed/aqz-KE-bpKQ',
    plataforma: 'youtube',
    descripcion: '[EJEMPLO] ' + LOREM.slice(0, 100),
    orden: 2,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'video-3',
    titulo: 'Reportaje especial (ejemplo)',
    url_embed: 'https://player.vimeo.com/video/76979871',
    plataforma: 'vimeo',
    descripcion: '[EJEMPLO] ' + LOREM.slice(0, 100),
    orden: 3,
    created_at: now,
    updated_at: now,
  },
];

export const placeholderLinks: Link[] = [
  {
    id: 'link-1',
    titulo: 'Página 10',
    url: 'https://pagina10.com',
    categoria: 'proyecto',
    icono: 'newspaper',
    orden: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'link-2',
    titulo: 'Colombia Positiva',
    url: 'https://colombiapositiva.co',
    categoria: 'proyecto',
    icono: 'globe',
    orden: 2,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'link-3',
    titulo: 'Twitter / X',
    url: 'https://twitter.com/ejemplo',
    categoria: 'red_social',
    icono: 'twitter',
    orden: 3,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'link-4',
    titulo: 'LinkedIn',
    url: 'https://linkedin.com/in/ejemplo',
    categoria: 'red_social',
    icono: 'linkedin',
    orden: 4,
    created_at: now,
    updated_at: now,
  },
];

export const placeholderAwards: Award[] = [
  {
    id: 'award-1',
    titulo: 'Premio Nacional de Periodismo (EJEMPLO)',
    entidad: 'Entidad de ejemplo',
    anio: 2023,
    descripcion: '[EJEMPLO] ' + LOREM.slice(0, 110),
    orden: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'award-2',
    titulo: 'Reconocimiento Regional de Medios (EJEMPLO)',
    entidad: 'Entidad de ejemplo',
    anio: 2021,
    descripcion: '[EJEMPLO] ' + LOREM.slice(0, 110),
    orden: 2,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'award-3',
    titulo: 'Certificación en Comunicación Digital (EJEMPLO)',
    entidad: 'Entidad de ejemplo',
    anio: 2019,
    descripcion: '[EJEMPLO] ' + LOREM.slice(0, 110),
    orden: 3,
    created_at: now,
    updated_at: now,
  },
];

export const placeholderMessages: ContactMessage[] = [
  {
    id: 'msg-1',
    nombre: 'Remitente de ejemplo',
    email: 'ejemplo@correo.com',
    mensaje: '[EJEMPLO] Mensaje de prueba de la bandeja de contacto. ' + LOREM.slice(0, 80),
    leido: false,
    created_at: now,
  },
];

export const placeholderMedia: Media[] = Array.from({ length: 4 }, (_, i) => {
  const n = i + 1;
  return {
    id: `media-${n}`,
    nombre: `imagen-ejemplo-${n}.jpg`,
    url: placeholderImage(`media-${n}`, 600, 600),
    tipo: 'imagen',
    created_at: now,
  } satisfies Media;
});

export const placeholderSettings: Setting[] = [
  { clave: 'seo_title', valor: 'Mario Cepeda — Director de medios, abogado y periodista', updated_at: now },
  {
    clave: 'seo_description',
    valor:
      '[EJEMPLO] Sitio personal de Mario Cepeda. Director de Página 10 y Colombia Positiva.',
    updated_at: now,
  },
  { clave: 'og_image', valor: placeholderImage('og-mario', 1200, 630), updated_at: now },
];

/** Mapa clave/valor de settings, como lo consumen las páginas para SEO. */
export const placeholderSettingsMap: Record<string, string> = Object.fromEntries(
  placeholderSettings.map((s) => [s.clave, s.valor ?? '']),
);
