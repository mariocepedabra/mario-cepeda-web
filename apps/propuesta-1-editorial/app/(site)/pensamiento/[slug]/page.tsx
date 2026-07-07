import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { formatDate, SITE_DEFAULTS, truncate } from '@mario/core/lib';
import { getPostBySlug, getPosts } from '@mario/database/queries';

import { Cover } from '@/components/cover';
import { PostCard } from '@/components/cards';
import { Reveal } from '@/components/interactive';
import { ReadingProgress } from '@/components/reading-progress';
import { ShareButton, WhatsAppShareButton } from '@/components/share-button';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Publicación no encontrada' };
  const description = post.bajada ?? (post.resumen ? truncate(post.resumen, 200) : undefined);

  // Imagen limpia (sin el marcador #loop) y solo si es una URL absoluta, para
  // que el bot de WhatsApp/redes pueda armar la tarjeta con imagen.
  const rawImage = post.portada_url?.split('#')[0]?.trim();
  const image = rawImage && /^https?:\/\//.test(rawImage) ? rawImage : undefined;
  const url = `/pensamiento/${post.slug}`;
  const images = image
    ? [{ url: image, alt: post.titulo, width: 1200, height: 630 }]
    : undefined;

  return {
    title: post.titulo,
    description: description ?? undefined,
    alternates: { canonical: url },
    openGraph: {
      title: post.titulo,
      description: description ?? undefined,
      type: 'article',
      url,
      siteName: SITE_DEFAULTS.name,
      locale: 'es_CO',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.titulo,
      description: description ?? undefined,
      images: image ? [image] : undefined,
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
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
                <p className="text-sm text-ink-muted">
                  Por{' '}
                  <span className="font-semibold text-ink">{post.autor?.trim() || SITE_DEFAULTS.name}</span>
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <WhatsAppShareButton
                    title={post.titulo}
                    text={post.bajada ?? post.resumen ?? undefined}
                    path={`/pensamiento/${post.slug}`}
                    image={post.portada_url?.split('#')[0]?.trim() || undefined}
                  />
                  <ShareButton
                    title={post.titulo}
                    text={post.bajada ?? post.resumen ?? undefined}
                    path={`/pensamiento/${post.slug}`}
                  />
                </div>
              </div>
            </header>
          </div>

          {/* Imagen de cabecera a sangre */}
          {post.portada_url ? (
            <figure className="mx-auto mt-10 max-w-5xl px-5 sm:px-8">
              <div className="relative aspect-[16/9] overflow-hidden rounded-card bg-paper-2 shadow-soft">
                <Cover
                  url={post.portada_url}
                  alt={`Portada de «${post.titulo}»`}
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  priority
                />
              </div>
              <figcaption className="mt-3 text-sm text-ink-muted">{post.titulo}</figcaption>
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
