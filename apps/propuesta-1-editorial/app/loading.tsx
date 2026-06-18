export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <div className="text-center">
        <p className="font-display text-2xl font-semibold tracking-tight text-ink">
          Mario Cepeda
        </p>
        <div className="mx-auto mt-4 h-px w-24 animate-pulse bg-accent" />
        <p className="mt-3 text-sm uppercase tracking-widest text-ink-soft">Cargando…</p>
      </div>
    </div>
  );
}
