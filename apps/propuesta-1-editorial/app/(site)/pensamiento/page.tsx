import type { Metadata } from 'next';
import Link from 'next/link';

import { parseMosaic } from '@mario/core/lib';
import { getPosts, getSettings } from '@mario/database/queries';

import { PostCard } from '@/components/cards';
import { Reveal } from '@/components/interactive';
import { WorkMosaic } from '@/components/work-mosaic';

export const metadata: Metadata = {
  title: 'Pensamiento',
  description: 'Ensayos, columnas e ideas de Mario Cepeda sobre medios, región, tecnología y sociedad.',
};

interface Props {
  searchParams: Promise<{ tema?: string }>;
}

export default async function PensamientoPage({ searchParams }: Props) {
  const { tema } = await searchParams;
  const [posts, settings] = await Promise.all([getPosts(), getSettings()]);
  const mosaic = parseMosaic(settings, 'pensamiento');

  const temas = Array.from(
    new Set(posts.map((p) => p.categoria).filter((c): c is string => Boolean(c))),
  );
  const activos = tema && temas.includes(tema) ? posts.filter((p) => p.categoria === tema) : posts;

  return (
    <main className="mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8 sm:pt-40">
      <Reveal>
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
            Pensamiento
          </p>
          <h1 className="mt-4 font-display text-5xl font-semibold leading-[1] sm:text-6xl">
            Ensayos, columnas e ideas
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink-soft">
            Reflexiones de Mario sobre medios y comunicación, su región, tecnología, cultura y
            sociedad.
          </p>
        </header>
      </Reveal>

      {/* Mosaico / collage de imágenes */}
      {mosaic.length > 0 ? (
        <section className="mt-12">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">En imágenes</h2>
          </Reveal>
          <div className="mt-8">
            <WorkMosaic images={mosaic} />
          </div>
        </section>
      ) : null}

      {/* Filtros por tema */}
      {temas.length > 0 ? (
        <nav aria-label="Filtrar por tema" className="mt-10 flex flex-wrap gap-2">
          <FilterChip label="Todos" href="/pensamiento" active={!tema || !temas.includes(tema)} />
          {temas.map((t) => (
            <FilterChip
              key={t}
              label={t}
              href={`/pensamiento?tema=${encodeURIComponent(t)}`}
              active={tema === t}
            />
          ))}
        </nav>
      ) : null}

      {activos.length === 0 ? (
        <p className="py-20 text-lg italic text-ink-soft">Aún no hay publicaciones en este tema.</p>
      ) : (
        <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {activos.map((post, i) => (
            <Reveal key={post.id} delay={(i % 3) * 0.08}>
              <PostCard post={post} />
            </Reveal>
          ))}
        </div>
      )}
    </main>
  );
}

function FilterChip({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? 'border-ink bg-ink text-paper'
          : 'border-line text-ink-soft hover:border-ink hover:text-ink'
      }`}
    >
      {label}
    </Link>
  );
}
