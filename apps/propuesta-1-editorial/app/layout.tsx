import type { Metadata } from 'next';
import { Archivo, Fraunces } from 'next/font/google';

import { SITE_DEFAULTS } from '@mario/core/lib';
import { getProfile, getSettings } from '@mario/database/queries';

import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = settings.seo_title || SITE_DEFAULTS.title;
  const description = settings.seo_description || SITE_DEFAULTS.description;
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001';

  return {
    metadataBase: new URL(base),
    title: { default: title, template: `%s · ${SITE_DEFAULTS.name}` },
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'es_CO',
      siteName: SITE_DEFAULTS.name,
      images: settings.og_image ? [{ url: settings.og_image }] : undefined,
    },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();

  return (
    <html lang="es" className={`${fraunces.variable} ${archivo.variable}`}>
      <body className="antialiased">
        <SiteHeader brand={profile.nombre} />
        {children}
        <SiteFooter brand={profile.nombre} tagline={profile.titular} redes={profile.redes} />
      </body>
    </html>
  );
}
