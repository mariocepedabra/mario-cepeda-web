import { MAIN_SECTIONS, parseMedia, PERFIL_KEYS, perfilText } from '@mario/core/lib';
import type { SearchCorpus } from '@mario/database/queries';

import { ESTOICISMO, ESTOICISMO_SLIDES } from '@/lib/presentaciones';

import { htmlToText } from './text';
import type { SearchSection } from './types';

/** Una unidad buscable del sitio, sea cual sea su origen. */
export interface SearchDoc {
  id: string;
  seccion: SearchSection;
  url: string;
  titulo: string;
  /** Texto corto de la etiqueta cuando no hay tema: «Proyecto», «Libro»… */
  tipo?: string;
  tema?: string | null;
  autor?: string | null;
  resumen?: string;
  texto?: string;
  imagen?: string | null;
  fecha?: string | null;
  /** Multiplica la relevancia; menos de 1 para lo que rara vez se busca a propósito. */
  peso?: number;
}

/** Firma por defecto: no se indexa porque haría que «Mario» devolviera todas las notas. */
const DEFAULT_AUTHOR = 'Mario Cepeda Bravo';

/** Miniatura de un medio: solo las imágenes; los videos y embeds no tienen una fija. */
function thumbnail(url: string | null | undefined): string | null {
  const { src, type } = parseMedia(url);
  return src && type === 'image' ? src : null;
}

/** Une bajada y resumen, que en muchas notas repiten el mismo texto. */
function joinSummary(bajada: string, resumen: string): string {
  const repeated = bajada.slice(0, 40) === resumen.slice(0, 40);
  if (repeated) return bajada.length > resumen.length ? bajada : resumen;
  return [bajada, resumen].filter(Boolean).join(' ');
}

/** Páginas fijas, con las palabras con las que la gente las buscaría. */
const STATIC_PAGES: SearchDoc[] = [
  {
    id: 'pagina:contacto',
    seccion: 'sitio',
    url: '/contacto',
    titulo: 'Hablemos',
    tipo: 'Contacto',
    resumen: 'Escríbele a Mario: propuestas, colaboraciones, columnas o cualquier idea.',
    texto: 'contacto contactar correo mensaje teléfono whatsapp escribir entrevista',
  },
  {
    id: 'pagina:privacidad',
    seccion: 'sitio',
    url: '/privacidad',
    titulo: 'Política de privacidad',
    tipo: 'Legal',
    resumen: 'Cómo se tratan los datos personales en este sitio.',
    peso: 0.4,
  },
  {
    id: 'pagina:terminos',
    seccion: 'sitio',
    url: '/terminos',
    titulo: 'Términos de uso',
    tipo: 'Legal',
    resumen: 'Condiciones de uso de este sitio.',
    peso: 0.4,
  },
];

/** Convierte todo el contenido público del sitio en documentos buscables. */
export function buildDocuments(corpus: SearchCorpus): SearchDoc[] {
  const { posts, projects, experiences, books, narino, videos, profile, settings } = corpus;

  const notas = posts.map(
    (p): SearchDoc => ({
      id: `nota:${p.id}`,
      seccion: 'pensamiento',
      url: `/pensamiento/${p.slug}`,
      titulo: p.titulo,
      tema: p.categoria,
      autor: p.autor === DEFAULT_AUTHOR ? null : p.autor,
      resumen: joinSummary(htmlToText(p.bajada), htmlToText(p.resumen)),
      texto: htmlToText(p.contenido),
      imagen: thumbnail(p.portada_url),
      fecha: p.fecha,
    }),
  );

  const proyectos = projects.map(
    (p): SearchDoc => ({
      id: `proyecto:${p.id}`,
      seccion: 'trabajo',
      url: `/trabajo#proyecto-${p.id}`,
      titulo: p.titulo,
      tipo: 'Proyecto',
      resumen: p.subtitulo ?? '',
      texto: p.descripcion ?? '',
      imagen: thumbnail(p.imagen_url),
    }),
  );

  const trayectoria = experiences.map(
    (e): SearchDoc => ({
      id: `trayectoria:${e.id}`,
      seccion: 'trabajo',
      url: `/trabajo#trayectoria-${e.id}`,
      titulo: e.titulo,
      tipo: 'Trayectoria',
      resumen: [e.organizacion, e.periodo].filter(Boolean).join(' · '),
      texto: e.descripcion ?? '',
    }),
  );

  const libros = books.map(
    (b): SearchDoc => ({
      id: `libro:${b.id}`,
      seccion: 'libros',
      url: `/libros#libro-${b.id}`,
      titulo: b.titulo,
      tipo: 'Libro',
      autor: b.autor,
      resumen: b.resena ?? '',
      imagen: thumbnail(b.portada_url),
    }),
  );

  const perfiles = narino.map(
    (p): SearchDoc => ({
      id: `narino:${p.id}`,
      seccion: 'narino',
      url: `/narino/${p.slug}`,
      titulo: p.nombre,
      tema: p.lugar,
      texto: htmlToText(p.historia),
      imagen: thumbnail(p.foto_url),
    }),
  );

  const videosDocs = videos.map(
    (v): SearchDoc => ({
      id: `video:${v.id}`,
      seccion: 'sitio',
      url: '/#multimedia',
      titulo: v.titulo,
      tipo: 'Video',
      resumen: v.descripcion ?? '',
      texto: 'video multimedia',
    }),
  );

  const secciones = MAIN_SECTIONS.map(
    (s): SearchDoc => ({
      id: `seccion:${s.id}`,
      seccion: s.id,
      url: s.href,
      titulo: s.label,
      tipo: 'Sección',
      resumen: s.blurb,
    }),
  );

  const presentacion: SearchDoc = {
    id: 'presentacion:filosofia-estoica',
    seccion: 'pensamiento',
    url: '/pensamiento#presentacion',
    titulo: ESTOICISMO.title,
    tipo: 'Presentación',
    resumen: ESTOICISMO.subtitle,
    texto: ESTOICISMO_SLIDES.map((s) => s.alt).join(' '),
    imagen: ESTOICISMO_SLIDES[0]?.src,
  };

  const perfil: SearchDoc = {
    id: 'pagina:perfil-profesional',
    seccion: 'sitio',
    url: '/perfil-profesional',
    titulo: 'Perfil profesional',
    tipo: 'Sobre Mario',
    resumen: profile.titular,
    texto: [
      profile.bio.replace(/^\[.*?\]\s*/, ''),
      ...PERFIL_KEYS.map((key) => perfilText(settings, key)),
    ].join(' '),
    imagen: thumbnail(profile.foto_url),
  };

  return [
    ...notas,
    ...proyectos,
    ...trayectoria,
    ...libros,
    ...perfiles,
    ...videosDocs,
    ...secciones,
    presentacion,
    perfil,
    ...STATIC_PAGES,
  ];
}
