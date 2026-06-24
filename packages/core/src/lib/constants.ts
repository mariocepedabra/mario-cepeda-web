/**
 * Las 4 secciones principales del sitio (estilo Gates Notes).
 * Nombres FIJOS por requerimiento del proyecto; cada una imita la
 * maquetación de su equivalente en gatesnotes.com pero con contenido propio.
 */
export const MAIN_SECTIONS = [
  {
    id: 'pensamiento',
    label: 'Pensamiento',
    href: '/pensamiento',
    blurb: 'Ensayos, columnas e ideas sobre medios, región, tecnología y sociedad.',
  },
  {
    id: 'trabajo',
    label: 'Trabajo',
    href: '/trabajo',
    blurb: 'Quién es Mario a través de lo que hace: Página 10, Colombia Positiva y su propósito.',
  },
  {
    id: 'libros',
    label: 'Libros',
    href: '/libros',
    blurb: 'Lecturas que lo marcaron y recomendaciones de temporada.',
  },
  {
    id: 'narino',
    label: 'Nariño',
    href: '/narino',
    blurb: 'Gente, lugares y tradiciones de su tierra. La sección más cercana.',
  },
] as const;

export type MainSectionId = (typeof MAIN_SECTIONS)[number]['id'];

/** Enlaces legales del footer. */
export const LEGAL_LINKS = [
  { label: 'Términos de uso', href: '/terminos' },
  { label: 'Política de privacidad', href: '/privacidad' },
] as const;

/** Copys del bloque de boletín (editables más adelante desde el panel). */
export const NEWSLETTER = {
  eyebrow: 'Boletín',
  title: 'Únete a la conversación',
  description:
    'Ideas, columnas y crónicas de Nariño, directo en tu correo. ' +
    'Nunca compartiremos tu correo con nadie.',
  placeholderName: 'Tu nombre',
  placeholderEmail: 'tucorreo@ejemplo.com',
  cta: 'Suscribirme',
} as const;

/** Secciones del antiguo layout de una sola página (en desuso tras el rediseño). */
export const PUBLIC_SECTIONS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'sobre-mi', label: 'Sobre mí' },
  { id: 'trayectoria', label: 'Trayectoria' },
  { id: 'notas', label: 'Notas' },
  { id: 'prensa', label: 'Prensa' },
  { id: 'multimedia', label: 'Multimedia' },
  { id: 'enlaces', label: 'Enlaces' },
  { id: 'reconocimientos', label: 'Reconocimientos' },
  { id: 'contacto', label: 'Contacto' },
] as const;

export type PublicSectionId = (typeof PUBLIC_SECTIONS)[number]['id'];

/** Valores por defecto del sitio (sobrescritos por la tabla `settings`). */
export const SITE_DEFAULTS = {
  name: 'Mario Cepeda',
  title: 'Mario Cepeda — Director de medios, abogado y periodista',
  description:
    'Sitio personal de Mario Cepeda. Director de Página 10 y Colombia Positiva. ' +
    'Director de medios, abogado y periodista en Nariño, Colombia.',
  locale: 'es_CO',
} as const;

/** Etiquetas legibles para las categorías de enlaces. */
export const LINK_CATEGORY_LABELS: Record<string, string> = {
  proyecto: 'Proyectos',
  red_social: 'Redes sociales',
  recurso: 'Recursos',
};
