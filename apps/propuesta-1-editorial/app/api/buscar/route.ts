import { NextResponse, type NextRequest } from 'next/server';

import { getSearchEngine } from '@/lib/search';
import {
  isSearchSection,
  MAX_QUERY_LENGTH,
  MIN_QUERY_LENGTH,
  type SearchResponse,
} from '@/lib/search/types';

export const dynamic = 'force-dynamic';

const MAX_RESULTS = 20;

/** Las búsquedas repetidas se sirven desde la CDN sin tocar el servidor. */
const CACHE_CONTROL = 'public, s-maxage=60, stale-while-revalidate=300';

/** Búsqueda del diálogo de la cabecera: `GET /api/buscar?q=&seccion=&limite=`. */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = (searchParams.get('q') ?? '').slice(0, MAX_QUERY_LENGTH);
  const seccion = searchParams.get('seccion');
  const limite = Math.min(Math.max(Number(searchParams.get('limite')) || 8, 1), MAX_RESULTS);

  if (q.trim().length < MIN_QUERY_LENGTH) {
    return NextResponse.json({ error: 'Consulta demasiado corta' }, { status: 400 });
  }

  try {
    const engine = await getSearchEngine();
    const body: SearchResponse = engine.search({
      q,
      seccion: isSearchSection(seccion) ? seccion : null,
      limite,
    });
    return NextResponse.json(body, { headers: { 'Cache-Control': CACHE_CONTROL } });
  } catch (error) {
    console.error('[buscar]', error);
    return NextResponse.json({ error: 'Búsqueda no disponible' }, { status: 503 });
  }
}
