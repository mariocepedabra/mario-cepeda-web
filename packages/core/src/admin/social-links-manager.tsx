'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Plus, Share2, Trash2 } from 'lucide-react';

import { saveSocialLinks } from '../actions';
import { socialNetworkLabel, socialNetworkOf } from '../lib';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, toast } from '../ui';

/**
 * Gestor de las redes sociales cuyo feed automático aparece bajo los artículos
 * de una sección (hoy, Pensamiento). Es una lista ordenada de URLs de PERFIL:
 * la web detecta la red (X, Facebook o Instagram) y pinta su feed. Se pueden
 * poner una o varias a la vez. Si la lista queda vacía, la web usa por defecto
 * el perfil de X de Mario.
 */
export function SocialLinksManager({
  section,
  initial,
  sectionName,
}: {
  /** Clave de sección (p. ej. "pensamiento"). */
  section: string;
  initial: string[];
  /** Nombre legible de la sección (para los textos del panel). */
  sectionName: string;
}) {
  const router = useRouter();
  const [items, setItems] = React.useState<string[]>(initial);
  const [draft, setDraft] = React.useState('');
  const [pending, setPending] = React.useState(false);

  const addDraft = () => {
    const v = draft.trim();
    if (!v) return;
    setItems((list) => [...list, v]);
    setDraft('');
  };

  const remove = (index: number) => setItems((list) => list.filter((_, i) => i !== index));

  const update = (index: number, value: string) =>
    setItems((list) => list.map((u, i) => (i === index ? value : u)));

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
    const clean = items.map((u) => u.trim()).filter(Boolean);
    const res = await saveSocialLinks(section, clean);
    setPending(false);
    if (res.ok) {
      setItems(clean);
      toast.success('Redes guardadas.');
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Redes sociales (sección {sectionName})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm text-zinc-500">
          Pega el enlace del <strong>perfil</strong> de la red social que quieras mostrar bajo los
          artículos de <strong>{sectionName}</strong>: sus publicaciones aparecerán solas y se
          actualizarán automáticamente. Puedes poner una o <strong>varias a la vez</strong> (X,
          Facebook o Instagram) y ordenarlas. Si dejas la lista vacía, se muestra por defecto el
          perfil de <strong>X</strong> de Mario.
        </p>
        <ul className="space-y-1 rounded-lg bg-zinc-50 p-3 text-xs text-zinc-500">
          <li>
            <strong>X (Twitter):</strong> perfil, p. ej. <code>https://x.com/mariocepedabra</code>.
          </li>
          <li>
            <strong>Facebook:</strong> enlace de la <strong>Página</strong> (no de un perfil
            personal), p. ej. <code>https://www.facebook.com/tu.pagina</code>.
          </li>
          <li>
            <strong>Instagram:</strong> enlace del perfil o de una publicación/reel concreto.
          </li>
        </ul>

        {/* Añadir por URL */}
        <div>
          <Label htmlFor="social-url">Añadir enlace de red social</Label>
          <div className="mt-1.5 flex gap-2">
            <Input
              id="social-url"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="https://x.com/usuario"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addDraft();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addDraft}
              disabled={!draft.trim()}
              className="shrink-0"
            >
              <Plus /> Añadir
            </Button>
          </div>
        </div>

        {/* Lista actual */}
        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-400">
            No hay redes configuradas. La web mostrará por defecto el perfil de X de Mario.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((url, i) => {
              const network = socialNetworkOf(url);
              return (
                <li
                  key={i}
                  className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-2"
                >
                  <span className="hidden shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 sm:inline-flex sm:items-center sm:gap-1">
                    <Share2 className="size-3" />
                    {socialNetworkLabel(network)}
                  </span>
                  <Input
                    value={url}
                    onChange={(e) => update(i, e.target.value)}
                    aria-label={`Enlace de red ${i + 1}`}
                    className="flex-1"
                  />
                  <div className="flex shrink-0 gap-0.5">
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
                      aria-label="Quitar red"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => remove(i)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-400">
            {items.length} {items.length === 1 ? 'red' : 'redes'} · recuerda{' '}
            <strong>Guardar redes</strong>.
          </p>
          <Button type="button" onClick={onSave} disabled={pending}>
            {pending ? 'Guardando…' : 'Guardar redes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
