import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { getNarinoProfileBySlug } from '@mario/database/queries';

import { Cover } from '@/components/cover';
import { ReadingProgress } from '@/components/reading-progress';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getNarinoProfileBySlug(slug);
  if (!profile) return { title: 'Perfil no encontrado' };
  return {
    title: profile.nombre,
    description: profile.lugar ? `${profile.nombre} — ${profile.lugar}` : profile.nombre,
    openGraph: {
      title: profile.nombre,
      type: 'article',
      images: profile.foto_url ? [{ url: profile.foto_url }] : undefined,
    },
  };
}

export default async function NarinoDetailPage({ params }: Props) {
  const { slug } = await params;
  const profile = await getNarinoProfileBySlug(slug);

  if (!profile) notFound();

  return (
    <>
      <ReadingProgress />
      <main className="pt-28 sm:pt-32">
        <article>
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <Link
              href="/narino"
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent hover:underline"
            >
              <ArrowLeft className="size-4" />
              Nariño
            </Link>

            <header className="mt-6">
              {profile.lugar ? (
                <p className="text-sm font-semibold uppercase tracking-widest text-ink-muted">
                  {profile.lugar}
                </p>
              ) : null}
              <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.05] sm:text-5xl">
                {profile.nombre}
              </h1>
            </header>
          </div>

          {profile.foto_url ? (
            <figure className="mx-auto mt-10 max-w-5xl px-5 sm:px-8">
              <div className="relative aspect-[16/10] overflow-hidden rounded-card bg-paper-2 shadow-soft">
                <Cover
                  url={profile.foto_url}
                  alt={profile.nombre}
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  priority
                />
              </div>
            </figure>
          ) : null}

          {profile.historia ? (
            <div
              className="article-content mx-auto mt-12 max-w-[68ch] px-5 sm:px-8"
              dangerouslySetInnerHTML={{ __html: profile.historia }}
            />
          ) : null}
        </article>
      </main>
    </>
  );
}
