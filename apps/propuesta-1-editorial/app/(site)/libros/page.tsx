import type { Metadata } from 'next';
import { Star } from 'lucide-react';

import { parseMosaic } from '@mario/core/lib';
import { getBooks, getSettings } from '@mario/database/queries';
import type { Book } from '@mario/database';

import { Cover } from '@/components/cover';
import { Reveal } from '@/components/interactive';
import { MosaicItem } from '@/components/work-mosaic';

export const metadata: Metadata = {
  title: 'Libros',
  description: 'Libros que Mario Cepeda recomienda y reseña.',
};

/**
 * Una pieza del collage: o bien una reseña de libro, o bien un medio
 * (video/imagen/embed) que acompaña a la sección. Ambos conviven en un único
 * mosaico masonry.
 */
type Tile =
  | { kind: 'book'; key: string; book: Book }
  | { kind: 'media'; key: string; url: string };

/**
 * Entrelaza libros y medios de forma proporcional: reparte los videos entre los
 * libros (en vez de agrupar todos los libros y luego todos los videos) para que
 * el collage tenga variedad visual, sin importar cuántos haya de cada tipo.
 */
function weaveTiles(books: Book[], media: string[]): Tile[] {
  const bookTiles: Tile[] = books.map((book) => ({ kind: 'book', key: `book-${book.id}`, book }));
  const mediaTiles: Tile[] = media.map((url, i) => ({ kind: 'media', key: `media-${i}`, url }));
  if (bookTiles.length === 0) return mediaTiles;
  if (mediaTiles.length === 0) return bookTiles;

  const out: Tile[] = [];
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

      {/* Un único collage masonry: reseñas de libros y videos entrelazados. Cada
          pieza fluye a su tamaño natural (ancho de columna, alto automático) sin
          recortarse, priorizando la composición visual. */}
      {tiles.length > 0 ? (
        <Reveal className="mt-16 sm:mt-20">
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
            {tiles.map((tile) =>
              tile.kind === 'book' ? (
                <BookTile key={tile.key} book={tile.book} />
              ) : (
                <MosaicItem key={tile.key} url={tile.url} />
              ),
            )}
          </div>
        </Reveal>
      ) : null}
    </main>
  );
}

/** Tarjeta vertical de un libro dentro del collage: portada grande + reseña. */
function BookTile({ book }: { book: Book }) {
  return (
    <article className="group break-inside-avoid overflow-hidden rounded-card bg-paper-2 shadow-soft transition-shadow duration-300 hover:shadow-lift">
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-paper">
        <Cover
          url={book.portada_url}
          alt={`Portada de «${book.titulo}»`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-5">
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
