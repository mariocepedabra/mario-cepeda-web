'use client';

import * as React from 'react';

import { parseMedia, toVideoSource } from '@mario/core/lib';

/**
 * Banners a SANGRE COMPLETA de la sección Libros. Cada banner ocupa el 100 % del
 * ancho del contenedor (que en la página de Libros es todo el ancho de la
 * ventana, de borde a borde) y conserva su alto natural: las imágenes se
 * muestran completas sin recortarse, los videos a su proporción y los embeds
 * (YouTube/Vimeo…) en 16:9. Varios banners en la misma franja se apilan en
 * orden. Si no hay ninguno, no renderiza nada (ni deja hueco).
 */
export function SectionBanners({
  urls,
  className = '',
}: {
  urls: string[];
  className?: string;
}) {
  const items = urls.filter((u) => u && u.trim());
  if (items.length === 0) return null;

  return (
    <div className={className}>
      {items.map((url, i) => (
        <BannerItem key={`${url}-${i}`} url={url} />
      ))}
    </div>
  );
}

function BannerItem({ url }: { url: string }) {
  const { src, type, loop } = parseMedia(url);
  if (!src) return null;

  if (type === 'image') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" loading="lazy" className="block h-auto w-full" />
    );
  }

  if (type === 'video') {
    return <BannerVideo src={src} loop={loop} />;
  }

  // Embed (YouTube/Vimeo/TikTok): proporción 16:9 a todo el ancho.
  const { src: embedSrc } = toVideoSource(src, loop);
  return (
    <div className="relative aspect-video w-full">
      <iframe
        src={embedSrc}
        title="Banner"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        className="absolute inset-0 size-full border-0"
      />
    </div>
  );
}

/** Video del banner. Si `loop`, se reproduce en bucle silenciado (tipo GIF). */
function BannerVideo({ src, loop }: { src: string; loop: boolean }) {
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
      className="block h-auto w-full"
      playsInline
      preload={loop ? 'auto' : 'metadata'}
      controls={!loop}
      autoPlay={loop}
      loop={loop}
      muted={loop}
    />
  );
}
