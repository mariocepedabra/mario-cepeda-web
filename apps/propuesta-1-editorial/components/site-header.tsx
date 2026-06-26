'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

import { MAIN_SECTIONS, type MainSectionId } from '@mario/core/lib';
import type { NavMedia } from '@mario/database';

import { Cover } from './cover';

/** ¿La ruta actual pertenece a esta sección? */
function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

type Section = (typeof MAIN_SECTIONS)[number];

/* -------------------------------------------------------------------------- */
/*  Cabecera del sitio                                                         */
/*  Arranca transparente sobre el papel y se vuelve sólida al hacer scroll.    */
/*  En escritorio, al pasar el cursor sobre una sección despliega un panel     */
/*  a todo el ancho con la media configurada para esa sección (estilo          */
/*  Gates Notes). En móvil se mantiene el menú a pantalla completa de siempre. */
/* -------------------------------------------------------------------------- */
export function SiteHeader({ brand, navMedia }: { brand: string; navMedia?: NavMedia }) {
  const pathname = usePathname() || '/';
  const reduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<MainSectionId | null>(null);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cierra menú móvil y panel al cambiar de ruta.
  React.useEffect(() => {
    setOpen(false);
    setActive(null);
  }, [pathname]);

  // Cierra con Escape y bloquea el scroll del fondo mientras el menú móvil está abierto.
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

  // El panel de escritorio también se descarta con Escape.
  React.useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setActive(null);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active]);

  // Limpia cualquier temporizador pendiente al desmontar.
  React.useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  // Apertura/cierre del panel con un pequeño retardo para evitar parpadeos al
  // mover el cursor entre el ítem del menú y el panel desplegado.
  const openFlyout = (id: MainSectionId) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActive(id);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActive(null), 140);
  };
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const activeSection = active ? MAIN_SECTIONS.find((s) => s.id === active) : null;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
          scrolled || open || active
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
                const current = isActive(pathname, s.href);
                return (
                  <li
                    key={s.id}
                    onMouseEnter={() => openFlyout(s.id)}
                    onMouseLeave={scheduleClose}
                  >
                    <Link
                      href={s.href}
                      aria-current={current ? 'page' : undefined}
                      className={`link-underline pb-1 text-sm font-medium tracking-wide transition-colors ${
                        current ? 'text-accent' : 'text-ink-soft hover:text-ink'
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

        {/* Panel desplegable de escritorio (hover): media por sección */}
        <AnimatePresence>
          {activeSection ? (
            <NavFlyout
              key={activeSection.id}
              section={activeSection}
              media={navMedia?.[activeSection.id] ?? ''}
              reduceMotion={!!reduceMotion}
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
            />
          ) : null}
        </AnimatePresence>
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
                const current = isActive(pathname, s.href);
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
                      aria-current={current ? 'page' : undefined}
                      className={`block py-5 font-display text-3xl font-semibold ${
                        current ? 'text-accent' : 'text-ink'
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

/* -------------------------------------------------------------------------- */
/*  Panel desplegable a todo el ancho con la media de la sección.              */
/*  Se monta solo en escritorio. AnimatePresence «congela» sus props durante   */
/*  la salida, por eso recibe la sección y la media como props (no del estado). */
/* -------------------------------------------------------------------------- */
function NavFlyout({
  section,
  media,
  reduceMotion,
  onMouseEnter,
  onMouseLeave,
}: {
  section: Section;
  media: string;
  reduceMotion: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <motion.div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      initial={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
      className="absolute inset-x-0 top-full hidden border-t border-line bg-paper shadow-soft lg:block"
    >
      <div
        className={`mx-auto grid max-w-7xl items-center gap-10 px-8 py-10 ${
          media ? 'grid-cols-[1fr_minmax(0,1.1fr)]' : 'grid-cols-1'
        }`}
      >
        <div className="flex flex-col justify-center">
          <p className="font-display text-3xl font-semibold text-ink">{section.label}</p>
          <p className="mt-3 max-w-md text-ink-soft">{section.blurb}</p>
          <Link
            href={section.href}
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent-deep"
          >
            Ver sección <span aria-hidden>→</span>
          </Link>
        </div>

        {media ? (
          <div className="relative h-[300px] overflow-hidden rounded-xl bg-paper-2">
            <Cover
              url={media}
              alt={section.label}
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
