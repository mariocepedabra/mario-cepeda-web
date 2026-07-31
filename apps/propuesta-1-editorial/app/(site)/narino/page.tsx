import type { Metadata } from 'next';
import Link from 'next/link';

import { parseBanners, type BannerPosition } from '@mario/core/lib';
import { getNarinoProfiles, getSettings } from '@mario/database/queries';

import { Cover } from '@/components/cover';
import { Reveal } from '@/components/interactive';
import { SectionBanners } from '@/components/section-banners';

export const metadata: Metadata = {
  title: 'Nariño',
  description: 'Gente, lugares y tradiciones de Nariño: el Carnaval, el Galeras y la gente admirable de la región.',
};

export default async function NarinoPage() {
  const [profiles, settings] = await Promise.all([getNarinoProfiles(), getSettings()]);
  const banners = parseBanners(settings, 'narino');
  const bannersAt = (pos: BannerPosition) =>
    banners.filter((b) => b.pos === pos).map((b) => b.url);

  // El <main> ocupa TODO el ancho para que los banners lleguen de borde a borde;
  // cada bloque de contenido se centra en su propio contenedor `max-w-7xl`.
  return (
    <main className="pb-24 pt-32 sm:pt-40">
      {/* Banner de cabecera (a sangre completa), antes del título. */}
      <SectionBanners urls={bannersAt('header')} className="mb-12 sm:mb-16" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <header className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">Nariño</p>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-[1] sm:text-6xl">
              Orgullo de su tierra
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-ink-soft">
              Personas admirables, lugares y tradiciones que hacen grande a Nariño: el Carnaval de
              Negros y Blancos, el Galeras y la gente que sostiene su cultura.
            </p>
          </header>
        </Reveal>
      </div>

      {/* Banner sobre el contenido (a sangre completa). */}
      <SectionBanners urls={bannersAt('above')} className="mt-12 sm:mt-16" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {profiles.length === 0 ? (
          <p className="py-20 text-lg italic text-ink-soft">Próximamente.</p>
        ) : (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile, i) => (
              <Reveal key={profile.id} delay={(i % 3) * 0.08}>
                <Link href={`/narino/${profile.slug}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-paper-2 shadow-soft">
                    <Cover
                      url={profile.foto_url}
                      alt={profile.nombre}
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h2 className="mt-4 font-display text-2xl font-semibold leading-tight group-hover:text-accent">
                    {profile.nombre}
                  </h2>
                  {profile.lugar ? (
                    <p className="mt-1 text-sm font-medium uppercase tracking-widest text-ink-muted">
                      {profile.lugar}
                    </p>
                  ) : null}
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>

      {/* Banner bajo el contenido y banner de pie (a sangre completa). */}
      <SectionBanners urls={bannersAt('below')} className="mt-16 sm:mt-20" />
      <SectionBanners urls={bannersAt('footer')} className="mt-16 sm:mt-20" />
    </main>
  );
}
