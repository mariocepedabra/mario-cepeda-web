'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Ban, Eye, RotateCcw, Send, Trash2 } from 'lucide-react';

import type { Subscriber, SubscriberEvent } from '@mario/database';

import {
  deleteSubscriber,
  loadSubscriberEvents,
  saveNewsletterSettings,
  sendTestNewsletter,
  setSubscriberEstado,
} from '../actions';
import { NEWSLETTER_KEYS } from '../lib';
import { formatDate } from '../lib/utils';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  toast,
} from '../ui';
import { EmptyState } from './states';

const ESTADO_LABEL: Record<string, string> = {
  activo: 'Activo',
  baneado: 'Baneado',
  baja: 'Dado de baja',
};

/* -------------------------------------------------------------------------- */
/*  Configuración de Resend + boletín                                         */
/* -------------------------------------------------------------------------- */
function ConfigForm({ initial }: { initial: Record<string, string> }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [enabled, setEnabled] = React.useState(initial[NEWSLETTER_KEYS.enabled] === '1');
  const [autoSend, setAutoSend] = React.useState(initial[NEWSLETTER_KEYS.autoSend] === '1');
  const [fromName, setFromName] = React.useState(initial[NEWSLETTER_KEYS.fromName] ?? '');
  const [fromEmail, setFromEmail] = React.useState(initial[NEWSLETTER_KEYS.fromEmail] ?? '');
  const [replyTo, setReplyTo] = React.useState(initial[NEWSLETTER_KEYS.replyTo] ?? '');
  const [apiKey, setApiKey] = React.useState('');

  const hasKey = initial.__hasKey === '1';

  const onSave = async () => {
    setPending(true);
    const res = await saveNewsletterSettings({
      enabled,
      auto_send: autoSend,
      from_name: fromName,
      from_email: fromEmail,
      reply_to: replyTo,
      resend_api_key: apiKey,
    });
    setPending(false);
    if (res.ok) {
      toast.success('Configuración del boletín guardada.');
      setApiKey('');
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  const onTest = async () => {
    setTesting(true);
    const res = await sendTestNewsletter();
    setTesting(false);
    if (res.ok) toast.success('Correo de prueba enviado a tu dirección.');
    else toast.error(res.error);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración del boletín (Resend)</CardTitle>
        <CardDescription>
          Conecta tu cuenta de{' '}
          <a
            href="https://resend.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Resend
          </a>{' '}
          para enviar correos. El remitente debe pertenecer a un dominio verificado en Resend.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <label className="flex items-center justify-between gap-4">
          <span>
            <span className="block font-medium text-zinc-800">Boletín activo</span>
            <span className="block text-sm text-zinc-500">Permite el envío de correos.</span>
          </span>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </label>

        <label className="flex items-center justify-between gap-4">
          <span>
            <span className="block font-medium text-zinc-800">Aviso automático al publicar</span>
            <span className="block text-sm text-zinc-500">
              Envía un correo a los suscriptores al publicar una nota nueva.
            </span>
          </span>
          <Switch checked={autoSend} onCheckedChange={setAutoSend} />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="nl_from_name">Nombre del remitente</Label>
            <Input
              id="nl_from_name"
              className="mt-1.5"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              placeholder="Mario Cepeda"
            />
          </div>
          <div>
            <Label htmlFor="nl_from_email">Correo del remitente</Label>
            <Input
              id="nl_from_email"
              type="email"
              className="mt-1.5"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              placeholder="boletin@tudominio.com"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="nl_reply_to">Responder a (opcional)</Label>
          <Input
            id="nl_reply_to"
            type="email"
            className="mt-1.5"
            value={replyTo}
            onChange={(e) => setReplyTo(e.target.value)}
            placeholder="contacto@tudominio.com"
          />
        </div>

        <div>
          <Label htmlFor="nl_api_key">API key de Resend {hasKey ? '(ya guardada)' : ''}</Label>
          <Input
            id="nl_api_key"
            type="password"
            autoComplete="off"
            className="mt-1.5"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={hasKey ? '•••••••• (deja vacío para conservarla)' : 're_...'}
          />
          <p className="mt-1 text-xs text-zinc-400">
            Se guarda cifrada del lado servidor (tabla protegida, sin lectura pública). Déjala vacía
            para no cambiar la que ya tienes.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onTest} disabled={testing}>
            <Send /> {testing ? 'Enviando…' : 'Enviar prueba a mi correo'}
          </Button>
          <Button type="button" onClick={onSave} disabled={pending}>
            {pending ? 'Guardando…' : 'Guardar configuración'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Tabla de suscriptores + perfil + acciones                                 */
/* -------------------------------------------------------------------------- */
function SubscribersTable({ subscribers }: { subscribers: Subscriber[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = React.useState<Subscriber | null>(null);
  const [profile, setProfile] = React.useState<Subscriber | null>(null);
  const [events, setEvents] = React.useState<SubscriberEvent[] | null>(null);
  const [pending, setPending] = React.useState(false);

  const openProfile = async (sub: Subscriber) => {
    setProfile(sub);
    setEvents(null);
    try {
      const data = await loadSubscriberEvents(sub.id);
      setEvents(data);
    } catch {
      setEvents([]);
    }
  };

  const toggleBan = async (sub: Subscriber) => {
    const next = sub.estado === 'baneado' ? 'activo' : 'baneado';
    const res = await setSubscriberEstado(sub.id, next);
    if (res.ok) {
      toast.success(next === 'baneado' ? 'Suscriptor baneado.' : 'Suscriptor reactivado.');
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setPending(true);
    const res = await deleteSubscriber(deleting.id);
    setPending(false);
    if (res.ok) {
      toast.success('Suscriptor eliminado.');
      setDeleting(null);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suscriptores ({subscribers.length})</CardTitle>
        <CardDescription>
          Personas suscritas al boletín. Puedes ver su perfil, banearlas o eliminarlas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {subscribers.length === 0 ? (
          <EmptyState
            title="Aún no hay suscriptores"
            description="Cuando alguien se suscriba desde la web, aparecerá aquí."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Correo</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Desde</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium text-zinc-900">{sub.email}</TableCell>
                  <TableCell>{sub.nombre || <span className="text-zinc-400">—</span>}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        sub.estado === 'activo'
                          ? 'success'
                          : sub.estado === 'baneado'
                            ? 'warning'
                            : 'secondary'
                      }
                    >
                      {ESTADO_LABEL[sub.estado] ?? sub.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{formatDate(sub.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-0.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Ver perfil"
                        onClick={() => openProfile(sub)}
                      >
                        <Eye />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={sub.estado === 'baneado' ? 'Reactivar' : 'Banear'}
                        onClick={() => toggleBan(sub)}
                      >
                        {sub.estado === 'baneado' ? <RotateCcw /> : <Ban />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Eliminar"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => setDeleting(sub)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Perfil del suscriptor */}
      <Dialog open={profile !== null} onOpenChange={(o) => !o && setProfile(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{profile?.email}</DialogTitle>
            <DialogDescription>
              {profile?.nombre ? `${profile.nombre} · ` : ''}
              Suscrito desde {profile ? formatDate(profile.created_at) : ''} ·{' '}
              {profile ? (ESTADO_LABEL[profile.estado] ?? profile.estado) : ''}
            </DialogDescription>
          </DialogHeader>
          <div>
            <p className="mb-2 text-sm font-semibold text-zinc-700">
              Notas y secciones visitadas
            </p>
            {events === null ? (
              <p className="text-sm text-zinc-400">Cargando…</p>
            ) : events.length === 0 ? (
              <p className="text-sm text-zinc-400">
                Todavía no hay visitas registradas para este suscriptor.
              </p>
            ) : (
              <ul className="max-h-72 space-y-1.5 overflow-y-auto">
                {events.map((ev) => (
                  <li
                    key={ev.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-zinc-100 px-3 py-2 text-sm"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-zinc-800">{ev.titulo || ev.path}</span>
                      <span className="block truncate text-xs text-zinc-400">{ev.path}</span>
                    </span>
                    <span className="shrink-0 text-xs text-zinc-400">{formatDate(ev.created_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmación de borrado */}
      <Dialog open={deleting !== null} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar suscriptor</DialogTitle>
            <DialogDescription>
              Se borrará «{deleting?.email}» y su historial de visitas. Esta acción no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" disabled={pending} onClick={confirmDelete}>
              {pending ? 'Eliminando…' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export function NewsletterManager({
  settings,
  subscribers,
}: {
  settings: Record<string, string>;
  subscribers: Subscriber[];
}) {
  return (
    <div className="space-y-8">
      <ConfigForm initial={settings} />
      <SubscribersTable subscribers={subscribers} />
    </div>
  );
}
