import Link from 'next/link';
import PolicyDoc, { type PolicySection } from '@/components/system/PolicyDoc';

/**
 * The guarantee.
 *
 * WHAT WAS LEFT HERE. The banner and the emoji cards went in an earlier pass,
 * but two boxes survived it: the eight dispatch checks in a `.card` with green
 * tick icons, and a maroon-tinted panel promising to make it right. Both are
 * the same mistake in miniature — the shop's promise set inside a container
 * that says "notice", instead of set as the document it is.
 *
 * The pull quote survives, because it is the one thing on the page doing real
 * work: a guarantee is a sentence somebody stands behind, so it is set at the
 * size of a sentence somebody stands behind.
 *
 * WHY IT IS THE SAME COMPONENT AS THE POLICIES. This page makes claims a
 * customer may later hold us to, which is exactly what a policy is. Setting it
 * in the same document frame as the terms is the honest presentation — it says
 * these are commitments, not marketing.
 */

export const metadata = {
  title: '100% Authentic — Ammalu Tex',
  description:
    'Where the cloth comes from, what the listing promises, and the eight checks every piece passes before it leaves the counter.',
};

function Guarantee() {
  return (
    <figure className="border-y border-paper-edge py-[clamp(2.5rem,7vh,4.5rem)]">
      <blockquote className="max-w-[24ch] font-display text-chapter font-normal leading-[1.06] text-graphite">
        What you see is exactly what you get.
      </blockquote>
      <figcaption className="mt-7 max-w-[52ch] text-lede text-graphite-muted">
        We source directly from weavers across Tamil Nadu and trusted textile hubs, bypassing
        middlemen — which is why the price is what it is and the cloth is what we say it is.
      </figcaption>
    </figure>
  );
}

const SECTIONS: PolicySection[] = [
  {
    title: 'How the cloth reaches us',
    clauses: [
      {
        heading: 'Who we buy from',
        body: (
          <ul>
            <li>Weavers and manufacturers we deal with by name.</li>
            <li>Fair terms, so the money reaches the people who made the piece.</li>
          </ul>
        ),
      },
    ],
  },
  {
    title: 'What the listing promises',
    clauses: [
      {
        heading: 'Colour',
        body: 'Photographed in natural light. Screens vary slightly; that is the only variation there should be.',
      },
      {
        heading: 'Size',
        body: 'Measured from the actual garment, in inches and centimetres — not a generic national chart.',
      },
      {
        heading: 'Fabric',
        body: 'Cotton, silk, georgette, crepe, all from certified suppliers. If the page says silk, it is silk.',
      },
    ],
  },
  {
    title: 'The eight checks before dispatch',
    clauses: [
      {
        heading: 'Every piece, by hand',
        body: (
          <ol>
            <li>Fabric matches the description.</li>
            <li>No loose threads or stitching defects.</li>
            <li>Colour matches the photograph.</li>
            <li>Correct sizing, against our size guide.</li>
            <li>Embroidery and embellishments secure.</li>
            <li>Zips, buttons and hooks all work.</li>
            <li>No stains or storage damage.</li>
            <li>Pressed and presented properly.</li>
          </ol>
        ),
      },
      {
        heading: 'Nothing passes through unopened',
        body: 'No supplier parcel reaches the shop floor without being checked first.',
      },
    ],
  },
  {
    title: 'If we got it wrong',
    clauses: [
      {
        heading: 'Tell us',
        body: (
          <>
            A genuine size issue or damage is covered by the{' '}
            <Link href="/cancellation">cancellation, return &amp; exchange policy</Link>, which
            holds the windows and how the refund is paid.
          </>
        ),
      },
    ],
  },
];

export default function AuthenticPage() {
  return (
    <PolicyDoc
      eyebrow="Our word"
      title="100% authentic"
      standfirst="No imitations, and no compromises on what the label says."
      updated="3 September 2026"
      summary={<Guarantee />}
      sections={SECTIONS}
      footnote="This page is a set of commitments, not a marketing claim. If a piece you received does not match any line on it, we want to hear about that specific line."
    />
  );
}
