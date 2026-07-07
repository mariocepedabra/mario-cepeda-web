'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

import { MAIN_SECTIONS, type MainSectionId } from '@mario/core/lib';
import type { NavMedia, NavText } from '@mario/database';

import { Cover } from './cover';

/** ¿La ruta actual pertenece a esta sección? */
function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

type Section = (typeof MAIN_SECTIONS)[number];

/* -------------------------------------------------------------------------- */
/*  Cabecera del sitio — «isla dinámica» estilo Gates Notes.                    */
/*  Una barra oscura, flotante y redondeada, centrada sobre el papel, con tres  */
/*  zonas: marca (izq.), secciones (centro) y el botón «Hablemos» (der.). En    */
/*  escritorio, al pasar el cursor sobre una sección despliega bajo la isla un   */
/*  panel redondeado con la media de fondo a sangre completa y su título/texto,  */
/*  configurables desde Perfil. En móvil se mantiene el menú a pantalla completa. */
/* -------------------------------------------------------------------------- */
export function SiteHeader({
  brand,
  navMedia,
  navText,
}: {
  brand: string;
  navMedia?: NavMedia;
  navText?: NavText;
}) {
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

  // [SOLO DEV] abre el panel vía ?flyout=<seccion> para poder verificarlo.
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    const id = new URLSearchParams(window.location.search).get('flyout');
    if (id && MAIN_SECTIONS.some((s) => s.id === id)) setActive(id as MainSectionId);
  }, []);

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
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 pt-3 sm:px-6 sm:pt-4">
          {/* Isla dinámica */}
          <div className="relative">
            <div
              className={`relative z-20 flex h-14 items-center gap-2 rounded-full border border-white/10 bg-ink/95 pl-2 pr-2 text-paper shadow-lift backdrop-blur-md transition-all duration-300 sm:h-16 sm:gap-3 ${
                scrolled ? 'shadow-2xl' : ''
              }`}
            >
              {/* Marca (izq., ancho flexible para centrar el menú) */}
              <div className="flex flex-1 items-center">
                <Link
                  href="/"
                  className="flex items-center gap-2 rounded-full px-3 py-2 font-display text-lg font-semibold tracking-tight transition-colors hover:bg-white/5 sm:text-xl"
                  aria-label={`${brand} — inicio`}
                >
                  <Image
                    src="/logo-lion.png"
                    alt=""
                    aria-hidden
                    width={32}
                    height={32}
                    priority
                    className="size-6 sm:size-7"
                  />
                  <span className="whitespace-nowrap">{brand}</span>
                </Link>
              </div>

              {/* Secciones (centro) */}
              <nav
                aria-label="Secciones principales"
                className="hidden shrink-0 lg:block"
              >
                <ul className="flex items-center gap-1">
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
                          className={`inline-block rounded-full px-4 py-2 text-sm font-medium tracking-wide transition-colors ${
                            current
                              ? 'bg-white/10 text-paper'
                              : active === s.id
                                ? 'bg-white/5 text-paper'
                                : 'text-paper/70 hover:bg-white/5 hover:text-paper'
                          }`}
                        >
                          {s.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* Acciones (der., ancho flexible para centrar el menú) */}
              <div className="flex flex-1 items-center justify-end gap-1.5">
                <Link
                  href="/contacto"
                  className="hidden rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-accent-deep sm:inline-block"
                >
                  Hablemos
                </Link>

                <button
                  type="button"
                  aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
                  aria-expanded={open}
                  aria-controls="menu-movil"
                  onClick={() => setOpen((v) => !v)}
                  className="inline-flex size-10 items-center justify-center rounded-full text-paper transition-colors hover:bg-white/10 lg:hidden"
                >
                  {open ? <X className="size-6" /> : <Menu className="size-6" />}
                </button>
              </div>
            </div>

            {/* Panel desplegable de escritorio (hover): media a sangre completa + textos */}
            <AnimatePresence>
              {activeSection ? (
                <NavFlyout
                  key={activeSection.id}
                  section={activeSection}
                  media={navMedia?.[activeSection.id] ?? ''}
                  titulo={navText?.[activeSection.id]?.titulo?.trim() || activeSection.label}
                  texto={navText?.[activeSection.id]?.texto?.trim() || activeSection.blurb}
                  foco={navText?.[activeSection.id]?.foco?.trim() || undefined}
                  alto={navText?.[activeSection.id]?.alto}
                  reduceMotion={!!reduceMotion}
                  onMouseEnter={cancelClose}
                  onMouseLeave={scheduleClose}
                  onClose={() => setActive(null)}
                />
              ) : null}
            </AnimatePresence>
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
            className="fixed inset-x-0 bottom-0 top-20 z-40 overflow-y-auto bg-paper px-5 pb-10 pt-6 sm:top-24 sm:px-8 lg:hidden"
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
            <Link
              href="/contacto"
              onClick={() => setOpen(false)}
              className="mt-8 inline-block rounded-full bg-accent px-6 py-3 font-semibold text-paper transition-colors hover:bg-accent-deep"
            >
              Hablemos
            </Link>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Panel desplegable a TODO EL ANCHO del viewport, por DETRÁS de la isla y por */
