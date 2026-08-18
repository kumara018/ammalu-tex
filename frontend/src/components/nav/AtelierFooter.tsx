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
 * have it. So this is set on muslin rather than black, the columns are three
 * instead of four, the links are text instead of tiles, and the marketing
 * paragraph is gone — the address IS the reassurance on a site selling clothes
 * from a real counter in Erode.
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
    <footer className="relative z-10 border-t border-paper-edge bg-paper-shade px-6 py-[9vh] sm:px-10">
      <div className="mx-auto grid w-full max-w-[104rem] gap-x-12 gap-y-12 lg:grid-cols-12">

        <div className="lg:col-span-4">
          <p className="font-display text-band font-normal text-graphite">{STORE.name}</p>
          <address className="mt-5 not-italic text-graphite-muted">
            {STORE.shopNo}<br />
            {STORE.area}<br />
            {STORE.city}, {STORE.state} {STORE.pincode}
          </address>
          <p className="mt-5 text-graphite-faint">
            {STORE.weekdays}<br />{STORE.weekend}
          </p>
        </div>

        <div className="lg:col-span-3">
          <h2 className="text-rule uppercase text-graphite-faint">The shelf</h2>
          <ul className="mt-5 space-y-2.5">
            {SHELF.map((name) => (
              <li key={name}>
                <Link
                  href={`/products?category=${encodeURIComponent(name)}`}
                  className="text-graphite-muted transition-colors duration-500 hover:text-thread focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread"
                >
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h2 className="text-rule uppercase text-graphite-faint">Good to know</h2>
          <ul className="mt-5 space-y-2.5">
            {POLICIES.map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className="text-graphite-muted transition-colors duration-500 hover:text-thread focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread"
                >
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-rule uppercase text-graphite-faint">Speak to us</h2>
          <ul className="mt-5 space-y-2.5">
            <li>
              <a href={`tel:${STORE.phone1}`} className="text-graphite-muted transition-colors duration-500 hover:text-thread focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread">
                {STORE.phone1}
              </a>
            </li>
            <li>
              <a href={`tel:${STORE.phone2}`} className="text-graphite-muted transition-colors duration-500 hover:text-thread focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread">
                {STORE.phone2}
              </a>
            </li>
            <li>
              <a href={`mailto:${STORE.email}`} className="break-all text-graphite-muted transition-colors duration-500 hover:text-thread focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread">
                {STORE.email}
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${STORE.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-graphite-muted transition-colors duration-500 hover:text-thread focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread"
              >
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-[7vh] flex w-full max-w-[104rem] flex-wrap items-baseline justify-between gap-4 border-t border-paper-edge pt-7">
        <p className="text-caption uppercase text-graphite-faint">
          © {new Date().getFullYear()} {STORE.name}
        </p>
        <p className="text-caption uppercase text-graphite-faint">
          {STORE.area}, {STORE.city}
        </p>
      </div>
    </footer>
  );
}
