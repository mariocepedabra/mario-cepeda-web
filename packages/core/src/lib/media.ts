/**
 * Utilidades de medios (puras, sin dependencias de navegador): detección de
 * tipo (imagen/video/embed) y del marcador de bucle/GIF. Las usan tanto el
 * panel (al guardar) como la web pública (al renderizar la portada).
 *
 * Convención de bucle: una URL que termina en `#loop` (o `#gif`) indica que el
 * video debe reproducirse en bucle infinito tipo GIF. Así no hace falta una
 * columna extra en la base de datos.
 */

export type MediaType = 'image' | 'video' | 'embed';

export interface ParsedMedia {
  src: string;
  type: MediaType;
  loop: boolean;
}

const VIDEO_FILE = /\.(mp4|webm|ogg|ogv|mov|m4v)$/i;
const EMBED_HOSTS = /youtube\.com|youtu\.be|vimeo\.com|tiktok\.com|instagram\.com/i;
const LOOP_MARKER = /#(loop|gif)\b/i;

/** ¿La URL apunta a un archivo de video directo (no un embed)? */
export function isVideoFileUrl(url: string): boolean {
  const clean = url.split('#')[0].split('?')[0].trim();
  return VIDEO_FILE.test(clean);
}

/** Interpreta una URL de medio: tipo (imagen/video/embed) y si va en bucle. */
export function parseMedia(url: string | null | undefined): ParsedMedia {
  const raw = (url ?? '').trim();
  if (!raw) return { src: '', type: 'image', loop: false };
  const loop = LOOP_MARKER.test(raw);
  const src = raw.replace(LOOP_MARKER, '');
  if (isVideoFileUrl(src)) return { src, type: 'video', loop };
  if (EMBED_HOSTS.test(src)) return { src, type: 'embed', loop };
  return { src, type: 'image', loop };
}

/** Añade o quita el marcador de bucle (#loop) a una URL. */
export function withLoop(url: string, loop: boolean): string {
  const base = (url ?? '').replace(LOOP_MARKER, '');
  return loop && base ? `${base}#loop` : base;
}

/**
 * Normaliza un enlace de video a su forma «embed» (YouTube/Vimeo/TikTok/
 * Instagram) o lo detecta como archivo directo. `loop` aplica parámetros de
 * bucle/autoplay cuando la plataforma lo permite (YouTube/Vimeo).
 */
export function toVideoSource(raw: string, loop: boolean): { src: string; kind: 'file' | 'embed' } {
  const url = raw.trim();

  if (isVideoFileUrl(url)) return { src: url, kind: 'file' };

  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([\w-]{11})/,
  );
  if (yt?.[1]) {
    const id = yt[1];
    const params = loop ? `?loop=1&playlist=${id}&autoplay=1&mute=1&playsinline=1` : '';
    return { src: `https://www.youtube.com/embed/${id}${params}`, kind: 'embed' };
  }

  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm?.[1]) {
    const params = loop ? '?loop=1&autoplay=1&muted=1' : '';
    return { src: `https://player.vimeo.com/video/${vm[1]}${params}`, kind: 'embed' };
  }

  const tt = url.match(/tiktok\.com\/.*?\/video\/(\d+)/) || url.match(/tiktok\.com\/.*?(\d{10,})/);
  if (tt?.[1]) return { src: `https://www.tiktok.com/embed/v2/${tt[1]}`, kind: 'embed' };

  const ig = url.match(/instagram\.com\/(?:p|reel|tv)\/([\w-]+)/);
  if (ig?.[1]) return { src: `https://www.instagram.com/p/${ig[1]}/embed`, kind: 'embed' };

  return { src: url, kind: 'embed' };
}
