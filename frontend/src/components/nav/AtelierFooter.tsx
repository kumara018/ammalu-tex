'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { STORE } from '@/lib/config';
import { isAuthRoute } from '@/lib/routes';

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
 * A giant clipped wordmark was tried here — the maker's name stamped into the
 * selvedge — and removed. On a real screen it was not texture, it was a large
 * dead band of near-black below the last usable line, and on a phone it pushed
 * the actual footer content off the top of it. The name is already set at the
 * head of the first column; saying it again at 15rem was decoration paying for
 * itself in scroll distance.
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
  if (isAuthRoute(pathname)) return null;

  return (
    <footer className="relative z-10 overflow-hidden px-6 pb-[7vh] pt-[9vh] text-paper/75 sm:px-10">
      {/**
       * WHY THIS IS NOT A FLAT SLAB ANY MORE.
       *
       * It was one value — `bg-graphite`, #332722 — across the full width and
       * the full height, with text at 45–70% over it. Flat dark plus faded
       * text is the definition of dull: nothing in the whole block varies, so
       * the eye has nowhere to go and the counter reads as the page having
       * run out rather than as a room having an end.
       *
       * Three things fix it, and none of them is "use a brighter colour":
       *
       *   LIGHT. The ground is now lit from the top left, the way the shop is
       *   — a warm #402C25 falling to #1B100D at the base. It is the same
       *   family, so the palette is untouched; it simply has a direction now.
       *
       *   A GLOW. One very wide, very faint thread-coloured radial behind the
       *   first column, where the name sits. It is the lamp over the counter.
       *
       *   AN EDGE. A thread hairline across the top, brightest in the middle
       *   and fading at both ends — the woven edge where the paper stops and
       *   the counter starts. A hard 1px line at full strength would read as
       *   a border; this reads as light catching a fold.
       *
       * All three are painted, none animate, and the whole thing is two
       * absolutely-positioned divs behind content that was already there.
       */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(120% 90% at 18% 0%, rgba(193,135,111,0.16) 0%, rgba(193,135,111,0) 58%),' +
            'linear-gradient(168deg, #402C25 0%, #2C1D18 46%, #1B100D 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(to right, rgba(193,135,111,0) 0%, rgba(193,135,111,0.65) 30%, rgba(227,188,172,0.8) 50%, rgba(193,135,111,0.65) 70%, rgba(193,135,111,0) 100%)',
        }}
      />
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
          <address className="mt-5 not-italic text-paper/80">
            {STORE.shopNo}<br />
            {STORE.area}<br />
            {STORE.city}, {STORE.state} {STORE.pincode}
          </address>
          <p className="mt-5 text-paper/55">
            {STORE.weekdays}<br />{STORE.weekend}
          </p>
          {/* The map, under the address it belongs to.
              The sister shop has carried this since its footer was rebuilt and
              this one never did — which meant the only shop with a real
              counter in Texvalley was the one you could not find on a map. It
              sits with the address rather than under "speak to us": it is a
              location, not a way of reaching a person. */}
          <a
            href={STORE.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-block border-b border-paper/25 pb-0.5 text-paper/70 transition-colors duration-500 hover:border-thread-pale hover:text-thread-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread-pale"
          >
            Find us on the map
          </a>
        </div>

        <div className="lg:col-span-3">
          <h2 className="text-rule uppercase text-thread-pale/90">The shelf</h2>
          <ul className="mt-5 space-y-2.5">
            {SHELF.map((name) => (
              <li key={name}>
                <Link
                  href={`/products?category=${encodeURIComponent(name)}`}
                  className="text-paper/80 transition-colors duration-500 hover:text-thread-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread-pale"
                >
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h2 className="text-rule uppercase text-thread-pale/90">Good to know</h2>
          <ul className="mt-5 space-y-2.5">
            {POLICIES.map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className="text-paper/80 transition-colors duration-500 hover:text-thread-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread-pale"
                >
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-rule uppercase text-thread-pale/90">Speak to us</h2>
          <ul className="mt-5 space-y-2.5">
            <li>
              <a href={`tel:${STORE.phone1}`} className="text-paper/80 transition-colors duration-500 hover:text-thread-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread-pale">
                {STORE.phone1}
              </a>
            </li>
            <li>
              <a href={`tel:${STORE.phone2}`} className="text-paper/80 transition-colors duration-500 hover:text-thread-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread-pale">
                {STORE.phone2}
              </a>
            </li>
            <li>
              <a href={`mailto:${STORE.email}`} className="break-all text-paper/80 transition-colors duration-500 hover:text-thread-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread-pale">
                {STORE.email}
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${STORE.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-paper/80 transition-colors duration-500 hover:text-thread-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread-pale"
              >
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-[7vh] flex w-full max-w-[104rem] flex-wrap items-baseline justify-between gap-4 border-t border-paper/15 pt-7">
        <p className="text-caption uppercase text-paper/50">
          © {new Date().getFullYear()} {STORE.name}
        </p>
        <p className="text-caption uppercase text-paper/50">
          {STORE.area}, {STORE.city}
        </p>
      </div>

    </footer>
  );
}
