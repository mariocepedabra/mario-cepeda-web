import type { Metadata } from 'next';
import Form from 'next/form';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';

import { Highlighted } from '@/components/search/highlighted';
import { getSearchEngine } from '@/lib/search';
import {
  isSearchSection,
  MAX_QUERY_LENGTH,
  MIN_QUERY_LENGTH,
  SEARCH_SECTIONS,
  type SearchExplore,
  type SearchHit,
  type SearchOrder,
  type SearchResponse,
  type SearchSection,
} from '@/lib/search/types';

/** Resultados por tanda; «Ver más» suma otra. */
const PAGE_SIZE = 12;

type Params = {
  q?: string;
  seccion?: string;
  orden?: string;
  pagina?: string;
};

interface Props {
  searchParams: Promise<Params>;
}

/** Las páginas de resultados no aportan a Google y solo diluirían el sitio. */
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim();
  return {
    title: query ? `Buscar: ${query}` : 'Buscar',
    description: 'Busca en las notas, proyectos, libros e historias de Mario Cepeda.',
    robots: { index: false, follow: true },
  };
}

/** Enlace que conserva el estado de la búsqueda cambiando solo lo indicado. */
function hrefWith(current: Params, changes: Params): string {
  const merged = { ...current, ...changes };
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value);
  }
  return `/buscar?${params.toString()}`;
}

export default async function BuscarPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = (params.q ?? '').slice(0, MAX_QUERY_LENGTH).trim();
  const seccion: SearchSection | null = isSearchSection(params.seccion) ? params.seccion : null;
  const orden: SearchOrder = params.orden === 'recientes' ? 'recientes' : 'relevancia';
  const pagina = Math.max(1, Number.parseInt(params.pagina ?? '1', 10) || 1);
  const searching = q.length >= MIN_QUERY_LENGTH;

  let data: SearchResponse | null = null;
  let explore: SearchExplore | null = null;
  let failed = false;

  try {
    const engine = await getSearchEngine();
    explore = engine.explore();
    if (searching) data = engine.search({ q, seccion, orden, limite: pagina * PAGE_SIZE });
  } catch (error) {
    console.error('[buscar]', error);
    failed = true;
  }

  const current: Params = {
    q,
    seccion: seccion ?? undefined,
    orden: orden === 'recientes' ? orden : undefined,
  };

  return (
    <main className="mx-auto max-w-4xl px-5 pb-24 pt-32 sm:px-8 sm:pt-40">
      <header>
        <p className="text-accent text-sm font-semibold uppercase tracking-[0.25em]">Buscar</p>
        <h1 className="font-display mt-4 text-4xl font-semibold leading-[1.05] sm:text-5xl">
          {searching ? `Resultados para «${q}»` : 'Encuentra lo que buscas'}
        </h1>
      </header>

      <Form
        action="/buscar"
        role="search"
        className="border-line focus-within:border-ink mt-8 flex items-center gap-2 rounded-full border bg-white/60 py-1.5 pl-5 pr-1.5 transition-colors"
      >
        <Search aria-hidden className="text-ink-muted size-5 shrink-0" />
        <input
          type="search"
          name="q"
          defaultValue={q}
          key={q}
          maxLength={MAX_QUERY_LENGTH}
          placeholder="Busca notas, temas, libros, personas…"
          aria-label="Buscar en el sitio"
          autoComplete="off"
          enterKeyHint="search"
          className="text-ink placeholder:text-ink-muted h-11 min-w-0 flex-1 bg-transparent text-lg outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        <button
          type="submit"
          className="bg-ink text-paper hover:bg-accent-deep shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
        >
          Buscar
        </button>
      </Form>

      {failed ? (
        <p role="alert" className="text-ink-soft py-16 text-center text-lg">
          La búsqueda no está disponible en este momento. Inténtalo de nuevo en unos segundos.
        </p>
      ) : data ? (
        <Results data={data} current={current} seccion={seccion} orden={orden} pagina={pagina} />
      ) : null}

      {!failed && explore && (!data || data.total === 0) ? (
        <Explore explore={explore} sinResultados={Boolean(data)} />
      ) : null}
    </main>
  );
}

