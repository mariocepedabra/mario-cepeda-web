export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <div className="text-center">
        <div className="mx-auto size-12 animate-bounce rounded-full bg-terra" />
        <p className="mt-4 font-display text-xl font-bold text-ink">Mario Cepeda</p>
        <p className="mt-1 text-sm text-muted">Cargando…</p>
      </div>
    </div>
  );
}
