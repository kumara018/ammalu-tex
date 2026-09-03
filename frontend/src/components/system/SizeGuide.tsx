'use client';

import { useState } from 'react';

/**
 * The size guide, as a tailor would give it.
 *
 * WHAT WAS HERE. Two HTML tables, six rows each, four columns of paired
 * numbers — `36–38" / 91–97 cm` — and a paragraph underneath telling you where
 * on your body to put the tape. It is complete, it is accurate, and it is
 * useless at the moment of decision, because the question a customer is
 * actually asking is not "what are the numbers for XL". It is:
 *
 *     "I measured 38 inches. Which one am I?"
 *
 * A table makes you answer that by reading twenty-four numbers and doing the
 * comparison in your head. That is work the page should be doing.
 *
 * SO THIS IS A TAPE, NOT A TABLE. The three measurements are drawn as real
 * measuring tapes across an inch scale, and each size is a band ON that scale.
 * You find your number on the tape and read straight up to the band that
 * contains it — which is exactly how a tailor uses a tape, and it answers the
 * question in one look instead of twenty-four comparisons.
 *
 * The size list stays, because a customer who already knows they are an XL
 * wants to confirm three numbers and leave. Selecting one lights its band on
 * all three tapes at once, so you can see the whole garment at that size
 * rather than one cell of a grid.
 *
 * WHY IT IS DRAWN AND NOT PHOTOGRAPHED. A body diagram would need a model,
 * and a model is a body type — which on a size guide spanning 32" to 47" is
 * the one thing that cannot be neutral. An inch scale has no body at all: it
 * is the instrument, and the instrument is honest to everybody using it.
 *
 * Entirely inline SVG and CSS transforms. No images, no library, one piece of
 * state.
 */

export interface SizeRow {
  size: string;
  chestIn: [number, number];
  waistIn: [number, number];
  hipIn: [number, number];
}

/**
 * The same numbers the tables carried, as numbers rather than strings so the
 * page can compute with them. Centimetres are derived, never stored twice —
 * two hand-maintained columns are two chances to disagree.
 */
export const SIZES: SizeRow[] = [
  { size: 'S',    chestIn: [32, 34], waistIn: [26, 28], hipIn: [35, 37] },
  { size: 'M',    chestIn: [34, 36], waistIn: [28, 30], hipIn: [37, 39] },
  { size: 'L',    chestIn: [36, 38], waistIn: [30, 32], hipIn: [39, 41] },
  { size: 'XL',   chestIn: [38, 40], waistIn: [32, 34], hipIn: [41, 43] },
  { size: 'XXL',  chestIn: [40, 42], waistIn: [34, 36], hipIn: [43, 45] },
  { size: 'XXXL', chestIn: [42, 44], waistIn: [36, 38], hipIn: [45, 47] },
];

const cm = (inches: number) => Math.round(inches * 2.54);

/** The scale every tape is drawn on. Wide enough to hold hips at XXXL. */
const MIN = 24;
const MAX = 48;
const span = MAX - MIN;
const pct = (inches: number) => ((inches - MIN) / span) * 100;

const MEASURES = [
  { key: 'chestIn', label: 'Chest', where: 'at the fullest part' },
  { key: 'waistIn', label: 'Waist', where: 'at the narrowest' },
  { key: 'hipIn',   label: 'Hip',   where: 'at the widest' },
] as const;

/** Inch marks along a tape: a tick every inch, a numbered tick every four. */
const TICKS = Array.from({ length: span + 1 }, (_, i) => MIN + i);

