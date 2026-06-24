'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { saveContent } from '../actions';
import { CONTENT_FIELDS, CONTENT_GROUPS, siteText } from '../lib';
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

export function ContentForm({ initial }: { initial: Record<string, string> }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  // Estado plano por clave (las claves llevan puntos: no usamos react-hook-form,
  // que las interpretaría como rutas anidadas).
  const [values, setValues] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(CONTENT_FIELDS.map((f) => [f.key, siteText(initial, f.key)])),
  );

  const set = (key: string, v: string) => setValues((s) => ({ ...s, [key]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    const res = await saveContent(values);
    setPending(false);
    if (res.ok) {
      toast.success('Textos guardados.');
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {CONTENT_GROUPS.map((group) => (
        <Card key={group}>
          <CardHeader>
            <CardTitle>{group}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {CONTENT_FIELDS.filter((f) => f.group === group).map((f) => (
              <div key={f.key}>
                <Label htmlFor={f.key}>{f.label}</Label>
                {f.type === 'textarea' ? (
                  <Textarea
                    id={f.key}
                    rows={2}
                    className="mt-1.5"
                    value={values[f.key] ?? ''}
                    onChange={(e) => set(f.key, e.target.value)}
                  />
                ) : (
                  <Input
                    id={f.key}
                    className="mt-1.5"
                    value={values[f.key] ?? ''}
                    onChange={(e) => set(f.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar textos'}
        </Button>
      </div>
    </form>
  );
}
