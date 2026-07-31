import type { Metadata } from 'next';

import { parseBanners, parseMosaic, type BannerPosition } from '@mario/core/lib';
import { getBooks, getSettings } from '@mario/database/queries';
import type { Book } from '@mario/database';

import { Reveal } from '@/components/interactive';
import { BooksCollage, type CollageTile } from '@/components/books-collage';
import { SectionBanners } from '@/components/section-banners';

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
  const banners = parseBanners(settings, 'libros');
  const tiles = weaveTiles(books, media);

  // URLs de los banners de cada franja, en el orden fijado en el panel.
  const bannersAt = (pos: BannerPosition) =>
    banners.filter((b) => b.pos === pos).map((b) => b.url);

  // El <main> ocupa TODO el ancho para que los banners lleguen de borde a borde;
  // cada bloque de contenido se centra en su propio contenedor `max-w-7xl`.
  return (
    <main className="pb-24 pt-32 sm:pt-40">
      {/* Banner de cabecera (a sangre completa), antes del título. */}
      <SectionBanners urls={bannersAt('header')} className="mb-12 sm:mb-16" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
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
      </div>

      {/* Banner sobre los videos (a sangre completa). */}
      <SectionBanners urls={bannersAt('above')} className="mt-12 sm:mt-16" />

      {/* Un único collage masonry: reseñas de libros y videos entrelazados, en el
          mismo orden que se fija en el panel (izquierda→derecha, arriba→abajo).
          Cada pieza fluye a su tamaño natural, sin recortarse. */}
      {tiles.length > 0 ? (
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="mt-16 sm:mt-20">
            <BooksCollage tiles={tiles} />
          </Reveal>
        </div>
      ) : null}

      {/* Banner bajo los videos y banner de pie (a sangre completa). */}
      <SectionBanners urls={bannersAt('below')} className="mt-16 sm:mt-20" />
      <SectionBanners urls={bannersAt('footer')} className="mt-16 sm:mt-20" />
    </main>
  );
}
