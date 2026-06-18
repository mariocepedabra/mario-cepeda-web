'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Mail, MailOpen, Trash2 } from 'lucide-react';

import type { ContactMessage } from '@mario/database';

import { deleteMessage, setMessageRead } from '../actions';
import { formatDate } from '../lib/utils';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  toast,
} from '../ui';
import { EmptyState } from './states';

export function MessagesInbox({ messages }: { messages: ContactMessage[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = React.useState<ContactMessage | null>(null);
  const [pending, setPending] = React.useState(false);

  const toggleRead = async (msg: ContactMessage) => {
    const res = await setMessageRead(msg.id, !msg.leido);
    if (res.ok) router.refresh();
    else toast.error(res.error);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setPending(true);
    const res = await deleteMessage(deleting.id);
    setPending(false);
    if (res.ok) {
      toast.success('Mensaje eliminado.');
      setDeleting(null);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  if (messages.length === 0) {
    return (
      <EmptyState
        title="Bandeja vacía"
        description="Cuando alguien escriba desde el formulario de contacto, aparecerá aquí."
      />
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`rounded-xl border bg-white p-4 transition-colors ${
            msg.leido ? 'border-zinc-200' : 'border-zinc-900/20 bg-zinc-50'
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-zinc-900">{msg.nombre}</p>
                {!msg.leido ? <Badge>Nuevo</Badge> : null}
              </div>
              <a href={`mailto:${msg.email}`} className="text-sm text-blue-600 hover:underline">
                {msg.email}
              </a>
            </div>
            <div className="flex items-center gap-1">
              <span className="mr-1 text-xs text-zinc-400">{formatDate(msg.created_at)}</span>
              <Button
                size="icon"
                variant="ghost"
                aria-label={msg.leido ? 'Marcar como no leído' : 'Marcar como leído'}
                onClick={() => toggleRead(msg)}
              >
                {msg.leido ? <MailOpen /> : <Mail />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Eliminar"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setDeleting(msg)}
              >
                <Trash2 />
              </Button>
            </div>
          </div>
          <p className="mt-3 whitespace-pre-line text-sm text-zinc-700">{msg.mensaje}</p>
        </div>
      ))}

      <Dialog open={deleting !== null} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar mensaje</DialogTitle>
            <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
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
    </div>
  );
}
