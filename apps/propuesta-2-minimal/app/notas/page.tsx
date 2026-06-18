import type { Metadata } from 'next';
import Link from 'next/link';

import { getPosts, getProfile } from '@mario/database/queries';

import { Navbar } from '@/components/interactive';
import { Footer, PostCard } from '@/components/sections';

export const metadata: Metadata = {
  title: 'Notas y columnas',
  description: 'Artículos, columnas y opinión de Mario Cepeda.',
};

export default async function NotasPage() {
  const [posts, profile] = await Promise.all([getPosts(), getProfile()]);

  return (
    <>
      <Navbar name={profile.nombre} />
      <main className="mx-auto min-h-screen max-w-screen-xl px-6 pb-24 pt-36 lg:px-10">
        <header className="border-b border-line pb-8">
          <p className="font-mono text-sm uppercase tracking-[0.2em] text-accent">Archivo</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">Notas</h1>
        </header>

        {posts.length === 0 ? (
          <p className="py-20 text-center text-muted">Aún no hay notas publicadas.</p>
        ) : (
          <div className="grid gap-12 py-12 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        <Link href="/" className="text-sm font-medium hover:text-accent">
          ← Volver al inicio
        </Link>
      </main>
      <Footer profile={profile} />
    </>
  );
}
