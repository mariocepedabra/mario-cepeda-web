'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="glass max-w-md rounded-2xl p-8 text-center">
        <p className="font-display text-5xl font-bold text-gradient">Ups</p>
        <h1 className="mt-4 font-display text-2xl font-semibold">Algo salió mal</h1>
        <p className="mt-2 text-muted">Ocurrió un error al cargar esta sección.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-full bg-gradient-to-r from-accent to-accent-2 px-6 py-3 font-medium text-[#0b0b16] transition-opacity hover:opacity-90"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
