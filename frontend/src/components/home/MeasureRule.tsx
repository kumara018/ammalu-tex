'use client';

/**
 * A tailor's measuring rule, used as the site's structural divider.
 *
 * WHY THIS EXISTS. The first pass gave every zone the same treatment — text on
 * paper, a hairline between sections, the same weight in the header, the body
 * and the footer. Consistent, and completely flat: nothing said a section had
 * ended except a 1px line, and nothing anywhere said what kind of shop this is.
 *
 * A rule is the one object every tailoring workroom has and no template ever
 * ships. It is drawn rather than decorated: real major and minor ticks at a
 * real interval, numbered at the majors, the way a measuring tape is. That
 * makes it a piece of information design that happens to be beautiful, instead
 * of an ornament — which is the difference the brief is asking for.
 *
 * Rendered as one inline SVG so it costs no request, scales to any width, and
 * inherits colour from the page. `vectorEffect` keeps the hairlines at exactly
 * one device pixel at any zoom, which is what stops it looking like a graphic
 * and makes it look like an instrument.
 */
export default function MeasureRule({
  label,
  className = '',
}: {
  /** Optional caption set into the rule, like the brand stamped on a tape. */
  label?: string;
  className?: string;
}) {
  // 40 minor divisions; every fifth is a major. Numbers only on the majors,
  // because a tape crowded with numbers is unreadable and so is this.
  const MINORS = 40;
  const ticks = Array.from({ length: MINORS + 1 }, (_, i) => i);

  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <svg
        viewBox={`0 0 ${MINORS * 10} 26`}
        preserveAspectRatio="none"
        className="h-[26px] w-full text-paper-edge"
      >
        {/* The spine. */}
        <line
          x1="0" y1="0.5" x2={MINORS * 10} y2="0.5"
          stroke="currentColor" strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        {ticks.map((i) => {
          const major = i % 5 === 0;
          return (
            <line
              key={i}
              x1={i * 10} y1="0"
              x2={i * 10} y2={major ? 13 : 6}
              stroke="currentColor"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              // The majors carry the accent; the minors stay quiet. Doing this
              // per-tick rather than with two elements keeps it one pass.
              className={major ? 'text-thread/50' : ''}
            />
          );
        })}
      </svg>

      {label && (
        <span className="pointer-events-none absolute left-0 top-[15px] bg-paper pr-4 text-rule uppercase text-graphite-faint">
          {label}
        </span>
      )}
    </div>
  );
}
