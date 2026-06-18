export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="text-center">
        <p className="font-display text-2xl font-semibold text-gradient">Mario Cepeda</p>
        <div className="mx-auto mt-4 h-1 w-32 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-accent to-accent-2" />
        </div>
        <p className="mt-3 text-sm text-muted">Cargando…</p>
      </div>
    </div>
  );
}
