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
import DeliverTo from '@/components/home/DeliverTo';

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
const BOLTS = [
  { index: '01', name: 'Chudithar',   note: 'Every day',      dye: dyeFor('Chudithar').band,      copy: 'Cotton and silk, cut for a working day and a long evening. The set most often bought twice.' },
  { index: '02', name: 'Lehenga',     note: 'The occasion',   dye: dyeFor('Lehenga').band,      copy: 'Weight, drape, and a hem that holds its line through a wedding. Kept, and worn again.' },
  { index: '03', name: 'Half Saree',  note: 'The ceremony',   dye: dyeFor('Half Saree').band,    copy: 'For the day a girl is dressed as a woman for the first time, and photographed all afternoon.' },
  { index: '04', name: 'Party Wears', note: 'For the room',   dye: dyeFor('Party Wears').band,         copy: 'Colour that survives a camera flash and still looks considered from an arm’s length away.' },
  { index: '05', name: 'Tops',        note: 'The everyday',   dye: dyeFor('Tops').band,   copy: 'The pieces that do the quiet work — worn on their own, or under everything else.' },
  { index: '06', name: 'Crop Tops',   note: 'Newer cuts',     dye: dyeFor('Crop Tops').band, copy: 'Shorter lines for younger customers, in the same cloth the rest of the shelf is cut from.' },
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
      <section className="relative flex min-h-[calc(100svh-8.5rem)] flex-col justify-end px-6 pb-[clamp(3rem,9vh,5.5rem)] pt-[clamp(3rem,10vh,7rem)] sm:px-10">
        {/**
          * A soft wash under the copy only.
          *
          * The atelier scene is bright — pale muslin and window light — so
          * graphite type over it is legible in most of the frame but not all
          * of it, and the luminance moves as the light crosses the room. This
          * keeps the reading column settled without putting a sheet over the
          * whole page: it fades out entirely by the middle of the frame, where
          * the room is doing the work.
          */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'linear-gradient(94deg, rgba(250,246,243,0.94) 0%, rgba(250,246,243,0.86) 26%, rgba(250,246,243,0.5) 44%, rgba(250,246,243,0) 64%)',
          }}
        />

        <div className="mx-auto w-full max-w-[104rem]">
          <Reveal>
            <p className="mb-[clamp(1rem,2.4vh,1.75rem)] text-rule uppercase text-thread">
              {STORE.area}&nbsp;·&nbsp;{STORE.city}&nbsp;·&nbsp;Sizes&nbsp;S–XXXL
            </p>

            {/* Where this order is going. Directly under the line that says
                where the shop IS — the two halves of the same question. */}
            <div className="mt-4">
              <DeliverTo />
            </div>
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
              <a
                href={`tel:${STORE.phone1}`}
                className="text-caption uppercase text-graphite-faint transition-colors duration-500 hover:text-thread focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-thread"
              >
                Ask us anything · {STORE.phone1}
              </a>
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

        {/* ═══ II. The shelf ═════════════════════════════════════════════
            Six bolts of cloth. Replaces the icon grid — a family does not
            shop by taxonomy, they shop by the day that is coming. */}
        <section aria-labelledby="shelf-heading" className="border-t border-paper-edge px-6 py-[10vh] sm:px-10">
          <div className="mx-auto w-full max-w-[104rem]">
            <Reveal>
              <div className="mb-[5vh]">
                <MeasureRule label="Sizes S – XXL" className="mb-9" />
                <h2 id="shelf-heading" className="font-display text-chapter font-normal text-graphite">
                  On the shelf
                </h2>
              </div>
            </Reveal>

            {BOLTS.map((b, i) => (
              <BoltRow key={b.name} {...b} delay={i * 60} />
            ))}
            <MeasureRule className="mt-2" />
          </div>
        </section>

        {/* ═══ III. Just finished ════════════════════════════════════════ */}
        {recentItems.length > 0 && (
          <section aria-labelledby="recent-heading" className="border-t border-paper-edge px-6 py-[10vh] sm:px-10">
            <div className="mx-auto w-full max-w-[104rem]">
              <Reveal>
                <div className="mb-[5vh] flex flex-wrap items-baseline justify-between gap-4">
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

              <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {recentItems.slice(0, 6).map((p, i) => (
                  <Reveal key={p.id} delay={i * 70}>
                    <ProductCard product={p} />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══ IV. Chosen by us ══════════════════════════════════════════ */}
        {featuredItems.length > 0 && (
          <section aria-labelledby="featured-heading" className="border-t border-paper-edge px-6 py-[10vh] sm:px-10">
            <div className="mx-auto w-full max-w-[104rem]">
              <Reveal>
                <div className="mb-[5vh] flex flex-wrap items-baseline justify-between gap-4">
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

              <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
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
