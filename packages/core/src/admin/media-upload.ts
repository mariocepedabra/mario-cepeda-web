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
