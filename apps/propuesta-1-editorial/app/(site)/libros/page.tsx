import type { Metadata } from 'next';

import { parseMosaic } from '@mario/core/lib';
import { getBooks, getSettings } from '@mario/database/queries';
import type { Book } from '@mario/database';

import { Reveal } from '@/components/interactive';
import { BooksCollage, type CollageTile } from '@/components/books-collage';

export const metadata: Metadata = {
  title: 'Libros',
  description: 'Libros que Mario Cepeda recomienda y reseña.',
};

/**
 * Entrelaza libros y medios de forma proporcional: reparte los videos entre los
 * libros (en vez de agrupar todos los libros y luego todos los videos) para que
 * el collage tenga variedad visual. El orden RELATIVO de cada grupo se conserva,
 * así que los videos aparecen en el mismo orden que se fija en el panel.
 */
function weaveTiles(books: Book[], media: string[]): CollageTile[] {
  const bookTiles: CollageTile[] = books.map((book) => ({ kind: 'book', key: `book-${book.id}`, book }));
  const mediaTiles: CollageTile[] = media.map((url, i) => ({ kind: 'media', key: `media-${i}`, url }));
  if (bookTiles.length === 0) return mediaTiles;
  if (mediaTiles.length === 0) return bookTiles;

  const out: CollageTile[] = [];
  let bi = 0;
  let mi = 0;
  const total = bookTiles.length + mediaTiles.length;
  for (let i = 0; i < total; i++) {
    const takeMedia =
      mi < mediaTiles.length &&
      (bi >= bookTiles.length ||
        (mi + 0.5) / mediaTiles.length <= (bi + 0.5) / bookTiles.length);
    out.push(takeMedia ? mediaTiles[mi++] : bookTiles[bi++]);
  }
  return out;
}

export default async function LibrosPage() {
  const [books, settings] = await Promise.all([getBooks(), getSettings()]);
  const media = parseMosaic(settings, 'libros');
  const tiles = weaveTiles(books, media);

  return (
    <main className="mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8 sm:pt-40">
      <Reveal>
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">Libros</p>
          <h1 className="mt-4 font-display text-5xl font-semibold leading-[1] sm:text-6xl">
            Lecturas que marcan
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink-soft">
            Las lecturas que formaron a Mario y los videos que las acompañan, reunidos en un solo
            mosaico.
          </p>
        </header>
      </Reveal>

      {/* Un único collage masonry: reseñas de libros y videos entrelazados, en el
          mismo orden que se fija en el panel (izquierda→derecha, arriba→abajo).
          Cada pieza fluye a su tamaño natural, sin recortarse. */}
      {tiles.length > 0 ? (
        <Reveal className="mt-16 sm:mt-20">
          <BooksCollage tiles={tiles} />
        </Reveal>
      ) : null}
    </main>
  );
}
