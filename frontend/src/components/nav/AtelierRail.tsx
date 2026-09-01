'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import HelpMenu from '@/components/nav/HelpMenu';
import { useCart } from '@/context/CartContext';
import { STORE } from '@/lib/config';
import { LogoMark } from '@/components/Logo';
import AccountMenu from '@/components/nav/AccountMenu';
import RailSearch from '@/components/nav/RailSearch';
import DeliverTo from '@/components/home/DeliverTo';
import ContactMenu from '@/components/nav/ContactMenu';

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
/* Help has left this list — it is a dropdown now (nav/HelpMenu.tsx), because
   it pointed at one long document and a customer wanting the postage charge
   had to load it and hunt for the line. The two that remain are single
   destinations, which is what a rail link should be. */
const RAIL = [
  { href: '/products',  label: 'The shelf' },
  { href: '/authentic', label: 'Our word' },
];

export default function AtelierRail() {
  const pathname = usePathname();
  const { count } = useCart();

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
      {/**
       * THE RAIL ON A NARROW WALL.
       *
       * This was one flex row with no responsive treatment of any kind, and on
       * a phone it broke in the way that is easy to miss on a laptop: the mark
       * and the actions are `shrink-0`, so the only thing that could give was
       * the list of destinations. It gave by wrapping inside itself — "THE /
       * SHELF", "OUR / WORD" stacked two words tall — and the row still
       * overflowed, carrying SIGN IN and BAG off the right edge of the screen
       * where nobody could reach them. The sister shop was fine because it
       * hides its navigation behind an Index button; this one has none.
       *
       * The fix is not a hamburger. This file's first paragraph is a promise
       * that the rail is always present and never opens a panel — a workroom
       * wall where the tools stay in reach — and putting three links behind a
       * button to save 90px would quietly break that promise on the one device
       * most customers actually use.
       *
       * A narrow wall does not make a tailor hide the tools. It makes the rail
       * two rows. So: the mark and the actions share the top row, the three
       * destinations get their own row beneath, and everything stays visible
       * and tappable. At `md` and up it collapses back to the single row it
       * always was.
       *
       * `items-center` rather than `items-baseline` on that single row is the
       * other half of this. Baseline alignment measured the small-caps links
       * against the baseline of a 1.45rem wordmark, which sat them visibly low
       * in the bar. Centred, they sit where the eye expects them.
       */}
      <nav
        aria-label="Main"
        className="mx-auto flex w-full max-w-[104rem] flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4 md:flex-nowrap sm:px-10"
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
          className="group order-1 flex shrink-0 items-center gap-3 self-center text-graphite transition-colors duration-500 hover:text-thread focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-thread"
        >
          <LogoMark size={32} className="shrink-0 text-thread transition-colors duration-500 group-hover:text-thread-deep" />
          {/* THE NAME, AND THE SHOP'S OWN LINE UNDER IT.
              A strapline was tried here once and removed: it was the shop's
              LOCATION, it repeated what the footer already says, and a name
              needing a caption to feel like a name is not yet a name. All true
              of that line.
              A tagline is a different object. "Timeless fabrics. Thoughtful
              choices." is not explaining the name — it is the sentence the shop
              signs itself with, and it is what the owner's own artwork sets
              beneath it. So it returns, at rule size in the accent, and only
              from `sm` up: on a phone the rail needs its width for the actions,
              and the mark and the name are the identity there. */}
          {/* A shade smaller on a phone, so the top row has room for the
              actions without the name reaching for the middle of the screen. */}
        <span className="flex flex-col">
          <span className="relative inline-block font-display text-[1.2rem] leading-none tracking-tight sm:text-[1.45rem]">
            {STORE.name}
            <span
              aria-hidden="true"
              className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-thread transition-transform duration-[520ms] ease-[cubic-bezier(0.22,0.61,0.24,1)] group-hover:scale-x-100 motion-reduce:transition-none"
            />
          </span>
          {/* `mt-2` clears the rule that draws itself under the name on hover;
              at `mt-1` the two collided. Hidden below `sm` — see the note above. */}
          <span className="mt-2 hidden text-[0.55rem] uppercase leading-none tracking-[0.19em] text-thread-deep sm:block">
            {STORE.tagline}
          </span>
        </span>
        </Link>

        {/* Three destinations, not six duplicated filters — see RAIL above.
            `order-last` puts this on the second row on a phone (it is the
            widest of the three groups, so it is the one that gets the row);
            `md:order-none` restores the middle position on a wide rail. */}
        {/* `basis-full`, not `w-full`. `flex-1` is shorthand for
            `flex: 1 1 0%` — it sets flex-basis to 0, which overrides `w-full`
            for a flex item, so the row never actually broke. It only LOOKED
            right on a narrow phone, where the row was overflowing and wrapped
            for a different reason entirely. `basis-full` is flex-basis:100%,
            which genuinely forces its own line. */}
        <ul className="order-3 flex basis-full items-center gap-x-7 md:order-2 md:flex-1 md:basis-auto">
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
          {/* Same row, same type, but a control rather than a destination. */}
          <li><HelpMenu /></li>
        </ul>

        {/**
          * EXPLICIT ORDER ON ALL THREE, NOT `order-last` PLUS AN OVERRIDE.
          *
          * The first version gave the destinations `order-last md:order-none`
          * and left the mark and actions unordered. On a phone that worked; at
          * tablet width the override did not take, and the rail rendered as
          * mark → SIGN IN, BAG → THE SHELF, OUR WORD, HELP, with the
          * navigation stranded to the right of the actions.
          *
          * Numbering all three removes the guess. 1-3-2 on a phone puts the
          * destinations on their own second row; 1-2-3 from `md` up is the
          * single row reading mark, destinations, actions.
          *
          * `ml-auto` still pins the actions right on the phone's top row,
          * where nothing sits between them and the mark.
          */}
        <div className="order-2 ml-auto flex shrink-0 items-center gap-x-6 md:order-3">
          {/* The glass is the field — see components/nav/RailSearch.tsx. */}
          <RailSearch />

          {/* The name was a plain link to /account. It opens a menu now —
              see components/nav/AccountMenu.tsx. */}
          <AccountMenu />

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

      {/**
        * WHERE THIS ORDER IS GOING, IN THE HEADER.
        *
        * It sat in the homepage hero, which meant it existed on exactly one
        * page — and the question "do you deliver to me" is one a customer has
        * on the shelf and at the product just as much as at the door. Amazon
        * keeps it in the header for that reason, and it was asked for there.
        *
        * Its own thin line under the rail rather than crammed into the row
        * above: that row is already carrying the mark, three destinations, the
        * glass, the account and the bag, and on a phone it is two rows before
        * this is added.
        */}
      <div className="border-t border-paper-edge/60 bg-paper/90">
        <div className="mx-auto flex w-full max-w-[104rem] items-center justify-between gap-6 px-6 py-1.5 sm:px-10">
          <DeliverTo />
          {/* Contact us, on every page — see nav/ContactMenu.tsx. The numbers
              were only in the footer, several screens down, which is where a
              question that could have become an order goes to die. */}
          <ContactMenu />
        </div>
      </div>

      {/* The thread, pinned along the seam. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-thread transition-transform duration-150 ease-out"
        style={{ transform: `scaleX(${progress})` }}
      />
    </header>
  );
}
