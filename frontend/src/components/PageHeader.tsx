'use client';

import Reveal from './home/Reveal';

/**
 * The opening of a page that is not the homepage.
 *
 * Three parts, and the order is the argument: a small thread-coloured label
 * saying where you are, the page's name in the display face, and one line of
 * plain speech underneath. The same shape on every route is what makes the
 * site read as one shop rather than a set of screens that share a logo.
 *
 * Deliberately quieter than the homepage's opening. That one is staging a
 * room; this one is a title page, and a title page that competes with the
 * room behind it is just noise over the thing worth looking at.
 *
 * `align` exists for the two auth routes, where the content is a narrow column
 * and a left-flushed title next to a centred form reads as a mistake.
 */
export default function PageHeader({
  eyebrow,
  title,
  lede,
  align = 'left',
  className = '',
  children,
}: {
  eyebrow?: string;
  title: string;
  /** ReactNode rather than string: a standfirst may carry a link or emphasis. */
  lede?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
  /** A date line, a count, an action — sits under the standfirst. */
  children?: React.ReactNode;
}) {
  const centered = align === 'center';

  return (
    <header
      className={`${centered ? 'mx-auto max-w-[56ch] text-center' : ''} mb-[clamp(2.5rem,7vh,5rem)] ${className}`}
    >
      {eyebrow && (
        <Reveal>
          <p className="mb-4 text-rule uppercase text-thread">{eyebrow}</p>
        </Reveal>
      )}

      <Reveal delay={eyebrow ? 90 : 0}>
        <h1 className="text-balance font-display text-chapter font-normal text-graphite">
          {title}
        </h1>
      </Reveal>

      {lede && (
        <Reveal delay={eyebrow ? 180 : 90}>
          <p className={`mt-6 max-w-[54ch] text-lede text-graphite-muted ${centered ? 'mx-auto' : ''}`}>
            {lede}
          </p>
        </Reveal>
      )}

      {children && (
        <Reveal delay={eyebrow ? 250 : 160}>
          <div className="mt-8">{children}</div>
        </Reveal>
      )}
    </header>
  );
}