function Tape({
  measure,
  active,
}: {
  measure: (typeof MEASURES)[number];
  active: SizeRow | null;
}) {
  const range = active ? (active[measure.key] as [number, number]) : null;

  return (
    <div className="py-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-rule uppercase text-graphite">
          {measure.label}
          <span className="ml-3 normal-case text-graphite-faint">{measure.where}</span>
        </p>
        {range && (
          <p className="text-caption uppercase tabular-nums text-thread">
            {range[0]}–{range[1]}&Prime; · {cm(range[0])}–{cm(range[1])} cm
          </p>
        )}
      </div>

      {/* The tape. */}
      <div className="relative mt-4 h-11">
        {/* The band for the chosen size, laid on the tape. Width and offset
            are percentages of the same scale the ticks are drawn on, so the
            band cannot drift out of register with the numbers under it. */}
        {range && (
          <span
            aria-hidden="true"
            className="absolute top-0 h-5 bg-thread/25 transition-all duration-[600ms] ease-[cubic-bezier(0.22,0.61,0.24,1)] motion-reduce:transition-none"
            style={{ left: `${pct(range[0])}%`, width: `${pct(range[1]) - pct(MIN) - (pct(range[0]) - pct(MIN))}%` }}
          />
        )}
        {range && (
          <>
            <span
              aria-hidden="true"
              className="absolute top-0 h-5 w-px bg-thread transition-all duration-[600ms] ease-[cubic-bezier(0.22,0.61,0.24,1)] motion-reduce:transition-none"
              style={{ left: `${pct(range[0])}%` }}
            />
            <span
              aria-hidden="true"
              className="absolute top-0 h-5 w-px bg-thread transition-all duration-[600ms] ease-[cubic-bezier(0.22,0.61,0.24,1)] motion-reduce:transition-none"
              style={{ left: `${pct(range[1])}%` }}
            />
          </>
        )}

        {/* The scale itself: real ticks at real intervals, hairline-exact at
            any zoom, which is what makes it read as an instrument rather than
            a graphic. */}
        <svg
          viewBox={`0 0 ${span * 10} 26`}
          preserveAspectRatio="none"
          className="absolute top-0 h-5 w-full text-paper-edge"
          aria-hidden="true"
        >
          <line x1="0" y1="0.5" x2={span * 10} y2="0.5" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          {TICKS.map((inch, i) => (
            <line
              key={inch}
              x1={i * 10} y1="0" x2={i * 10} y2={inch % 4 === 0 ? 13 : 6}
              stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke"
              className={inch % 4 === 0 ? 'text-graphite-faint' : ''}
            />
          ))}
        </svg>

        {/* Numbered inches, positioned on the same percentage scale. */}
        {TICKS.filter((i) => i % 4 === 0).map((inch) => (
          <span
            key={inch}
            aria-hidden="true"
            className="absolute top-6 -translate-x-1/2 text-rule tabular-nums text-graphite-faint"
            style={{ left: `${pct(inch)}%` }}
          >
            {inch}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function SizeGuide() {
  const [picked, setPicked] = useState<string | null>('L');
  const active = SIZES.find((s) => s.size === picked) ?? null;

  return (
    <div>
      <p className="max-w-[62ch] text-lede text-graphite-muted">
        Measure yourself relaxed, with a soft tape. Find your number on the tape below and read
        up to the band it falls in — or pick a size and see all three measurements at once.
      </p>

      {/* The sizes. Pressed, not hovered: on a phone there is no hover, and a
          size guide is read on a phone in a shop. */}
      <div className="mt-9 flex flex-wrap gap-2">
        {SIZES.map((s) => {
          const on = s.size === picked;
          return (
            <button
              key={s.size}
              onClick={() => setPicked(on ? null : s.size)}
              aria-pressed={on}
              className={`min-w-[3.75rem] border px-4 py-2.5 text-caption uppercase tabular-nums transition-colors duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread ${
                on
                  ? 'border-graphite bg-graphite text-paper'
                  : 'border-paper-edge text-graphite-muted hover:border-thread hover:text-thread'
              }`}
            >
              {s.size}
            </button>
          );
        })}
      </div>

      {/* Three tapes, one per measurement. */}
      <div className="mt-6 divide-y divide-paper-edge border-y border-paper-edge">
        {MEASURES.map((m) => (
          <Tape key={m.key} measure={m} active={active} />
        ))}
      </div>

      {/**
       * The table is still here, and deliberately.
       *
       * The tapes answer "which size am I". The table answers "what exactly
       * does XL mean", which is the question somebody asks when they are
       * checking a garment against one they already own — and for that, twenty
       * four numbers in a grid genuinely is the right form. It is also what a
       * screen reader gets, since the tapes are `aria-hidden` decoration over
       * data that lives here.
       */}
      <div className="mt-10 overflow-x-auto overflow-y-hidden">
        <table className="w-full min-w-[34rem] text-sm">
          <caption className="mb-4 text-left text-rule uppercase text-graphite-faint">
            Every size, in inches and centimetres
          </caption>
          <thead>
            <tr className="border-b border-paper-edge text-rule uppercase text-thread">
              <th scope="col" className="py-3 pr-4 text-left font-normal">Size</th>
              <th scope="col" className="py-3 pr-4 text-left font-normal">Chest</th>
              <th scope="col" className="py-3 pr-4 text-left font-normal">Waist</th>
              <th scope="col" className="py-3 text-left font-normal">Hip</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-paper-edge">
            {SIZES.map((row) => {
              const on = row.size === picked;
              return (
                <tr
                  key={row.size}
                  onClick={() => setPicked(on ? null : row.size)}
                  className={`cursor-pointer transition-colors duration-500 ${on ? 'bg-paper-shade' : 'hover:bg-paper-shade/60'}`}
                >
                  <th scope="row" className={`py-3.5 pr-4 text-left font-normal ${on ? 'text-thread' : 'text-graphite'}`}>
                    {row.size}
                  </th>
                  {(['chestIn', 'waistIn', 'hipIn'] as const).map((k) => (
                    <td key={k} className="py-3.5 pr-4 tabular-nums text-graphite-muted">
                      {row[k][0]}–{row[k][1]}&Prime;
                      <span className="ml-2 text-graphite-faint">
                        {cm(row[k][0])}–{cm(row[k][1])} cm
                      </span>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-8 text-caption uppercase text-graphite-faint">
        Chudithar, Lehenga, Half Saree and Party Wears begin at L
      </p>

      <div className="mt-8 border-l border-thread/50 pl-5 text-graphite-muted">
        <b className="font-normal text-graphite">Between two sizes?</b> For a fitted cut, take the
        smaller and it will sit close. For anything that falls — a lehenga, a half saree — take
        the larger; the drape needs the room. If you are still unsure, call the counter with your
        measurements and we will tell you which one we would send.
      </div>
    </div>
  );
}
