/**
 * Búsquedas recientes del visitante. Se guardan solo en su navegador: nunca
 * salen de ahí. Si el almacenamiento no está disponible (modo privado estricto),
 * la función simplemente no aparece.
 */

const STORAGE_KEY = 'mc_busquedas_recientes';
const MAX_RECENT = 5;

export function readRecentSearches(): string[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(stored) ? stored.filter((s) => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

function write(searches: string[]): string[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  } catch {
    // Sin almacenamiento disponible: la lista dura solo esta visita.
  }
  return searches;
}

export function addRecentSearch(query: string): string[] {
  const term = query.trim();
  if (!term) return readRecentSearches();
  const others = readRecentSearches().filter((s) => s.toLowerCase() !== term.toLowerCase());
  return write([term, ...others].slice(0, MAX_RECENT));
}

export function removeRecentSearch(query: string): string[] {
  return write(readRecentSearches().filter((s) => s !== query));
}

export function clearRecentSearches(): string[] {
  return write([]);
}
