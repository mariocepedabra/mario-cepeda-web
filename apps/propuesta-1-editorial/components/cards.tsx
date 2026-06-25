import Link from 'next/link';

import { formatDate, truncate } from '@mario/core/lib';
import type { Post } from '@mario/database';

import { Cover } from './cover';

/** Tarjeta de artículo reutilizable (listado de Pensamiento, relacionados…). */
export function PostCard({ post }: { post: Post }) {
  const meta = [post.categoria, formatDate(post.fecha)].filter(Boolean).join(' · ');
  return (
    <Link href={`/pensamiento/${post.slug}`} className="group block">
      <div className="relative mb-4 aspect-[3/2] overflow-hidden rounded-card bg-paper-2 shadow-soft">
        <Cover
          url={post.portada_url}
          alt={`Portada de «${post.titulo}»`}
          sizes="(max-width: 768px) 100vw, 33vw"
          className="transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      {meta ? (
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">{meta}</p>
      ) : null}
      <h3 className="mt-2 font-display text-2xl font-semibold leading-tight group-hover:text-accent">
        {post.titulo}
      </h3>
      {post.resumen ? (
        <p className="mt-2 leading-relaxed text-ink-soft">{truncate(post.resumen, 120)}</p>
      ) : null}
    </Link>
  );
}
