import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="max-w-md text-center">
        <p className="font-display text-7xl font-extrabold text-accent">404</p>
        <h1 className="mt-4 font-display text-3xl font-bold text-ink">Página no encontrada</h1>
        <p className="mt-2 text-ink-soft">La página que buscas no existe o fue movida.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-ink"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
