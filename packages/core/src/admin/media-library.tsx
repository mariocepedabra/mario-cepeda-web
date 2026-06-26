'use client';

import * as React from 'react';
import { ImageOff, Loader2 } from 'lucide-react';

import type { SupabaseClient } from '@supabase/supabase-js';

import { createBrowserSupabase } from '@mario/database/client';
import { isSupabaseConfigured, type Media } from '@mario/database';

import { isVideoFileUrl } from '../lib';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui';

/** Qué tipo de medios puede elegirse en el selector. */
export type MediaAccept = 'image' | 'video' | 'all';

/** Clasifica un archivo de la tabla `media` por su tipo y extensión. */
function kindOf(item: Media): 'image' | 'video' | 'other' {
  if (item.tipo === 'imagen') return 'image';
  if (isVideoFileUrl(item.url)) return 'video';
  return 'other';
}

/**
 * Selector reutilizable que muestra los archivos ya subidos a «Medios» (tabla
 * `media`) para elegir uno sin volver a subirlo. Se usa en `MediaField` y en el
 * editor de contenido. Devuelve la URL elegida por `onSelect`.
 */
export function MediaLibraryDialog({
  open,
  onOpenChange,
  onSelect,
  accept = 'all',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  accept?: MediaAccept;
}) {
  const [items, setItems] = React.useState<Media[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    let active = true;
    setItems(null);
    setError(null);
    if (!isSupabaseConfigured) {
      setItems([]);
      return;
    }
    void (async () => {
      const supabase = createBrowserSupabase() as unknown as SupabaseClient;
      const { data, error: err } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });
      if (!active) return;
      if (err) setError(err.message);
      setItems((data as Media[]) ?? []);
    })();
    return () => {
      active = false;
    };
  }, [open]);

  const visible = (items ?? []).filter((item) => {
    const k = kindOf(item);
    if (k === 'other') return false;
    if (accept === 'all') return true;
    return k === accept;
  });

  const choose = (url: string) => {
    onSelect(url);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Elegir de Medios</DialogTitle>
          <DialogDescription>
            Selecciona un archivo ya subido a la sección «Medios».
          </DialogDescription>
        </DialogHeader>

        {items === null ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-zinc-500">
            <Loader2 className="size-4 animate-spin" /> Cargando…
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center text-sm text-zinc-500">
            <ImageOff className="size-6 text-zinc-300" />
            {error
              ? `No se pudo cargar la galería: ${error}`
              : 'No hay archivos para elegir todavía. Súbelos en la sección «Medios».'}
          </div>
        ) : (
          // Contenedor de scroll (bloque) separado de la rejilla: dentro del
          // DialogContent (grid) una rejilla con max-h+overflow comprime las
          // filas en vez de hacer scroll; un bloque con overflow sí scrollea.
          <div className="max-h-[60vh] min-h-0 overflow-y-auto p-1">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {visible.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => choose(item.url)}
                  title={item.nombre}
                  className="group overflow-hidden rounded-lg border border-zinc-200 bg-white text-left transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-zinc-900"
                >
                  {/* Alto fijo: `aspect-square` colapsa dentro del DialogContent (grid). */}
                  <div className="h-28 w-full bg-zinc-100 sm:h-32">
                    {kindOf(item) === 'image' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.url} alt={item.nombre} className="size-full object-cover" />
                    ) : (
                      <video
                        src={item.url}
                        muted
                        preload="metadata"
                        className="size-full object-cover"
                      />
                    )}
                  </div>
                  <p className="truncate p-2 text-xs text-zinc-600">{item.nombre}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
