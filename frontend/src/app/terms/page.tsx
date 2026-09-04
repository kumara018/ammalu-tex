import Link from 'next/link';
import PolicyDoc, { type PolicySection } from '@/components/system/PolicyDoc';
import { STORE } from '@/lib/config';

/**
 * Terms and conditions.
 *
 * Every clause is carried across word for word — pricing, payment methods, the
 * cancellation windows, the liability cap and the Erode jurisdiction are legal
 * statements and are not paraphrased. The date stays where it was: restyling a
 * document does not amend it.
 */

export const metadata = {
  title: 'Terms & Conditions — Ammalu Tex',
  description: 'The terms you agree to when you shop at Ammalu Tex.',
};

const SECTIONS: PolicySection[] = [
  {
    title: 'The agreement',
    clauses: [
      {
        heading: 'Acceptance',
        body: (
          <>
            By accessing and using <strong>ammalutex.com</strong> (“the Website”) you accept and
            agree to be bound by these Terms &amp; Conditions. If you do not agree, please do not
            use our website or services. These terms apply to all visitors, users and customers of{' '}
            {STORE.name}.
          </>
        ),
      },
      {
        heading: 'Age',
        body: 'You must be at least 18 years old to create an account and make purchases.',
      },
    ],
  },
  {
    title: 'Products and pricing',
    clauses: [
      {
        heading: 'What the price includes',
        body: 'All prices are shown in Indian Rupees (₹) and are inclusive of applicable taxes.',
      },
      {
        heading: 'Changes',
        body: 'We reserve the right to change prices at any time without prior notice.',
      },
      {
        heading: 'Colour',
        body: 'Product images are illustrative. Actual colours may vary slightly depending on your screen.',
      },
      {
        heading: 'Availability',
        body: 'Availability is subject to stock. We reserve the right to cancel an order for an out-of-stock item.',
      },
    ],
  },
  {
    title: 'Orders and payment',
    clauses: [
      {
        heading: 'When an order is confirmed',
        body: 'Orders are confirmed only after successful online payment.',
      },
      {
        heading: 'How you can pay',
        body: (
          <>
            UPI, credit and debit cards, net banking and EMI, all through Razorpay.{' '}
            <strong>Cash on delivery is not available.</strong>
          </>
        ),
      },
      {
        heading: 'Our discretion',
        body: 'We reserve the right to reject or cancel any order at our discretion, with a full refund where payment has been made.',
      },
    ],
  },
  {
    title: 'Shipping and delivery',
    clauses: [
      {
        heading: 'Who carries it',
        body: 'Orders are delivered across India by Delhivery.',
      },
      {
        heading: 'How long it takes',
        body: 'Standard delivery takes 5–7 business days. Times may be longer for remote areas.',
      },
      {
        heading: 'What it costs',
        body: (
          <>
            A flat shipping fee of ₹{STORE.shippingFee} applies to all orders. Full detail is in the{' '}
            <Link href="/shipping">shipping policy</Link>.
          </>
        ),
      },
      {
        heading: 'What we cannot control',
        body: 'We are not responsible for delays caused by courier partners, natural disasters or government action.',
      },
    ],
  },
  {
    /*
     * THE WINDOWS, AND A LINK. This section used to restate the whole
     * cancellation policy — the reasons, the proof, how the refund settles,
     * the non-returnable rule — and then link to it anyway. Two copies of a
     * contractual term is two places to amend and one chance to disagree with
     * itself. The binding periods stay here because they are terms; the rest
     * lives in one place.
     */
    title: 'Cancellation, return and exchange',
    clauses: [
      {
        heading: 'The three periods',
        body: (
          <ul>
            <li>
              <strong>1 hour</strong> from purchase to cancel.
            </li>
            <li>
              <strong>4 hours</strong> from delivery to return for a refund.
            </li>
            <li>
              <strong>12 hours</strong> from delivery to exchange.
            </li>
          </ul>
        ),
      },
      {
        heading: 'Conditions and settlement',
        body: (
          <>
            Set out in full in the{' '}
            <Link href="/cancellation">cancellation, return &amp; exchange policy</Link>, which
            forms part of these terms.
          </>
        ),
      },
    ],
  },
  {
    title: 'Your account',
    clauses: [
      {
        heading: 'Accuracy',
        body: 'You must give accurate information when you create an account.',
      },
      {
        heading: 'Your credentials',
        body: 'You are responsible for keeping your account credentials confidential.',
      },
      {
        heading: 'Suspension',
        body: 'We reserve the right to suspend or close accounts that break these terms.',
      },
    ],
  },
  {
    title: 'Intellectual property',
    clauses: [
      {
        heading: 'What belongs to us',
        body: `All content on this website — text, images, logos and design — is the property of ${STORE.name} and is protected by copyright law. You may not reproduce, distribute or use any of it without our written permission.`,
      },
    ],
  },
  {
    title: 'Liability',
    clauses: [
      {
        heading: 'The limit',
        body: `${STORE.name} is not liable for indirect, incidental or consequential damages arising from the use of our website or products. Our maximum liability is the value of the order placed.`,
      },
    ],
  },
  {
    title: 'Governing law',
    clauses: [
      {
        heading: 'Jurisdiction',
        body: (
          <>
            These terms are governed by the laws of India. Any dispute is subject to the exclusive
            jurisdiction of the courts in <strong>Erode, Tamil Nadu, India</strong>.
          </>
        ),
      },
    ],
  },
  {
    title: 'Changes to these terms',
    clauses: [
      {
        heading: 'How you will know',
        body: 'We may update these terms at any time. Continuing to use the website after a change means you accept the updated terms, so the date at the top is the one to check.',
      },
    ],
  },
  {
    title: 'Where to find us',
    clauses: [
      {
        heading: 'The shop',
        body: (
          <>
            {STORE.name}, {STORE.shopNo}, {STORE.area}, {STORE.city}, {STORE.state} —{' '}
            {STORE.pincode}.
          </>
        ),
      },
      {
        heading: 'Speak to someone',
        body: (
          <>
            <a href={`mailto:${STORE.supportEmail}`}>{STORE.supportEmail}</a> ·{' '}
            <a href={`tel:${STORE.phone1}`}>{STORE.phone1}</a>
          </>
        ),
      },
    ],
  },
];

export default function TermsPage() {
  return (
    <PolicyDoc
      eyebrow="The agreement"
      title="Terms & conditions"
      standfirst="What you agree to when you buy from us, and what we commit to in return."
      updated="21 May 2026"
      sections={SECTIONS}
      footnote="These are the terms of a family shop, not a marketplace. If a clause seems to work against you in a situation we did not anticipate, tell us — we would rather fix the clause than argue it."
    />
  );
}
