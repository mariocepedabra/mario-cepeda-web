import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="max-w-md rounded-[2rem] border border-line bg-white/60 p-10 text-center shadow-sm">
        <p className="font-display text-7xl font-extrabold text-terra">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">Página no encontrada</h1>
        <p className="mt-2 text-muted">La página que buscas no existe o fue movida.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-terra px-6 py-3 font-bold text-white transition-transform hover:scale-105"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
