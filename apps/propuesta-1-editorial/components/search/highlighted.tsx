import type { Segment } from '@/lib/search/types';

/** Pinta un texto con las palabras buscadas marcadas con el resaltador de la marca. */
export function Highlighted({ segments }: { segments: Segment[] }) {
  return (
    <>
      {segments.map((segment, i) =>
        segment.m ? (
          <mark key={i} className="mark-highlight bg-transparent text-inherit">
            {segment.t}
          </mark>
        ) : (
          segment.t
        ),
      )}
    </>
  );
}
