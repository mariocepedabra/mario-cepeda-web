import MiniSearch, { type SearchOptions, type SearchResult } from 'minisearch';

import { formatDate } from '@mario/core/lib';

import type { SearchDoc } from './documents';
import { highlight, isStopword, mentions, normalizeText, snippet, termOf, tokenize } from './text';
import {
  SEARCH_SECTIONS,
  type SearchExplore,
  type SearchHit,
  type SearchOrder,
  type SearchResponse,
  type SearchSection,
} from './types';

/**
 * Motor de búsqueda sobre un índice invertido en memoria (MiniSearch, BM25+).
 *
 * Una consulta pasa por tres intentos, de más a menos preciso, y se queda con el
 * primero que dé resultados:
 *   1. Todas las palabras, con la última como prefijo (búsqueda mientras se escribe).
 *   2. Lo mismo tolerando errores de escritura (avisa con `corregido`).
 *   3. Cualquiera de las palabras (avisa con `parcial`).
 * Así la tolerancia a errores nunca mete ruido cuando la búsqueda ya tiene aciertos.
 */

/** Atajos que la gente escribe y que en los textos aparecen de otra forma. */
const ALIASES: Record<string, string[]> = {
  p10: ['pagina', '10'],
};

const FIELD_BOOST = { titulo: 6, tema: 3, autor: 3, resumen: 2, texto: 1 };

/** Error de escritura admitido, como fracción del largo de la palabra. */
const fuzziness = (term: string) => (term.length >= 4 ? 0.25 : false);

const processQueryTerm = (term: string) => termOf(term);

interface IndexedDoc extends SearchDoc {
  /** Título y cuerpo normalizados, para comparar frases exactas. */
  tituloPlano: string;
  plano: string;
}

interface ParsedQuery {
  /** Palabras que se le pasan al índice. */
  terms: string[];
  /** Frases entre comillas, normalizadas: deben aparecer tal cual. */
  frases: string[];
  /** La consulta entera normalizada, para premiar coincidencias literales. */
  literal: string;
  /** Si el usuario sigue escribiendo la última palabra, se busca como prefijo. */
  prefijo: boolean;
}

function parseQuery(raw: string): ParsedQuery {
  const frases: string[] = [];
  const sinFrases = raw.replace(/"([^"]+)"|«([^»]+)»/g, (_, doble, angular) => {
    frases.push(normalizeText(doble ?? angular).trim());
    return ` ${doble ?? angular} `;
  });

  const tokens = tokenize(sinFrases).flatMap((token) => ALIASES[normalizeText(token)] ?? [token]);
  const utiles = tokens.filter((token) => !isStopword(token));

  return {
    // Con solo palabras vacías («de») aún se escribe: se usa la última como prefijo.
    terms: utiles.length > 0 ? utiles : tokens.slice(-1),
    frases: frases.filter(Boolean),
    literal: tokenize(normalizeText(raw)).join(' '),
    prefijo: frases.length === 0 && !/\s$/.test(raw),
  };
}

/** Las notas recientes pesan algo más; el efecto se desvanece en un par de años. */
function recencyBoost(fecha: string | null | undefined): number {
  if (!fecha) return 1.15;
  const years = (Date.now() - new Date(fecha).getTime()) / (365 * 24 * 3600 * 1000);
  return 1 + 0.3 * Math.exp(-Math.max(years, 0) / 2);
}

function etiqueta(doc: SearchDoc): string {
  const seccion = SEARCH_SECTIONS.find((s) => s.id === doc.seccion)?.label;
  const fecha = formatDate(doc.fecha, { month: 'short' });
  const partes = doc.seccion === 'sitio' ? [doc.tipo] : [seccion, doc.tipo ?? doc.tema];
  return [...partes, doc.autor, fecha].filter(Boolean).join(' · ');
}

export interface SearchInput {
  q: string;
  seccion?: SearchSection | null;
  orden?: SearchOrder;
  limite: number;
}

export class SearchEngine {
  readonly builtAt = Date.now();
  private readonly docs = new Map<string, IndexedDoc>();
  private readonly index: MiniSearch<SearchDoc>;
  /** Forma más frecuente de cada término, para mostrar correcciones legibles. */
  private readonly surfaces = new Map<string, Map<string, number>>();

  constructor(documents: SearchDoc[]) {
    this.index = new MiniSearch<SearchDoc>({
      fields: Object.keys(FIELD_BOOST),
      storeFields: [],
      tokenize,
      processTerm: (term) => (isStopword(term) ? null : termOf(term)),
    });
    this.index.addAll(documents);

    for (const doc of documents) {
      const cuerpo = [doc.resumen, doc.texto].filter(Boolean).join(' ');
      this.docs.set(doc.id, {
        ...doc,
        tituloPlano: normalizeText(doc.titulo),
        plano: normalizeText(`${doc.titulo} ${cuerpo}`),
      });
      for (const word of tokenize(`${doc.titulo} ${cuerpo}`.toLowerCase())) {
        const term = termOf(word);
        const forms = this.surfaces.get(term) ?? new Map<string, number>();
        forms.set(word, (forms.get(word) ?? 0) + 1);
        this.surfaces.set(term, forms);
      }
    }
  }

