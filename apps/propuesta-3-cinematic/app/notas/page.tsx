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
      <main className="mx-auto min-h-screen max-w-6xl px-5 pb-24 pt-32 sm:px-8">
        <header className="border-b border-line pb-8">
          <p className="font-display text-sm uppercase tracking-[0.3em] text-accent-2">Archivo</p>
          <h1 className="mt-4 font-display text-5xl font-bold tracking-tight sm:text-6xl">
            <span className="text-gradient">Notas y columnas</span>
          </h1>
        </header>

        {posts.length === 0 ? (
          <p className="py-20 text-center text-muted">Aún no hay notas publicadas.</p>
        ) : (
          <div className="grid gap-6 py-12 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        <Link href="/" className="font-display font-semibold text-accent-2 hover:text-accent">
          ← Volver al inicio
        </Link>
      </main>
      <Footer profile={profile} />
    </>
  );
}
