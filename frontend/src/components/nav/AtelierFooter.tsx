'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { STORE } from '@/lib/config';

/**
 * The counter at the end of the room.
 *
 * WHAT IT REPLACES. A near-black slab with four columns of links, coloured
 * social tiles, a boxed "Store Timings" card and a paragraph of marketing about
 * being a trusted destination. Recolouring it — which is all that had been done
 * — left a dark block under a paper shop and changed nothing about its shape.
 *
 * A footer's real job is small: say where the shop is, how to reach it, and
 * where the policies live. Everything else was there because footers usually
 * have it. So the columns are three instead of four, the links are text
 * instead of tiles, and the marketing paragraph is gone — the address IS the
 * reassurance on a site selling clothes from a real counter in Erode.
 *
 * WHY IT IS DARK, AFTER BEING PAPER FOR ONE PASS. Set on muslin, it read as
 * the same surface as the page and the same surface as the header — the whole
 * site was one flat sheet with hairlines on it, which is under-designed rather
 * than restrained. The room has to end somewhere. Graphite gives the page a
 * floor, puts the wordmark on the strongest contrast available, and makes the
 * three zones — rail, paper, counter — read as three different places.
 *
 * The wordmark is set enormous and clipped at the baseline, the way a maker's
 * name is stamped into the selvedge at the end of a bolt: you see it when the
 * cloth runs out.
 */

const SHELF = ['Chudithar', 'Lehenga', 'Half Saree', 'Party Wears', 'Tops', 'Crop Tops'];

const POLICIES = [
  { href: '/shipping',     label: 'Shipping' },
  { href: '/cancellation', label: 'Cancellation, return & exchange' },
  { href: '/terms',        label: 'Terms' },
  { href: '/privacy',      label: 'Privacy' },
  { href: '/authentic',    label: 'Authenticity' },
  { href: '/support',      label: 'Help' },
];

export default function AtelierFooter() {
  const pathname = usePathname();
  // Auth screens are one focused card on an otherwise empty page. A footer
  // full of links there is an invitation to abandon signing in.
  if (pathname.startsWith('/auth')) return null;

  return (
    <footer className="relative z-10 overflow-hidden bg-graphite px-6 pb-0 pt-[9vh] text-paper/70 sm:px-10">
      {/* The measure, in thread, across the top edge — the counter's own rule. */}
      <div aria-hidden="true" className="mx-auto mb-[7vh] w-full max-w-[104rem] opacity-30">
        <svg viewBox="0 0 400 14" preserveAspectRatio="none" className="h-3.5 w-full text-paper">
          <line x1="0" y1="0.5" x2="400" y2="0.5" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          {Array.from({ length: 41 }, (_, i) => (
            <line key={i} x1={i * 10} y1="0" x2={i * 10} y2={i % 5 === 0 ? 9 : 4}
                  stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
      </div>

      <div className="mx-auto grid w-full max-w-[104rem] gap-x-12 gap-y-12 lg:grid-cols-12">

        <div className="lg:col-span-4">
          <p className="font-display text-band font-normal text-paper">{STORE.name}</p>
          <address className="mt-5 not-italic text-paper/70">
            {STORE.shopNo}<br />
            {STORE.area}<br />
            {STORE.city}, {STORE.state} {STORE.pincode}
          </address>
          <p className="mt-5 text-paper/45">
            {STORE.weekdays}<br />{STORE.weekend}
          </p>
        </div>

        <div className="lg:col-span-3">
          <h2 className="text-rule uppercase text-thread-pale">The shelf</h2>
          <ul className="mt-5 space-y-2.5">
            {SHELF.map((name) => (
              <li key={name}>
                <Link
                  href={`/products?category=${encodeURIComponent(name)}`}
                  className="text-paper/70 transition-colors duration-500 hover:text-thread-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread-pale"
                >
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h2 className="text-rule uppercase text-thread-pale">Good to know</h2>
          <ul className="mt-5 space-y-2.5">
            {POLICIES.map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className="text-paper/70 transition-colors duration-500 hover:text-thread-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread-pale"
                >
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-rule uppercase text-thread-pale">Speak to us</h2>
          <ul className="mt-5 space-y-2.5">
            <li>
              <a href={`tel:${STORE.phone1}`} className="text-paper/70 transition-colors duration-500 hover:text-thread-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread-pale">
                {STORE.phone1}
              </a>
            </li>
            <li>
              <a href={`tel:${STORE.phone2}`} className="text-paper/70 transition-colors duration-500 hover:text-thread-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread-pale">
                {STORE.phone2}
              </a>
            </li>
            <li>
              <a href={`mailto:${STORE.email}`} className="break-all text-paper/70 transition-colors duration-500 hover:text-thread-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread-pale">
                {STORE.email}
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${STORE.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-paper/70 transition-colors duration-500 hover:text-thread-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread-pale"
              >
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-[7vh] flex w-full max-w-[104rem] flex-wrap items-baseline justify-between gap-4 border-t border-paper/12 pt-7">
        <p className="text-caption uppercase text-paper/45">
          © {new Date().getFullYear()} {STORE.name}
        </p>
        <p className="text-caption uppercase text-paper/45">
          {STORE.area}, {STORE.city}
        </p>
      </div>

      {/* The maker's name stamped into the selvedge. Clipped at the baseline
          on purpose — you see it as the cloth runs out. aria-hidden because
          the name is already read above; this is texture, not content. */}
      <p
        aria-hidden="true"
        className="pointer-events-none mx-auto mt-[6vh] w-full max-w-[104rem] select-none translate-y-[0.22em] whitespace-nowrap font-display text-[clamp(4rem,17vw,15rem)] leading-[0.75] text-paper/[0.055]"
      >
        {STORE.name}
      </p>
    </footer>
  );
}
