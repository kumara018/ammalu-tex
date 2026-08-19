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
 *
 * `scale` exists because a title page and a document are not the same object.
 * `display` is the editorial step the shelf and the front page want. `doc` is
 * for pages somebody opens with a question — the policies, the help page —
 * where the heading is the thing standing between them and the answer.
 */
export default function PageHeader({
  eyebrow,
  title,
  lede,
  align = 'left',
  scale = 'display',
  className = '',
  children,
}: {
  eyebrow?: string;
  title: string;
  /** ReactNode rather than string: a standfirst may carry a link or emphasis. */
  lede?: React.ReactNode;
  align?: 'left' | 'center';
  /** `display` for editorial routes, `doc` for pages that answer a question. */
  scale?: 'display' | 'doc';
  className?: string;
  /** A date line, a count, an action — sits under the standfirst. */
  children?: React.ReactNode;
}) {
  const centered = align === 'center';
  const doc = scale === 'doc';

  return (
    <header
      className={`${centered ? 'mx-auto max-w-[56ch] text-center' : ''} ${
        doc ? 'mb-[clamp(1.5rem,4vh,2.75rem)]' : 'mb-[clamp(2.5rem,7vh,5rem)]'
      } ${className}`}
    >
      {eyebrow && (
        <Reveal>
          <p className={`text-rule uppercase text-thread ${doc ? 'mb-2.5' : 'mb-4'}`}>{eyebrow}</p>
        </Reveal>
      )}

      <Reveal delay={eyebrow ? 90 : 0}>
        <h1
          className={`text-balance font-display font-normal text-graphite ${
            doc ? 'max-w-[34ch] text-doc' : 'text-chapter'
          }`}
        >
          {title}
        </h1>
      </Reveal>

      {lede && (
        <Reveal delay={eyebrow ? 180 : 90}>
          {/* On a document the standfirst carries the ANSWER, so it gets a
              reading measure rather than a narrow editorial column. */}
          <p
            className={`text-lede text-graphite-muted ${centered ? 'mx-auto' : ''} ${
              doc ? 'mt-3.5 max-w-[72ch]' : 'mt-6 max-w-[54ch]'
            }`}
          >
            {lede}
          </p>
        </Reveal>
      )}

      {children && (
        <Reveal delay={eyebrow ? 250 : 160}>
          <div className={doc ? 'mt-5' : 'mt-8'}>{children}</div>
        </Reveal>
      )}
    </header>
  );
}
