import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="max-w-md text-center">
        <p className="font-display text-7xl font-semibold text-accent">404</p>
        <h1 className="mt-4 font-display text-3xl font-semibold text-ink">Página no encontrada</h1>
        <p className="mt-2 text-ink-soft">La página que buscas no existe o fue movida.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-card bg-ink px-6 py-3 font-medium text-paper transition-colors hover:bg-accent"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
