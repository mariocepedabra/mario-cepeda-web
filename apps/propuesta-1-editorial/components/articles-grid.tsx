'use client';

import * as React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

import type { Post } from '@mario/database';

import { PostCard } from './cards';
import { Reveal } from './interactive';

/** Cuántas notas se muestran antes de «Ver más» (3 filas × 3 columnas). */
const INITIAL = 9;

/**
 * Grilla de artículos con «Ver más / Ver menos»: muestra 3 filas (9 notas) y
 * despliega el resto con una animación escalonada suave. Mantiene una sola
 * grilla para que las columnas queden alineadas al expandir y contraer.
 */
export function ArticlesGrid({ posts }: { posts: Post[] }) {
  const reduce = useReducedMotion();
  const [expanded, setExpanded] = React.useState(false);

  const base = posts.slice(0, INITIAL);
  const extra = posts.slice(INITIAL);
  const hasMore = extra.length > 0;

  return (
    <div>
      <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {base.map((post, i) => (
          <Reveal key={post.id} delay={(i % 3) * 0.08}>
            <PostCard post={post} />
          </Reveal>
        ))}

        <AnimatePresence initial={false}>
          {expanded &&
            extra.map((post, i) =>
              reduce ? (
                <div key={post.id}>
                  <PostCard post={post} />
                </div>
              ) : (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5, delay: (i % 3) * 0.06, ease: [0.22, 1, 0.36, 1] },
                  }}
                  exit={{ opacity: 0, y: 12, transition: { duration: 0.25 } }}
                >
                  <PostCard post={post} />
                </motion.div>
              ),
            )}
        </AnimatePresence>
      </div>

      {hasMore ? (
        <div className="mt-14 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="group inline-flex items-center gap-2 rounded-full border border-ink px-7 py-3.5 font-semibold text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            {expanded ? 'Ver menos' : `Ver más (${extra.length})`}
            <ChevronDown
              className={`size-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      ) : null}
    </div>
  );
}
