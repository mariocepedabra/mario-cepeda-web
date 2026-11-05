import { MAIN_SECTIONS, type MainSectionId } from '@mario/core/lib';

/**
 * Tipos y constantes del buscador. Este módulo es seguro para el cliente: no
 * importa el motor (que solo corre en el servidor) ni toca la base de datos.
 */

/** Sección a la que pertenece un resultado. `sitio` agrupa las páginas sueltas. */
export type SearchSection = MainSectionId | 'sitio';

export type SearchOrder = 'relevancia' | 'recientes';

/** Filtros del buscador, en el orden en que se muestran. */
export const SEARCH_SECTIONS: readonly { id: SearchSection; label: string }[] = [
  ...MAIN_SECTIONS.map((s) => ({ id: s.id, label: s.label })),
  { id: 'sitio', label: 'Páginas' },
];

/** Mínimo de caracteres para lanzar una búsqueda. */
export const MIN_QUERY_LENGTH = 2;

/** Máximo de caracteres aceptado (evita consultas abusivas). */
export const MAX_QUERY_LENGTH = 120;

/** Trozo de texto; `m` marca las palabras que coinciden con la búsqueda. */
export type Segment = { t: string; m?: true };

export interface SearchHit {
  id: string;
  seccion: SearchSection;
  url: string;
  /** Línea de metadatos: sección · tema · autor · fecha. */
  etiqueta: string;
  titulo: Segment[];
  fragmento: Segment[];
  imagen: string | null;
}

export interface SearchResponse {
  q: string;
  /** Resultados totales dentro del filtro activo. */
  total: number;
  /** Resultados por sección, sin aplicar el filtro de sección. */
  facetas: Record<SearchSection, number>;
  resultados: SearchHit[];
  /** Consulta corregida cuando se tuvo que tolerar un error de escritura. */
  corregido: string | null;
  /** `true` si ningún resultado contiene todas las palabras buscadas. */
  parcial: boolean;
}

/** Contenido para descubrir antes de escribir: temas y notas recientes. */
export interface SearchExplore {
  temas: string[];
  recientes: SearchHit[];
}

export function isSearchSection(value: string | null | undefined): value is SearchSection {
  return SEARCH_SECTIONS.some((s) => s.id === value);
}

/** Enlace a la página completa de resultados. */
export function searchPageUrl(q: string, seccion?: SearchSection | null): string {
  const params = new URLSearchParams({ q });
  if (seccion) params.set('seccion', seccion);
  return `/buscar?${params.toString()}`;
}
