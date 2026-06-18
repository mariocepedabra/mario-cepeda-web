import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="glass max-w-md rounded-2xl p-10 text-center">
        <p className="font-display text-7xl font-bold text-gradient">404</p>
        <h1 className="mt-4 font-display text-2xl font-semibold">Página no encontrada</h1>
        <p className="mt-2 text-muted">La página que buscas no existe o fue movida.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-gradient-to-r from-accent to-accent-2 px-6 py-3 font-medium text-[#0b0b16] transition-opacity hover:opacity-90"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
