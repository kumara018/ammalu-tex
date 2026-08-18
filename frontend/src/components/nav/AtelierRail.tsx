'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { STORE } from '@/lib/config';
import { LogoMark } from '@/components/Logo';

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

/**
 * WHY THE SIX CATEGORY NAMES ARE NOT HERE ANY MORE.
 *
 * They were, inline, on every page. On the shelf — the one page where a
 * customer actually picks a category — the page ALSO renders those six names
 * as its filter, with an "All" reset and a live active state the rail could
 * never have. So the shelf showed Chudithar, Lehenga, Half Saree, Party
 * Wears, Tops and Crop Tops twice, sixty pixels apart, and the copy that
 * worked was the lower one.
 *
 * Duplicating a control does not make it twice as findable; it makes the page
 * look unfinished and makes a visitor wonder whether the two lists do
 * different things. The rail now carries the three destinations the site
 * actually has, and the categories live on the page that filters by them.
 */
const RAIL = [
  { href: '/products',  label: 'The shelf' },
  { href: '/authentic', label: 'Our word' },
  { href: '/support',   label: 'Help' },
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
        {/**
         * The stamp and the label.
         *
         * The name alone read as brand text — the lockup every storefront
         * has, a glyph in a circle beside a word. What makes a garment's
         * label an identity rather than a name is the second line: who made
         * it, and where. So the mark is a stitched stamp (components/Logo.tsx)
         * and the name carries "Texvalley · Erode" under it at rule size —
         * true, specific to this shop, and not mistakable for anyone else's.
         */}
        <Link
          href="/"
          aria-label={`${STORE.name} — home`}
          className="group flex shrink-0 items-center gap-3 self-center text-graphite transition-colors duration-500 hover:text-thread focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-thread"
        >
          <LogoMark size={32} className="shrink-0 text-thread transition-colors duration-500 group-hover:text-thread-deep" />
          {/* The name, and nothing under it.
              A strapline was tried here — the shop's location, set as a label
              line beneath the name. It made the lockup taller than the rail
              needed, it repeated what the footer already says, and a name that
              needs a caption to feel like a name is not yet a name. The
              distinctiveness has to live in the letterforms and the stamp, so
              it does: the mark is stitched, and the name is set in Instrument
              Serif at a size that reads as a signature rather than a label,
              with a thread rule that draws itself under it on approach. */}
          <span className="relative inline-block font-display text-[1.45rem] leading-none tracking-tight">
            {STORE.name}
            <span
              aria-hidden="true"
              className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-thread transition-transform duration-[520ms] ease-[cubic-bezier(0.22,0.61,0.24,1)] group-hover:scale-x-100 motion-reduce:transition-none"
            />
          </span>
        </Link>

        {/* Three destinations, not six duplicated filters — see RAIL above. */}
        <ul className="flex flex-1 items-baseline gap-x-7">
          {RAIL.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`border-b pb-1 text-caption uppercase transition-colors duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-thread ${
                  active(href)
                    ? 'border-thread text-thread'
                    : 'border-transparent text-graphite-muted hover:border-paper-edge hover:text-graphite'
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

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
