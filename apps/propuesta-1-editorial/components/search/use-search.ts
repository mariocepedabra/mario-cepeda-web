'use client';

import * as React from 'react';

import {
  MIN_QUERY_LENGTH,
  type SearchExplore,
  type SearchResponse,
  type SearchSection,
} from '@/lib/search/types';

/** Pausa entre teclas antes de consultar: suficiente para no lanzar una por letra. */
const DEBOUNCE_MS = 120;

const RESULTS_IN_DIALOG = 8;

/** Respuestas ya vistas en esta visita: al borrar letras los resultados son inmediatos. */
const responses = new Map<string, SearchResponse>();

export type SearchStatus = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Consulta el buscador mientras se escribe. Conserva los resultados anteriores
 * hasta que llegan los nuevos para que la lista no parpadee, y cancela las
 * peticiones que quedan obsoletas para que una respuesta lenta no pise a otra.
 */
export function useSearch(query: string, seccion: SearchSection | null) {
  const [data, setData] = React.useState<SearchResponse | null>(null);
  const [status, setStatus] = React.useState<SearchStatus>('idle');

  React.useEffect(() => {
    const q = query.trim();
    if (q.length < MIN_QUERY_LENGTH) {
      setData(null);
      setStatus('idle');
      return;
    }

    const params = new URLSearchParams({ q: query, limite: String(RESULTS_IN_DIALOG) });
    if (seccion) params.set('seccion', seccion);
    const url = `/api/buscar?${params.toString()}`;

    const cached = responses.get(url);
    if (cached) {
      setData(cached);
      setStatus('ready');
      return;
    }

    setStatus('loading');
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const body = (await response.json()) as SearchResponse;
        responses.set(url, body);
        setData(body);
        setStatus('ready');
      } catch {
        if (!controller.signal.aborted) setStatus('error');
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, seccion]);

  return { data, status };
}

/** Carga los temas y las notas recientes. También despierta el índice del servidor. */
export function useExplore(enabled: boolean): SearchExplore | null {
  const [data, setData] = React.useState<SearchExplore | null>(null);

  React.useEffect(() => {
    if (!enabled || data) return;
    const controller = new AbortController();
    fetch('/api/buscar/explorar', { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then(setData)
      .catch(() => {
        // Sin sugerencias el buscador sigue funcionando.
      });
    return () => controller.abort();
  }, [enabled, data]);

  return data;
}
