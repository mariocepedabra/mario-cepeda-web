'use client';

import * as React from 'react';
import { Check, ImageOff, Loader2 } from 'lucide-react';

import type { SupabaseClient } from '@supabase/supabase-js';

import { createBrowserSupabase } from '@mario/database/client';
import { isSupabaseConfigured, placeholderMedia, type Media } from '@mario/database';

import { isVideoFileUrl } from '../lib';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui';

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
 * `media`). Por defecto elige UNO (`onSelect`, cierra al hacer clic). Con
 * `multiple` permite marcar VARIOS y confirmarlos juntos (`onSelectMany`).
 */
export function MediaLibraryDialog({
  open,
  onOpenChange,
  onSelect,
  onSelectMany,
  accept = 'all',
  multiple = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect?: (url: string) => void;
  onSelectMany?: (urls: string[]) => void;
  accept?: MediaAccept;
  multiple?: boolean;
}) {
  const [items, setItems] = React.useState<Media[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!open) return;
    let active = true;
    setItems(null);
    setError(null);
    setSelected([]);
    if (!isSupabaseConfigured) {
      setItems(placeholderMedia); // modo demo: muestra medios de ejemplo
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

  const toggle = (url: string) =>
    setSelected((s) => (s.includes(url) ? s.filter((u) => u !== url) : [...s, url]));

  const onClickItem = (url: string) => {
    if (multiple) {
      toggle(url);
    } else {
      onSelect?.(url);
      onOpenChange(false);
    }
  };

  const confirmMany = () => {
    if (selected.length > 0) onSelectMany?.(selected);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Elegir de Medios</DialogTitle>
          <DialogDescription>
            {multiple
              ? 'Marca uno o varios archivos y pulsa «Añadir».'
              : 'Selecciona un archivo ya subido a la sección «Medios».'}
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
              {visible.map((item) => {
                const isSelected = multiple && selected.includes(item.url);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onClickItem(item.url)}
                    title={item.nombre}
                    aria-pressed={multiple ? isSelected : undefined}
                    className={`group relative overflow-hidden rounded-lg border bg-white text-left transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-zinc-900 ${
                      isSelected ? 'border-zinc-900 ring-2 ring-zinc-900' : 'border-zinc-200'
                    }`}
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
                    {isSelected ? (
                      <span className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-zinc-900 text-white shadow">
                        <Check className="size-4" />
                      </span>
                    ) : null}
                    <p className="truncate p-2 text-xs text-zinc-600">{item.nombre}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {multiple && visible.length > 0 ? (
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={confirmMany} disabled={selected.length === 0}>
              Añadir {selected.length > 0 ? `(${selected.length})` : ''}
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
