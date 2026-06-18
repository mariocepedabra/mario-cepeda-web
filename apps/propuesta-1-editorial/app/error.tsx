'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="max-w-md text-center">
        <p className="font-display text-6xl font-semibold text-accent">Ups</p>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
          Algo salió mal
        </h1>
        <p className="mt-2 text-ink-soft">
          Ocurrió un error al cargar esta sección. Inténtalo de nuevo.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-card bg-ink px-6 py-3 font-medium text-paper transition-colors hover:bg-accent"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
