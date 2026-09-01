import type { Metadata } from 'next';
import { Instrument_Serif, DM_Sans } from 'next/font/google';

/**
 * The atelier's two voices, and neither is the sister shop's.
 *
 * Instrument Serif is high-contrast and narrow — it reads like the name
 * stitched into a couture label, which is exactly the register a workroom
 * wants. DM Sans carries everything else: geometric, quiet, and legible at the
 * small annotated sizes this design leans on.
 *
 * Loaded through next/font, which SELF-HOSTS the files at build time. That is
 * not only a performance choice here: the Content-Security-Policy added in
 * next.config.js has no font CDN in `font-src`, so a <link> to Google would be
 * refused and the page would silently fall back to a system face.
 */
const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

const body = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { LoginPromptProvider } from '@/context/LoginPromptContext';
import { WishlistProvider } from '@/context/WishlistContext';
import NavGate, { ChromeGate } from '@/components/nav/NavGate';
import AtelierFooter from '@/components/nav/AtelierFooter';
import LoginPromptModal from '@/components/LoginPromptModal';
import PageTransition from '@/components/PageTransition';
import QueryProvider from '@/components/QueryProvider';
import ThreeProvider from '@/three/ThreeProvider';
import SiteToaster from '@/components/system/SiteToaster';
import ErrorReporting from '@/components/ErrorReporting';
import { STORE } from '@/lib/config';

export const metadata: Metadata = {
  title: `${STORE.name} — Premium Women's Textiles | Texvalley Erode`,
  description: 'Shop premium Chudithar, Tops, Lehenga, Crop Tops & Party Wears at Ammalu Tex. Located at Texvalley Gangapuram, Erode. Fast delivery across India. 100% authentic products.',
  keywords: 'Ammalu Tex, ammalu tex, ammalutex, textile shop Erode, Texvalley Gangapuram, chudithar, lehenga, tops, crop tops, party wear, women fashion, Erode textile, buy chudithar online, women clothing India',
  authors: [{ name: 'Ammalu Tex' }],
  creator: 'Ammalu Tex',
  publisher: 'Ammalu Tex',
  metadataBase: new URL('https://ammalutex.com'),
  alternates: { canonical: 'https://ammalutex.com' },
  openGraph: {
    title: 'Ammalu Tex — Premium Women\'s Textiles',
    description: 'Shop Chudithar, Tops, Lehenga, Crop Tops & Party Wears at Ammalu Tex, Texvalley Gangapuram, Erode.',
    url: 'https://ammalutex.com',
    siteName: 'Ammalu Tex',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Ammalu Tex — Premium Women\'s Textiles',
    description: 'Shop Chudithar, Tops, Lehenga & more at Ammalu Tex, Texvalley Erode.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    google: 'vdZpTkr1hRH3z7cLVbtyzehOWAEgqlJQLkwY14gEhUg',
  },
  icons: {
    icon: [{ url: '/logo-mark.png', type: 'image/png' }],
    shortcut: '/logo-mark.png',
    apple: '/logo-mark.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <head>
        <link rel="icon" type="image/png" href="/logo-mark.png?v=5" />
        <link rel="shortcut icon" href="/logo-mark.png?v=5" />
        <link rel="apple-touch-icon" href="/logo-mark.png?v=5" />
      </head>
      <body className="bg-paper text-graphite min-h-screen flex flex-col font-sans antialiased">
        {/* Notices what the React boundaries cannot: throws outside render —
            rejected promises from handlers, failed dynamic imports, anything
            that happens after the tree has already rendered. Until now this
            shop had no error boundary at all, so a crash showed the browser's
            own page and nobody here ever heard about it. */}
        <ErrorReporting />
        {/* The single persistent 3D canvas. Sits outside the providers and
            outside PageTransition so a route change never remounts it — the
            GL context, compiled shaders and uploaded textures survive
            navigation. Fixed at z-0; all real UI renders above it. */}
        <ThreeProvider />
        {/* Outermost data provider: the auth, cart and wishlist contexts all
            issue queries, so the client must exist above them. */}
        <QueryProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
            <LoginPromptProvider>
              {/* relative z-10: the canvas is position:fixed, which creates a
                  stacking context and would otherwise paint over static page
                  content. Everything a customer reads or clicks stays real
                  HTML, above the canvas. */}
              <div className="relative z-10 flex flex-col flex-1">
              <NavGate />
              <main className="flex-1"><PageTransition>{children}</PageTransition></main>
              <AtelierFooter />
              </div>
              {/* Cinematic overlays. Both sit above the canvas and below the
                  modals, and neither takes pointer events — the path to
                  checkout is never behind them. */}
                    {/* The ambient sound toggle is unmounted — see the
                        sister shop's layout for the reasoning. Short version:
                        a fixed bottom-left control on z-30 covers the footer's
                        first column on a phone, and a shop where somebody is
                        deciding whether to spend money does not open with
                        sound. The component stays in the tree so the decision
                        is one line to reverse. */}
              <LoginPromptModal />
              <SiteToaster />
            </LoginPromptProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
