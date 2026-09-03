'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { productsAPI } from '@/lib/api';
import { STORE } from '@/lib/config';
import type { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import Reveal from '@/components/home/Reveal';
import BoltRow from '@/components/home/BoltRow';
import MeasureRule from '@/components/home/MeasureRule';
import { dyeFor } from '@/lib/dyes';
import GarmentSlide from '@/components/home/GarmentSlide';

/**
 * The Atelier — Ammalu Tex's homepage.
 *
 * WHY THIS EXISTS AT ALL. The 3D platform for this shop was built and mounted
 * — `ThreeProvider` is in the root layout, `/` routes to the `atelier` scene,
 * and the canvas has been rendering a workroom in window light this whole time.
 * Nobody could see it. This page sat on top of it in the old maroon design,
 * fully opaque, so the room behind was painted every frame and covered every
 * frame. The complaint that the site "still shows the same old design, no 3D"
 * was exactly right, and it was a layering problem rather than a missing one.
 *
 * So the DOM is now built to let the room through: no page-wide background, a
 * ground that comes from the body, and copy that occupies the frame rather than
 * filling it.
 *
 * WHY IT LOOKS NOTHING LIKE THE SISTER SHOP. Vijey Textile is a dark heirloom
 * room at night — near-black ground, brass used sparingly enough to still read
 * as metal, one enormous serif sentence. Ammalu Tex is a tailoring workroom in
 * daylight. Same architecture, opposite world: paper ground, graphite type, a
 * single terracotta thread as the only accent, and a scale that annotates
 * rather than announces. The palette is taken from the scene's own values so
 * the page and the canvas are one room instead of two.
 *
 * WHAT IS GONE, AND WHY. The six-tile category grid, the offers carousel with
 * emoji, the trust-badge row. Those are conversion furniture from a different
 * kind of shop; here the structure carries the argument. Categories are bolts
 * on a shelf, because that is how the stock actually sits.
 */

const unwrap = (raw: unknown): Product[] =>
  Array.isArray(raw)
    ? raw
    : ((raw as { products?: Product[] })?.products ??
       (raw as { items?: Product[] })?.items ??
       (raw as { data?: Product[] })?.data ??
       []);

/**
 * The shelf. Names are the shop's real categories — they must keep matching
 * what `/products?category=` filters on, so these strings are not decorative.
 */
/**
 * The shelf, and the dye each bolt is finished in.
 *
 * The dye is not chosen for contrast against the row above it — it is the
 * colour that category is actually most often dyed. See the dye box in
 * tailwind.config.js for why these six and no others.
 */
/* One line per bolt. These were 80–92 characters of prose each, six of them
   stacked down the homepage — a paragraph per category between a customer and
   the shelf. The names and the dyes carry it. */
const BOLTS = [
  { index: '01', name: 'Chudithar',   note: 'Every day',      dye: dyeFor('Chudithar').band,      copy: 'Cotton and silk, for a working day.' },
  { index: '02', name: 'Lehenga',     note: 'The occasion',   dye: dyeFor('Lehenga').band,      copy: 'Weight, drape, and a hem that holds its line.' },
  { index: '03', name: 'Half Saree',  note: 'The ceremony',   dye: dyeFor('Half Saree').band,    copy: 'For the ceremony, and the photographs after it.' },
  { index: '04', name: 'Party Wears', note: 'For the room',   dye: dyeFor('Party Wears').band,         copy: 'Colour that survives a camera flash.' },
  { index: '05', name: 'Tops',        note: 'The everyday',   dye: dyeFor('Tops').band,   copy: 'Worn on their own, or under everything else.' },
  { index: '06', name: 'Crop Tops',   note: 'Newer cuts',     dye: dyeFor('Crop Tops').band, copy: 'Shorter lines, same cloth as the rest of the shelf.' },
];

export default function HomePage() {
  const featured = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => (await productsAPI.getAll({ featured: true, limit: 6 })).data,
    staleTime: 60_000,
  });
  const recent = useQuery({
    queryKey: ['products', 'recent'],
    queryFn: async () => (await productsAPI.getAll({ sort_by: 'created_at', sort_order: 'desc', limit: 6 })).data,
    staleTime: 60_000,
  });

  const featuredItems = useMemo(() => unwrap(featured.data), [featured.data]);
  const recentItems = useMemo(() => unwrap(recent.data), [recent.data]);

  return (
    // No background on this wrapper, deliberately. The body paints the ground
    // and the canvas sits behind it at z-0; anything opaque here covers the
    // atelier while still costing every draw call to render it.
    <div className="text-graphite">

      {/* ═══ I. The window ═══════════════════════════════════════════════
          The opening. One line, the shop's own address under it, and
          nothing else competing for the frame — the room behind is the
          image. */}
      {/* min-h subtracts the header rather than assuming a full viewport. The
          navigation is IN FLOW here, not fixed, so `100svh` pushed the closing
          call to action below the fold — the screenshot showed the headline
          running off the bottom edge with nothing under it. */}
      {/* A BAND, NOT A SCREEN. This filled the viewport, so a customer met a
          sentence and had to scroll before seeing anything they could buy —
          "product should be visible in homepage mainly not down". */}
      {/**
        * NO RESERVED EMPTY SPACE ON A PHONE.
        *
        * The hero holds its copy at the BOTTOM (`justify-end`) against a
        * minimum height, because the atelier scene used to fill the space
        * above it. The scene no longer loads on a phone — it was three
        * quarters of a megabyte for a background — so that space became
        * exactly what the screenshot showed: four hundred pixels of nothing
        * between the header and the first words, with the products below it.
        *
        * On a phone the section is now content-height and the copy sits at the
        * top, so the shop starts immediately. The reserved height and the
        * bottom alignment return at `md`, which is where the scene actually
        * renders and where there is something in that space to look at.
        */}
      {/* THE OPENING IS CAPPED, NOT JUST PROPORTIONAL.
          `min-h-[46svh]` with `justify-end` means the content is pinned to the
          BOTTOM of a box sized to the viewport — so the taller the viewport,
          the more empty space opens above the headline. On a phone asked to
          "request desktop site" the CSS viewport is 980 wide and very tall, and
          that gap measured 111px above the h1 with nothing in it.
          `min(46svh, 22rem)` keeps the proportion on ordinary screens and stops
          it growing without limit on tall ones. Same failure the hero line had
          before it was given min(9.4vw, 12.2vh): a single-axis viewport unit
          has no idea what shape the screen actually is. */}
      <section className="relative overflow-hidden flex flex-col justify-start px-6 pb-[clamp(1.5rem,4vh,2.5rem)] pt-[clamp(1.25rem,4vh,2.25rem)] sm:px-10 md:min-h-[min(46svh,22rem)] md:justify-end md:pt-[clamp(2rem,6vh,3.5rem)]">
        {/* THE OPENING IS A GARMENT NOW, NOT AN ABSTRACTION.
            PaperDrift put translucent panels behind the headline — pattern
            paper, in keeping with the palette, and abstract. Beside the sister
            shop, which opens on a photograph of a piece turning slowly, it read
            as decoration where there should have been product. The owner asked
            for the garments.
            Falls back to the shop's own photographs when public/hero/ is empty,
            which it is; see lib/heroGarments.ts. */}
        <GarmentSlide products={[...featuredItems, ...recentItems]} />
        {/* `relative z-10`: GarmentSlide is absolutely positioned behind this,
            and without a stacking context of its own the copy would be painted
            over by it. */}
        <div className="relative z-10 mx-auto w-full max-w-[104rem]">
          <Reveal>
            {/* thread-deep, not thread. The accent measures 2.81:1 on the paper
              ground, and this is 11px running text carrying the shop's address
              and its size range — the two facts a customer checks first. The
              deeper tone is 4.26:1, still unmistakably the accent, and the
              line is over the hero wash where it needs every bit of it. */}
            <p className="mb-[clamp(1rem,2.4vh,1.75rem)] text-rule uppercase text-thread-deep">
              {STORE.area}&nbsp;·&nbsp;{STORE.city}&nbsp;·&nbsp;Sizes&nbsp;S–XXXL
            </p>

          </Reveal>

          <Reveal delay={110}>
            <h1 className="max-w-[min(17ch,52vw)] text-balance font-display text-plate font-normal text-graphite">
              Cut, pressed, and folded by the people who sell it
            </h1>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-[clamp(1.5rem,3.6vh,2.5rem)] flex flex-wrap items-center gap-x-9 gap-y-4">
              <Link
                href="/products"
                className="group inline-flex items-baseline gap-3 border-b border-thread/60 pb-2 text-caption uppercase text-graphite transition-colors duration-500 hover:border-thread focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-thread"
              >
                See the whole shelf
                <span aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1.5">→</span>
              </Link>
              {/* "Ask us anything · <number>" was removed on request. The number
                  is in the footer on every page, and a phone number beside the
                  one button that starts a purchase competes with it. */}
            </div>
          </Reveal>
        </div>
      </section>

      {/**
        * EVERYTHING BELOW THE OPENING NEEDS AN OPAQUE GROUND.
        *
        * The canvas is `position: fixed`. Without a sheet over it, the atelier
        * would composite behind every section on the page at once — the same
        * room showing through the shelf, the arrivals and the address block
        * simultaneously. `bg-paper` is the sheet, and it is structural rather
        * than decorative: it is what makes the opening an opening.
        */}
      <div className="relative z-10 bg-paper">

        {/* Stock first. Everything below is context; this is the shop. */}
        {/* ═══ III. Just finished ════════════════════════════════════════ */}
        {recentItems.length > 0 && (
          <section aria-labelledby="recent-heading" className="border-t border-paper-edge px-6 py-[5vh] sm:px-10">
            <div className="mx-auto w-full max-w-[104rem]">
              <Reveal>
                <div className="mb-[3vh] flex flex-wrap items-baseline justify-between gap-4">
                  <h2 id="recent-heading" className="font-display text-chapter font-normal text-graphite">
                    Just finished
                  </h2>
                  <Link
                    href="/products?sort_by=created_at&sort_order=desc"
                    className="text-caption uppercase text-graphite-faint transition-colors duration-500 hover:text-thread focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-thread"
                  >
                    Everything new →
                  </Link>
                </div>
              </Reveal>

              <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
                {recentItems.slice(0, 6).map((p, i) => (
                  <Reveal key={p.id} delay={i * 70}>
                    <ProductCard product={p} />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══ II. The shelf ═════════════════════════════════════════════
            Six bolts of cloth. Replaces the icon grid — a family does not
            shop by taxonomy, they shop by the day that is coming. */}
        {/**
          * ═══ The shelf, folded away ════════════════════════════════════
          *
          * Six bolts, each a row with a line of copy, sat open on the homepage
          * below the products. Asked for directly: make it a dropdown, so a
          * customer who wants to browse by category can open it and everybody
          * else scrolls past one line instead of six rows.
          *
          * Native <details>/<summary> — keyboard operable, announced as a
          * disclosure, and no JavaScript, which matters on a page that just
          * had three quarters of a megabyte taken off it. A hand-built
          * accordion would need state, ARIA, focus handling and an animation,
          * and would be worse at all four.
          */}
        <section aria-labelledby="shelf-heading" className="border-t border-paper-edge px-6 py-[5vh] sm:px-10">
          <details className="group mx-auto w-full max-w-[104rem]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-thread">
              <h2 id="shelf-heading" className="font-display text-[clamp(1.35rem,2.4vw,1.9rem)] font-normal text-graphite">
                Shop by category
              </h2>
              <span className="flex items-center gap-3 text-rule uppercase text-thread-deep">
                <span className="hidden sm:inline">Six bolts · Sizes S–XXXL</span>
                <span
                  aria-hidden="true"
                  className="text-lg leading-none transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none"
                >
                  +
                </span>
              </span>
            </summary>

            <div className="pt-[3vh]">
              {BOLTS.map((b, i) => (
                <BoltRow key={b.name} {...b} delay={i * 60} />
              ))}
              <MeasureRule className="mt-2" />
            </div>
          </details>
        </section>

        {/* ═══ IV. Chosen by us ══════════════════════════════════════════ */}
        {featuredItems.length > 0 && (
          <section aria-labelledby="featured-heading" className="border-t border-paper-edge px-6 py-[5vh] sm:px-10">
            <div className="mx-auto w-full max-w-[104rem]">
              <Reveal>
                <div className="mb-[3vh] flex flex-wrap items-baseline justify-between gap-4">
                  <h2 id="featured-heading" className="font-display text-chapter font-normal text-graphite">
                    Chosen by us
                  </h2>
                  <Link
                    href="/products?featured=true"
                    className="text-caption uppercase text-graphite-faint transition-colors duration-500 hover:text-thread focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-thread"
                  >
                    See all →
                  </Link>
                </div>
              </Reveal>

              <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
                {featuredItems.slice(0, 6).map((p, i) => (
                  <Reveal key={p.id} delay={i * 70}>
                    <ProductCard product={p} />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══ V. The counter ════════════════════════════════════════════
            Replaces a trust-badge row with the thing that actually
            reassures someone buying online: a real shop, at a real
            address, with someone who answers the phone. */}
        {/* THE COUNTER SECTION IS GONE, AND THAT IS THE RIGHT ANSWER.
         *
         * It began as a block listing the address, both phone numbers, the
         * email, the hours and the delivery terms — every one of which the
         * footer already carried, sixty pixels further down, under the same
         * heading. Stripping it back to an invitation plus a map link only
         * moved the duplication: the footer's own "Find us on the map" sat
         * two hundred pixels below the one this section offered.
         *
         * A page does not need a section that says "come and see us"
         * immediately above a counter that says where, when, and on which
         * number. The footer IS this section, and it is better at it. */}
      </div>
    </div>
  );
}
