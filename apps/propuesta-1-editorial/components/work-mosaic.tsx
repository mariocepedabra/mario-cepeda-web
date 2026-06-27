'use client';

import * as React from 'react';

import { parseMedia, toVideoSource } from '@mario/core/lib';

/**
 * Collage tipo masonry para la sección Trabajo. Usa columnas CSS y
 * `break-inside-avoid`, de modo que cada imagen/video se muestra a su tamaño
 * natural (ancho de columna, alto automático) SIN recortarse. Soporta imágenes,
 * videos subidos (con bucle/GIF) y embeds (YouTube/Vimeo…).
 */
export function WorkMosaic({ images }: { images: string[] }) {
  if (images.length === 0) return null;
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
      {images.map((url, i) => (
        <MosaicItem key={`${url}-${i}`} url={url} />
      ))}
    </div>
  );
}

function MosaicItem({ url }: { url: string }) {
  const { src, type, loop } = parseMedia(url);
  if (!src) return null;

  const frame =
    'block w-full break-inside-avoid overflow-hidden rounded-card bg-paper-2 shadow-soft';

  if (type === 'image') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" loading="lazy" className={`${frame} h-auto`} />
    );
  }

  if (type === 'video') {
    return (
      <div className={frame}>
        <MosaicVideo src={src} loop={loop} />
      </div>
    );
  }

  // Embed (YouTube/Vimeo/TikTok/Instagram): proporción 16:9.
  const { src: embedSrc } = toVideoSource(src, loop);
  return (
    <div className={`${frame} aspect-video`}>
      <iframe
        src={embedSrc}
        title="Video"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        className="size-full border-0"
      />
    </div>
  );
}

/** Video del collage. Si `loop`, se reproduce en bucle silenciado (tipo GIF). */
function MosaicVideo({ src, loop }: { src: string; loop: boolean }) {
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
      className="h-auto w-full"
      playsInline
      preload={loop ? 'auto' : 'metadata'}
      controls={!loop}
      autoPlay={loop}
      loop={loop}
      muted={loop}
    />
  );
}
