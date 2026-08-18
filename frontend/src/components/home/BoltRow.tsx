'use client';

import Link from 'next/link';
import Reveal from './Reveal';

/**
 * One category, presented as a bolt of cloth on the shelf.
 *
 * REPLACES A SIX-TILE ICON GRID. That grid was the same six rounded squares
 * every shop has, and it asked the customer to shop by taxonomy — which is not
 * how anyone buys clothes. A bolt row is how the stock actually sits in the
 * shop: a name, a selvedge, and what it is for.
 *
 * The rule to the left is the selvedge edge. It is the only decoration, it is
 * one hairline, and it grows on hover — the cloth being pulled out to look at.
 */
export default function BoltRow({
  index,
  name,
  note,
  copy,
  delay = 0,
}: {
  index: string;
  name: string;
  note: string;
  copy: string;
  delay?: number;
}) {
  return (
    <Reveal delay={delay}>
      <Link
        href={`/products?category=${encodeURIComponent(name)}`}
        className="group grid grid-cols-[auto_1fr] items-baseline gap-x-6 border-t border-paper-edge py-7 transition-colors duration-500 hover:border-thread focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-thread sm:gap-x-10 sm:py-9"
      >
        <span className="font-sans text-rule uppercase text-graphite-faint transition-colors duration-500 group-hover:text-thread">
          {index}
        </span>

        <div className="grid gap-y-2 lg:grid-cols-[minmax(0,22ch)_minmax(0,1fr)_auto] lg:items-baseline lg:gap-x-10">
          <h3 className="font-display text-band font-normal text-graphite">
            {name}
          </h3>

          <p className="max-w-[52ch] text-lede text-graphite-muted">
            {copy}
          </p>

          <span className="flex items-baseline gap-3 text-caption uppercase text-graphite-faint transition-colors duration-500 group-hover:text-thread">
            {note}
            <span
              aria-hidden="true"
              className="inline-block h-px w-6 bg-paper-edge transition-all duration-500 group-hover:w-12 group-hover:bg-thread"
            />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}
