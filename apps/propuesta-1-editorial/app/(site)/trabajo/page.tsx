import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';

import { parseMosaic } from '@mario/core/lib';
import { getExperiences, getProfile, getProjects, getSettings } from '@mario/database/queries';

import { Cover } from '@/components/cover';
import { ContactForm, Reveal } from '@/components/interactive';
import { WorkMosaic } from '@/components/work-mosaic';

export const metadata: Metadata = {
  title: 'Trabajo',
  description: 'Quién es Mario Cepeda a través de lo que hace: Página 10, Colombia Positiva y su propósito.',
};

export default async function TrabajoPage() {
  const [profile, projects, experiences, settings] = await Promise.all([
    getProfile(),
    getProjects(),
    getExperiences(),
    getSettings(),
  ]);
  const bio = profile.bio.replace(/^\[.*?\]\s*/, '');
  const mosaic = parseMosaic(settings);

  return (
    <main className="pb-24 pt-28 sm:pt-32">
      {/* Hero personal */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[0.55fr_0.45fr] lg:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">Trabajo</p>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-[1] sm:text-6xl">
              Lo que hago y por qué lo hago
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">{bio}</p>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-paper-2 shadow-lift">
            <Cover
              url={profile.foto_url}
              alt={`Retrato de ${profile.nombre}`}
              sizes="(max-width: 1024px) 100vw, 45vw"
              priority
            />
          </div>
        </div>
      </section>

      {/* Proyectos en zig-zag */}
      {projects.length > 0 ? (
        <section className="mx-auto mt-20 max-w-7xl px-5 sm:mt-28 sm:px-8">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">Proyectos</h2>
          </Reveal>
          <div className="mt-12 space-y-16 sm:space-y-24">
            {projects.map((project, i) => (
              <Reveal key={project.id}>
                <article className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
                  <div className={`relative aspect-[4/3] overflow-hidden rounded-card bg-paper-2 shadow-soft ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                    <Cover
                      url={project.imagen_url}
                      alt={project.titulo}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                  <div>
                    {project.subtitulo ? (
                      <p className="text-sm font-semibold uppercase tracking-widest text-accent">
                        {project.subtitulo}
                      </p>
                    ) : null}
                    <h3 className="mt-2 font-display text-3xl font-semibold">{project.titulo}</h3>
                    {project.descripcion ? (
                      <p className="mt-4 text-lg leading-relaxed text-ink-soft">
                        {project.descripcion}
                      </p>
                    ) : null}
                    {project.url ? (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 inline-flex items-center gap-2 font-semibold text-ink hover:text-accent"
                      >
                        Visitar <ArrowUpRight className="size-4" />
                      </a>
                    ) : null}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* Cita destacada */}
      <section className="mx-auto my-20 max-w-4xl px-5 sm:my-28 sm:px-8">
        <Reveal>
          <blockquote className="border-l-4 border-accent pl-6 font-display text-3xl font-medium italic leading-snug sm:text-4xl">
            «Creo en un periodismo cercano, que le devuelva la voz a las regiones.»
            <footer className="mt-4 text-base not-italic text-ink-muted">— {profile.nombre}</footer>
          </blockquote>
        </Reveal>
      </section>

      {/* Trayectoria */}
      {experiences.length > 0 ? (
        <section className="mx-auto max-w-4xl px-5 sm:px-8">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">Trayectoria</h2>
          </Reveal>
          <div className="mt-10 divide-y divide-line border-y border-line">
            {experiences.map((exp, i) => (
              <Reveal key={exp.id} delay={i * 0.05}>
                <div className="grid gap-2 py-7 sm:grid-cols-[0.28fr_0.72fr] sm:gap-8">
                  <p className="font-display text-lg text-accent">{exp.periodo}</p>
                  <div>
                    <h3 className="font-display text-2xl font-semibold">{exp.titulo}</h3>
                    {exp.organizacion ? (
                      <p className="mt-1 text-sm font-medium uppercase tracking-wide text-ink-muted">
                        {exp.organizacion}
                      </p>
                    ) : null}
                    {exp.descripcion ? (
                      <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">
                        {exp.descripcion}
                      </p>
                    ) : null}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* Mosaico / collage de imágenes */}
      {mosaic.length > 0 ? (
        <section className="mx-auto mt-20 max-w-7xl px-5 sm:mt-28 sm:px-8">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">En imágenes</h2>
          </Reveal>
          <div className="mt-10">
            <WorkMosaic images={mosaic} />
          </div>
        </section>
      ) : null}

      {/* CTA de contacto */}
      <section className="mx-auto mt-20 max-w-5xl px-5 sm:mt-28 sm:px-8">
        <Reveal>
          <h2 className="mb-10 font-display text-3xl font-semibold sm:text-4xl">Hablemos</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <ContactForm redes={profile.redes} />
        </Reveal>
      </section>
    </main>
  );
}
