import Image from 'next/image';

import { parseMedia, toVideoSource } from '@mario/core/lib';

import { VideoCover } from './video-cover';

/**
 * Portada de un elemento: pinta una imagen, un video subido (con bucle/GIF
 * opcional) o un embed (YouTube/Vimeo/TikTok/Instagram), según la URL.
 * Debe ir dentro de un contenedor con `position: relative` y un aspect ratio.
 */
export function Cover({
  url,
  alt,
  sizes,
  className = '',
  priority,
  objectPosition,
}: {
  url: string | null | undefined;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
  /** Punto de encuadre CSS (`object-position`, p. ej. "50% 30%") para imágenes y videos. */
  objectPosition?: string;
}) {
  const { src, type, loop } = parseMedia(url);
  if (!src) return null;

  if (type === 'image') {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        style={objectPosition ? { objectPosition } : undefined}
        className={`object-cover ${className}`}
      />
    );
  }

  if (type === 'video') {
    return (
      <VideoCover
        src={src}
        loop={loop}
        alt={alt}
        className={className}
        objectPosition={objectPosition}
      />
    );
  }

  // Embed (YouTube/Vimeo/TikTok/Instagram)
  const { src: embedSrc } = toVideoSource(src, loop);
  return (
    <iframe
      src={embedSrc}
      title={alt}
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      allowFullScreen
      className={`absolute inset-0 size-full border-0 ${className}`}
    />
  );
}
