'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

import { MAIN_SECTIONS } from '@mario/core/lib';

/** ¿La ruta actual pertenece a esta sección? */
function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/* -------------------------------------------------------------------------- */
/*  Cabecera del sitio                                                         */
/*  Arranca transparente sobre el papel y se vuelve sólida al hacer scroll.    */
/* -------------------------------------------------------------------------- */
export function SiteHeader({ brand }: { brand: string }) {
  const pathname = usePathname() || '/';
  const reduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cierra el menú al cambiar de ruta.
  React.useEffect(() => setOpen(false), [pathname]);

  // Cierra con Escape y bloquea el scroll del fondo mientras está abierto.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
        scrolled || open
          ? 'border-line bg-paper/90 shadow-soft backdrop-blur-md'
          : 'border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:h-20 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight sm:text-2xl"
          aria-label={`${brand} — inicio`}
        >
          <Image
            src="/logo-lion.png"
            alt=""
            aria-hidden
            width={32}
            height={32}
            priority
            className="size-7 sm:size-8"
          />
          {brand}
        </Link>

        <nav aria-label="Secciones principales" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {MAIN_SECTIONS.map((s) => {
              const active = isActive(pathname, s.href);
              return (
                <li key={s.id}>
                  <Link
                    href={s.href}
                    aria-current={active ? 'page' : undefined}
                    className={`link-underline pb-1 text-sm font-medium tracking-wide transition-colors ${
                      active ? 'text-accent' : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    {s.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="#newsletter"
            className="hidden rounded-full bg-accent px-5 py-2 text-sm font-semibold text-paper transition-colors hover:bg-accent-deep sm:inline-block"
          >
            Suscríbete
          </a>

          <button
            type="button"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            aria-controls="menu-movil"
            onClick={() => setOpen((v) => !v)}
            className="-mr-1 inline-flex size-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-paper-2 lg:hidden"
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>
      </header>

      {/* Overlay de navegación móvil a pantalla completa */}
      <AnimatePresence>
        {open ? (
          <motion.nav
            id="menu-movil"
            aria-label="Menú"
            key="menu-movil"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.25 }}
            className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-paper px-5 pb-10 pt-6 sm:top-20 sm:px-8 lg:hidden"
          >
            <ul className="flex flex-col">
              {MAIN_SECTIONS.map((s, i) => {
                const active = isActive(pathname, s.href);
                return (
                  <motion.li
                    key={s.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduceMotion ? 0 : 0.05 + i * 0.06 }}
                    className="border-b border-line"
                  >
                    <Link
                      href={s.href}
                      aria-current={active ? 'page' : undefined}
                      className={`block py-5 font-display text-3xl font-semibold ${
                        active ? 'text-accent' : 'text-ink'
                      }`}
                    >
                      {s.label}
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
            <a
              href="#newsletter"
              onClick={() => setOpen(false)}
              className="mt-8 inline-block rounded-full bg-accent px-6 py-3 font-semibold text-paper transition-colors hover:bg-accent-deep"
            >
              Suscríbete al boletín
            </a>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </>
  );
}
