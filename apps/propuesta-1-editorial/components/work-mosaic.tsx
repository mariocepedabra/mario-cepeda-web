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

  // Pocos elementos (1–2): se muestran centrados en una fila, no pegados a la
  // izquierda del collage de 3 columnas.
  if (images.length <= 2) {
    return (
      <div className="flex flex-wrap justify-center gap-4">
        {images.map((url, i) => (
          <div key={`${url}-${i}`} className="w-full max-w-full sm:w-[30rem]">
            <MosaicItem url={url} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
      {images.map((url, i) => (
        <MosaicItem key={`${url}-${i}`} url={url} />
      ))}
    </div>
  );
}

/**
 * Columna vertical de medios (imágenes/videos/embeds). Pensada para acompañar
 * a un contenido en una columna lateral: cada pieza se apila una debajo de otra
 * a su tamaño natural, sin mezclarse con el contenido de al lado.
 */
export function MediaColumn({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-6">
      {items.map((url, i) => (
        <MosaicItem key={`${url}-${i}`} url={url} />
      ))}
    </div>
  );
}

export function MosaicItem({ url }: { url: string }) {
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

  // Instagram bloquea el iframe genérico («rechazó la conexión»): se usa su
  // embed OFICIAL (blockquote + embed.js), que sí reproduce fotos/reels/videos.
  const ig = src.match(/instagram\.com\/(?:[^/?#]+\/)*?(p|reel|reels|tv)\/([\w-]+)/i);
  if (ig) {
    const tipo = ig[1].toLowerCase() === 'reels' ? 'reel' : ig[1].toLowerCase();
    return (
      <div className={frame}>
        <InstagramEmbed url={`https://www.instagram.com/${tipo}/${ig[2]}/`} />
      </div>
    );
  }

  // Embed (YouTube/Vimeo/TikTok): proporción 16:9.
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

/* -------------------------------------------------------------------------- */
/*  Embed oficial de Instagram: inyecta embed.js (una sola vez) y deja que el   */
/*  script convierta el blockquote en el reproductor real del post/reel.        */
/* -------------------------------------------------------------------------- */
declare global {
  interface Window {
    instgrm?: { Embeds?: { process?: () => void } };
  }
}

function InstagramEmbed({ url }: { url: string }) {
  React.useEffect(() => {
    const process = () => window.instgrm?.Embeds?.process?.();
    if (window.instgrm?.Embeds) {
      process();
      return;
    }
    let script = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.instagram.com/embed.js"]',
    );
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
    }
    script.addEventListener('load', process);
    return () => script?.removeEventListener('load', process);
  }, [url]);

  return (
    <blockquote
      className="instagram-media"
      data-instgrm-permalink={url}
      data-instgrm-version="14"
      style={{ width: '100%', minWidth: 0, margin: 0, border: 0, background: 'transparent' }}
    >
      <a href={url} target="_blank" rel="noopener noreferrer">
        Ver en Instagram
      </a>
    </blockquote>
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
