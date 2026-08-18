'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { LogoMark } from '@/components/Logo';
import { STORE } from '@/lib/config';

/**
 * The frame shared by sign in, create account and forgot password.
 *
 * WHY IT DOES NOT LOOK LIKE THE SISTER SHOP'S. The progressive FLOW came from
 * Vijey Textile deliberately — one field at a time is a solved problem and
 * should not be reinvented per shop. The COMPOSITION was ported with it, and
 * that was the mistake: recoloured, the two screens were the same centred card
 * on the same scrim with the same mark centred above it, which makes two shops
 * look like one company's two skins.
 *
 * So the layout is now this shop's own, and the differences are structural
 * rather than decorative:
 *
 *   CENTRED    ->  FLUSH LEFT. Vijey centres everything: buying there is an
 *                  occasion and the card is presented. A workroom docket is
 *                  written down the left margin, so this is.
 *
 *   A CARD     ->  A SHEET. Vijey's form sits in a bordered card floating on
 *                  the scrim. Here it sits directly on the paper with a ruled
 *                  spine down its left edge — the measure, the same instrument
 *                  used on the homepage and the shelf.
 *
 *   IMPLICIT   ->  NUMBERED. Vijey's steps advance silently. A workroom counts
 *                  its operations, so the step is stated — 01, 02, 03 — and the
 *                  ones behind you stay visible as struck-through numerals. You
 *                  can see how far in you are and how much is left, which is
 *                  the one thing a multi-step form usually refuses to say.
 *
 *   STACKED    ->  TWO COLUMNS. On a wide screen the shop's own details sit in
 *                  the right margin: the address, the counter, the hours. It
 *                  fills what would otherwise be empty paper with the single
 *                  most reassuring thing on a site asking for your password —
 *                  evidence there is a real shop behind it.
 */
export default function AuthShell({
  title,
  standfirst,
  children,
  footer,
  /** 1-based position in the flow, for the numbered spine. */
  step = 1,
  steps = 3,
}: {
  title: string;
  standfirst?: ReactNode;
  children: ReactNode;
  /** Flow-required actions only — never general navigation. */
  footer?: ReactNode;
  step?: number;
  steps?: number;
}) {
  return (
    <div className="relative min-h-[100svh] px-6 py-[clamp(2.5rem,7vh,4.5rem)] sm:px-10">
      {/* Behind a form the scene is atmosphere only — a legible field beats a
          visible workroom. Paper, never the sister shop's near-black. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'linear-gradient(100deg, rgba(250,246,243,0.97) 0%, rgba(250,246,243,0.93) 44%, rgba(250,246,243,0.72) 72%, rgba(250,246,243,0.5) 100%)',
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[104rem]">
        {/* The only route back to the shop. Flush left, no spacer needed. */}
        <Link
          href="/"
          aria-label={`${STORE.name} — return to the shop`}
          className="group inline-flex items-center gap-2.5 text-graphite transition-colors duration-500 hover:text-thread focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-thread"
        >
          <LogoMark size={28} className="shrink-0 transition-opacity duration-500 group-hover:opacity-80" />
          <span className="font-display text-[1.35rem] leading-none tracking-tight">
            {STORE.name}
          </span>
        </Link>

        <div className="mt-[clamp(3rem,11vh,7rem)] grid gap-x-16 gap-y-14 lg:grid-cols-12">
          <main className="lg:col-span-7 xl:col-span-6">
            {/* The spine: the operation count, then the rule. */}
            <div className="mb-8 flex items-center gap-4">
              <span className="flex items-baseline gap-2 text-rule uppercase tabular-nums">
                {Array.from({ length: steps }, (_, i) => {
                  const n = i + 1;
                  const done = n < step;
                  const now = n === step;
                  return (
                    <span
                      key={n}
                      className={
                        now ? 'text-thread'
                        : done ? 'text-graphite-faint line-through decoration-thread/60'
                        : 'text-paper-edge'
                      }
                    >
                      {String(n).padStart(2, '0')}
                    </span>
                  );
                })}
              </span>
              <span aria-hidden="true" className="h-px flex-1 bg-paper-edge" />
            </div>

            <h1 className="font-display text-chapter font-normal text-graphite">{title}</h1>
            {standfirst && (
              <p className="mt-4 max-w-[46ch] text-lede text-graphite-muted">{standfirst}</p>
            )}

            {/* No card. The form sits on the paper, held by a ruled spine. */}
            <div className="mt-10 border-l border-paper-edge pl-7 sm:pl-9">{children}</div>

            {footer && <div className="mt-10">{footer}</div>}

            <p className="mt-12 max-w-[46ch] text-caption leading-relaxed text-graphite-faint">
              By continuing you agree to our{' '}
              <Link
                href="/terms"
                className="underline underline-offset-4 transition-colors duration-500 hover:text-thread focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread"
              >
                terms
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                className="underline underline-offset-4 transition-colors duration-500 hover:text-thread focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread"
              >
                privacy policy
              </Link>
              .
            </p>
          </main>

          {/* The shop, in the right margin. Evidence there is a real counter
              behind the form — the most reassuring thing available on a page
              asking someone for their password. */}
          <aside className="hidden self-end lg:col-span-4 lg:col-start-9 lg:block">
            <p className="text-rule uppercase text-thread">The counter</p>
            <address className="mt-5 not-italic leading-relaxed text-graphite-muted">
              {STORE.shopNo}<br />
              {STORE.area}<br />
              {STORE.city}, {STORE.state} {STORE.pincode}
            </address>
            <p className="mt-6 leading-relaxed text-graphite-faint">
              {STORE.weekdays}<br />{STORE.weekend}
            </p>
            <a
              href={`tel:${STORE.phone1}`}
              className="mt-6 inline-block text-graphite-muted transition-colors duration-500 hover:text-thread focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread"
            >
              {STORE.phone1}
            </a>
          </aside>
        </div>
      </div>
    </div>
  );
}
