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
  /** Texto alternativo / descripción para lectores de pantalla. */
  alt: string;
  /** Diapositiva de imagen (WebP exportada del .pptx). */
  src?: string;
  /** Diapositiva de medio enmarcado (foto o video) con la estética del deck. */
  frame?: FramedContent;
}

export interface FramedContent {
  kind: 'image' | 'video';
  /** Ruta de la imagen o el video. */
  media: string;
  eyebrow?: string;
  title: string;
  caption?: string;
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
    // No auto-avanzar sobre una diapositiva de video (para dejarla ver).
    if (!playing || count < 2 || slides[index]?.frame?.kind === 'video') return;
    const id = window.setTimeout(() => go(1), AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [playing, index, go, count, slides]);

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
  // Precarga de vecinas: imágenes (incluida una foto enmarcada), no videos.
  const preloadSrc = (s?: Slide) =>
    s?.src ?? (s?.frame?.kind === 'image' ? s.frame.media : undefined);
  const neighbors = [preloadSrc(slides[wrap(index + 1)]), preloadSrc(slides[wrap(index - 1)])];

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
              {current.frame ? (
                <FramedSlide frame={current.frame} alt={current.alt} />
              ) : (
                <>
                  {/* Imágenes ya optimizadas (WebP 1600×900): <img> directo. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={current.src}
                    alt={current.alt}
                    draggable={false}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    className="pointer-events-none h-full w-full object-contain"
                  />
                </>
              )}
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
                key={i}
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

/* -------------------------------------------------------------------------- */
/*  Diapositiva de medio enmarcado (foto/video) con la estética del deck       */
/*                                                                             */
/*  Replica el lenguaje visual de la presentación (papel cálido, marco         */
/*  redondeado terracota, antetítulo con rombo y pie «Filosofía estoica»). Se  */
/*  dimensiona con unidades de container-query (cqh/cqw) para escalar igual    */
/*  que las diapositivas-imagen a cualquier tamaño del escenario.              */
/* -------------------------------------------------------------------------- */

function FramedSlide({ frame, alt }: { frame: FramedContent; alt: string }) {
  const isVideo = frame.kind === 'video';
  return (
    <div
      className="absolute inset-0 overflow-hidden bg-paper"
      style={{ containerType: 'size' }}
    >
      <div className="absolute inset-0 flex items-center gap-[5cqw] px-[7cqw] py-[7cqh]">
        {/* Columna de texto */}
        <div className="min-w-0 flex-1">
          {frame.eyebrow ? (
            <p
              className="font-sans font-semibold uppercase text-accent"
              style={{ fontSize: '2.6cqh', letterSpacing: '0.22em' }}
            >
              <span aria-hidden>◆ </span>
              {frame.eyebrow}
            </p>
          ) : null}
          <h3
            className="font-display font-semibold text-ink"
            style={{ fontSize: '9cqh', lineHeight: 1.03, marginTop: '2.4cqh' }}
          >
            {frame.title}
          </h3>
          {frame.caption ? (
            <p
              className="font-sans text-ink-soft"
              style={{ fontSize: '3cqh', lineHeight: 1.5, marginTop: '3cqh', maxWidth: '94%' }}
            >
              {frame.caption}
            </p>
          ) : null}
        </div>

        {/* Marco del medio (vertical; dimensionado por altura para que quepa) */}
        <div
          className={`relative shrink-0 overflow-hidden border-accent ${
            isVideo ? 'aspect-[9/16]' : 'aspect-[3/4]'
          }`}
          style={{
            height: isVideo ? '82cqh' : '78cqh',
            borderWidth: '0.5cqh',
            borderRadius: '2.6cqh',
            boxShadow: '0 1.6cqh 4cqh -1.6cqh rgba(30, 27, 22, 0.55)',
          }}
        >
          {isVideo ? (
            <FramedVideo src={frame.media} alt={alt} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={frame.media}
              alt={alt}
              draggable={false}
              className="pointer-events-none h-full w-full object-cover"
            />
          )}
        </div>
      </div>

      {/* Pie de página, como en el deck */}
      <p
        className="pointer-events-none absolute font-display italic text-ink-muted"
        style={{ left: '7cqw', bottom: '4.5cqh', fontSize: '2.4cqh' }}
      >
        Filosofía estoica · Mario Cepeda Bravo
      </p>
    </div>
  );
}

/** Video del clip: bucle silenciado automático al entrar; controles para oírlo. */
function FramedVideo({ src, alt }: { src: string; alt: string }) {
  const ref = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = true;
    void el.play().catch(() => {});
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      aria-label={alt}
      className="h-full w-full object-cover"
      playsInline
      loop
      muted
      controls
      preload="metadata"
    />
  );
}
