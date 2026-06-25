import type { SupabaseClient } from '@supabase/supabase-js';

import { createBrowserSupabase } from '@mario/database/client';

const BUCKET = 'media';

export type UploadResult = { url: string } | { error: string };

/**
 * Sube un archivo (imagen o video) al bucket `media` de Supabase Storage y
 * devuelve su URL pública. También lo registra en la tabla `media` para que
 * aparezca en el gestor. Requiere sesión de admin (lo permiten las políticas RLS).
 */
export async function uploadToStorage(file: File): Promise<UploadResult> {
  const supabase = createBrowserSupabase() as unknown as SupabaseClient;
  const path = `${Date.now()}-${file.name.replace(/[^\w.\-]/g, '_')}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) return { error: error.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const tipo = file.type.startsWith('image/')
    ? 'imagen'
    : file.type.startsWith('video/')
      ? 'otro'
      : 'documento';
  // Registro en la tabla (best-effort; si falla, el archivo ya está subido).
  await supabase.from('media').insert({ nombre: file.name, url: publicUrl, tipo });

  return { url: publicUrl };
}

/** ¿La URL apunta a un archivo de video directo (no un embed)? */
export function isVideoFileUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|ogv|mov|m4v)(\?.*)?$/i.test(url.trim());
}

/**
 * Normaliza un enlace de video a su forma «embed» y detecta si es un archivo
 * directo. Soporta YouTube, Vimeo, TikTok e Instagram. `loop` aplica parámetros
 * de bucle/autoplay cuando la plataforma lo permite (YouTube/Vimeo).
 */
export function toVideoSource(raw: string, loop: boolean): { src: string; kind: 'file' | 'embed' } {
  const url = raw.trim();

  // Archivo de video directo (incluye URLs de Supabase Storage .mp4/.webm…)
  if (isVideoFileUrl(url)) return { src: url, kind: 'file' };

  // YouTube
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([\w-]{11})/,
  );
  if (yt?.[1]) {
    const id = yt[1];
    const params = loop
      ? `?loop=1&playlist=${id}&autoplay=1&mute=1&playsinline=1`
      : '';
    return { src: `https://www.youtube.com/embed/${id}${params}`, kind: 'embed' };
  }

  // Vimeo
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm?.[1]) {
    const params = loop ? '?loop=1&autoplay=1&muted=1' : '';
    return { src: `https://player.vimeo.com/video/${vm[1]}${params}`, kind: 'embed' };
  }

  // TikTok
  const tt = url.match(/tiktok\.com\/.*?\/video\/(\d+)/) || url.match(/tiktok\.com\/.*?(\d{10,})/);
  if (tt?.[1]) {
    return { src: `https://www.tiktok.com/embed/v2/${tt[1]}`, kind: 'embed' };
  }

  // Instagram (post / reel / tv)
  const ig = url.match(/instagram\.com\/(?:p|reel|tv)\/([\w-]+)/);
  if (ig?.[1]) {
    return { src: `https://www.instagram.com/p/${ig[1]}/embed`, kind: 'embed' };
  }

  // Por defecto: tratarlo como embed genérico (iframe).
  return { src: url, kind: 'embed' };
}
