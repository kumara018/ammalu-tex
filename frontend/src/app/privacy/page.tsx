import PolicyDoc, { type PolicySection } from '@/components/system/PolicyDoc';
import { STORE } from '@/lib/config';

/**
 * Privacy policy.
 *
 * Content carried across clause for clause — the named processors (Delhivery,
 * Razorpay, SendGrid), the data categories, the rights list and the minors
 * clause are legal statements and are reproduced exactly. Only the
 * presentation changed: out of a white card, into a document.
 *
 * The "last updated" date stays at 21 May 2026 deliberately. Restyling a
 * document does not amend it, and moving the date would tell every reader the
 * terms had changed when they had not.
 */

export const metadata = {
  title: 'Privacy Policy — Ammalu Tex',
  description:
    'How Ammalu Tex collects, uses and protects your personal information, and who we share it with.',
};

const SECTIONS: PolicySection[] = [
  {
    title: 'Who we are',
    clauses: [
      {
        heading: 'Introduction',
        body: (
          <>
            <strong>{STORE.name}</strong> (“we”, “our”, “us”) is committed to protecting your
            personal information and your right to privacy. This policy explains how we collect,
            use, disclose and safeguard your information when you visit{' '}
            <strong>ammalutex.com</strong> and make purchases from us.
          </>
        ),
      },
    ],
  },
  {
    title: 'What we collect',
    clauses: [
      {
        heading: 'Personal information',
        body: 'Full name, email address, mobile number and delivery address, when you register or place an order.',
      },
      {
        heading: 'Payment information',
        body: (
          <>
            <strong>We do not store card or UPI details.</strong> Payments are processed securely
            through Razorpay.
          </>
        ),
      },
      {
        heading: 'Order information',
        body: 'Products purchased, order history and delivery details.',
      },
      {
        heading: 'Device information',
        body: 'Browser type, IP address and pages visited, for analytics and security.',
      },
    ],
  },
  {
    title: 'What we use it for',
    clauses: [
      {
        heading: 'Six purposes',
        body: (
          <ul>
            <li>To process and deliver your orders.</li>
            <li>To send order confirmations, shipping updates and invoices by email and WhatsApp.</li>
            <li>To answer customer support queries.</li>
            <li>To send promotional offers — only with your consent.</li>
            <li>To improve our website and services.</li>
            <li>To comply with legal obligations.</li>
          </ul>
        ),
      },
    ],
  },
  {
    title: 'Who else sees it',
    clauses: [
      {
        heading: 'We do not sell your data',
        body: 'We do not sell or rent your personal data. We share it only with the parties below, and only with what they need to do their part of the job.',
      },
      {
        heading: 'Our four processors',
        body: (
          <ul>
            <li>
              <strong>Delhivery</strong> — our shipping partner, for delivery. They receive your
              name, address and phone number.
            </li>
            <li>
              <strong>Razorpay</strong> — our payment gateway, for processing payments securely.
            </li>
            <li>
              <strong>SendGrid</strong> — for sending transactional email.
            </li>
            <li>Government or legal authorities, when required by law.</li>
          </ul>
        ),
      },
    ],
  },
  {
    title: 'How we keep it',
    clauses: [
      {
        heading: 'Security',
        body: 'We use industry-standard measures including SSL encryption, secure servers and access controls to protect your personal information. No method of transmission over the internet is 100% secure, and we will not claim otherwise.',
      },
      {
        heading: 'Cookies',
        body: 'We use cookies and similar technologies to keep you signed in, remember your bag and understand website traffic. You can disable cookies in your browser settings; some parts of the site will stop working if you do.',
      },
    ],
  },
  {
    title: 'Your rights',
    clauses: [
      {
        heading: 'What you can ask us for',
        body: (
          <ul>
            <li>Access to the personal data we hold about you.</li>
            <li>Correction of anything inaccurate.</li>
            <li>Deletion of your account and your data.</li>
            <li>To stop receiving promotional messages.</li>
          </ul>
        ),
      },
      {
        heading: 'How to exercise them',
        body: (
          <>
            Write to <a href={`mailto:${STORE.supportEmail}`}>{STORE.supportEmail}</a> and we will
            action it.
          </>
        ),
      },
    ],
  },
  {
    title: 'Children',
    clauses: [
      {
        heading: 'Under 18',
        body: 'Our services are not directed at anyone under the age of 18, and we do not knowingly collect personal information from minors.',
      },
    ],
  },
  {
    title: 'Changes to this policy',
    clauses: [
      {
        heading: 'How you will know',
        body: 'We may update this policy from time to time. Significant changes are published on this page with a new date at the top, which is the date to check.',
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
        heading: 'Questions about your data',
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

export default function PrivacyPage() {
  return (
    <PolicyDoc
      eyebrow="Your data"
      title="Privacy policy"
      standfirst="What we collect when you shop with us, who we pass it to, and how to get it back or have it removed."
      updated="21 May 2026"
      sections={SECTIONS}
      footnote="If anything here is unclear, ask — a policy nobody can read is not a policy, it is a disclaimer."
    />
  );
}
