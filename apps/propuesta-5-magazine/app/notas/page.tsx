import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { formatDate, truncate } from '@mario/core/lib';
import { getPosts, getProfile } from '@mario/database/queries';

import { Navbar } from '@/components/interactive';
import { Footer, PostCard } from '@/components/sections';

export const metadata: Metadata = {
  title: 'Notas y columnas',
  description: 'Columnas, opinión y análisis de Mario Cepeda.',
};

export default async function NotasPage() {
  const [posts, profile] = await Promise.all([getPosts(), getProfile()]);
  const [featured, ...rest] = posts;

  return (
    <>
      <Navbar name={profile.nombre} />
      <main className="bg-bg pt-24 sm:pt-28">
        <div className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
          <header className="border-b border-line pb-8">
            <p className="font-display text-sm font-bold uppercase tracking-[0.18em] text-accent">
              El archivo
            </p>
            <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
              Notas y columnas
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-ink-soft">
              Columnas, opinión y análisis publicados por Mario Cepeda.
            </p>
          </header>

          {posts.length === 0 ? (
            <p className="py-20 text-center text-lg text-ink-soft">Aún no hay notas publicadas.</p>
          ) : (
            <>
              {featured ? (
                <Link
                  href={`/notas/${featured.slug}`}
                  className="group mt-12 grid items-center gap-8 lg:grid-cols-2 lg:gap-12"
                >
                  <div className="relative aspect-[16/10] overflow-hidden rounded-card bg-bg-soft">
                    {featured.portada_url ? (
                      <Image
                        src={featured.portada_url}
                        alt={`Portada de «${featured.titulo}» (imagen de ejemplo)`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        priority
                      />
                    ) : null}
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
                      Última publicación
                    </span>
                    <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-ink transition-colors group-hover:text-accent sm:text-4xl">
                      {featured.titulo}
                    </h2>
                    {featured.resumen ? (
                      <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
                        {truncate(featured.resumen, 180)}
                      </p>
                    ) : null}
                    <div className="mt-5 flex items-center gap-3 text-sm font-medium text-ink-soft">
                      <span>{formatDate(featured.fecha)}</span>
                      <span aria-hidden>·</span>
                      <span className="inline-flex items-center gap-1.5 font-semibold text-accent">
                        Leer la nota
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              ) : null}

              {rest.length > 0 ? (
                <div className="mt-16 grid gap-x-8 gap-y-12 border-t border-line pt-12 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post, i) => (
                    <PostCard key={post.id} post={post} index={i + 1} />
                  ))}
                </div>
              ) : null}
            </>
          )}

          <div className="mt-16">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-semibold text-ink transition-colors hover:text-accent"
            >
              <ArrowLeft className="size-4" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
      <Footer profile={profile} />
    </>
  );
}
