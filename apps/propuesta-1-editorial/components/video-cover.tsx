'use client';

import * as React from 'react';

/**
 * Video de portada. Si `loop` está activo, se reproduce en bucle infinito tipo
 * GIF (autoplay + silenciado); si no, muestra controles. Usa un ref para forzar
 * `muted` (React no lo aplica de forma fiable como atributo, y sin él los
 * navegadores bloquean el autoplay).
 */
export function VideoCover({
  src,
  loop,
  alt,
  className = '',
  objectPosition,
}: {
  src: string;
  loop: boolean;
  alt: string;
  className?: string;
  /** Punto de encuadre CSS (`object-position`, p. ej. "50% 30%"). */
  objectPosition?: string;
}) {
  const ref = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (el && loop) {
      el.muted = true;
      void el.play().catch(() => {});
    }
  }, [loop, src]);

  return (
    <video
      ref={ref}
      src={src}
      aria-label={alt}
      playsInline
      preload={loop ? 'auto' : 'metadata'}
      controls={!loop}
      autoPlay={loop}
      loop={loop}
      muted={loop}
      style={objectPosition ? { objectPosition } : undefined}
      className={`absolute inset-0 size-full object-cover ${className}`}
    />
  );
}
