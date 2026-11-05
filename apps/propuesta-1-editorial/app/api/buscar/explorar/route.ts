import { NextResponse } from 'next/server';

import { getSearchEngine } from '@/lib/search';

export const dynamic = 'force-dynamic';

/** Temas y notas recientes que el buscador muestra antes de escribir. */
export async function GET() {
  try {
    const engine = await getSearchEngine();
    return NextResponse.json(engine.explore(), {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (error) {
    console.error('[buscar/explorar]', error);
    return NextResponse.json({ error: 'Búsqueda no disponible' }, { status: 503 });
  }
}
