'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="max-w-md text-center">
        <p className="font-mono text-sm uppercase tracking-widest text-accent">Error</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Algo salió mal</h1>
        <p className="mt-2 text-muted">Ocurrió un error al cargar esta sección.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 bg-fg px-6 py-3 text-sm font-medium text-bg transition-colors hover:bg-accent"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
