'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';

import { saveMosaic } from '../actions';
import { parseMedia } from '../lib';
import { Button, Card, CardContent, CardHeader, CardTitle, Label, toast } from '../ui';
import { MediaField } from './media-field';

/**
 * Gestor del mosaico de la sección Trabajo: una lista ordenada de imágenes/
 * videos (se eligen con la Galería de Medios o se suben). En la web se pintan
 * en un collage que respeta la proporción de cada archivo, sin recortarlo.
 */
export function MosaicManager({ initial }: { initial: string[] }) {
  const router = useRouter();
  const [items, setItems] = React.useState<string[]>(initial);
  const [draft, setDraft] = React.useState('');
  const [pending, setPending] = React.useState(false);

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    setItems((list) => [...list, v]);
    setDraft('');
  };

  const remove = (index: number) => setItems((list) => list.filter((_, i) => i !== index));

  const move = (index: number, dir: -1 | 1) =>
    setItems((list) => {
      const next = index + dir;
      if (next < 0 || next >= list.length) return list;
      const copy = [...list];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      return copy;
    });

  const onSave = async () => {
    setPending(true);
    const res = await saveMosaic(items);
    setPending(false);
    if (res.ok) {
      toast.success('Mosaico guardado.');
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mosaico de imágenes (sección Trabajo)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm text-zinc-500">
          Imágenes o videos que aparecen en un collage al final de la sección{' '}
          <strong>Trabajo</strong>, debajo de «Trayectoria». Se muestran respetando la proporción de
          cada archivo (sin recortar). Añade desde la Galería de Medios o sube uno nuevo, y ordénalos
          a tu gusto.
        </p>

        {/* Añadir un nuevo elemento */}
        <div>
          <Label>Añadir imagen o video</Label>
          <div className="mt-1.5 flex flex-col gap-2 sm:flex-row sm:items-start">
            <div className="flex-1">
              <MediaField
                value={draft}
                onChange={setDraft}
                placeholder="Pega una URL, elige de Medios o sube un archivo →"
              />
            </div>
            <Button type="button" onClick={add} disabled={!draft.trim()} className="shrink-0">
              <Plus /> Añadir
            </Button>
          </div>
        </div>

        {/* Lista actual */}
        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-400">
            Aún no hay imágenes en el mosaico.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {items.map((url, i) => {
              const parsed = parseMedia(url);
              return (
                <li
                  key={`${url}-${i}`}
                  className="overflow-hidden rounded-lg border border-zinc-200 bg-white"
                >
                  <div className="flex h-28 items-center justify-center bg-zinc-50">
                    {parsed.type === 'image' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={parsed.src} alt="" className="max-h-full max-w-full object-contain" />
                    ) : parsed.type === 'video' ? (
                      <video src={parsed.src} muted preload="metadata" className="max-h-full max-w-full" />
                    ) : (
                      <span className="px-2 text-center text-xs text-zinc-400">Enlace incrustado</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-1 p-1.5">
                    <span className="text-xs text-zinc-400">{i + 1}</span>
                    <div className="flex gap-0.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Mover antes"
                        disabled={i === 0}
                        onClick={() => move(i, -1)}
                      >
                        <ChevronUp />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Mover después"
                        disabled={i === items.length - 1}
                        onClick={() => move(i, 1)}
                      >
                        <ChevronDown />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Quitar del mosaico"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => remove(i)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex justify-end">
          <Button type="button" onClick={onSave} disabled={pending}>
            {pending ? 'Guardando…' : 'Guardar mosaico'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
