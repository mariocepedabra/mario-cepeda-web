'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Images, Plus, Trash2, Upload } from 'lucide-react';

import { saveMosaic } from '../actions';
import { parseMedia } from '../lib';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, toast } from '../ui';
import { MediaLibraryDialog } from './media-library';
import { probeVideoPlayable, uploadToStorage } from './media-upload';

/**
 * Gestor del mosaico de la sección Trabajo: una lista ordenada de imágenes/
 * videos. Se añaden VARIOS a la vez desde la Galería de Medios o subiendo
 * varios archivos. En la web se pintan en un collage que respeta la proporción
 * de cada archivo, sin recortarlo.
 */
export function MosaicManager({ initial }: { initial: string[] }) {
  const router = useRouter();
  const [items, setItems] = React.useState<string[]>(initial);
  const [draft, setDraft] = React.useState('');
  const [pending, setPending] = React.useState(false);
  const [galleryOpen, setGalleryOpen] = React.useState(false);
  const [progress, setProgress] = React.useState<{ done: number; total: number } | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const append = (urls: string[]) => {
    const clean = urls.map((u) => u.trim()).filter(Boolean);
    if (clean.length > 0) setItems((list) => [...list, ...clean]);
  };

  const addDraft = () => {
    const v = draft.trim();
    if (!v) return;
    append([v]);
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

  const onFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    const uploaded: string[] = [];
    const errors: string[] = [];
    for (let i = 0; i < files.length; i++) {
      setProgress({ done: i, total: files.length });
      const file = files[i];
      if (file.type.startsWith('video/')) {
        const playable = await probeVideoPlayable(file);
        if (playable === false) {
          errors.push(`${file.name}: no se reproduce en el navegador (HEVC/H.265).`);
          continue;
        }
      }
      const res = await uploadToStorage(file);
      if ('error' in res) errors.push(`${file.name}: ${res.error}`);
      else uploaded.push(res.url);
    }
    setProgress(null);
    if (fileRef.current) fileRef.current.value = '';
    if (uploaded.length > 0) {
      append(uploaded);
      toast.success(`${uploaded.length} archivo${uploaded.length > 1 ? 's' : ''} añadido${uploaded.length > 1 ? 's' : ''}.`);
    }
    if (errors.length > 0) toast.error(errors[0]);
  };

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

  const uploading = progress !== null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mosaico de imágenes (sección Trabajo)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm text-zinc-500">
          Imágenes o videos que aparecen en un collage al final de la sección{' '}
          <strong>Trabajo</strong>, debajo de «Trayectoria». Se muestran respetando la proporción de
          cada archivo (sin recortar). Puedes añadir <strong>varios a la vez</strong> desde la
          Galería de Medios o subiendo varios archivos, y ordenarlos a tu gusto.
        </p>

        {/* Acciones para añadir (varios a la vez) */}
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={() => setGalleryOpen(true)} disabled={uploading}>
            <Images /> Elegir de Galería
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={onFiles}
          />
          <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload />{' '}
            {uploading ? `Subiendo ${progress.done + 1}/${progress.total}…` : 'Subir archivos'}
          </Button>
        </div>

        {/* Añadir por URL (opcional) */}
        <div>
          <Label htmlFor="mosaic-url">…o pega una URL</Label>
          <div className="mt-1.5 flex gap-2">
            <Input
              id="mosaic-url"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="https://… (imagen, video o enlace de YouTube)"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addDraft();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addDraft} disabled={!draft.trim()} className="shrink-0">
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

        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-400">
            {items.length} {items.length === 1 ? 'elemento' : 'elementos'} · recuerda{' '}
            <strong>Guardar mosaico</strong>.
          </p>
          <Button type="button" onClick={onSave} disabled={pending}>
            {pending ? 'Guardando…' : 'Guardar mosaico'}
          </Button>
        </div>
      </CardContent>

      <MediaLibraryDialog
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        multiple
        accept="all"
        onSelectMany={append}
      />
    </Card>
  );
}
