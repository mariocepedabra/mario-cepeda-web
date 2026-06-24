/**
 * Textos editables del sitio (capa de «cadenas sueltas» del brief, §10.2).
 *
 * Se guardan en la tabla `settings` (clave→valor) y se leen con `siteText()`,
 * que cae al valor por defecto definido aquí si no hay nada guardado. Así la
 * web nunca queda vacía y Mario puede editar estos textos desde el panel.
 */

export type ContentFieldType = 'text' | 'textarea';

export interface ContentField {
  key: string;
  label: string;
  group: string;
  type: ContentFieldType;
  default: string;
}

export const CONTENT_FIELDS: ContentField[] = [
  // Inicio · Hero ------------------------------------------------------------
  {
    key: 'home.hero.eyebrow',
    label: 'Antetítulo',
    group: 'Inicio · Hero',
    type: 'text',
    default: 'Sitio personal · Nariño, Colombia',
  },
  {
    key: 'home.hero.title',
    label: 'Titular',
    group: 'Inicio · Hero',
    type: 'textarea',
    default: 'Ideas que mueven a Nariño y al mundo',
  },
  {
    key: 'home.hero.highlight',
    label: 'Palabra resaltada (dentro del titular)',
    group: 'Inicio · Hero',
    type: 'text',
    default: 'Nariño',
  },
  {
    key: 'home.hero.lead',
    label: 'Párrafo de entrada',
    group: 'Inicio · Hero',
    type: 'textarea',
    default:
      'Director de Página 10 y Colombia Positiva. Escribo sobre medios, mi región y las ideas que la mueven.',
  },
  {
    key: 'home.hero.cta_primary',
    label: 'Botón principal',
    group: 'Inicio · Hero',
    type: 'text',
    default: 'Explorar Pensamiento',
  },
  {
    key: 'home.hero.cta_secondary',
    label: 'Botón secundario',
    group: 'Inicio · Hero',
    type: 'text',
    default: 'Suscríbete',
  },
  // Inicio · Accesos a secciones --------------------------------------------
  {
    key: 'home.sections.eyebrow',
    label: 'Antetítulo',
    group: 'Inicio · Secciones',
    type: 'text',
    default: 'Explora',
  },
  {
    key: 'home.sections.title',
    label: 'Título',
    group: 'Inicio · Secciones',
    type: 'text',
    default: 'Cuatro miradas',
  },
  {
    key: 'section.pensamiento.blurb',
    label: 'Pensamiento — descripción',
    group: 'Inicio · Secciones',
    type: 'textarea',
    default: 'Ensayos, columnas e ideas sobre medios, región, tecnología y sociedad.',
  },
  {
    key: 'section.trabajo.blurb',
    label: 'Trabajo — descripción',
    group: 'Inicio · Secciones',
    type: 'textarea',
    default:
      'Quién es Mario a través de lo que hace: Página 10, Colombia Positiva y su propósito.',
  },
  {
    key: 'section.libros.blurb',
    label: 'Libros — descripción',
    group: 'Inicio · Secciones',
    type: 'textarea',
    default: 'Lecturas que lo marcaron y recomendaciones de temporada.',
  },
  {
    key: 'section.narino.blurb',
    label: 'Nariño — descripción',
    group: 'Inicio · Secciones',
    type: 'textarea',
    default: 'Gente, lugares y tradiciones de su tierra. La sección más cercana.',
  },
  // Boletín ------------------------------------------------------------------
  {
    key: 'newsletter.title',
    label: 'Título',
    group: 'Boletín',
    type: 'text',
    default: 'Únete a la conversación',
  },
  {
    key: 'newsletter.description',
    label: 'Descripción',
    group: 'Boletín',
    type: 'textarea',
    default:
      'Ideas, columnas y crónicas de Nariño, directo en tu correo. Nunca compartiremos tu correo con nadie.',
  },
];

export const CONTENT_DEFAULTS: Record<string, string> = Object.fromEntries(
  CONTENT_FIELDS.map((f) => [f.key, f.default]),
);

export const CONTENT_KEYS: string[] = CONTENT_FIELDS.map((f) => f.key);

/** Grupos en orden de aparición (para el editor del panel). */
export const CONTENT_GROUPS: string[] = Array.from(new Set(CONTENT_FIELDS.map((f) => f.group)));

/** Devuelve el texto guardado para `key`, o su valor por defecto. */
export function siteText(map: Record<string, string> | undefined, key: string): string {
  const value = map?.[key];
  return value && value.trim() ? value : CONTENT_DEFAULTS[key] ?? '';
}
