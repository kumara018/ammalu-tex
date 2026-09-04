'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { scrollPageTo } from '@/lib/smoothScroll';

/**
 * A section heading that opens and closes.
 *
 * WHY A POLICY PAGE IS A BAD SHAPE FOR A LONG DOCUMENT. These pages hold five
 * or six parts and somebody arrives wanting exactly one of them. Laid out flat
 * they are several screens of prose, and every visitor pays the cost of the
 * other five to read the one they came for. Closed by default, the page
 * becomes its own table of contents: a short stack of headings, and you open
 * the one you want.
 *
 * BUILT ON NATIVE <details>, NOT A useState PANEL. The browser gives the right
 * keyboard behaviour, the right ARIA role and — the one that matters here —
 * the right find-in-page behaviour, so Ctrl+F still reaches text inside a
 * closed section. A hand-rolled disclosure has to reimplement all of that and
 * usually reimplements some of it wrong.
 *
 * THE ONE THING NATIVE <details> DOES NOT SOLVE IS THE ANCHOR. Links into
 * these pages are deep ones. Navigating to a fragment inside a CLOSED
 * <details> scrolls to a heading with nothing under it, which looks like the
 * link is broken — so this opens itself when the hash addresses it or
 * addresses anything within it, on first load and on every later hash change,
 * then scrolls the addressed element into view. The containment test matters:
 * a hash often names a clause inside a section rather than the section itself.
 *
 * Ported from the sister shop, in this shop's palette. The behaviour is
 * deliberately identical — a customer moving between the two should not have
 * to learn a second set of manners.
 */
export default function Disclosure({
  id,
  index,
  title,
  children,
  defaultOpen = false,
}: {
  id?: string;
  /** The section number, shown in the accent beside the heading. */
  index?: string;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const check = () => {
      if (typeof window === 'undefined') return;
      const host = ref.current;
      if (!host) return;

      const hash = window.location.hash;
      if (hash.length < 2) return;

      let target: Element | null = null;
      try {
        target = document.querySelector(hash);
      } catch {
        return; // a hash that is not a valid selector is not ours to handle
      }

      const addressesSelf = !!id && hash === `#${id}`;
      // contains() reads the DOM, which exists even while <details> is shut.
      const addressesChild = !!target && target !== host && host.contains(target);
      if (!addressesSelf && !addressesChild) return;

      setOpen(true);

      /* The browser scrolled while the section was still collapsed, so the
         landing position is wrong by the height of whatever just expanded.
         Re-run it on the next frame, once layout has settled. */
      requestAnimationFrame(() => {
        const landing = (addressesChild ? target : host) as HTMLElement | null;
        if (!landing) return;
        const margin = parseFloat(getComputedStyle(landing).scrollMarginTop) || 0;
        scrollPageTo(landing, { offset: -margin });
      });
    };
    check();
    window.addEventListener('hashchange', check);
    return () => window.removeEventListener('hashchange', check);
  }, [id]);

  return (
    <details
      ref={ref}
      id={id}
      open={open}
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
      className="scroll-mt-52 border-t border-paper-edge"
    >
      <summary
        className="flex cursor-pointer list-none items-baseline gap-5 py-6
                   transition-colors duration-300 hover:text-thread
                   focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
                   focus-visible:outline-thread [&::-webkit-details-marker]:hidden"
      >
        {index && <span className="text-rule tabular-nums text-thread">{index}</span>}
        <h2 className="font-display text-doc-head font-normal text-graphite">{title}</h2>
        {/* The chevron is the affordance. `ml-auto` keeps it at the far edge so
            a row of six reads as a list of controls rather than six titles with
            decoration. It rotates rather than swapping glyph, so there is
            nothing to load and nothing to mismatch. */}
        <svg
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          className={`ml-auto h-4 w-4 shrink-0 self-center text-graphite-faint transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        >
          <path
            d="m4.5 7.5 5.5 5 5.5-5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </summary>

      <div className="pb-12">{children}</div>
    </details>
  );
}
