'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, ImagePlus, Trash2 } from 'lucide-react';

import { saveBanners } from '../actions';
import { BANNER_POSITIONS, type Banner, type BannerPosition } from '../lib';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Select,
  toast,
} from '../ui';
import { MediaField } from './media-field';

/**
 * Gestor de los banners a sangre completa de una sección (por ahora, Libros).
 * Cada banner es un archivo (imagen o video: subido, de galería o por URL, con
 * opción de bucle tipo GIF) MÁS una posición en la página. En la web cada banner
 * ocupa TODO el ancho de la ventana, de borde a borde, con su alto natural (sin
 * recortarse). El orden de la lista se respeta dentro de cada posición.
 */
export function BannersManager({
  section,
  initial,
  sectionName,
}: {
  /** Clave de sección de banners (p. ej. "libros"). */
  section: string;
  initial: Banner[];
  /** Nombre legible de la sección (para los textos del panel). */
  sectionName: string;
}) {
  const router = useRouter();
  const [items, setItems] = React.useState<Banner[]>(initial);
  const [pending, setPending] = React.useState(false);

  const add = () => setItems((list) => [...list, { url: '', pos: 'above' }]);

  const remove = (index: number) => setItems((list) => list.filter((_, i) => i !== index));

  const setUrl = (index: number, url: string) =>
    setItems((list) => list.map((b, i) => (i === index ? { ...b, url } : b)));

  const setPos = (index: number, pos: BannerPosition) =>
    setItems((list) => list.map((b, i) => (i === index ? { ...b, pos } : b)));

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
    // No enviamos filas sin archivo (se descartan también en el servidor).
    const payload = items.filter((b) => b.url.trim().length > 0);
    const res = await saveBanners(section, payload);
    setPending(false);
    if (res.ok) {
      toast.success('Banners guardados.');
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Banners a todo el ancho (sección {sectionName})</CardTitle>
        <CardDescription>
          Franjas de <strong>imagen o video</strong> que ocupan <strong>todo el ancho</strong> de la
          página (de borde a borde), con su alto natural (sin recortarse). Elige el archivo como en el
          resto del panel —pega una URL, súbelo o elígelo de la Galería— y decide la{' '}
          <strong>posición</strong> de cada uno. Si pones varios en la misma posición, se apilan en el
          orden de esta lista.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-400">
            Aún no hay banners. Añade el primero con el botón de abajo.
          </p>
        ) : (
          <ul className="space-y-4">
            {items.map((banner, i) => (
              <li
                key={i}
                className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4"
              >
                <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                  <div className="min-w-[16rem] flex-1">
                    <Label className="mb-1.5 block" htmlFor={`banner-pos-${i}`}>
                      Banner {i + 1} · posición
                    </Label>
                    <Select
                      id={`banner-pos-${i}`}
                      value={banner.pos}
                      onChange={(e) => setPos(i, e.target.value as BannerPosition)}
                    >
                      {BANNER_POSITIONS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="flex shrink-0 gap-0.5">
                    <Button
                      size="icon"
                      variant="ghost"
                      type="button"
                      aria-label="Mover antes"
                      disabled={i === 0}
                      onClick={() => move(i, -1)}
                    >
                      <ChevronUp />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      type="button"
                      aria-label="Mover después"
                      disabled={i === items.length - 1}
                      onClick={() => move(i, 1)}
                    >
                      <ChevronDown />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      type="button"
                      aria-label="Quitar banner"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => remove(i)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
                <MediaField
                  value={banner.url}
                  onChange={(v) => setUrl(i, v)}
                  placeholder="URL del banner, subir o galería →"
                />
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button type="button" variant="outline" onClick={add}>
            <ImagePlus /> Añadir banner
          </Button>
          <div className="flex items-center gap-3">
            <p className="text-xs text-zinc-400">
              {items.length} {items.length === 1 ? 'banner' : 'banners'} · recuerda{' '}
              <strong>Guardar banners</strong>.
            </p>
            <Button type="button" onClick={onSave} disabled={pending}>
              {pending ? 'Guardando…' : 'Guardar banners'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