function Results({
  data,
  current,
  seccion,
  orden,
  pagina,
}: {
  data: SearchResponse;
  current: Params;
  seccion: SearchSection | null;
  orden: SearchOrder;
  pagina: number;
}) {
  const all = Object.values(data.facetas).reduce((sum, n) => sum + n, 0);
  const sections = SEARCH_SECTIONS.filter((s) => data.facetas[s.id] > 0);

  return (
    <>
      {all > 0 ? (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
          <nav aria-label="Filtrar por sección" className="flex flex-wrap gap-2">
            <Chip
              label="Todo"
              count={all}
              href={hrefWith(current, { seccion: undefined })}
              active={!seccion}
            />
            {sections.map((s) => (
              <Chip
                key={s.id}
                label={s.label}
                count={data.facetas[s.id]}
                href={hrefWith(current, { seccion: s.id })}
                active={seccion === s.id}
              />
            ))}
          </nav>

          <nav aria-label="Ordenar resultados" className="flex items-center gap-3 text-sm">
            <SortLink
              label="Relevancia"
              href={hrefWith(current, { orden: undefined })}
              active={orden === 'relevancia'}
            />
            <span aria-hidden className="text-line">
              |
            </span>
            <SortLink
              label="Más recientes"
              href={hrefWith(current, { orden: 'recientes' })}
              active={orden === 'recientes'}
            />
          </nav>
        </div>
      ) : null}

      <div role="status" className="text-ink-soft mt-8">
        {data.corregido ? (
          <p>
            Mostrando resultados para <strong className="text-ink">«{data.corregido}»</strong>.
          </p>
        ) : null}
        {data.parcial ? (
          <p>Ningún resultado tiene todas las palabras; estos son los más parecidos.</p>
        ) : null}
        {data.total > 0 ? (
          <p className="text-ink-muted text-sm">
            {data.total} {data.total === 1 ? 'resultado' : 'resultados'}
          </p>
        ) : (
          <p className="text-lg">
            No encontramos nada para «{data.q}». Prueba con otras palabras o con una más general.
          </p>
        )}
      </div>

      {data.total > 0 ? (
        <ol className="divide-line border-line mt-4 divide-y border-y">
          {data.resultados.map((hit) => (
            <li key={hit.id}>
              <ResultRow hit={hit} />
            </li>
          ))}
        </ol>
      ) : null}

      {data.total > data.resultados.length ? (
        <div className="mt-12 flex justify-center">
          <Link
            href={hrefWith(current, { pagina: String(pagina + 1) })}
            scroll={false}
            className="border-ink text-ink hover:bg-ink hover:text-paper inline-flex items-center gap-2 rounded-full border px-7 py-3.5 font-semibold transition-colors"
          >
            Ver más ({data.total - data.resultados.length})
          </Link>
        </div>
      ) : null}
    </>
  );
}

function ResultRow({ hit }: { hit: SearchHit }) {
  return (
    <Link href={hit.url} className="group flex items-start gap-5 py-6 sm:gap-8">
      <div className="min-w-0 flex-1">
        <p className="text-accent-deep text-xs font-semibold uppercase tracking-widest">
          {hit.etiqueta}
        </p>
        <h2 className="font-display group-hover:text-accent-deep mt-2 text-2xl font-semibold leading-tight">
          <Highlighted segments={hit.titulo} />
        </h2>
        {hit.fragmento.length > 0 ? (
          <p className="text-ink-soft mt-2 leading-relaxed">
            <Highlighted segments={hit.fragmento} />
          </p>
        ) : null}
      </div>
      {hit.imagen ? (
        <div className="bg-paper-2 shadow-soft relative aspect-[3/2] w-24 shrink-0 overflow-hidden rounded-xl sm:w-44">
          <Image
            src={hit.imagen}
            alt=""
            fill
            sizes="(max-width: 640px) 96px, 176px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : null}
    </Link>
  );
}

function Explore({ explore, sinResultados }: { explore: SearchExplore; sinResultados: boolean }) {
  return (
    <div className={sinResultados ? 'mt-10' : 'mt-12'}>
      {explore.temas.length > 0 ? (
        <section>
          <h2 className="text-ink-muted font-sans text-xs font-semibold uppercase tracking-widest">
            Temas
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {explore.temas.map((tema) => (
              <Chip key={tema} label={tema} href={`/buscar?q=${encodeURIComponent(tema)}`} />
            ))}
          </div>
        </section>
      ) : null}

      {explore.recientes.length > 0 ? (
        <section className="mt-12">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-ink-muted font-sans text-xs font-semibold uppercase tracking-widest">
              Lo más reciente
            </h2>
            <Link
              href="/pensamiento"
              className="text-accent-deep hover:text-ink inline-flex items-center gap-1.5 text-sm font-semibold"
            >
              Ver todas las notas <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
          <ol className="divide-line border-line mt-3 divide-y border-y">
            {explore.recientes.map((hit) => (
              <li key={hit.id}>
                <ResultRow hit={hit} />
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  );
}

function Chip({
  label,
  count,
  href,
  active = false,
}: {
  label: string;
  count?: number;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? 'true' : undefined}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? 'border-ink bg-ink text-paper'
          : 'border-line text-ink-soft hover:border-ink hover:text-ink'
      }`}
    >
      {label}
      {count !== undefined ? <span className="ml-1.5 tabular-nums opacity-70">{count}</span> : null}
    </Link>
  );
}

function SortLink({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? 'true' : undefined}
      className={`font-medium transition-colors ${
        active ? 'text-ink underline underline-offset-4' : 'text-ink-muted hover:text-ink'
      }`}
    >
      {label}
    </Link>
  );
}
