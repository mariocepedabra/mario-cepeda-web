import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="max-w-md text-center">
        <p className="text-7xl font-semibold tracking-tight text-accent">404</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Página no encontrada</h1>
        <p className="mt-2 text-muted">La página que buscas no existe o fue movida.</p>
        <Link
          href="/"
          className="mt-6 inline-block bg-fg px-6 py-3 text-sm font-medium text-bg transition-colors hover:bg-accent"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
