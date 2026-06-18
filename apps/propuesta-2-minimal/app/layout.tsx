import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';

import { SITE_DEFAULTS } from '@mario/core/lib';
import { getSettings } from '@mario/database/queries';

import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = settings.seo_title || SITE_DEFAULTS.title;
  const description = settings.seo_description || SITE_DEFAULTS.description;
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3002';

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${mono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
