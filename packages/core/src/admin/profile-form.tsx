'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';

import type { Profile } from '@mario/database';

import { saveProfile } from '../actions';
import { profileSchema, type ProfileInput } from '../schemas';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  toast,
} from '../ui';
import { MediaField } from './media-field';
import { MediaFocusField } from './media-focus';

const SOCIAL_FIELDS = [
  ['twitter', 'Twitter / X'],
  ['facebook', 'Facebook'],
  ['instagram', 'Instagram'],
  ['linkedin', 'LinkedIn'],
  ['youtube', 'YouTube'],
  ['website', 'Sitio web'],
] as const;

/** Secciones del menú superior con su panel desplegable (media + textos). */
const NAV_SECTIONS = [
  ['pensamiento', 'Pensamiento'],
  ['trabajo', 'Trabajo'],
  ['libros', 'Libros'],
  ['narino', 'Nariño'],
] as const;

export function ProfileForm({ initial }: { initial: Profile }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nombre: initial.nombre,
      titular: initial.titular,
      bio: initial.bio,
      foto_url: initial.foto_url ?? '',
      redes: {
        twitter: initial.redes?.twitter ?? '',
        facebook: initial.redes?.facebook ?? '',
        instagram: initial.redes?.instagram ?? '',
        linkedin: initial.redes?.linkedin ?? '',
        youtube: initial.redes?.youtube ?? '',
        website: initial.redes?.website ?? '',
      },
      nav_media: {
        pensamiento: initial.nav_media?.pensamiento ?? '',
        trabajo: initial.nav_media?.trabajo ?? '',
        libros: initial.nav_media?.libros ?? '',
        narino: initial.nav_media?.narino ?? '',
      },
      nav_text: {
        pensamiento: {
          titulo: initial.nav_text?.pensamiento?.titulo ?? '',
          texto: initial.nav_text?.pensamiento?.texto ?? '',
          foco: initial.nav_text?.pensamiento?.foco ?? '',
        },
        trabajo: {
          titulo: initial.nav_text?.trabajo?.titulo ?? '',
          texto: initial.nav_text?.trabajo?.texto ?? '',
          foco: initial.nav_text?.trabajo?.foco ?? '',
        },
        libros: {
          titulo: initial.nav_text?.libros?.titulo ?? '',
          texto: initial.nav_text?.libros?.texto ?? '',
          foco: initial.nav_text?.libros?.foco ?? '',
        },
        narino: {
          titulo: initial.nav_text?.narino?.titulo ?? '',
          texto: initial.nav_text?.narino?.texto ?? '',
          foco: initial.nav_text?.narino?.foco ?? '',
        },
      },
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setPending(true);
    const res = await saveProfile(values);
    setPending(false);
    if (res.ok) {
      toast.success('Perfil actualizado.');
      router.refresh();
    } else {
      toast.error(res.error);
    }
  });

  const err = (name: string) => {
    const e = form.formState.errors[name as keyof ProfileInput];
    return e && typeof e.message === 'string' ? e.message : null;
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Datos principales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" className="mt-1.5" {...form.register('nombre')} />
            {err('nombre') ? <p className="mt-1 text-xs text-red-600">{err('nombre')}</p> : null}
          </div>
          <div>
            <Label htmlFor="titular">Titular</Label>
            <Input id="titular" className="mt-1.5" {...form.register('titular')} />
            {err('titular') ? <p className="mt-1 text-xs text-red-600">{err('titular')}</p> : null}
          </div>
          <div>
            <Label htmlFor="foto_url">Foto o video (con opción GIF)</Label>
            <div className="mt-1.5">
              <Controller
                control={form.control}
                name="foto_url"
                render={({ field }) => (
                  <MediaField
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    placeholder="Pega una URL, elige de Medios o sube un archivo →"
                  />
                )}
              />
            </div>
            {err('foto_url') ? <p className="mt-1 text-xs text-red-600">{err('foto_url')}</p> : null}
          </div>
          <div>
            <Label htmlFor="bio">Biografía</Label>
            <Textarea id="bio" rows={6} className="mt-1.5" {...form.register('bio')} />
            {err('bio') ? <p className="mt-1 text-xs text-red-600">{err('bio')}</p> : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Redes sociales</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SOCIAL_FIELDS.map(([key, label]) => (
            <div key={key}>
              <Label htmlFor={`redes.${key}`}>{label}</Label>
              <Input
                id={`redes.${key}`}
                placeholder="https://"
                className="mt-1.5"
                {...form.register(`redes.${key}` as const)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Menú desplegable por sección</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-zinc-500">
            Al pasar el cursor sobre cada sección del menú superior (solo en escritorio) se despliega
            un panel a todo el ancho. La media se muestra como fondo a sangre completa y el título y
            la descripción van encima. Si dejas el título o la descripción en blanco, se usa el texto
            por defecto de la sección. Si la media es un video, márcalo en bucle para que se reproduzca
            tipo GIF.
          </p>
          {NAV_SECTIONS.map(([key, label]) => {
            const mediaValue = form.watch(`nav_media.${key}` as const) ?? '';
            return (
              <div key={key} className="space-y-3 rounded-lg border border-zinc-200 p-4">
                <p className="text-sm font-semibold text-zinc-900">{label}</p>
                <div>
                  <Label htmlFor={`nav_text.${key}.titulo`}>Título</Label>
                  <Input
                    id={`nav_text.${key}.titulo`}
                    placeholder={label}
                    className="mt-1.5"
                    {...form.register(`nav_text.${key}.titulo` as const)}
                  />
                </div>
                <div>
                  <Label htmlFor={`nav_text.${key}.texto`}>Descripción</Label>
                  <Textarea
                    id={`nav_text.${key}.texto`}
                    rows={2}
                    placeholder="Texto que aparece bajo el título"
                    className="mt-1.5"
                    {...form.register(`nav_text.${key}.texto` as const)}
                  />
                </div>
                <div>
                  <Label>Imagen o video de fondo</Label>
                  <div className="mt-1.5">
                    <Controller
                      control={form.control}
                      name={`nav_media.${key}` as const}
                      render={({ field }) => (
                        <MediaField
                          value={field.value ?? ''}
                          onChange={field.onChange}
                          placeholder="Pega una URL, elige de Medios o sube un archivo →"
                        />
                      )}
                    />
                  </div>
                </div>
                <Controller
                  control={form.control}
                  name={`nav_text.${key}.foco` as const}
                  render={({ field }) => (
                    <MediaFocusField
                      media={mediaValue}
                      value={field.value ?? ''}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            );
          })}
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
