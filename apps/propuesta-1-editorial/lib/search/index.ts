import 'server-only';

import { after } from 'next/server';

import { getSearchCorpus } from '@mario/database/queries';

import { buildDocuments } from './documents';
import { SearchEngine } from './engine';

/**
 * Índice en memoria, compartido por las búsquedas de cada instancia del servidor.
 * Pasado este tiempo se reconstruye en segundo plano mientras se sigue
 * respondiendo con el anterior, así que una nota nueva aparece en un par de
 * minutos sin hacer esperar a nadie. Si la base de datos falla, se conserva el
 * último índice bueno.
 */
const INDEX_TTL_MS = 60_000;

let engine: SearchEngine | null = null;
let rebuilding: Promise<SearchEngine> | null = null;

async function rebuild(): Promise<SearchEngine> {
  const corpus = await getSearchCorpus();
  engine = new SearchEngine(buildDocuments(corpus));
  return engine;
}

export async function getSearchEngine(): Promise<SearchEngine> {
  if (engine && Date.now() - engine.builtAt < INDEX_TTL_MS) return engine;

  rebuilding ??= rebuild().finally(() => {
    rebuilding = null;
  });

  if (!engine) return rebuilding;

  const pending = rebuilding.catch((error) => {
    console.error('[buscar] índice no actualizado', error);
  });
  after(() => pending);
  return engine;
}
