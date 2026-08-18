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
        heading: 'Direct from the weaver',
        body: 'We work directly with skilled weavers and manufacturers in Tamil Nadu and the major textile hubs across India. No middlemen, and no markup added by anybody between them and the counter.',
      },
      {
        heading: 'Who the money reaches',
        body: 'We buy from local artisans on fair terms. Shopping here supports the craftspeople who made the piece, which is a claim we can make because we know their names.',
      },
    ],
  },
  {
    title: 'What the listing promises',
    clauses: [
      {
        heading: 'Colour',
        body: 'We photograph in natural light, so the colour you see is the colour that arrives. Slight variation between screens is normal and is the only variation there should be.',
      },
      {
        heading: 'Size',
        body: 'Our size guide is calibrated against actual garment measurements, in inches and centimetres, not against a generic national standard.',
      },
      {
        heading: 'Fabric',
        body: 'Cotton, silk, georgette, crepe — every fabric comes from a certified supplier and is named accurately on the product page. If the page says silk, it is silk.',
      },
    ],
  },
  {
    title: 'Checked before it is folded',
    clauses: [
      {
        heading: 'Every piece, by hand',
        body: 'Each garment is inspected before it reaches the shop floor: fabric, stitching, colour fastness, finishing. Nothing is sent on from a supplier unopened.',
      },
      {
        heading: 'The eight checks before dispatch',
        body: (
          <ol>
            <li>Fabric composition matches the product description.</li>
            <li>No loose threads or stitching defects.</li>
            <li>Colour matches the product photograph.</li>
            <li>Correct sizing, against our size guide.</li>
            <li>Embroidery and embellishments are secure.</li>
            <li>Zips, buttons and hooks all work.</li>
            <li>No stains or storage damage.</li>
            <li>Pressed and presented properly.</li>
          </ol>
        ),
      },
    ],
  },
  {
    title: 'If we got it wrong',
    clauses: [
      {
        heading: 'The window',
        body: (
          <>
            If a piece arrives with a genuine size issue or damage, you can request a{' '}
            <strong>return within 4 hours of delivery</strong>, or an{' '}
            <strong>exchange within 12 hours</strong>.
          </>
        ),
      },
      {
        heading: 'What happens then',
        body: (
          <>
            Once the request is approved and the piece is picked up, the refund is processed
            automatically through Razorpay to your original payment method. The full terms are in
            the <Link href="/cancellation">cancellation, return &amp; exchange policy</Link>.
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
      standfirst="Every garment is handpicked from verified weavers, manufacturers and trusted suppliers. No imitations, and no compromises on what the label says."
      updated="21 May 2026"
      summary={<Guarantee />}
      sections={SECTIONS}
      footnote="This page is a set of commitments, not a marketing claim. If a piece you received does not match any line on it, we want to hear about that specific line."
    />
  );
}
