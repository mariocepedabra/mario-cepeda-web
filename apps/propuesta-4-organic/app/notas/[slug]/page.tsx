import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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
      <main className="pt-28">
        <article className="mx-auto max-w-3xl px-5 pb-24 sm:px-8">
          <Link href="/notas" className="text-sm font-bold uppercase tracking-wide text-terra hover:underline">
            ← Notas
          </Link>

          <header className="mt-6">
            <p className="text-sm font-bold uppercase tracking-wide text-muted">
              {formatDate(post.fecha)}
            </p>
            <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              {post.titulo}
            </h1>
            {post.resumen ? <p className="mt-4 text-xl text-muted">{post.resumen}</p> : null}
          </header>

          {post.portada_url ? (
            <div className="relative my-10 aspect-[16/9] overflow-hidden rounded-[2rem] border-4 border-white shadow-sm">
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
              dangerouslySetInnerHTML={{ __html: post.contenido }}
            />
          ) : null}
        </article>
      </main>
      <Footer profile={profile} />
    </>
  );
}
