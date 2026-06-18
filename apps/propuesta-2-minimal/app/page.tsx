import {
  getAwards,
  getExperiences,
  getLinks,
  getPosts,
  getPress,
  getProfile,
  getVideos,
} from '@mario/database/queries';

import { ContactForm, Navbar, Reveal } from '@/components/interactive';
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
      <Navbar name={profile.nombre} />
      <main>
        <Hero profile={profile} />
        <About profile={profile} />
        <Timeline experiences={experiences} />
        <PostsPreview posts={posts.slice(0, 4)} />
        <PressSection press={press} />
        <Multimedia videos={videos} />
        <LinksSection links={links} />
        <Awards awards={awards} />

        <section id="contacto" className="scroll-mt-24 border-t border-line">
          <div className="mx-auto max-w-screen-xl px-6 py-20 lg:px-10 lg:py-28">
            <div className="grid gap-8 lg:grid-cols-12">
              <Reveal className="lg:col-span-3">
                <div className="flex items-baseline gap-3 lg:flex-col lg:items-start lg:gap-2">
                  <span className="font-mono text-sm text-accent">08</span>
                  <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-muted">
                    Contacto
                  </h2>
                </div>
              </Reveal>
              <div className="lg:col-span-9">
                <Reveal>
                  <ContactForm redes={profile.redes} />
                </Reveal>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer profile={profile} />
    </>
  );
}
