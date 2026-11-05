'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Clock, CornerDownLeft, Loader2, Search, X } from 'lucide-react';

import {
  MAX_QUERY_LENGTH,
  MIN_QUERY_LENGTH,
  SEARCH_SECTIONS,
  searchPageUrl,
  type SearchHit,
  type SearchResponse,
  type SearchSection,
} from '@/lib/search/types';

import { Highlighted } from './highlighted';
import {
  addRecentSearch,
  clearRecentSearches,
  readRecentSearches,
  removeRecentSearch,
} from './recent-searches';
import { useExplore, useSearch } from './use-search';

const NO_RESULTS: SearchHit[] = [];

/** Una fila navegable con el teclado. */
type Option = { id: string; run: () => void };

const optionId = (key: string) => `buscador-opcion-${key}`;

/* -------------------------------------------------------------------------- */
/*  Diálogo del buscador. Usa el <dialog> nativo: el navegador aporta la capa   */
/*  superior, el fondo inerte y el foco atrapado. Sigue el patrón «combobox»    */
/*  de WAI-ARIA: el foco se queda en el campo y las flechas recorren la lista.  */
/*  Enter abre la fila marcada o, si no hay ninguna, la página de resultados.   */
/* -------------------------------------------------------------------------- */
export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? <SearchPanel onClose={onClose} reduceMotion={!!reduceMotion} /> : null}
    </AnimatePresence>
  );
}

