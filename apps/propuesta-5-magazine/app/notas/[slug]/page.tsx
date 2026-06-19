import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { formatDate, truncate } from '@mario/core/lib';
import { getPostBySlug, getProfile } from '@mario/database/queries';

import { Navbar } from '@/components/interactive';
import { Footer } from '@/components/sections';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Nota no encontrada' };
  return {
    title: post.titulo,
    description: post.resumen ? truncate(post.resumen, 160) : undefined,
    openGraph: {
      title: post.titulo,
      description: post.resumen ?? undefined,
      type: 'article',
      images: post.portada_url ? [{ url: post.portada_url }] : undefined,
    },
  };
}

export default async function NotaDetailPage({ params }: Props) {
  const { slug } = await params;
  const [post, profile] = await Promise.all([getPostBySlug(slug), getProfile()]);

  if (!post) notFound();

  return (
    <>
      <Navbar name={profile.nombre} />
      <main className="bg-bg pt-24 sm:pt-28">
        <article className="mx-auto max-w-3xl px-5 pb-24 sm:px-8">
          <Link
            href="/notas"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-ink"
          >
            <ArrowLeft className="size-4" />
            Volver a las notas
          </Link>

          <header className="mt-6 border-b border-line pb-8">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-accent">Columna</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.06] tracking-tight text-ink sm:text-5xl">
              {post.titulo}
            </h1>
            {post.resumen ? (
              <p className="mt-5 text-xl leading-relaxed text-ink-soft">{post.resumen}</p>
            ) : null}
            <p className="mt-5 text-sm font-medium text-ink-soft">{formatDate(post.fecha)}</p>
          </header>

          {post.portada_url ? (
            <div className="relative my-10 aspect-[16/9] overflow-hidden rounded-card bg-bg-soft">
              <Image
                src={post.portada_url}
                alt={`Portada de «${post.titulo}» (imagen de ejemplo)`}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                priority
              />
            </div>
          ) : null}

          {post.contenido ? (
            <div
              className="article-content mt-8"
              // El contenido proviene del editor del admin (confiable).
              dangerouslySetInnerHTML={{ __html: post.contenido }}
            />
          ) : null}
        </article>
      </main>
      <Footer profile={profile} />
    </>
  );
}
