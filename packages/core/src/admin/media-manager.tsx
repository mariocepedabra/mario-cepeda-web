'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Trash2, Upload } from 'lucide-react';

import type { SupabaseClient } from '@supabase/supabase-js';

import { createBrowserSupabase } from '@mario/database/client';
import { isSupabaseConfigured, type Media } from '@mario/database';

import { isVideoFileUrl } from '../lib';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  toast,
} from '../ui';
import { ConfigNotice } from './config-banner';
import { probeVideoPlayable } from './media-upload';
import { EmptyState } from './states';

const BUCKET = 'media';

/** Deriva la ruta del objeto en Storage a partir de su URL pública. */
function storagePath(url: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  return idx === -1 ? null : url.slice(idx + marker.length);
}

export function MediaManager({ media }: { media: Media[] }) {
  const router = useRouter();
  const [uploading, setUploading] = React.useState(false);
  const [deleting, setDeleting] = React.useState<Media | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  if (!isSupabaseConfigured) {
    return <ConfigNotice feature="La gestión de medios" />;
  }

  const onUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);

    // Para videos, comprobamos que el navegador pueda decodificarlos: los
    // HEVC/H.265 (iPhone/4K) se guardarían pero se verían en blanco en la web.
    if (file.type.startsWith('video/')) {
      const playable = await probeVideoPlayable(file);
      if (playable === false) {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = '';
        toast.error(
          'Este video no se reproduce en el navegador (suele ser HEVC/H.265 de iPhone o 4K): se vería en blanco. Conviértelo a MP4 H.264 (p. ej. con HandBrake) y vuelve a subirlo.',
        );
        return;
      }
    }

    const supabase = createBrowserSupabase() as unknown as SupabaseClient;
    const path = `${Date.now()}-${file.name.replace(/[^\w.\-]/g, '_')}`;

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    });
    if (upErr) {
      setUploading(false);
      toast.error(`No se pudo subir: ${upErr.message}`);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(path);

    const tipo = file.type.startsWith('image/')
      ? 'imagen'
      : file.type.startsWith('video/')
        ? 'otro'
        : 'documento';
    const { error: dbErr } = await supabase
      .from('media')
      .insert({ nombre: file.name, url: publicUrl, tipo });

    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
    if (dbErr) {
      toast.error(`Subido, pero no se registró: ${dbErr.message}`);
    } else {
      toast.success('Archivo subido.');
      router.refresh();
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    const supabase = createBrowserSupabase() as unknown as SupabaseClient;
    const path = storagePath(deleting.url);
    if (path) await supabase.storage.from(BUCKET).remove([path]);
    const { error } = await supabase.from('media').delete().eq('id', deleting.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Archivo eliminado.');
      setDeleting(null);
      router.refresh();
    }
  };

  const copyUrl = (url: string) => {
    void navigator.clipboard.writeText(url);
    toast.success('URL copiada al portapapeles.');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Gestión de medios</h1>
          <p className="text-sm text-zinc-500">
            Sube imágenes y videos a Supabase Storage para reutilizarlos en todo el sitio.
          </p>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*,application/pdf"
            className="hidden"
            onChange={onUpload}
          />
          <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
            <Upload /> {uploading ? 'Subiendo…' : 'Subir archivo'}
          </Button>
        </div>
      </div>

      {media.length === 0 ? (
        <EmptyState title="Sin archivos" description="Sube tu primer archivo con el botón de arriba." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
              <div className="aspect-square bg-zinc-100">
                {item.tipo === 'imagen' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.nombre} className="size-full object-cover" />
                ) : isVideoFileUrl(item.url) ? (
                  <video src={item.url} muted preload="metadata" className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center text-xs text-zinc-400">
                    {item.tipo}
                  </div>
                )}
              </div>
              <div className="space-y-2 p-3">
                <p className="truncate text-xs text-zinc-600" title={item.nombre}>
                  {item.nombre}
                </p>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => copyUrl(item.url)}>
                    <Copy /> URL
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Eliminar"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => setDeleting(item)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={deleting !== null} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar archivo</DialogTitle>
            <DialogDescription>
              Se eliminará de Storage y del listado. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
