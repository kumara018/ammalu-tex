'use client';

import Link from 'next/link';
import { STORE } from '@/lib/config';

/**
 * The frame around every sign-in, sign-up and reset screen.
 *
 * WHAT IT REPLACES. A full-width bar in `bg-brand-gradient` with white text, a
 * logo lockup centred between a back-link and an invisible spacer div kept
 * there to balance it, and beneath that a heavy drop-shadowed card. Three
 * different visual systems on a page whose entire job is one form.
 *
 * The rule this follows is the same one the rail follows: on an auth screen
 * every extra affordance is an invitation to abandon it. So there is no
 * navigation, no footer, no sound toggle — `NavGate` strips those — and here
 * there is no header bar either. Just the mark, which is the escape hatch
 * people actually look for, and the form.
 *
 * The atelier scene still runs behind this (the `threshold` scene, per
 * `sceneForPath`), so the page is deliberately transparent apart from the one
 * surface the form sits on.
 */
export default function AuthShell({
  title,
  lede,
  children,
  footer,
}: {
  title: string;
  lede?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col px-6 py-[clamp(2.5rem,8vh,5rem)] sm:px-10">
      {/* The mark, and the only way back. Left-flushed rather than centred:
          a centred mark needs a spacer on the right to balance it, which is
          how the old header ended up with an empty div in it. */}
      <Link
        href="/"
        className="shrink-0 font-display text-[1.35rem] leading-none tracking-tight text-graphite transition-colors duration-500 hover:text-thread focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-thread"
      >
        {STORE.name}
      </Link>

      <div className="flex flex-1 items-center justify-center py-[clamp(2rem,7vh,4.5rem)]">
        <div className="w-full max-w-[26rem]">
          <header className="mb-9">
            <h1 className="font-display text-band font-normal text-graphite">{title}</h1>
            {lede && <p className="mt-3 text-graphite-muted">{lede}</p>}
          </header>

          {children}

          {footer && (
            <div className="mt-9 border-t border-paper-edge pt-6 text-graphite-muted">
              {footer}
            </div>
          )}
        </div>
      </div>

      <p className="shrink-0 text-caption uppercase text-graphite-faint">
        {STORE.area} · {STORE.city}
      </p>
    </div>
  );
}
