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

import { articulosMario } from './articulos';
import type {
  Award,
  Book,
  ContactMessage,
  Experience,
  Link,
  Media,
  NarinoProfile,
  Post,
  Press,
  Profile,
  Project,
  Setting,
  Subscriber,
  SubscriberEvent,
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
  nav_media: {
    pensamiento: placeholderImage('nav-pensamiento', 1200, 800),
    trabajo: placeholderImage('nav-trabajo', 1200, 800),
    libros: placeholderImage('nav-libros', 1200, 800),
    narino: placeholderImage('nav-narino', 1200, 800),
  },
  nav_text: {},
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

/**
 * Notas / columnas REALES de Mario para la sección Pensamiento.
 * Importadas de pagina10.com y lasillavacia.com (columnas de las que es autor +
 * notas sobre él), sin duplicados. Estas alimentan el FALLBACK público cuando la
 * tabla `posts` está vacía o Supabase no está configurado; la carga definitiva y
 * editable en el panel vive en `seed/articulos-mario.sql`. Ver `articulos.ts`.
 */
export const placeholderPosts: Post[] = articulosMario;

export const placeholderProjects: Project[] = [
  {
    id: 'proj-1',
    titulo: 'Página 10',
    subtitulo: 'Medio digital · Fundador y director',
    descripcion:
      '[EJEMPLO] ' +
      LOREM.slice(0, 180) +
      ' Un proyecto periodístico que conecta a Nariño con el país.',
    imagen_url: placeholderImage('proyecto-pagina10', 1200, 900),
    url: 'https://pagina10.com',
    orden: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'proj-2',
    titulo: 'Colombia Positiva',
    subtitulo: 'Plataforma de buenas noticias · Director',
    descripcion: '[EJEMPLO] ' + LOREM.slice(0, 180) + ' Periodismo de soluciones para el país.',
    imagen_url: placeholderImage('proyecto-colombiapositiva', 1200, 900),
    url: 'https://colombiapositiva.co',
    orden: 2,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'proj-3',
    titulo: 'Ejercicio del derecho',
    subtitulo: 'Abogado litigante',
    descripcion: '[EJEMPLO] ' + LOREM.slice(0, 160),
    imagen_url: placeholderImage('proyecto-derecho', 1200, 900),
    url: null,
    orden: 3,
    created_at: now,
    updated_at: now,
  },
];

export const placeholderBooks: Book[] = [
  {
    id: 'book-1',
    titulo: 'Cien años de soledad (EJEMPLO)',
    autor: 'Autor de ejemplo',
    portada_url: placeholderImage('libro-1', 600, 900),
    valoracion: 5,
    resena: '[EJEMPLO] Una nota breve de Mario sobre por qué este libro lo marcó. ' + LOREM.slice(0, 80),
    lista: 'marcaron',
    orden: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'book-2',
    titulo: 'El olvido que seremos (EJEMPLO)',
    autor: 'Autor de ejemplo',
    portada_url: placeholderImage('libro-2', 600, 900),
    valoracion: 5,
    resena: '[EJEMPLO] ' + LOREM.slice(0, 90),
    lista: 'marcaron',
    orden: 2,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'book-3',
    titulo: 'Lectura de temporada (EJEMPLO)',
    autor: 'Autor de ejemplo',
    portada_url: placeholderImage('libro-3', 600, 900),
    valoracion: 4,
    resena: '[EJEMPLO] ' + LOREM.slice(0, 90),
    lista: 'temporada',
    orden: 3,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'book-4',
    titulo: 'Otra recomendación (EJEMPLO)',
    autor: 'Autor de ejemplo',
    portada_url: placeholderImage('libro-4', 600, 900),
    valoracion: 4,
    resena: '[EJEMPLO] ' + LOREM.slice(0, 90),
    lista: 'temporada',
    orden: 4,
    created_at: now,
    updated_at: now,
  },
];

export const placeholderNarinoProfiles: NarinoProfile[] = [
  {
    id: 'narino-1',
    nombre: 'Maestro artesano (EJEMPLO)',
    slug: 'maestro-artesano-ejemplo',
    lugar: 'Pasto, Nariño',
    foto_url: placeholderImage('narino-1', 1000, 1200),
    historia: `<p>[EJEMPLO] ${LOREM}</p><p>${LOREM}</p>`,
    orden: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'narino-2',
    nombre: 'El Carnaval de Negros y Blancos (EJEMPLO)',
    slug: 'carnaval-negros-y-blancos-ejemplo',
    lugar: 'Pasto, Nariño',
    foto_url: placeholderImage('narino-2', 1000, 1200),
    historia: `<p>[EJEMPLO] ${LOREM}</p><p>${LOREM}</p>`,
    orden: 2,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'narino-3',
    nombre: 'El volcán Galeras (EJEMPLO)',
    slug: 'volcan-galeras-ejemplo',
    lugar: 'Nariño',
    foto_url: placeholderImage('narino-3', 1000, 1200),
    historia: `<p>[EJEMPLO] ${LOREM}</p><p>${LOREM}</p>`,
    orden: 3,
    created_at: now,
    updated_at: now,
  },
];

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

export const placeholderSubscribers: Subscriber[] = [
  {
    id: 'sub-1',
    email: 'lectora.ejemplo@correo.com',
    nombre: 'Lectora de ejemplo',
    estado: 'activo',
    token: '00000000-0000-0000-0000-0000000000a1',
    created_at: '2025-02-10T10:00:00.000Z',
    updated_at: '2025-02-10T10:00:00.000Z',
  },
  {
    id: 'sub-2',
    email: 'suscriptor.ejemplo@correo.com',
    nombre: 'Suscriptor de ejemplo',
    estado: 'activo',
    token: '00000000-0000-0000-0000-0000000000a2',
    created_at: '2025-03-05T16:30:00.000Z',
    updated_at: '2025-03-05T16:30:00.000Z',
  },
  {
    id: 'sub-3',
    email: 'baneado.ejemplo@correo.com',
    nombre: null,
    estado: 'baneado',
    token: '00000000-0000-0000-0000-0000000000a3',
    created_at: '2025-01-20T09:15:00.000Z',
    updated_at: '2025-01-20T09:15:00.000Z',
  },
];

export const placeholderSubscriberEvents: SubscriberEvent[] = [
  {
    id: 'ev-1',
    subscriber_id: 'sub-1',
    path: '/pensamiento/columna-de-ejemplo-1',
    titulo: 'Título de columna de ejemplo n.º 1',
    created_at: '2025-02-11T12:00:00.000Z',
  },
  {
    id: 'ev-2',
    subscriber_id: 'sub-1',
    path: '/narino',
    titulo: 'Nariño',
    created_at: '2025-02-12T18:20:00.000Z',
  },
];

export const placeholderSettings: Setting[] = [
  { clave: 'seo_title', valor: 'Mario Cepeda — Director de medios, abogado y periodista', updated_at: now },
  {
    clave: 'seo_description',
    valor:
      '[EJEMPLO] Sitio personal de Mario Cepeda. Director de Página 10 y Colombia Positiva.',
    updated_at: now,
  },
  { clave: 'og_image', valor: placeholderImage('og-mario', 1200, 630), updated_at: now },
  {
    // Mosaico de Trabajo (EJEMPLO): proporciones variadas para mostrar el collage.
    clave: 'mosaico_trabajo',
    valor: JSON.stringify([
      placeholderImage('mosaico-1', 900, 1200),
      placeholderImage('mosaico-2', 1200, 800),
      placeholderImage('mosaico-3', 1000, 1000),
      placeholderImage('mosaico-4', 1200, 900),
      placeholderImage('mosaico-5', 800, 1100),
      placeholderImage('mosaico-6', 1200, 700),
      placeholderImage('mosaico-7', 1100, 1300),
    ]),
    updated_at: now,
  },
  {
    // Mosaico de Pensamiento (EJEMPLO): independiente del de Trabajo.
    clave: 'mosaico_pensamiento',
    valor: JSON.stringify([
      placeholderImage('mosaico-p1', 1200, 800),
      placeholderImage('mosaico-p2', 900, 1200),
      placeholderImage('mosaico-p3', 1200, 900),
      placeholderImage('mosaico-p4', 1000, 1000),
      placeholderImage('mosaico-p5', 1100, 1300),
      placeholderImage('mosaico-p6', 1200, 700),
    ]),
    updated_at: now,
  },
];

/** Mapa clave/valor de settings, como lo consumen las páginas para SEO. */
export const placeholderSettingsMap: Record<string, string> = Object.fromEntries(
  placeholderSettings.map((s) => [s.clave, s.valor ?? '']),
);
