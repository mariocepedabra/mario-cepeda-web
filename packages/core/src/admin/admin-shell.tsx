'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen,
  Briefcase,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Mountain,
  Search,
  Send,
  Type,
  User,
  Video,
  Workflow,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { createBrowserSupabase } from '@mario/database/client';
import { isSupabaseConfigured } from '@mario/database';

import { cn } from '../lib/utils';
import { Button, Toaster } from '../ui';
import { ConfigBanner } from './config-banner';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/perfil', label: 'Perfil', icon: User },
  { href: '/admin/notas', label: 'Pensamiento', icon: FileText },
  { href: '/admin/proyectos', label: 'Proyectos', icon: Briefcase },
  { href: '/admin/trayectoria', label: 'Trayectoria', icon: Workflow },
  { href: '/admin/libros', label: 'Libros', icon: BookOpen },
  { href: '/admin/narino', label: 'Nariño', icon: Mountain },
  { href: '/admin/videos', label: 'Videos', icon: Video },
  { href: '/admin/mensajes', label: 'Mensajes', icon: Mail },
  { href: '/admin/boletin', label: 'Boletín', icon: Send },
  { href: '/admin/medios', label: 'Medios', icon: ImageIcon },
  { href: '/admin/textos', label: 'Textos', icon: Type },
  { href: '/admin/seo', label: 'SEO', icon: Search },
];

const ADMIN_FONT =
  "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await createBrowserSupabase().auth.signOut();
    }
    router.replace('/admin/login');
    router.refresh();
  };

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const NavLinks = () => (
    <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
      {NAV.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive(item.href)
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div
      className="mario-admin min-h-screen bg-zinc-50 text-zinc-900"
      style={{ fontFamily: ADMIN_FONT }}
    >
      {/* Sidebar escritorio */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-zinc-200 bg-white md:flex">
        <div className="flex h-14 items-center border-b border-zinc-200 px-5">
          <span className="text-sm font-bold tracking-tight">Mario Cepeda · Admin</span>
        </div>
        <NavLinks />
        <div className="border-t border-zinc-200 p-3">
          <Button variant="outline" className="w-full justify-start" onClick={signOut}>
            <LogOut /> Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Drawer móvil */}
      {open ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-zinc-200 px-4">
              <span className="text-sm font-bold">Admin</span>
              <Button size="icon" variant="ghost" aria-label="Cerrar menú" onClick={() => setOpen(false)}>
                <X />
              </Button>
            </div>
            <NavLinks />
            <div className="border-t border-zinc-200 p-3">
              <Button variant="outline" className="w-full justify-start" onClick={signOut}>
                <LogOut /> Cerrar sesión
              </Button>
            </div>
          </aside>
        </div>
      ) : null}

      {/* Contenido */}
      <div className="md:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur md:hidden">
          <Button size="icon" variant="ghost" aria-label="Abrir menú" onClick={() => setOpen(true)}>
            <Menu />
          </Button>
          <span className="text-sm font-bold">Mario Cepeda · Admin</span>
        </header>

        {!isSupabaseConfigured ? <ConfigBanner /> : null}

        <main className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <Toaster />
    </div>
  );
}
