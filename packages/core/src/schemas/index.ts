import { z } from 'zod';

/**
 * Esquemas Zod compartidos por los formularios (React Hook Form en cliente)
 * y por las Server Actions (validación en servidor). Una sola fuente de verdad.
 */

// Helpers ----------------------------------------------------------------------

/** URL opcional que también acepta cadena vacía (campos de formulario). */
const optionalUrl = z
  .string()
  .trim()
  .url('Introduce una URL válida')
  .or(z.literal(''))
  .optional();

/** Entero opcional: '' o null -> undefined. */
const optionalInt = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
  z.number({ invalid_type_error: 'Debe ser un número' }).int().optional(),
);

/** Entero con valor por defecto 0 (campo «orden»). */
const orderInt = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? 0 : Number(v)),
  z.number({ invalid_type_error: 'Debe ser un número' }).int().min(0),
);

const requiredText = (label: string, min = 1) =>
  z.string().trim().min(min, `${label} es obligatorio`);

// Perfil -----------------------------------------------------------------------

export const socialLinksSchema = z.object({
  twitter: optionalUrl,
  facebook: optionalUrl,
  instagram: optionalUrl,
  linkedin: optionalUrl,
  youtube: optionalUrl,
  tiktok: optionalUrl,
  whatsapp: z.string().trim().optional(),
  website: optionalUrl,
});

/**
 * Media (URL de imagen o video) por sección del menú. Mismo formato que
 * `foto_url`: URL válida o cadena vacía (admite el marcador `#loop`).
 */
export const navMediaSchema = z.object({
  pensamiento: optionalUrl,
  trabajo: optionalUrl,
  libros: optionalUrl,
  narino: optionalUrl,
});

/** Alto del panel en píxeles (con límites razonables); '' o null -> undefined. */
const navHeight = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
  z.number({ invalid_type_error: 'Debe ser un número' }).int().min(160).max(800).optional(),
);

/** Textos editables sobre la media de cada sección + encuadre y alto del panel. */
const navTextEntrySchema = z
  .object({
    titulo: z.string().trim().optional(),
    texto: z.string().trim().optional(),
    foco: z.string().trim().optional(),
    alto: navHeight,
  })
  .default({});

export const navTextSchema = z.object({
  pensamiento: navTextEntrySchema,
  trabajo: navTextEntrySchema,
  libros: navTextEntrySchema,
  narino: navTextEntrySchema,
});

export const profileSchema = z.object({
  nombre: requiredText('El nombre'),
  titular: requiredText('El titular'),
  bio: requiredText('La biografía', 10),
  foto_url: optionalUrl,
  redes: socialLinksSchema.default({}),
  nav_media: navMediaSchema.default({}),
  nav_text: navTextSchema.default({}),
});

// Trayectoria ------------------------------------------------------------------

export const experienceSchema = z.object({
  titulo: requiredText('El título'),
  organizacion: z.string().trim().optional(),
  periodo: z.string().trim().optional(),
  descripcion: z.string().trim().optional(),
  orden: orderInt,
});

// Notas / columnas -------------------------------------------------------------

const slugField = z
  .string()
  .trim()
  .min(1, 'El slug es obligatorio')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Solo minúsculas, números y guiones');

export const postSchema = z.object({
  titulo: requiredText('El título'),
  slug: slugField,
  categoria: z.string().trim().optional(),
  bajada: z.string().trim().optional(),
  resumen: z.string().trim().optional(),
  contenido: z.string().optional(),
  portada_url: optionalUrl,
  publicado: z.boolean().default(false),
  fecha: z.string().min(1, 'La fecha es obligatoria'),
});

// Proyectos (Trabajo) ----------------------------------------------------------

export const projectSchema = z.object({
  titulo: requiredText('El título'),
  subtitulo: z.string().trim().optional(),
  descripcion: z.string().trim().optional(),
  imagen_url: optionalUrl,
  url: optionalUrl,
  orden: orderInt,
});

