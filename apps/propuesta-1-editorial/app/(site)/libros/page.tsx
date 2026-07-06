import type { Metadata } from 'next';
import { Film, Star } from 'lucide-react';

import { parseMosaic } from '@mario/core/lib';
import { getBooks, getSettings } from '@mario/database/queries';
import type { Book, BookList } from '@mario/database';

import { Cover } from '@/components/cover';
import { Reveal } from '@/components/interactive';
import { MediaColumn } from '@/components/work-mosaic';

export const metadata: Metadata = {
  title: 'Libros',
  description: 'Libros que Mario Cepeda recomienda y reseña.',
};

const LIST_TITLES: Record<BookList, string> = {
  marcaron: 'Lecturas que me marcaron',
  temporada: 'Recomendados de la temporada',
};

export default async function LibrosPage() {
  const [books, settings] = await Promise.all([getBooks(), getSettings()]);
  const listas: BookList[] = ['marcaron', 'temporada'];
  const videos = parseMosaic(settings, 'libros');
  const hasVideos = videos.length > 0;

  return (
    <main className="mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8 sm:pt-40">
      <Reveal>
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">Libros</p>
          <h1 className="mt-4 font-display text-5xl font-semibold leading-[1] sm:text-6xl">
            Lecturas que marcan
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink-soft">
            Los libros que formaron a Mario y sus recomendaciones de temporada.
          </p>
        </header>
      </Reveal>

      {/* Dos columnas: a la izquierda las reseñas, a la derecha los videos. */}
      <div
        className={
          hasVideos
            ? 'mt-16 grid gap-12 sm:mt-20 lg:grid-cols-[1.5fr_0.9fr] lg:gap-14'
            : 'mt-16 sm:mt-20'
        }
      >
        {/* Reseñas (izquierda) */}
        <div className="space-y-16 sm:space-y-20">
          {listas.map((lista) => {
            const items = books.filter((b) => b.lista === lista);
            if (items.length === 0) return null;
            return (
              <section key={lista}>
                <Reveal>
                  <h2 className="mb-8 font-display text-3xl font-semibold sm:text-4xl">
                    {LIST_TITLES[lista]}
                  </h2>
                </Reveal>
                <div
                  className={
                    hasVideos
                      ? 'grid gap-x-8 gap-y-12 sm:grid-cols-2'
                      : 'grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3'
                  }
                >
                  {items.map((book, i) => (
                    <Reveal key={book.id} delay={(i % 3) * 0.08}>
                      <BookCard book={book} />
                    </Reveal>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Videos (derecha) */}
        {hasVideos ? (
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <h2 className="mb-8 flex items-center gap-2 font-display text-3xl font-semibold sm:text-4xl">
                <Film className="size-7 text-accent" />
                En video
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <MediaColumn items={videos} />
            </Reveal>
          </aside>
        ) : null}
      </div>
    </main>
  );
}

function BookCard({ book }: { book: Book }) {
  return (
    <article className="flex gap-5">
      <div className="relative aspect-[2/3] w-28 shrink-0 overflow-hidden rounded-card bg-paper-2 shadow-soft sm:w-32">
        <Cover url={book.portada_url} alt={`Portada de «${book.titulo}»`} sizes="128px" />
      </div>
      <div className="min-w-0">
        <h3 className="font-display text-xl font-semibold leading-snug">{book.titulo}</h3>
        <p className="mt-0.5 text-sm text-ink-muted">{book.autor}</p>
        {book.valoracion ? <Rating value={book.valoracion} /> : null}
        {book.resena ? (
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">{book.resena}</p>
        ) : null}
      </div>
    </article>
  );
}

function Rating({ value }: { value: number }) {
  return (
    <div className="mt-2 flex gap-0.5" aria-label={`Valoración: ${value} de 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`size-4 ${i < value ? 'fill-accent text-accent' : 'text-line'}`}
          aria-hidden
        />
      ))}
    </div>
  );
}
