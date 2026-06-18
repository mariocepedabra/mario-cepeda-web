'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { saveSettings } from '../actions';
import { seoSettingsSchema, type SeoSettingsInput } from '../schemas';
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

export function SeoForm({ initial }: { initial: Record<string, string> }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  const form = useForm<SeoSettingsInput>({
    resolver: zodResolver(seoSettingsSchema),
    defaultValues: {
      seo_title: initial.seo_title ?? '',
      seo_description: initial.seo_description ?? '',
      og_image: initial.og_image ?? '',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setPending(true);
    const res = await saveSettings(values);
    setPending(false);
    if (res.ok) {
      toast.success('Ajustes SEO guardados.');
      router.refresh();
    } else {
      toast.error(res.error);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>SEO y Open Graph</CardTitle>
          <CardDescription>
            Metadatos por defecto del sitio (título, descripción e imagen para redes).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="seo_title">Título SEO</Label>
            <Input id="seo_title" className="mt-1.5" {...form.register('seo_title')} />
          </div>
          <div>
            <Label htmlFor="seo_description">Descripción SEO</Label>
            <Textarea
              id="seo_description"
              rows={3}
              className="mt-1.5"
              {...form.register('seo_description')}
            />
          </div>
          <div>
            <Label htmlFor="og_image">Imagen Open Graph (URL)</Label>
            <Input id="og_image" placeholder="https://" className="mt-1.5" {...form.register('og_image')} />
            {form.formState.errors.og_image ? (
              <p className="mt-1 text-xs text-red-600">{form.formState.errors.og_image.message}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar ajustes'}
        </Button>
      </div>
    </form>
  );
}
