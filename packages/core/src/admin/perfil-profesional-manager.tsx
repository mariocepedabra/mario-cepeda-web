'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { savePerfilProfesional } from '../actions';
import { PERFIL_FIELDS, PERFIL_MEDIA_KEYS, perfilText, type PerfilMediaId } from '../lib';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  toast,
} from '../ui';
import { MediaField } from './media-field';

/**
 * Editor de la sección «Perfil Profesional»: los textos editoriales de la
 * cabecera y la media (imagen/video, subida o de galería, con opción de bucle)
 * que acompaña a la página pública `/perfil-profesional`. Las listas
 * estructuradas (formación, experiencia, reconocimientos…) están curadas en la
 * web y no se editan desde aquí.
 */
export function PerfilProfesionalManager({ initial }: { initial: Record<string, string> }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  const [texts, setTexts] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(PERFIL_FIELDS.map((f) => [f.key, perfilText(initial, f.key)])),
  );
  const [media, setMedia] = React.useState<Record<PerfilMediaId, string>>(() => ({
    hero: (initial[PERFIL_MEDIA_KEYS.hero] ?? '').trim(),
    secundaria: (initial[PERFIL_MEDIA_KEYS.secundaria] ?? '').trim(),
  }));

  const setText = (key: string, v: string) => setTexts((s) => ({ ...s, [key]: v }));
  const setMediaVal = (id: PerfilMediaId, v: string) => setMedia((s) => ({ ...s, [id]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    const payload: Record<string, string> = {
      ...texts,
      [PERFIL_MEDIA_KEYS.hero]: media.hero,
      [PERFIL_MEDIA_KEYS.secundaria]: media.secundaria,
    };
    const res = await savePerfilProfesional(payload);
    setPending(false);
    if (res.ok) {
      toast.success('Perfil profesional guardado.');
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Imágenes / video</CardTitle>
          <CardDescription>
            Media que acompaña al perfil. Puedes pegar una URL, subir un archivo o elegir de la
            galería (los videos admiten reproducción en bucle, tipo GIF). Si las dejas vacías, se
            usa tu foto de perfil como respaldo.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 block">Retrato principal (cabecera)</Label>
            <MediaField
              value={media.hero}
              onChange={(v) => setMediaVal('hero', v)}
              placeholder="URL, subir o galería →"
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Media secundaria (opcional)</Label>
            <MediaField
              value={media.secundaria}
              onChange={(v) => setMediaVal('secundaria', v)}
              placeholder="URL, subir o galería →"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Textos de cabecera</CardTitle>
          <CardDescription>
            Si dejas un campo vacío, se usa el texto por defecto.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {PERFIL_FIELDS.map((f) => (
            <div key={f.key}>
              <Label htmlFor={f.key}>{f.label}</Label>
              {f.type === 'textarea' ? (
                <Textarea
                  id={f.key}
                  rows={f.key === 'perfil.intro' || f.key === 'perfil.intro2' ? 4 : 2}
                  className="mt-1.5"
                  value={texts[f.key] ?? ''}
                  onChange={(e) => setText(f.key, e.target.value)}
                />
              ) : (
                <Input
                  id={f.key}
                  className="mt-1.5"
                  value={texts[f.key] ?? ''}
                  onChange={(e) => setText(f.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar perfil'}
        </Button>
      </div>
    </form>
  );
}
