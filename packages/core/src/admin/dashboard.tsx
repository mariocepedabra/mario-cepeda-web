import Link from 'next/link';
import { ArrowRight, FileText, Mail, Newspaper, Video } from 'lucide-react';

import type { DashboardStats } from '@mario/database/queries';

import { Card, CardContent } from '../ui';

const QUICK_LINKS = [
  { href: '/admin/notas', label: 'Notas', icon: FileText },
  { href: '/admin/prensa', label: 'Prensa', icon: Newspaper },
  { href: '/admin/videos', label: 'Videos', icon: Video },
  { href: '/admin/mensajes', label: 'Mensajes', icon: Mail },
];

function Stat({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-zinc-500">{label}</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-zinc-900">{value}</p>
        {hint ? <p className="mt-1 text-xs text-zinc-400">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export function Dashboard({ stats }: { stats: DashboardStats }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500">Resumen del sitio y accesos rápidos.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          label="Mensajes"
          value={stats.mensajesTotales}
          hint={`${stats.mensajesNoLeidos} sin leer`}
        />
        <Stat label="Notas publicadas" value={stats.notasPublicadas} hint={`${stats.notasBorrador} en borrador`} />
        <Stat label="Videos" value={stats.videos} />
        <Stat label="Prensa" value={stats.prensa} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Accesos rápidos
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
              >
                <span className="flex items-center gap-3 font-medium text-zinc-800">
                  <Icon className="size-4 text-zinc-500" />
                  {link.label}
                </span>
                <ArrowRight className="size-4 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-500" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
