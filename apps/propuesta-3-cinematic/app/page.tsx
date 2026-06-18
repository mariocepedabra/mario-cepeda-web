import {
  getAwards,
  getExperiences,
  getLinks,
  getPosts,
  getPress,
  getProfile,
  getVideos,
} from '@mario/database/queries';

import { ContactForm, Navbar, Reveal, ScrollProgress } from '@/components/interactive';
import {
  About,
  Awards,
  Footer,
  Hero,
  LinksSection,
  Multimedia,
  PostsPreview,
  PressSection,
  Timeline,
} from '@/components/sections';

export default async function HomePage() {
  const [profile, experiences, posts, press, videos, links, awards] = await Promise.all([
    getProfile(),
    getExperiences(),
    getPosts(),
    getPress(),
    getVideos(),
    getLinks(),
    getAwards(),
  ]);

  return (
    <>
      <ScrollProgress />
      <Navbar name={profile.nombre} />
      <main>
        <Hero profile={profile} />
        <About profile={profile} />
        <Timeline experiences={experiences} />
        <PostsPreview posts={posts.slice(0, 3)} />
        <PressSection press={press} />
        <Multimedia videos={videos} />
        <LinksSection links={links} />
        <Awards awards={awards} />

        <section id="contacto" className="relative scroll-mt-24 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <Reveal>
              <header className="mb-12">
                <span className="font-display text-sm font-medium tracking-widest text-accent">
                  08
                </span>
                <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  Contacto
                </h2>
              </header>
            </Reveal>
            <Reveal delay={0.1}>
              <ContactForm redes={profile.redes} />
            </Reveal>
          </div>
        </section>
      </main>
      <Footer profile={profile} />
    </>
  );
}
