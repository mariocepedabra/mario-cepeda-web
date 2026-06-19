export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-accent font-display text-lg font-extrabold text-white">
          MC
        </div>
        <div className="mx-auto mt-5 h-1 w-24 animate-pulse rounded-full bg-accent" />
        <p className="mt-3 text-sm font-medium uppercase tracking-widest text-ink-soft">Cargando…</p>
      </div>
    </div>
  );
}
