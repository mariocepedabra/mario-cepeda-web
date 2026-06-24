import { getProfile } from '@mario/database/queries';

import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

/**
 * Layout de la web pública: añade el header y el footer del sitio.
 * El panel `/admin` queda fuera de este grupo y no hereda esta envoltura.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();

  return (
    <>
      <SiteHeader brand={profile.nombre} />
      {children}
      <SiteFooter brand={profile.nombre} tagline={profile.titular} redes={profile.redes} />
    </>
  );
}
