'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { saveSectionMedia } from '../actions';
import { MAIN_SECTIONS, SECTION_MEDIA_KEYS, type SectionMediaId } from '../lib';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Label, toast } from '../ui';
import { MediaField } from './media-field';

type SectionMediaValues = Record<SectionMediaId, string>;

/**
 * Editor de la media (imagen/video, subida o de galería, con opción de bucle
 * tipo GIF) de cada una de las 4 tarjetas del bloque «Explora · Cuatro miradas»
 * de la portada. Vive en el Dashboard del panel.
 */
export function SectionMediaManager({ initial }: { initial: SectionMediaValues }) {
  const router = useRouter();
  const [values, setValues] = React.useState<SectionMediaValues>(initial);
  const [pending, setPending] = React.useState(false);

  const set = (id: SectionMediaId, v: string) =>
    setValues((s) => ({ ...s, [id]: v }));

  const onSave = async () => {
    setPending(true);
    const payload = Object.fromEntries(
      (Object.keys(SECTION_MEDIA_KEYS) as SectionMediaId[]).map((id) => [
        SECTION_MEDIA_KEYS[id],
        values[id] ?? '',
      ]),
    );
    const res = await saveSectionMedia(payload);
    setPending(false);
    if (res.ok) {
      toast.success('Imágenes de «Cuatro miradas» guardadas.');
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bloque «Cuatro miradas» (portada)</CardTitle>
        <CardDescription>
          Imagen o video de cada una de las 4 tarjetas de la portada. Puedes pegar una URL, subir un
          archivo o elegir de la galería. Los videos admiten reproducción en bucle (tipo GIF). Si
          dejas una vacía, se usa una imagen de ejemplo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {MAIN_SECTIONS.map((s) => (
            <div key={s.id}>
              <Label className="mb-1.5 block">{s.label}</Label>
              <MediaField
                value={values[s.id as SectionMediaId] ?? ''}
                onChange={(v) => set(s.id as SectionMediaId, v)}
                placeholder="URL, subir o galería →"
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button type="button" onClick={onSave} disabled={pending}>
            {pending ? 'Guardando…' : 'Guardar imágenes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
