'use client';

import * as React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Pause,
  Play,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Visor de presentación (tipo carrusel de diapositivas)                      */
/*                                                                             */
/*  Diseñado para causar impacto: cada diapositiva (imagen 16:9 exportada del  */
/*  .pptx) se pasa de una en una con una transición direccional suave. Incluye */
/*  flechas, teclado (← →, Inicio/Fin), gesto de deslizar en táctil, puntos de */
/*  navegación, reproducción automática con barra de progreso y pantalla       */
/*  completa. Respeta `prefers-reduced-motion`.                                */
/* -------------------------------------------------------------------------- */

export interface Slide {
  src: string;
  alt: string;
}

const AUTOPLAY_MS = 7000;
const EASE = [0.22, 1, 0.36, 1] as const;
const SWIPE_DISTANCE = 70; // px mínimos para pasar de diapositiva
const SWIPE_POWER = 6000; // umbral de impulso (distancia × velocidad)

export function SlidePresentation({
  slides,
  eyebrow = 'Presentación',
  title,
  subtitle,
}: {
  slides: Slide[];
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  const reduce = useReducedMotion();
  const count = slides.length;

  // `direction` (1 = avanza, -1 = retrocede) alimenta la animación de entrada/salida.
  const [[index, direction], setState] = React.useState<[number, number]>([0, 0]);
  const [playing, setPlaying] = React.useState(false);
  const [isFs, setIsFs] = React.useState(false);

  const wrapRef = React.useRef<HTMLDivElement>(null);
  // El teclado solo actúa cuando el visor está «activo» (puntero encima, foco
  // dentro o en pantalla completa) para no secuestrar las flechas de la página.
  const activeRef = React.useRef(false);

  const wrap = React.useCallback((i: number) => (i + count) % count, [count]);

  const go = React.useCallback(
    (dir: number) => setState(([i]) => [wrap(i + dir), dir]),
    [wrap],
  );
  const goTo = React.useCallback(
    (target: number) =>
      setState(([i]) => [wrap(target), target === i ? 0 : target > i ? 1 : -1]),
    [wrap],
  );

  /* --- Reproducción automática ------------------------------------------- */
  React.useEffect(() => {
    if (!playing || count < 2) return;
    const id = window.setTimeout(() => go(1), AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [playing, index, go, count]);

  /* --- Teclado ------------------------------------------------------------ */
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!activeRef.current) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault();
          go(1);
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          go(-1);
          break;
        case 'Home':
          e.preventDefault();
          goTo(0);
          break;
        case 'End':
          e.preventDefault();
          goTo(count - 1);
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, goTo, count]);

  /* --- Pantalla completa -------------------------------------------------- */
  React.useEffect(() => {
    const onChange = () => {
      const active = document.fullscreenElement === wrapRef.current;
      setIsFs(active);
      if (active) activeRef.current = true;
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFs = () => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen?.();
    } else {
      void el.requestFullscreen?.().catch(() => {});
    }
  };

  /* --- Variantes de animación -------------------------------------------- */
  const variants = reduce
    ? {
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        enter: (dir: number) => ({
          opacity: 0,
          x: dir >= 0 ? '52%' : '-52%',
          scale: 0.97,
        }),
        center: { opacity: 1, x: '0%', scale: 1 },
        exit: (dir: number) => ({
          opacity: 0,
          x: dir >= 0 ? '-52%' : '52%',
          scale: 0.97,
        }),
      };

  const current = slides[index];
  const neighbors = [slides[wrap(index + 1)]?.src, slides[wrap(index - 1)]?.src];

  const stageClass = isFs
    ? 'group relative aspect-video w-full max-w-[calc(100vh*16/9)] max-h-full overflow-hidden rounded-[20px] border border-line bg-paper-2 shadow-[0_24px_70px_-30px_rgba(30,27,22,0.6)]'
    : 'group relative aspect-video w-full overflow-hidden rounded-[20px] border border-line bg-paper-2 shadow-[0_24px_70px_-30px_rgba(30,27,22,0.55)]';

  return (
    <section
      aria-roledescription="carrusel"
      aria-label={`Presentación: ${title}`}
      className="select-none"
    >
      {/* Encabezado */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
            {eyebrow}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.1] sm:text-4xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-3 text-base leading-relaxed text-ink-soft sm:text-lg">{subtitle}</p>
          ) : null}
        </div>
        <p className="hidden shrink-0 items-center gap-2 text-sm text-ink-muted md:flex">
          <span aria-hidden>Usa las flechas</span>
          <kbd className="rounded border border-line bg-paper px-1.5 py-0.5 font-sans text-xs">←</kbd>
          <kbd className="rounded border border-line bg-paper px-1.5 py-0.5 font-sans text-xs">→</kbd>
        </p>
      </div>

      {/* Contenedor que entra en pantalla completa */}
      <div
        ref={wrapRef}
        onPointerEnter={() => (activeRef.current = true)}
        onPointerLeave={() => {
          if (!isFs) activeRef.current = false;
        }}
        onFocusCapture={() => (activeRef.current = true)}
        className={
          isFs
            ? 'fixed inset-0 z-[100] flex items-center justify-center bg-paper p-3 sm:p-8'
            : ''
        }
      >
        <div className={stageClass}>
          {/* Barra superior de reproducción automática */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-1 bg-transparent">
            <motion.div
              key={`${index}-${playing}`}
              className="h-full origin-left bg-accent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: playing ? 1 : 0 }}
              transition={{ duration: playing ? AUTOPLAY_MS / 1000 : 0.3, ease: 'linear' }}
            />
          </div>

          {/* Diapositiva actual */}
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={index}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: reduce ? 0.35 : 0.55, ease: EASE }}
              className="absolute inset-0"
              drag={count > 1 ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={(_, info) => {
                const power = info.offset.x * info.velocity.x;
                if (info.offset.x < -SWIPE_DISTANCE || power < -SWIPE_POWER) go(1);
                else if (info.offset.x > SWIPE_DISTANCE || power > SWIPE_POWER) go(-1);
              }}
            >
              {/* Imágenes ya optimizadas (WebP 1600×900): <img> directo. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.src}
                alt={current.alt}
                draggable={false}
                loading={index === 0 ? 'eager' : 'lazy'}
                className="pointer-events-none h-full w-full object-contain"
              />
            </motion.div>
          </AnimatePresence>

          {/* Flechas */}
          {count > 1 ? (
            <>
              <StageButton
                side="left"
                label="Diapositiva anterior"
                onClick={() => go(-1)}
              >
                <ChevronLeft className="size-6" strokeWidth={2.2} />
              </StageButton>
              <StageButton side="right" label="Diapositiva siguiente" onClick={() => go(1)}>
                <ChevronRight className="size-6" strokeWidth={2.2} />
              </StageButton>
            </>
          ) : null}

          {/* Controles superiores derechos: autoplay + pantalla completa */}
          <div className="absolute right-3 top-3 z-20 flex gap-2 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
            {count > 1 ? (
              <ChipButton
                label={playing ? 'Pausar reproducción' : 'Reproducir automáticamente'}
                onClick={() => setPlaying((p) => !p)}
              >
                {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
              </ChipButton>
            ) : null}
            <ChipButton
              label={isFs ? 'Salir de pantalla completa' : 'Pantalla completa'}
              onClick={toggleFs}
            >
              {isFs ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </ChipButton>
          </div>

          {/* Contador */}
          <div className="absolute bottom-3 left-3 z-20 rounded-full bg-ink/80 px-3 py-1 font-display text-sm font-semibold text-paper backdrop-blur-sm">
            <span className="tabular-nums">{String(index + 1).padStart(2, '0')}</span>
            <span className="text-paper/50"> / {String(count).padStart(2, '0')}</span>
          </div>

          {/* Progreso general (fino, en el borde inferior) */}
          <div className="absolute inset-x-0 bottom-0 z-20 h-[3px] bg-ink/10">
            <motion.div
              className="h-full bg-accent"
              animate={{ width: `${((index + 1) / count) * 100}%` }}
              transition={{ duration: 0.5, ease: EASE }}
            />
          </div>
        </div>
      </div>

      {/* Puntos de navegación (bajo el escenario, fuera de pantalla completa) */}
      {count > 1 ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {slides.map((s, i) => {
            const active = i === index;
            return (
              <button
                key={s.src}
                type="button"
                aria-label={`Ir a la diapositiva ${i + 1}`}
                aria-current={active ? 'true' : undefined}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  active
                    ? 'w-7 bg-accent'
                    : 'w-2 bg-line hover:bg-ink-muted'
                }`}
              />
            );
          })}
        </div>
      ) : null}

      {/* Precarga de vecinas para transiciones instantáneas */}
      <div aria-hidden className="pointer-events-none absolute h-0 w-0 overflow-hidden">
        {neighbors.filter(Boolean).map((src) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={src} src={src} alt="" width={16} height={9} />
        ))}
      </div>

      {/* Anuncio para lectores de pantalla */}
      <p className="sr-only" role="status" aria-live="polite">
        Diapositiva {index + 1} de {count}: {current.alt}
      </p>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Botones                                                                    */
/* -------------------------------------------------------------------------- */

function StageButton({
  side,
  label,
  onClick,
  children,
}: {
  side: 'left' | 'right';
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`absolute top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-ink/80 text-paper shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-accent focus-visible:opacity-100 active:scale-95 sm:size-12 ${
        side === 'left' ? 'left-3' : 'right-3'
      } opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100`}
    >
      {children}
    </button>
  );
}

function ChipButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-full bg-ink/80 text-paper shadow-md backdrop-blur-sm transition-colors duration-200 hover:bg-accent"
    >
      {children}
    </button>
  );
}
