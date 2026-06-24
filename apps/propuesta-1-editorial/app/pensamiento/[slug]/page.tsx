import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { formatDate, SITE_DEFAULTS, truncate } from '@mario/core/lib';
import { getPostBySlug, getPosts } from '@mario/database/queries';

import { PostCard } from '@/components/cards';
import { Reveal } from '@/components/interactive';
import { ReadingProgress } from '@/components/reading-progress';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Publicación no encontrada' };
  const description = post.bajada ?? (post.resumen ? truncate(post.resumen, 160) : undefined);
  return {
    title: post.titulo,
    description: description ?? undefined,
    openGraph: {
      title: post.titulo,
      description: description ?? undefined,
      type: 'article',
      images: post.portada_url ? [{ url: post.portada_url }] : undefined,
    },
  };
}

export default async function PensamientoDetailPage({ params }: Props) {
  const { slug } = await params;
  const [post, all] = await Promise.all([getPostBySlug(slug), getPosts()]);

  if (!post) notFound();

  const related = all.filter((p) => p.slug !== post.slug).slice(0, 3);
  const meta = [post.categoria, formatDate(post.fecha)].filter(Boolean).join(' · ');

  return (
    <>
      <ReadingProgress />
      <main className="pt-28 sm:pt-32">
        <article>
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <Link
              href="/pensamiento"
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent hover:underline"
            >
              <ArrowLeft className="size-4" />
              Pensamiento
            </Link>

            <header className="mt-6">
              {meta ? (
                <p className="text-sm font-semibold uppercase tracking-widest text-ink-muted">
                  {meta}
                </p>
              ) : null}
              <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.05] sm:text-5xl">
                {post.titulo}
              </h1>
              {post.bajada ? (
                <p className="mt-5 font-display text-xl italic leading-snug text-ink-soft sm:text-2xl">
                  {post.bajada}
                </p>
              ) : null}
              <p className="mt-6 border-t border-line pt-4 text-sm text-ink-muted">
                Por <span className="font-semibold text-ink">{SITE_DEFAULTS.name}</span>
              </p>
            </header>
          </div>

          {/* Imagen de cabecera a sangre */}
          {post.portada_url ? (
            <figure className="mx-auto mt-10 max-w-5xl px-5 sm:px-8">
              <div className="relative aspect-[16/9] overflow-hidden rounded-card bg-paper-2 shadow-soft">
                <Image
                  src={post.portada_url}
                  alt={`Portada de «${post.titulo}» (imagen de ejemplo)`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  className="object-cover"
                  priority
                />
              </div>
              <figcaption className="mt-3 text-sm text-ink-muted">
                Imagen de ejemplo. {post.titulo}.
              </figcaption>
            </figure>
          ) : null}

          {/* Cuerpo a ancho de lectura (~68ch) */}
          {post.contenido ? (
            <div
              className="article-content mx-auto mt-12 max-w-[68ch] px-5 sm:px-8"
              // El contenido proviene del editor del admin (confiable).
              dangerouslySetInnerHTML={{ __html: post.contenido }}
            />
          ) : null}
        </article>

        {/* Relacionados */}
        {related.length > 0 ? (
          <section className="mt-20 border-t border-line py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
              <Reveal>
                <h2 className="mb-10 font-display text-3xl font-semibold sm:text-4xl">
                  Sigue leyendo
                </h2>
              </Reveal>
              <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((p, i) => (
                  <Reveal key={p.id} delay={i * 0.08}>
                    <PostCard post={p} />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </>
  );
}
