'use client';

import Link from 'next/link';
import Reveal from './Reveal';

/**
 * One category, presented as a bolt of cloth on the shelf.
 *
 * WHAT IT WAS, AND WHY IT DID NOT WORK. Six rows, each a hairline rule, a
 * numeral, a name, a sentence and a small caption. Every one identical to the
 * other five, in one colour, at one weight. As a piece of setting it was
 * clean; as a shelf it was a table of contents, and the criticism it earned —
 * that the categories arrive "one by one" and the site has "only one colour" —
 * was exactly right about both.
 *
 * The fix is not variety for its own sake. It is that a bolt of cloth is
 * IDENTIFIED BY ITS DYE, and these six categories are genuinely dyed
 * differently: indigo for the everyday cotton, madder for a wedding lehenga,
 * turmeric for the half-saree ceremony. So each row carries its own dye on its
 * selvedge — the finished edge of the bolt, which is the one part of a folded
 * cloth you can actually see on a shelf.
 *
 * THREE THINGS THE SELVEDGE DOES, none of which a rule could:
 *
 *   IT DISTINGUISHES. Six colours means six rows you can tell apart at a
 *   glance and navigate by memory on the second visit.
 *
 *   IT MEASURES. The band is thin at rest and pulls to full width on hover —
 *   the bolt being drawn out to look at. It is a scaleX on the compositor, so
 *   it costs nothing and it is stopped entirely for reduced motion.
 *
 *   IT MEANS SOMETHING. The colour is the cloth. That is why it is allowed to
 *   exist in a palette that otherwise has one accent, and why it appears here
 *   and nowhere else on the site.
 */
export default function BoltRow({
  index,
  name,
  note,
  copy,
  dye,
  delay = 0,
}: {
  index: string;
  name: string;
  note: string;
  copy: string;
  /** A tailwind text/bg colour pair from the dye box — see tailwind.config.js. */
  dye: string;
  delay?: number;
}) {
  return (
    <Reveal delay={delay}>
      <Link
        href={`/products?category=${encodeURIComponent(name)}`}
        className="group relative block border-t border-paper-edge py-7 pl-6 transition-colors duration-500 hover:border-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-thread sm:py-9 sm:pl-10"
      >
        {/* The selvedge. Sits on the row's own left edge, full height, and
            widens from a thread to a band as the bolt is pulled out. */}
        <span
          aria-hidden="true"
          className={`absolute left-0 top-0 h-full w-1 origin-left scale-x-100 transition-transform duration-[600ms] ease-[cubic-bezier(0.22,0.61,0.24,1)] group-hover:scale-x-[3.5] motion-reduce:transition-none motion-reduce:group-hover:scale-x-100 ${dye}`}
        />

        <div className="grid grid-cols-[auto_1fr] items-baseline gap-x-6 sm:gap-x-10">
          <span className="font-sans text-rule uppercase tabular-nums text-graphite-faint transition-colors duration-500 group-hover:text-graphite">
            {index}
          </span>

          <div className="grid gap-y-2 lg:grid-cols-[minmax(0,22ch)_minmax(0,1fr)_auto] lg:items-baseline lg:gap-x-10">
            <h3 className="font-display text-band font-normal text-graphite">
              {name}
            </h3>

            <p className="max-w-[52ch] text-lede text-graphite-muted">
              {copy}
            </p>

            <span className="flex items-baseline gap-3 text-caption uppercase text-graphite-faint transition-colors duration-500 group-hover:text-graphite">
              {note}
              <span
                aria-hidden="true"
                className="inline-block h-px w-6 bg-paper-edge transition-all duration-500 group-hover:w-12 group-hover:bg-graphite-faint"
              />
            </span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}
