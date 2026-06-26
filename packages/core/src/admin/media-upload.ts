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
    contentType: file.type || undefined,
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

/**
 * Comprueba (en el navegador) si un video se puede REPRODUCIR de verdad, no solo
 * leer su duración. Los videos HEVC/H.265 (típicos de iPhone o 4K) cargan sus
 * metadatos —el reproductor muestra la duración— pero el navegador no decodifica
 * la imagen y se ven en blanco. Esta sonda reproduce el video oculto e intenta
 * pintar un fotograma real; si no lo consigue, no sirve para la web.
 *
 * Devuelve `true` (reproducible), `false` (no se decodifica) o `null`
 * (indeterminado: el navegador no soporta la comprobación, así que no bloqueamos).
 */
export function probeVideoPlayable(source: File | string): Promise<boolean | null> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') return resolve(null);
    const video = document.createElement('video');
    // Sin requestVideoFrameCallback no hay forma fiable de saber si pintó un
    // fotograma (leer la duración no basta), así que devolvemos indeterminado.
    if (!('requestVideoFrameCallback' in video)) return resolve(null);

    const isFile = typeof source !== 'string';
    const url = isFile ? URL.createObjectURL(source) : source;

    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.style.cssText =
      'position:fixed;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none';
    document.body.appendChild(video);

    let settled = false;
    const finish = (result: boolean | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        video.pause();
      } catch {
        /* noop */
      }
      video.removeAttribute('src');
      video.load();
      video.remove();
      if (isFile) URL.revokeObjectURL(url);
      resolve(result);
    };

    // Si en 6 s no se pintó ningún fotograma (con un archivo local no hay espera
    // de red), damos por hecho que el códec no se decodifica.
    const timer = setTimeout(() => finish(false), 6000);
    video.addEventListener('error', () => finish(false));
    // El callback solo se ejecuta cuando el navegador presenta un fotograma real.
    (video as HTMLVideoElement & {
      requestVideoFrameCallback: (cb: () => void) => number;
    }).requestVideoFrameCallback(() => finish(true));
    video.addEventListener('loadeddata', () => {
      void video.play().catch(() => {
        /* autoplay silenciado: si falla, lo resolverá el timeout/error */
      });
    });

    video.src = url;
    video.load();
  });
}
