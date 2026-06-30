import { siteText } from '@mario/core/lib';
import { getProfile, getSettings } from '@mario/database/queries';

import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { NewsletterTracker } from '@/components/newsletter-tracker';

/**
 * Layout de la web pública: añade el header y el footer del sitio.
 * El panel `/admin` queda fuera de este grupo y no hereda esta envoltura.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [profile, content] = await Promise.all([getProfile(), getSettings()]);

  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-2.5 focus:font-semibold focus:text-paper"
      >
        Saltar al contenido
      </a>
      <SiteHeader
        brand={profile.nombre}
        navMedia={profile.nav_media}
        navText={profile.nav_text}
      />
      <div id="contenido" tabIndex={-1} className="outline-none">
        {children}
      </div>
      <SiteFooter
        brand={profile.nombre}
        tagline={profile.titular}
        redes={profile.redes}
        newsletterTitle={siteText(content, 'newsletter.title')}
        newsletterDescription={siteText(content, 'newsletter.description')}
      />
      <NewsletterTracker />
    </>
  );
}
