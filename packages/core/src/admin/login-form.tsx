'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';

import { createBrowserSupabase } from '@mario/database/client';
import { isSupabaseConfigured } from '@mario/database';

import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '../ui';
import { ConfigNotice } from './config-banner';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setPending(true);
    const supabase = createBrowserSupabase();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setPending(false);
    if (authError) {
      setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
      return;
    }
    router.replace('/admin');
    router.refresh();
  };

  return (
    <div
      className="mario-admin flex min-h-screen items-center justify-center bg-zinc-100 p-4"
      style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}
    >
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400">Panel admin</p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-900">Mario Cepeda</h1>
        </div>

        {!isSupabaseConfigured ? (
          <ConfigNotice feature="El inicio de sesión" />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Iniciar sesión</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Correo</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="mt-1.5"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="mt-1.5"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error ? <p className="text-sm text-red-600">{error}</p> : null}
                <Button type="submit" className="w-full" disabled={pending}>
                  <LogIn /> {pending ? 'Entrando…' : 'Entrar'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
        <p className="text-center text-xs text-zinc-400">
          Acceso exclusivo del administrador del sitio.
        </p>
      </div>
    </div>
  );
}
