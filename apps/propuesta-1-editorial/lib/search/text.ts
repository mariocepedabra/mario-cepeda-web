import type { Segment } from './types';

/**
 * Procesamiento de texto en español para el buscador: normalización, raíces,
 * palabras vacías, resaltado y fragmentos. Todo lo que se resalta pasa por el
 * mismo `termOf` que usa el índice, así que lo marcado coincide siempre con lo
 * que el motor encontró (plurales y tildes incluidos).
 */

const WORD = /[\p{L}\p{M}\p{N}]+/gu;

/** Quita tildes y pasa a minúsculas: «Nariño» → «narino». */
export function normalizeText(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

export function tokenize(text: string): string[] {
  return text.match(WORD) ?? [];
}

/**
 * Raíz ligera en español (algoritmo de Savoy, el mismo del SpanishLightStemmer
 * de Lucene): unifica plural y género para que «política», «políticos» y
 * «politica» sean el mismo término. Espera texto ya normalizado.
 */
function stem(word: string): string {
  const n = word.length;
  if (n < 5) return word;
  const last = word[n - 1];
  if (last === 'o' || last === 'a' || last === 'e') return word.slice(0, -1);
  if (last === 's') {
    if (word.endsWith('eses')) return word.slice(0, -2);
    if (word.endsWith('ces')) return `${word.slice(0, -3)}z`;
    const prev = word[n - 2];
    if (prev === 'o' || prev === 'a' || prev === 'e') return word.slice(0, -2);
  }
  return word;
}

/** Forma canónica de una palabra, la que se guarda en el índice. */
export function termOf(word: string): string {
  return stem(normalizeText(word));
}

const STOPWORDS = new Set(
  (
    'a al algo algunas algunos ante antes como con contra cual cuando de del desde donde durante ' +
    'e el ella ellas ellos en entre era eran es esa esas ese eso esos esta estas este esto estos ' +
    'fue fueron ha han hasta hay la las le les lo los mas me mi mis muy ni no nos nosotros o otra ' +
    'otras otro otros para pero poco por porque que quien quienes se ser si sin sobre son su sus ' +
    'tambien te tiene tienen todo todos tu tus u un una unas uno unos y ya yo'
  ).split(' '),
);

export function isStopword(word: string): boolean {
  return STOPWORDS.has(normalizeText(word));
}

const ENTITIES: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  laquo: '«',
  ldquo: '“',
  lsquo: '‘',
  lt: '<',
  mdash: '—',
  nbsp: ' ',
  ndash: '–',
  quot: '"',
  raquo: '»',
  rdquo: '”',
  rsquo: '’',
};

function decodeEntity(entity: string, body: string): string {
  if (body[0] !== '#') return ENTITIES[body.toLowerCase()] ?? entity;
  const hex = body[1] === 'x' || body[1] === 'X';
  const code = Number.parseInt(body.slice(hex ? 2 : 1), hex ? 16 : 10);
  return Number.isFinite(code) && code > 0 && code <= 0x10ffff
    ? String.fromCodePoint(code)
    : entity;
}

/** Convierte el HTML de una nota en texto plano. */
export function htmlToText(html: string | null | undefined): string {
  if (!html) return '';
  return html
    .replace(/<(script|style|iframe)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, decodeEntity)
    .replace(/\s+/g, ' ')
    .trim();
}

/** Divide un texto marcando las palabras cuyo término está en `matched`. */
export function highlight(text: string, matched: ReadonlySet<string>): Segment[] {
  const segments: Segment[] = [];
  let cursor = 0;
  for (const match of text.matchAll(WORD)) {
    if (!matched.has(termOf(match[0]))) continue;
    if (match.index > cursor) segments.push({ t: text.slice(cursor, match.index) });
    segments.push({ t: match[0], m: true });
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) segments.push({ t: text.slice(cursor) });
  return segments;
}

/** ¿Aparece en el texto alguna de las palabras buscadas? */
export function mentions(text: string, matched: ReadonlySet<string>): boolean {
  for (const match of text.matchAll(WORD)) {
    if (matched.has(termOf(match[0]))) return true;
  }
  return false;
}

/** Recorta sin partir palabras y añade elipsis si sobra texto. */
function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const space = text.lastIndexOf(' ', max);
  return `${text.slice(0, space > 0 ? space : max)}…`;
}

/** Cuántas coincidencias se consideran al elegir el mejor fragmento. */
const SNIPPET_MAX_MATCHES = 200;

/**
 * Extrae el fragmento de `max` caracteres que reúne más palabras distintas de
 * la búsqueda, empezando en un inicio de frase cuando lo hay cerca.
 */
export function snippet(text: string, matched: ReadonlySet<string>, max = 170): Segment[] {
  const found: { index: number; term: string }[] = [];
  for (const match of text.matchAll(WORD)) {
    const term = termOf(match[0]);
    if (matched.has(term)) found.push({ index: match.index, term });
    if (found.length === SNIPPET_MAX_MATCHES) break;
  }
  if (found.length === 0) return text ? [{ t: clip(text, max) }] : [];

  let anchor = found[0].index;
  let bestScore = -1;
  for (let i = 0; i < found.length; i++) {
    const seen = new Set<string>();
    let count = 0;
    for (let j = i; j < found.length && found[j].index - found[i].index < max - 40; j++) {
      seen.add(found[j].term);
      count++;
    }
    const score = seen.size * 100 + count;
    if (score > bestScore) {
      bestScore = score;
      anchor = found[i].index;
    }
  }

  let start = Math.max(0, anchor - 50);
  const sentence = text.lastIndexOf('. ', anchor);
  if (sentence >= start) {
    start = sentence + 2;
  } else if (start > 0) {
    const space = text.indexOf(' ', start);
    if (space !== -1 && space < anchor) start = space + 1;
  }

  let end = Math.min(text.length, start + max);
  if (end < text.length) {
    const space = text.lastIndexOf(' ', end);
    if (space > anchor) end = space;
  }

  const segments = highlight(text.slice(start, end), matched);
  if (start > 0) segments.unshift({ t: '…' });
  if (end < text.length) segments.push({ t: '…' });
  return segments;
}
