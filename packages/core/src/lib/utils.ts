import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { VideoPlatform } from '@mario/database';

/** Combina clases de Tailwind resolviendo conflictos (patrón shadcn/ui). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Formatea una fecha en español de Colombia. */
export function formatDate(
  value: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
    ...options,
  }).format(date);
}

/** Devuelve solo el año de una fecha. */
export function formatYear(value: string | Date | null | undefined): string {
  return formatDate(value, { year: 'numeric', month: undefined, day: undefined });
}

/** Convierte un texto en un slug URL-safe. */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita acentos (marcas diacríticas)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Normaliza una URL de YouTube/Vimeo a su forma «embed» y detecta plataforma.
 * Acepta enlaces de tipo watch, youtu.be, shorts, embed o ya embebidos.
 */
export function toEmbed(raw: string): { url: string; platform: VideoPlatform } {
  const url = raw.trim();

  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([\w-]{11})/,
  );
  if (yt?.[1]) {
    return { url: `https://www.youtube.com/embed/${yt[1]}`, platform: 'youtube' };
  }

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo?.[1]) {
    return { url: `https://player.vimeo.com/video/${vimeo[1]}`, platform: 'vimeo' };
  }

  return { url, platform: 'otro' };
}

/** Recorta un texto a `max` caracteres añadiendo elipsis. */
export function truncate(text: string, max = 160): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}
