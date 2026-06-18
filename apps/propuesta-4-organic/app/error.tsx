'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="max-w-md rounded-[2rem] border border-line bg-white/60 p-8 text-center shadow-sm">
        <p className="font-display text-5xl font-extrabold text-terra">Ups</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">Algo salió mal</h1>
        <p className="mt-2 text-muted">Ocurrió un error al cargar esta sección.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-full bg-terra px-6 py-3 font-bold text-white transition-transform hover:scale-105"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
