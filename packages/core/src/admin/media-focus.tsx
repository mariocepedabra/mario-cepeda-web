'use client';

import * as React from 'react';

import { parseMedia } from '../lib';

/**
 * Selector de encuadre para la media del menú. Muestra una vista previa con la
 * MISMA proporción del panel desplegado (a lo ancho) y permite arrastrar para
 * recolocar la imagen/video (como arrastrar un mapa). Guarda el resultado como
 * un valor CSS `object-position` (p. ej. "50% 30%") que la web aplica tal cual.
 *
 * Solo aplica a imágenes y videos subidos (no a embeds como YouTube, donde no
 * se puede reencuadrar el contenido del iframe).
 */

const DEFAULT_POS = '50% 50%';
const clamp = (n: number) => Math.max(0, Math.min(100, n));
const fmt = (x: number, y: number) => `${Math.round(x)}% ${Math.round(y)}%`;

function parsePos(value?: string): { x: number; y: number } {
  const m = (value ?? '').match(/(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%/);
  if (!m) return { x: 50, y: 50 };
  return { x: clamp(Number(m[1])), y: clamp(Number(m[2])) };
}

/** Ancho de referencia del panel (≈ max-w-7xl) para que la vista previa
 *  reproduzca la proporción real recorte = ancho / alto configurado. */
const REF_WIDTH = 1280;

export function MediaFocusField({
  media,
  value,
  onChange,
  height = 420,
}: {
  media: string;
  value: string;
  onChange: (v: string) => void;
  /** Alto del panel (px) para fijar la proporción de la vista previa. */
  height?: number;
}) {
  const parsed = parseMedia(media);
  const boxRef = React.useRef<HTMLDivElement>(null);
  // Estado de arrastre: posición inicial del puntero y del encuadre al empezar.
  const drag = React.useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);

  // Solo imágenes y videos directos admiten reencuadre.
  if (!parsed.src || (parsed.type !== 'image' && parsed.type !== 'video')) return null;

  const { x, y } = parsePos(value);
  const pos = fmt(x, y);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    drag.current = { px: e.clientX, py: e.clientY, ox: x, oy: y };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Algunos entornos no admiten pointer capture; el arrastre funciona igual.
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = boxRef.current;
    if (!d || !el) return;
    const r = el.getBoundingClientRect();
    // Arrastrar la media en una dirección revela el contenido del lado contrario
    // (gesto de «agarrar y mover»): por eso restamos el desplazamiento.
    const dx = ((e.clientX - d.px) / r.width) * 100;
    const dy = ((e.clientY - d.py) / r.height) * 100;
    onChange(fmt(clamp(d.ox - dx), clamp(d.oy - dy)));
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-zinc-500">
        Arrastra para encuadrar: así se recortará la media en el menú (a lo ancho). Lo que ves aquí
        es exactamente lo que se mostrará.
      </p>
      <div
        ref={boxRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{ aspectRatio: `${REF_WIDTH} / ${Math.max(160, height)}` }}
        className="relative w-full cursor-grab touch-none select-none overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 active:cursor-grabbing"
      >
        {parsed.type === 'image' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={parsed.src}
            alt="Encuadre"
            draggable={false}
            className="pointer-events-none absolute inset-0 size-full object-cover"
            style={{ objectPosition: pos }}
          />
        ) : (
          <video
            src={parsed.src}
            muted
            loop
            autoPlay
            playsInline
            className="pointer-events-none absolute inset-0 size-full object-cover"
            style={{ objectPosition: pos }}
          />
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>
          Encuadre: {Math.round(x)}% / {Math.round(y)}%
        </span>
        <button
          type="button"
          onClick={() => onChange(DEFAULT_POS)}
          className="underline transition-colors hover:text-zinc-700"
        >
          Centrar
        </button>
      </div>
    </div>
  );
}
