/** Secciones públicas del sitio (mismas en las 4 propuestas). */
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
