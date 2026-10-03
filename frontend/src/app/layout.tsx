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
import ScrollManager from '@/components/system/ScrollManager';
import ReturnPathRecorder from '@/components/system/ReturnPathRecorder';
import { STORE } from '@/lib/config';

export const metadata: Metadata = {
  /*
   * THE TAGLINE, NOT A DESCRIPTION OF THE STOCK.
   *
   * These titles read "Premium Women's Textiles" -- a phrase chosen because it is what somebody
   * types into a search box. The shop's own line is what it signs itself with
   * everywhere else: the header, the footer, the invoice, the mail masthead
   * and its WhatsApp messages. Having the browser tab and every shared link
   * introduce the shop by a different phrase than the shop itself uses was the
   * inconsistency the owner kept seeing, and consistency of name won.
   *
   * The location stays. "Texvalley Erode" is the part that helps somebody in
   * Erode find a shop in Erode, and it costs the tagline nothing to sit beside
   * it. The descriptions below still carry the categories in full, so what the
   * shop sells is still stated -- in the sentence written for that purpose
   * rather than in the name.
   */
  title: `${STORE.name} — ${STORE.tagline} | Texvalley Erode`,
  // Under 160 characters: Google cuts a longer one off mid-word in the result.
  description: 'Premium chudithar, tops, lehenga, crop tops & party wear at Ammalu Tex, Texvalley Gangapuram, Erode. 100% authentic, delivered across India.',
  keywords: 'Ammalu Tex, ammalu tex, ammalutex, textile shop Erode, Texvalley Gangapuram, chudithar, lehenga, tops, crop tops, party wear, women fashion, Erode textile, buy chudithar online, women clothing India',
  authors: [{ name: 'Ammalu Tex' }],
  creator: 'Ammalu Tex',
  publisher: 'Ammalu Tex',
  // The host the site is actually served from. The bare domain answers with a
  // redirect to www, so canonicals, og:url and the sitemap on the bare host all
  // pointed search engines at a redirect (SEO-10, October 2026 test pass).
  // No site-wide canonical: see app/(home)/layout.tsx.
  metadataBase: new URL('https://www.ammalutex.com'),
  openGraph: {
    title: `${STORE.name} — ${STORE.tagline}`,
    description: 'Shop Chudithar, Tops, Lehenga, Crop Tops & Party Wears at Ammalu Tex, Texvalley Gangapuram, Erode.',
    url: 'https://www.ammalutex.com',
    siteName: 'Ammalu Tex',
    locale: 'en_IN',
    type: 'website',
    // The picture a shared link shows on WhatsApp, Facebook and the rest.
    // Without one, every link to the shop previewed as bare text — and a
    // product with no photograph, which inherits this, did the same.
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'Ammalu Tex — Timeless fabrics. Thoughtful choices.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${STORE.name} — ${STORE.tagline}`,
    description: 'Shop Chudithar, Tops, Lehenga & more at Ammalu Tex, Texvalley Erode.',
    images: ['/og.jpg'],
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
        {/* Takes you to the top when you click through to the page you are
            already on — the masthead, a footer link, a shelf filter. Renders
            nothing; it is one listener on the document. */}
        <ScrollManager />
        <ReturnPathRecorder />
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