// Libros -----------------------------------------------------------------------

export const bookSchema = z.object({
  titulo: requiredText('El título'),
  autor: z.string().trim().optional(),
  portada_url: optionalUrl,
  valoracion: optionalInt,
  resena: z.string().trim().optional(),
  lista: z.enum(['marcaron', 'temporada']).default('temporada'),
  orden: orderInt,
});

// Perfiles de Nariño -----------------------------------------------------------

export const narinoProfileSchema = z.object({
  nombre: requiredText('El nombre'),
  slug: slugField,
  lugar: z.string().trim().optional(),
  foto_url: optionalUrl,
  historia: z.string().optional(),
  orden: orderInt,
});

// Prensa -----------------------------------------------------------------------

export const pressSchema = z.object({
  titulo: requiredText('El título'),
  medio: z.string().trim().optional(),
  url: optionalUrl,
  fecha: z.string().optional(),
  imagen_url: optionalUrl,
});

// Videos -----------------------------------------------------------------------

export const videoSchema = z.object({
  titulo: requiredText('El título'),
  url_embed: z.string().trim().min(1, 'La URL del video es obligatoria'),
  plataforma: z.enum(['youtube', 'vimeo', 'otro']).default('youtube'),
  descripcion: z.string().trim().optional(),
  orden: orderInt,
});

// Enlaces ----------------------------------------------------------------------

export const linkSchema = z.object({
  titulo: requiredText('El título'),
  url: z.string().trim().url('Introduce una URL válida'),
  categoria: z.enum(['proyecto', 'red_social', 'recurso']).default('recurso'),
  icono: z.string().trim().optional(),
  orden: orderInt,
});

// Reconocimientos --------------------------------------------------------------

export const awardSchema = z.object({
  titulo: requiredText('El título'),
  entidad: z.string().trim().optional(),
  anio: optionalInt,
  descripcion: z.string().trim().optional(),
  orden: orderInt,
});

// Contacto (público) -----------------------------------------------------------

export const contactSchema = z.object({
  nombre: z.string().trim().min(2, 'Tu nombre es obligatorio'),
  email: z.string().trim().email('Introduce un correo válido'),
  mensaje: z.string().trim().min(10, 'El mensaje debe tener al menos 10 caracteres'),
});

// Ajustes SEO / OG -------------------------------------------------------------

export const seoSettingsSchema = z.object({
  seo_title: z.string().trim().optional(),
  seo_description: z.string().trim().optional(),
  og_image: optionalUrl,
});

// Textos editables del sitio (clave/valor) -------------------------------------

export const siteContentSchema = z.record(z.string());

// Mosaico de imágenes/videos de la sección Trabajo -----------------------------

export const mosaicSchema = z.array(z.string().trim());

// Tipos inferidos --------------------------------------------------------------

export type ProfileInput = z.infer<typeof profileSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type PostInput = z.infer<typeof postSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type BookInput = z.infer<typeof bookSchema>;
export type NarinoProfileInput = z.infer<typeof narinoProfileSchema>;
export type VideoInput = z.infer<typeof videoSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type SeoSettingsInput = z.infer<typeof seoSettingsSchema>;
export type SiteContentInput = z.infer<typeof siteContentSchema>;

/**
 * Mapa de esquemas para las entidades de lista que usan el CRUD genérico
 * (`saveRow`/`deleteRow`). Perfil, ajustes, mensajes y medios tienen flujos
 * propios y no entran aquí.
 */
export const listSchemas = {
  experiences: experienceSchema,
  posts: postSchema,
  projects: projectSchema,
  books: bookSchema,
  narino_profiles: narinoProfileSchema,
  videos: videoSchema,
} as const;

export type ListTable = keyof typeof listSchemas;

export function schemaFor(table: ListTable): z.ZodTypeAny {
  return listSchemas[table];
}
