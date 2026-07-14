'use client';

import * as React from 'react';
import { Star } from 'lucide-react';

import type { Book } from '@mario/database';

import { Cover } from './cover';
import { MosaicItem } from './work-mosaic';

/** Una pieza del collage de Libros: una reseña de libro o un medio (video/imagen/embed). */
export type CollageTile =
  | { kind: 'book'; key: string; book: Book }
  | { kind: 'media'; key: string; url: string };

/**
 * Collage de la sección Libros.
 *
 * A diferencia de un masonry con columnas CSS (`columns-*`), que se rellena
 * COLUMNA por columna y descoloca la secuencia, aquí repartimos las piezas en
 * ROUND-ROBIN (pieza 1 → col 1, pieza 2 → col 2, pieza 3 → col 3, pieza 4 →
 * col 1…). Así se leen en el MISMO orden en que están —izquierda→derecha,
 * arriba→abajo— y el orden que se fija en el panel se refleja tal cual en la
 * web. Cada pieza conserva su proporción natural (no se recorta).
 */
export function BooksCollage({ tiles }: { tiles: CollageTile[] }) {
  const columnCount = useColumnCount();
  const columns = React.useMemo(() => distribute(tiles, columnCount), [tiles, columnCount]);

  if (tiles.length === 0) return null;

  return (
    <div className="flex items-start gap-5">
      {columns.map((column, ci) => (
        <div key={ci} className="flex min-w-0 flex-1 flex-col gap-5">
          {column.map((tile) =>
            tile.kind === 'book' ? (
              <BookTile key={tile.key} book={tile.book} />
            ) : (
              <MosaicItem key={tile.key} url={tile.url} />
            ),
          )}
        </div>
      ))}
    </div>
  );
}

/** Nº de columnas según el ancho: 1 (móvil) · 2 (≥640px) · 3 (≥1024px). */
function useColumnCount(): number {
  const [cols, setCols] = React.useState(3);
  React.useEffect(() => {
    const lg = window.matchMedia('(min-width: 1024px)');
    const sm = window.matchMedia('(min-width: 640px)');
    const update = () => setCols(lg.matches ? 3 : sm.matches ? 2 : 1);
    update();
    lg.addEventListener('change', update);
    sm.addEventListener('change', update);
    return () => {
      lg.removeEventListener('change', update);
      sm.removeEventListener('change', update);
    };
  }, []);
  return cols;
}

/** Reparte las piezas en `cols` columnas en round-robin (conserva el orden de lectura). */
function distribute<T>(items: T[], cols: number): T[][] {
  const columns: T[][] = Array.from({ length: cols }, () => []);
  items.forEach((item, i) => columns[i % cols].push(item));
  return columns;
}

/** Tarjeta vertical de un libro dentro del collage: portada grande + reseña. */
function BookTile({ book }: { book: Book }) {
  return (
    <article className="group overflow-hidden rounded-card bg-paper-2 shadow-soft transition-shadow duration-300 hover:shadow-lift">
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