function SearchPanel({ onClose, reduceMotion }: { onClose: () => void; reduceMotion: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [previousFocus] = React.useState(() => document.activeElement as HTMLElement | null);

  const [query, setQuery] = React.useState('');
  const [seccion, setSeccion] = React.useState<SearchSection | null>(null);
  const [active, setActive] = React.useState(-1);
  const [recent, setRecent] = React.useState<string[]>([]);

  const { data, status } = useSearch(query, seccion);
  const explore = useExplore(true);

  const searching = query.trim().length >= MIN_QUERY_LENGTH;
  const results = (searching && data?.resultados) || NO_RESULTS;
  const hasResults = results.length > 0;

  // Abre el diálogo modal y fija el fondo sin que la página salte de ancho. Al
  // desmontarse devuelve el foco a donde estaba: antes no se puede, porque mientras
  // dura la animación de salida el resto de la página sigue inerte.
  React.useEffect(() => {
    const dialog = dialogRef.current;
    const root = document.documentElement;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    inputRef.current?.focus();
    setRecent(readRecentSearches());

    const { body } = document;
    const scrollbar = window.innerWidth - root.clientWidth;
    root.style.overflow = 'hidden';
    body.style.paddingRight = `${scrollbar}px`;
    return () => {
      root.style.overflow = '';
      body.style.paddingRight = '';
      previousFocus?.focus({ preventScroll: true });
    };
  }, [previousFocus]);

  // Al llegar a otra página (por ejemplo, tras abrir un resultado) se cierra solo.
  const firstPath = React.useRef(pathname);
  React.useEffect(() => {
    if (pathname !== firstPath.current) onClose();
  }, [pathname, onClose]);

  const remember = React.useCallback(() => {
    if (searching) setRecent(addRecentSearch(query));
  }, [query, searching]);

  const openResults = React.useCallback(() => {
    const q = query.trim();
    if (q.length < MIN_QUERY_LENGTH) return;
    setRecent(addRecentSearch(q));
    router.push(searchPageUrl(q, seccion));
    onClose();
  }, [query, seccion, router, onClose]);

  const openHit = React.useCallback(
    (hit: SearchHit) => {
      remember();
      router.push(hit.url);
      onClose();
    },
    [remember, router, onClose],
  );

  const runSearch = React.useCallback((term: string) => {
    setQuery(term);
    setSeccion(null);
    inputRef.current?.focus();
  }, []);

  // Filas de la lista en orden visual, para las flechas del teclado.
  const options = React.useMemo<Option[]>(() => {
    if (searching) {
      const rows = results.map((hit) => ({ id: hit.id, run: () => openHit(hit) }));
      return hasResults ? [...rows, { id: 'ver-todos', run: openResults }] : rows;
    }
    return [
      ...recent.map((term) => ({ id: `reciente-${term}`, run: () => runSearch(term) })),
      ...(explore?.recientes ?? []).map((hit) => ({ id: hit.id, run: () => openHit(hit) })),
    ];
  }, [searching, results, hasResults, recent, explore, openHit, openResults, runSearch]);

  // Una lista nueva empieza sin fila marcada: Enter sigue llevando a resultados.
  React.useEffect(() => setActive(-1), [query, seccion, data]);

  const activeId = options[active]?.id;

  React.useEffect(() => {
    if (!activeId) return;
    document.getElementById(optionId(activeId))?.scrollIntoView({ block: 'nearest' });
  }, [activeId]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing || options.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((i) => (i + 1) % options.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => (i <= 0 ? options.length - 1 : i - 1));
    }
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const option = options[active];
    if (option) option.run();
    else openResults();
  };

  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <motion.dialog
      ref={dialogRef}
      aria-label="Buscar en el sitio"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.18 }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="bg-ink/50 text-ink fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 p-0 backdrop-blur-sm sm:px-4 sm:pt-[9vh]"
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: -12, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: -8, scale: 0.985 }}
        transition={{ duration: 0.22, ease }}
        className="bg-paper shadow-lift sm:rounded-card mx-auto flex h-full w-full flex-col overflow-hidden sm:h-auto sm:max-h-[82vh] sm:max-w-2xl"
      >
        <form
          role="search"
          action="/buscar"
          onSubmit={onSubmit}
          className="border-line flex shrink-0 items-center gap-2 border-b py-2 pl-4 pr-2 sm:pl-5"
        >
          {status === 'loading' ? (
            <Loader2 aria-hidden className="text-accent size-5 shrink-0 animate-spin" />
          ) : (
            <Search aria-hidden className="text-ink-muted size-5 shrink-0" />
          )}
          <input
            ref={inputRef}
            type="text"
            inputMode="search"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            maxLength={MAX_QUERY_LENGTH}
            placeholder="Busca notas, temas, libros, personas…"
            aria-label="Buscar en el sitio"
            role="combobox"
            aria-expanded={options.length > 0}
            aria-controls="buscador-lista"
            aria-autocomplete="list"
            aria-activedescendant={activeId ? optionId(activeId) : undefined}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="search"
            className="font-display text-ink placeholder:text-ink-muted h-12 min-w-0 flex-1 bg-transparent text-xl outline-none"
          />
          {query ? (
            <button
              type="button"
              aria-label="Borrar búsqueda"
              onClick={() => {
                setQuery('');
                setSeccion(null);
                inputRef.current?.focus();
              }}
              className="text-ink-muted hover:bg-paper-2 hover:text-ink inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-colors"
            >
              <X aria-hidden className="size-4" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar buscador"
            className="text-ink-soft hover:bg-paper-2 hover:text-ink shrink-0 rounded-full px-3 py-2 text-sm font-medium transition-colors"
          >
            <span className="sm:hidden">Cerrar</span>
            <kbd className="hidden font-sans text-xs sm:inline">Esc</kbd>
          </button>
        </form>

        {searching && data ? (
          <SectionFilters data={data} seccion={seccion} onChange={setSeccion} />
        ) : null}

        <div
          id="buscador-lista"
          role="listbox"
          aria-label="Resultados de la búsqueda"
          className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2 transition-opacity sm:px-3 ${
            status === 'loading' && hasResults ? 'opacity-60' : ''
          }`}
        >
          {searching ? (
            <SearchResults
              query={query.trim()}
              data={data}
              status={status}
              seccion={seccion}
              activeId={activeId}
              temas={explore?.temas ?? []}
              onActive={(id) => setActive(options.findIndex((o) => o.id === id))}
              onOpen={openHit}
              onOpenAll={openResults}
              onSearch={runSearch}
            />
          ) : (
            <SearchStart
              recent={recent}
              temas={explore?.temas ?? []}
              recientes={explore?.recientes ?? []}
              activeId={activeId}
              onActive={(id) => setActive(options.findIndex((o) => o.id === id))}
              onSearch={runSearch}
              onOpen={openHit}
              onRemove={(term) => setRecent(removeRecentSearch(term))}
              onClear={() => setRecent(clearRecentSearches())}
            />
          )}
        </div>

        <p aria-live="polite" className="sr-only">
          {status === 'ready' && data
            ? data.total === 0
              ? 'Sin resultados'
              : `${data.total} ${data.total === 1 ? 'resultado' : 'resultados'}`
            : ''}
        </p>

        <footer className="border-line text-ink-muted hidden shrink-0 items-center gap-4 border-t px-5 py-2.5 text-xs sm:flex">
          <span className="inline-flex items-center gap-1.5">
            <Key>↑</Key>
            <Key>↓</Key>
            para moverte
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Key>
              <CornerDownLeft aria-hidden className="size-3" />
            </Key>
            para abrir
          </span>
        </footer>
      </motion.div>
    </motion.dialog>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="border-line bg-paper-2 text-ink-soft inline-flex h-5 min-w-5 items-center justify-center rounded border px-1 font-sans text-[11px]">
      {children}
    </kbd>
  );
}

function SectionFilters({
  data,
  seccion,
  onChange,
}: {
  data: SearchResponse;
  seccion: SearchSection | null;
  onChange: (seccion: SearchSection | null) => void;
}) {
  const all = Object.values(data.facetas).reduce((sum, n) => sum + n, 0);
  const sections = SEARCH_SECTIONS.filter((s) => data.facetas[s.id] > 0);
  if (sections.length < 2 && !seccion) return null;

  const chip = (selected: boolean) =>
    `shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
      selected
        ? 'border-ink bg-ink text-paper'
        : 'border-line text-ink-soft hover:border-ink hover:text-ink'
    }`;

  return (
    <div
      role="group"
      aria-label="Filtrar por sección"
      className="border-line flex shrink-0 gap-2 overflow-x-auto border-b px-4 py-2.5 [scrollbar-width:none] sm:px-5"
    >
      <button
        type="button"
        aria-pressed={!seccion}
        onClick={() => onChange(null)}
        className={chip(!seccion)}
      >
        Todo <span className="tabular-nums opacity-70">{all}</span>
      </button>
      {sections.map((s) => (
        <button
          key={s.id}
          type="button"
          aria-pressed={seccion === s.id}
          onClick={() => onChange(seccion === s.id ? null : s.id)}
          className={chip(seccion === s.id)}
        >
          {s.label} <span className="tabular-nums opacity-70">{data.facetas[s.id]}</span>
        </button>
      ))}
    </div>
  );
}

function SearchResults({
  query,
  data,
  status,
  seccion,
  activeId,
  temas,
  onActive,
  onOpen,
  onOpenAll,
  onSearch,
}: {
  query: string;
  data: SearchResponse | null;
  status: string;
  seccion: SearchSection | null;
  activeId: string | undefined;
  temas: string[];
  onActive: (id: string) => void;
  onOpen: (hit: SearchHit) => void;
  onOpenAll: () => void;
  onSearch: (term: string) => void;
}) {
  if (status === 'error') {
    return (
      <Notice title="La búsqueda no está disponible en este momento">
        Inténtalo de nuevo en unos segundos.
      </Notice>
    );
  }

  if (!data) return <ResultsSkeleton />;

  if (data.total === 0) {
    if (status === 'loading') return <ResultsSkeleton />;
    return (
      <Notice title={`No encontramos nada para «${query}»`}>
        <p>Prueba con otras palabras o con una más general.</p>
        <TopicChips temas={temas} onSearch={onSearch} className="mt-4 justify-center" />
      </Notice>
    );
  }

  const shown = data.resultados.length;
  const verTodos = 'ver-todos';

  return (
    <>
      {data.corregido ? (
        <p className="text-ink-soft px-3 pb-2 pt-1 text-sm">
          Mostrando resultados para <strong className="text-ink">«{data.corregido}»</strong>
        </p>
      ) : null}
      {data.parcial ? (
        <p className="text-ink-soft px-3 pb-2 pt-1 text-sm">
          Ningún resultado tiene todas las palabras; estos son los más parecidos.
        </p>
      ) : null}

      {data.resultados.map((hit) => (
        <ResultOption
          key={hit.id}
          hit={hit}
          selected={activeId === hit.id}
          onHover={() => onActive(hit.id)}
          onOpen={() => onOpen(hit)}
        />
      ))}

      <Link
        id={optionId(verTodos)}
        role="option"
        aria-selected={activeId === verTodos}
        tabIndex={-1}
        href={searchPageUrl(query, seccion)}
        onMouseMove={() => onActive(verTodos)}
        onClick={(event) => {
          event.preventDefault();
          onOpenAll();
        }}
        className={`text-accent-deep mt-1 flex items-center justify-between gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
          activeId === verTodos ? 'bg-paper-2' : ''
        }`}
      >
        {data.total > shown
          ? `Ver los ${data.total} resultados`
          : 'Abrir en la página de resultados'}
        <ArrowRight aria-hidden className="size-4" />
      </Link>
    </>
  );
}

function ResultOption({
  hit,
  selected,
  onHover,
  onOpen,
}: {
  hit: SearchHit;
  selected: boolean;
  onHover: () => void;
  onOpen: () => void;
}) {
  return (
    <Link
      id={optionId(hit.id)}
      role="option"
      aria-selected={selected}
      tabIndex={-1}
      href={hit.url}
      onMouseMove={onHover}
      onClick={(event) => {
        // Ctrl/⌘ + clic conserva el comportamiento de abrir en otra pestaña.
        if (event.metaKey || event.ctrlKey || event.shiftKey) return;
        event.preventDefault();
        onOpen();
      }}
      className={`flex gap-3 rounded-xl p-3 transition-colors ${selected ? 'bg-paper-2' : ''}`}
    >
      {hit.imagen ? (
        <span className="bg-paper-2 relative mt-0.5 size-14 shrink-0 overflow-hidden rounded-lg">
          <Image src={hit.imagen} alt="" fill sizes="56px" className="object-cover" />
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="text-accent-deep block truncate text-[11px] font-semibold uppercase tracking-widest">
          {hit.etiqueta}
        </span>
        <span className="font-display text-ink mt-0.5 block text-lg font-semibold leading-snug">
          <Highlighted segments={hit.titulo} />
        </span>
        {hit.fragmento.length > 0 ? (
          <span className="text-ink-soft mt-1 line-clamp-2 block text-sm leading-relaxed">
            <Highlighted segments={hit.fragmento} />
          </span>
        ) : null}
      </span>
    </Link>
  );
}

function SearchStart({
  recent,
  temas,
  recientes,
  activeId,
  onActive,
  onSearch,
  onOpen,
  onRemove,
  onClear,
}: {
  recent: string[];
  temas: string[];
  recientes: SearchHit[];
  activeId: string | undefined;
  onActive: (id: string) => void;
  onSearch: (term: string) => void;
  onOpen: (hit: SearchHit) => void;
  onRemove: (term: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-5 py-1">
      {recent.length > 0 ? (
        <section>
          <div className="flex items-center justify-between px-3">
            <GroupTitle>Búsquedas recientes</GroupTitle>
            <button
              type="button"
              onClick={onClear}
              className="text-ink-muted hover:text-ink rounded text-xs font-medium transition-colors"
            >
              Borrar todo
            </button>
          </div>
          <div className="mt-1">
            {recent.map((term) => {
              const id = `reciente-${term}`;
              return (
                <div
                  key={term}
                  id={optionId(id)}
                  role="option"
                  aria-selected={activeId === id}
                  onMouseMove={() => onActive(id)}
                  className={`flex items-center gap-1 rounded-xl pr-1 transition-colors ${
                    activeId === id ? 'bg-paper-2' : ''
                  }`}
                >
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => onSearch(term)}
                    className="text-ink flex min-w-0 flex-1 items-center gap-3 px-3 py-2 text-left"
                  >
                    <Clock aria-hidden className="text-ink-muted size-4 shrink-0" />
                    <span className="truncate">{term}</span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Quitar «${term}» de las búsquedas recientes`}
                    onClick={() => onRemove(term)}
                    className="text-ink-muted hover:bg-line hover:text-ink inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-colors"
                  >
                    <X aria-hidden className="size-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {temas.length > 0 ? (
        <section className="px-3">
          <GroupTitle>Temas</GroupTitle>
          <TopicChips temas={temas} onSearch={onSearch} className="mt-2" />
        </section>
      ) : null}

      {recientes.length > 0 ? (
        <section>
          <div className="px-3">
            <GroupTitle>Lo más reciente</GroupTitle>
          </div>
          <div className="mt-1">
            {recientes.map((hit) => (
              <ResultOption
                key={hit.id}
                hit={hit}
                selected={activeId === hit.id}
                onHover={() => onActive(hit.id)}
                onOpen={() => onOpen(hit)}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function GroupTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-ink-muted font-sans text-xs font-semibold uppercase tracking-widest">
      {children}
    </h2>
  );
}

function TopicChips({
  temas,
  onSearch,
  className = '',
}: {
  temas: string[];
  onSearch: (term: string) => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {temas.map((tema) => (
        <button
          key={tema}
          type="button"
          onClick={() => onSearch(tema)}
          className="border-line text-ink-soft hover:border-ink hover:text-ink rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors"
        >
          {tema}
        </button>
      ))}
    </div>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-10 text-center">
      <p className="font-display text-ink text-xl font-semibold">{title}</p>
      <div className="text-ink-soft mt-2">{children}</div>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div aria-hidden className="space-y-1">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex animate-pulse gap-3 p-3">
          <div className="bg-paper-2 size-14 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2 py-1">
            <div className="bg-paper-2 h-2.5 w-1/3 rounded" />
            <div className="bg-paper-2 h-4 w-4/5 rounded" />
            <div className="bg-paper-2 h-3 w-full rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
