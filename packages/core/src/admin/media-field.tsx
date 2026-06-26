'use client';

import * as React from 'react';
import { Upload } from 'lucide-react';

import { parseMedia, toVideoSource, withLoop } from '../lib';
import { Button, Input, toast } from '../ui';
import { probeVideoPlayable, uploadToStorage } from './media-upload';

/**
 * Campo de medio para el panel: permite pegar una URL o subir un archivo
 * (imagen o video) a Supabase Storage. Para videos ofrece la opción de
 * reproducir en bucle/GIF. Guarda una sola URL (con marcador `#loop` si aplica).
 */
export function MediaField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const parsed = parseMedia(value);
  const [uploading, setUploading] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const onFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);

    // Para videos, comprobamos que el navegador pueda decodificarlos antes de
    // subirlos: los HEVC/H.265 (iPhone/4K) se guardarían pero se verían en blanco.
    if (file.type.startsWith('video/')) {
      const playable = await probeVideoPlayable(file);
      if (playable === false) {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = '';
        toast.error(
          'Este video no se reproduce en el navegador (suele ser HEVC/H.265 de iPhone o 4K): se vería en blanco. Conviértelo a MP4 H.264 (p. ej. con HandBrake) y vuelve a subirlo.',
        );
        return;
      }
    }

    const res = await uploadToStorage(file);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
    if ('error' in res) {
      toast.error(`No se pudo subir: ${res.error}`);
      return;
    }
    onChange(res.url);
    toast.success('Archivo subido.');
  };

  const isVideo = parsed.type === 'video' || parsed.type === 'embed';

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={parsed.src}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? 'Pega una URL o sube un archivo →'}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={onFile}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="shrink-0"
        >
          <Upload /> {uploading ? 'Subiendo…' : 'Subir'}
        </Button>
      </div>

      <p className="text-xs text-zinc-400">
        Imágenes: JPG/PNG/WebP. Videos: usa <strong>MP4 H.264</strong>. Los videos de iPhone o 4K
        suelen ser HEVC/H.265 y los navegadores no los muestran (se ven en blanco); conviértelos
        (p. ej. con HandBrake) o pega un enlace de YouTube.
      </p>

      {isVideo ? (
        <label className="flex items-center gap-2 text-xs text-zinc-600">
          <input
            type="checkbox"
            checked={parsed.loop}
            onChange={(e) => onChange(withLoop(parsed.src, e.target.checked))}
          />
          Reproducir en bucle infinito (tipo GIF: se repite solo, sin sonido)
        </label>
      ) : null}

      {parsed.src ? (
        <div className="overflow-hidden rounded-md border border-zinc-200 bg-zinc-50">
          {parsed.type === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={parsed.src} alt="Vista previa" className="mx-auto max-h-40 object-contain" />
          ) : parsed.type === 'video' ? (
            <video src={parsed.src} controls className="mx-auto max-h-40" />
          ) : (
            <iframe
              src={toVideoSource(parsed.src, parsed.loop).src}
              title="Vista previa"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              className="mx-auto h-40 w-full border-0"
            />
          )}
        </div>
      ) : null}
    </div>
  );
}
