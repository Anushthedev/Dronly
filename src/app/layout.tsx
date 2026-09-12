import type { Metadata, Viewport } from 'next';
import { Antonio, Inter } from 'next/font/google';

import { ScrollProvider } from '@/components/providers/ScrollProvider';
import { AerialStage } from '@/components/three/AerialStage';
import { Footer } from '@/components/ui/Footer';
import { Nav } from '@/components/ui/Nav';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { SITE } from '@/lib/site';

import './globals.css';

/**
 * fkGroteskNeue and fkScreamer are licensed faces. These are the substitutes
 * the reference system nominates — Inter for the grotesque, Antonio for the
 * condensed heavy display. Swapping in the real files later is a matter of
 * pointing `next/font/local` at them and keeping these variable names.
 */
const grotesk = Inter({
  subsets: ['latin'],
  variable: '--font-fkgroteskneue',
  display: 'swap',
});

const screamer = Antonio({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-fkscreamer',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://dronly.studio'),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    'drone videography',
    'event drone coverage',
    'real estate aerial photography',
    'aerial production studio',
  ],
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    type: 'website',
    locale: 'en_US',
    siteName: SITE.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
};

export const viewport: Viewport = {
  themeColor: '#08080a',
  colorScheme: 'dark light',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${grotesk.variable} ${screamer.variable}`}>
      <body>
        {/*
          Opaque ground behind everything. The 3D stage sits above this at
          -z-10 and below the document; with no JS at all, the sky sections
          still land on ink instead of on bare cream.
        */}
        <div aria-hidden="true" className="fixed inset-0 -z-20 bg-[#08080a]" />

        <ScrollProvider>
          <AerialStage />
          <Nav />
          <ScrollProgress />
          <main id="main">{children}</main>
          <Footer />
        </ScrollProvider>
      </body>
    </html>
  );
}
