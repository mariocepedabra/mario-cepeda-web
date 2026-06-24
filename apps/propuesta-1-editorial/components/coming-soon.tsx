import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/**
 * Marcador de posición para secciones aún no construidas.
 * Las maquetaciones completas llegan en una fase posterior del rediseño.
 */
export function ComingSoon({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <main className="mx-auto flex min-h-[72vh] max-w-7xl flex-col px-5 pb-28 pt-36 sm:px-8 sm:pt-44">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
        {eyebrow}
      </p>
      <h1 className="mt-4 font-display text-5xl font-semibold leading-[1] sm:text-6xl">
        {title}
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">{description}</p>

      <div className="mt-10 inline-flex w-fit items-center gap-2 rounded-card border border-line bg-paper-2 px-5 py-3 text-ink-muted shadow-soft">
        <span className="size-2 rounded-full bg-accent" aria-hidden />
        Esta sección estará disponible próximamente.
      </div>

      <Link
        href="/"
        className="mt-12 inline-flex items-center gap-2 font-display text-lg font-semibold hover:text-accent"
      >
        <ArrowLeft className="size-5" />
        Volver al inicio
      </Link>
    </main>
  );
}
