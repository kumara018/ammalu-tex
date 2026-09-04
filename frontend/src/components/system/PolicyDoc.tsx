import type { ReactNode } from 'react';
import Disclosure from './Disclosure';
import MeasureRule from '@/components/home/MeasureRule';
import PageShell from '@/components/PageShell';
import PageHeader from '@/components/PageHeader';
import { ActionLink } from './Action';

/**
 * The shape every document on this site takes — policies, the guarantee, the
 * shipping terms.
 *
 * WHAT IT REPLACES, AND WHY THAT WAS THE REAL PROBLEM. Every one of these
 * pages was a single white card floating on the paper ground: `.card p-8`
 * holding ten `<section>`s of `text-sm`. Two things were wrong with it and
 * only one of them was colour.
 *
 *  1. THE BOX. A near-white panel on a near-white page is a form. It says
 *     "fill this in", not "read this". It also broke the one thing that makes
 *     a site feel like one place — a continuous ground running under every
 *     route. The card is gone; the document sits directly on the paper, and
 *     the paper is the same paper as the shelf, the bag and the counter.
 *
 *  2. NO WAY IN. Ten numbered headings at 1.125rem, no contents, no way to
 *     get from the top of a 4,000-word policy to the one clause you came for.
 *     Long documents are not read, they are consulted.
 *
 * HOW IT DIFFERS FROM THE SISTER SHOP'S, WHICH SOLVES THE SAME PROBLEM. Vijey
 * Textile sets its contents in the LEFT margin and the body to its right,
 * because that site is a publication and that is where a publication puts its
 * index. This is a workroom docket: the operations run down the page with
 * their numbers hanging in the left margin — the same numbered spine already
 * used on the sign-in flow and the eight dispatch checks — and the index sits
 * in the RIGHT margin, the same margin the shop's own counter details occupy
 * on the auth screens. One idiom, used everywhere it applies.
 *
 * The numbering is not decoration, which is the test. A policy genuinely is a
 * numbered reference document: support can say "point 4 of the cancellation
 * policy" and the customer can find point 4. That is why these pages get
 * numerals and the product grid does not.
 */

export interface PolicyClause {
  heading: string;
  body: ReactNode;
}

export interface PolicySection {
  title: string;
  clauses: PolicyClause[];
}

/**
 * Prose inside a clause.
 *
 * Lists are the reason this exists. A policy is mostly lists, and a
 * `list-disc` bullet is a typographic full stop borrowed from a word
 * processor. `ul` items get a short thread dash instead — a tick mark, the
 * length of a stitch — and `ol` items keep real numerals because in an
 * ordered list the number IS the information (step 3 comes after step 2).
 */
const PROSE = [
  'mt-3 max-w-[68ch] text-lede text-graphite-muted',
  '[&_a]:text-graphite [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-thread/50',
  '[&_a:hover]:decoration-thread',
  '[&_strong]:font-normal [&_strong]:text-graphite',
  '[&_ul]:mt-4 [&_ul]:space-y-3',
  '[&_ul>li]:relative [&_ul>li]:pl-6',
  '[&_ul>li]:before:absolute [&_ul>li]:before:left-0 [&_ul>li]:before:top-[0.8em]',
  '[&_ul>li]:before:h-px [&_ul>li]:before:w-3 [&_ul>li]:before:bg-thread/70',
  '[&_ol]:mt-4 [&_ol]:space-y-3 [&_ol]:list-decimal [&_ol]:pl-6',
  '[&_ol]:marker:tabular-nums [&_ol]:marker:text-thread',
].join(' ');

/** `Who pays the shipping` -> `who-pays-the-shipping`, for deep links. */
function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function PolicyDoc({
  eyebrow,
  title,
  standfirst,
  updated,
  summary,
  sections,
  footnote,
}: {
  eyebrow: string;
  title: string;
  standfirst: ReactNode;
  updated: string;
  /** The figures this page exists to answer, shown before anything is opened. */
  summary?: ReactNode;
  sections: PolicySection[];
  footnote?: ReactNode;
}) {
  return (
    <PageShell>
      <PageHeader eyebrow={eyebrow} title={title} lede={standfirst} scale="doc">
        <p className="text-rule uppercase text-graphite-faint">Last updated · {updated}</p>
      </PageHeader>

      <MeasureRule
        label={`${sections.length} ${sections.length === 1 ? 'part' : 'parts'}`}
        className="mb-[clamp(3rem,8vh,5rem)]"
      />

      {summary && <div className="mb-[clamp(3rem,9vh,6rem)]">{summary}</div>}

      <div className="max-w-[76ch]">
        {sections.map((section, i) => (
          <Disclosure
            key={section.title}
            id={slugify(section.title)}
            index={String(i + 1).padStart(2, '0')}
            title={section.title}
          >
            <dl className="mt-2 space-y-8">
              {section.clauses.map((c) => (
                <div key={c.heading}>
                  <dt className="text-rule uppercase text-graphite-faint">{c.heading}</dt>
                  <dd className={PROSE}>{c.body}</dd>
                </div>
              ))}
            </dl>
          </Disclosure>
        ))}

        {footnote && (
          <div className="mt-[8vh] border-t border-paper-edge pt-9">
            <p className="max-w-[62ch] text-lede text-graphite-muted">{footnote}</p>
            <div className="mt-8">
              <ActionLink href="/support">Speak to us</ActionLink>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
