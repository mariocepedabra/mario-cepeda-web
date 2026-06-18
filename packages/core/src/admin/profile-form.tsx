'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

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

const SOCIAL_FIELDS = [
  ['twitter', 'Twitter / X'],
  ['facebook', 'Facebook'],
  ['instagram', 'Instagram'],
  ['linkedin', 'LinkedIn'],
  ['youtube', 'YouTube'],
  ['website', 'Sitio web'],
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
            <Label htmlFor="foto_url">Foto (URL)</Label>
            <Input id="foto_url" className="mt-1.5" {...form.register('foto_url')} />
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

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar perfil'}
        </Button>
      </div>
    </form>
  );
}
