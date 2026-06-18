import * as React from 'react';
import { Inbox, Loader2 } from 'lucide-react';

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center">
      <div className="rounded-full bg-zinc-100 p-3 text-zinc-400">
        <Inbox className="size-6" />
      </div>
      <div>
        <p className="font-medium text-zinc-900">{title}</p>
        {description ? <p className="mt-1 text-sm text-zinc-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function LoadingState({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 p-10 text-sm text-zinc-500">
      <Loader2 className="size-4 animate-spin" />
      {label}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
      <p className="font-medium">Ocurrió un error</p>
      <p className="mt-1">{message}</p>
    </div>
  );
}
