'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { STORE } from '@/lib/config';

/**
 * The rail — Ammalu Tex's navigation, and the structural opposite of the
 * sister shop's.
 *
 * Vijey Textile hides everything behind a full-screen Index that opens as an
 * event, because there buying is an occasion. This is a workroom: the tools a
 * tailor uses are on the wall within reach, all the time, and nothing has to
 * be opened to find them. So this is a thin rail that is always present and
 * never opens a panel. Its own source says so — that sentence is in Vijey's
 * OverlayNav, written when the two were separated on purpose, and this is the
 * other half of it finally built.
 *
 * WHAT IT REPLACES. A 737-line shop bar: a search field with a filled button,
 * a two-tier menu, "Sign In" and "Create Account" as competing buttons, a cart
 * tile with a count badge. All of it is the same chrome every storefront has,
 * and repainting it in the shop's colours — which is all that had been done —
 * left the site looking exactly as it did before, in beige.
 *
 * WHAT SURVIVES, AND WHY ONLY THIS. The mark, the six bolts, the bag, and the
 * way in. A shopper needs to know where they are, what is on the shelf, what
 * they are carrying, and who they are. Everything else was furniture.
 *
 * The rail is `sticky`, not `fixed`: the opening measures the viewport minus
 * the header, and a fixed rail would sit over the scene it is measuring
 * against.
 */

const BOLTS = [
  'Chudithar',
  'Lehenga',
  'Half Saree',
  'Party Wears',
  'Tops',
  'Crop Tops',
];

export default function AtelierRail() {
  const pathname = usePathname();
  const { count } = useCart();
  const { user } = useAuth();

  /**
   * The rule under the rail thickens once the page has moved.
   *
   * Not a shadow and not a colour change — on a paper ground a drop shadow
   * reads as a floating card, which is the opposite of a rail pinned to the
   * wall. One hairline going from the palest edge to thread is enough to say
   * "the page is beneath this now", and it is a single compositor-friendly
   * property.
   */
  const [moved, setMoved] = useState(false);
  /**
   * How far down the page we are, 0..1, drawn as a thread laid along the
   * bottom edge of the rail.
   *
   * A tailor pins a thread along a seam to mark how far the work has got.
   * That is the whole idea, and it is doing real work: on the long pages —
   * the policies, a product, the shelf — there is otherwise nothing telling
   * you whether you are near the end. A percentage would say the same thing
   * and look like a dashboard; a thread says it and belongs to the shop.
   *
   * scaleX on a transform, so it never triggers layout.
   */
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let pending = false;
    const measure = () => {
      pending = false;
      const doc = document.documentElement;
      const span = doc.scrollHeight - window.innerHeight;
      setMoved(window.scrollY > 8);
      setProgress(span > 0 ? Math.min(1, Math.max(0, window.scrollY / span)) : 0);
    };
    const onScroll = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const active = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header
      className={`sticky top-0 z-40 bg-paper/90 backdrop-blur-sm transition-[border-color] duration-500 ${
        moved ? 'border-b border-thread/40' : 'border-b border-paper-edge/60'
      }`}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex w-full max-w-[104rem] items-baseline gap-x-8 px-6 py-4 sm:px-10"
      >
        {/* The mark. Set in the display face at a size that reads as a name
            rather than a logo lockup — this shop signs its work. */}
        <Link
          href="/"
          className="shrink-0 font-display text-[1.35rem] leading-none tracking-tight text-graphite transition-colors duration-500 hover:text-thread focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-thread"
        >
          {STORE.name}
        </Link>

        {/* The shelf, inline. Six names, no dropdown — a dropdown hides six
            items behind one click and buys nothing. Hidden below `lg` where
            they would wrap into a second row; the bag and account stay. */}
        <ul className="hidden flex-1 items-baseline gap-x-6 lg:flex">
          {BOLTS.map((name) => (
            <li key={name}>
              <Link
                href={`/products?category=${encodeURIComponent(name)}`}
                className="text-caption uppercase text-graphite-muted transition-colors duration-500 hover:text-thread focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-thread"
              >
                {name}
              </Link>
            </li>
          ))}
        </ul>

        {/* On narrow screens the shelf collapses to one honest link rather
            than a hamburger that opens a copy of this list. */}
        <Link
          href="/products"
          className="flex-1 text-caption uppercase text-graphite-muted transition-colors duration-500 hover:text-thread lg:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-thread"
        >
          The shelf
        </Link>

        <div className="flex shrink-0 items-baseline gap-x-6">
          <Link
            href={user ? '/account' : '/auth/login'}
            className="text-caption uppercase text-graphite-muted transition-colors duration-500 hover:text-thread focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-thread"
          >
            {user ? (user.full_name?.split(' ')[0] ?? 'Account') : 'Sign in'}
          </Link>

          {/* The count is set in the accent and only appears when it is not
              zero. A badge reading "0" is a decoration pretending to be
              information. */}
          <Link
            href="/cart"
            className={`text-caption uppercase transition-colors duration-500 hover:text-thread focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-thread ${
              active('/cart') ? 'text-thread' : 'text-graphite-muted'
            }`}
          >
            Bag
            {count > 0 && (
              <span className="ml-2 tabular-nums text-thread">{count}</span>
            )}
          </Link>
        </div>
      </nav>

      {/* The thread, pinned along the seam. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-thread transition-transform duration-150 ease-out"
        style={{ transform: `scaleX(${progress})` }}
      />
    </header>
  );
}
