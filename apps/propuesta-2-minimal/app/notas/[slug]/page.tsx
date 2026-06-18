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
      <main className="pt-32">
        <article className="mx-auto max-w-2xl px-6 pb-24">
          <Link href="/notas" className="font-mono text-xs uppercase tracking-widest text-accent hover:underline">
            ← Notas
          </Link>

          <header className="mt-6">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              {formatDate(post.fecha)}
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {post.titulo}
            </h1>
            {post.resumen ? <p className="mt-4 text-xl text-muted">{post.resumen}</p> : null}
          </header>

          {post.portada_url ? (
            <div className="relative my-10 aspect-[16/9] overflow-hidden border border-line">
              <Image
                src={post.portada_url}
                alt={`Portada de «${post.titulo}» (imagen de ejemplo)`}
                fill
                sizes="(max-width: 768px) 100vw, 672px"
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