  search({ q, seccion, orden = 'relevancia', limite }: SearchInput): SearchResponse {
    const query = parseQuery(q);
    const { hits, corregido, parcial } = this.match(query);

    const facetas = Object.fromEntries(SEARCH_SECTIONS.map((s) => [s.id, 0])) as Record<
      SearchSection,
      number
    >;
    for (const hit of hits) facetas[this.doc(hit).seccion]++;

    const filtrados = seccion ? hits.filter((hit) => this.doc(hit).seccion === seccion) : hits;
    const ordenados =
      orden === 'recientes'
        ? [...filtrados].sort((a, b) =>
            (this.doc(b).fecha ?? '').localeCompare(this.doc(a).fecha ?? ''),
          )
        : filtrados;

    return {
      q,
      total: filtrados.length,
      facetas,
      resultados: ordenados.slice(0, limite).map((hit) => this.toHit(hit)),
      corregido,
      parcial,
    };
  }

  /** Temas ordenados por cantidad de notas y las notas más recientes. */
  explore(recientes = 3): SearchExplore {
    const notas = [...this.docs.values()].filter((d) => d.seccion === 'pensamiento' && d.fecha);

    const conteo = new Map<string, number>();
    for (const { tema } of notas) {
      if (tema) conteo.set(tema, (conteo.get(tema) ?? 0) + 1);
    }

    return {
      temas: [...conteo.entries()].sort((a, b) => b[1] - a[1]).map(([tema]) => tema),
      recientes: notas
        .sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? ''))
        .slice(0, recientes)
        .map((doc) => this.present(doc, new Set())),
    };
  }

  private doc(hit: SearchResult): IndexedDoc {
    return this.docs.get(hit.id as string)!;
  }

  private match(query: ParsedQuery) {
    const none = { hits: [] as SearchResult[], corregido: null, parcial: false };
    if (query.terms.length === 0) return none;

    const attempt = (options: SearchOptions) =>
      this.rank(
        this.index.search(query.terms.join(' '), {
          boost: FIELD_BOOST,
          combineWith: 'AND',
          processTerm: processQueryTerm,
          prefix: (term, i, terms) => query.prefijo && i === terms.length - 1 && term.length >= 2,
          ...options,
        }),
        query,
      );

    const exact = attempt({});
    if (exact.length > 0) return { ...none, hits: exact };

    const tolerant = attempt({ fuzzy: fuzziness });
    if (tolerant.length > 0) return { ...none, hits: tolerant, corregido: this.correct(query) };

    const any = attempt({ fuzzy: fuzziness, combineWith: 'OR' });
    return { ...none, hits: any, parcial: any.length > 0 && query.terms.length > 1 };
  }

  /** Descarta lo que no cumple las frases exactas y ajusta el orden por relevancia. */
  private rank(results: SearchResult[], { frases, literal, terms }: ParsedQuery): SearchResult[] {
    return results
      .filter((hit) => frases.every((frase) => this.doc(hit).plano.includes(frase)))
      .map((hit) => {
        const doc = this.doc(hit);
        let factor = recencyBoost(doc.fecha) * (doc.peso ?? 1);
        if (terms.length > 1 || doc.tituloPlano === literal) {
          if (doc.tituloPlano.includes(literal)) factor *= 2.5;
          else if (doc.plano.includes(literal)) factor *= 1.5;
        }
        return { ...hit, score: hit.score * factor };
      })
      .sort((a, b) => b.score - a.score);
  }

  /** Reescribe la consulta cambiando cada palabra desconocida por la más parecida. */
  private correct({ terms }: ParsedQuery): string | null {
    const fixed = terms.map((word) => {
      if (this.surfaces.has(termOf(word))) return word;
      const best = this.index.autoSuggest(word, {
        fuzzy: fuzziness,
        processTerm: processQueryTerm,
      })[0];
      return (best && this.surfaceOf(best.terms[0])) ?? word;
    });
    const result = fixed.join(' ');
    return normalizeText(result) === normalizeText(terms.join(' ')) ? null : result;
  }

  private surfaceOf(term: string | undefined): string | undefined {
    const forms = term ? this.surfaces.get(term) : undefined;
    if (!forms) return undefined;
    return [...forms.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  }

  private toHit(hit: SearchResult): SearchHit {
    return this.present(this.doc(hit), new Set(Object.keys(hit.match)));
  }

  private present(doc: SearchDoc, matched: ReadonlySet<string>): SearchHit {
    const resumen = doc.resumen ?? '';
    const texto = doc.texto ?? '';
    // Se prefiere el resumen; el cuerpo solo si es donde aparece lo buscado.
    const fuente = !resumen || (!mentions(resumen, matched) && mentions(texto, matched));

    return {
      id: doc.id,
      seccion: doc.seccion,
      url: doc.url,
      etiqueta: etiqueta(doc),
      titulo: highlight(doc.titulo, matched),
      fragmento: snippet(fuente ? texto : resumen, matched),
      imagen: doc.imagen ?? null,
    };
  }
}