/*  delante de la página. Su ALTO lo define el control «Alto del panel» del     */
/*  panel de Mario (Perfil → cada sección, hasta 800 px); si no hay valor       */
/*  guardado se usa el alto por defecto. La media (imagen o video) llena el     */
/*  panel a sangre completa con el título/descripción encima sobre un velo en   */
/*  gradiente. Se cierra al sacar el cursor, al hacer clic, al hacer scroll o   */
/*  con Escape. Solo en escritorio. AnimatePresence «congela» sus props durante */
/*  la salida, por eso recibe sección, media y textos como props (no del        */
/*  estado).                                                                    */
/* -------------------------------------------------------------------------- */
const DEFAULT_NAV_HEIGHT = 420;

function NavFlyout({
  section,
  media,
  titulo,
  texto,
  foco,
  alto,
  reduceMotion,
  onMouseEnter,
  onMouseLeave,
  onClose,
}: {
  section: Section;
  media: string;
  titulo: string;
  texto: string;
  foco?: string;
  alto?: number;
  reduceMotion: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
}) {
  const hasMedia = !!media;
  const height = alto && alto > 0 ? alto : DEFAULT_NAV_HEIGHT;

  // También se cierra al hacer scroll (además del clic, mouseleave y Escape).
  React.useEffect(() => {
    const onWheel = () => onClose();
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchmove', onWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchmove', onWheel);
    };
  }, [onClose]);

  return (
    <motion.div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.25 }}
      style={{ height: `${height}px` }}
      className="fixed inset-x-0 top-0 z-10 hidden overflow-hidden rounded-b-3xl bg-paper shadow-lift lg:block"
    >
      {/* Media de fondo a sangre completa + velo para legibilidad */}
      {hasMedia ? (
        <>
          <Cover url={media} alt={titulo} sizes="100vw" objectPosition={foco} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
        </>
      ) : null}

      {/* Contenido al frente (deja libre la franja de la isla) */}
      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-10 pt-20">
        <div className="max-w-lg">
          <p
            className={`font-display text-4xl font-semibold ${
              hasMedia ? 'text-white' : 'text-ink'
            }`}
          >
            {titulo}
          </p>
          <p
            className={`mt-3 text-lg leading-relaxed ${
              hasMedia ? 'text-white/90' : 'text-ink-soft'
            }`}
          >
            {texto}
          </p>
          <Link
            href={section.href}
            className={`mt-6 inline-flex items-center gap-2 text-sm font-semibold transition-colors ${
              hasMedia ? 'text-white hover:text-white/80' : 'text-accent hover:text-accent-deep'
            }`}
          >
            Ver sección <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
