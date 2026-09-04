import PolicyDoc, { type PolicySection } from '@/components/system/PolicyDoc';
import { STORE } from '@/lib/config';

/**
 * Privacy policy.
 *
 * The named processors are the ones that actually receive data — Delhivery,
 * Razorpay, Brevo and Twilio. SendGrid was named here and is not the live
 * sender; Twilio was not named at all despite receiving every customer's
 * phone number for SMS and WhatsApp. The data categories, the rights list and
 * the minors
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
            What <strong>{STORE.name}</strong> collects when you shop at{' '}
            <strong>ammalutex.com</strong>, what we do with it, and who else sees it.
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
        heading: 'Never sold, never rented',
        body: 'Shared only with these, and only with what each one needs.',
      },
      {
        heading: 'The four',
        body: (
          <ul>
            <li>
              <strong>Delhivery</strong> — delivery. Your name, address and phone number.
            </li>
            <li>
              <strong>Razorpay</strong> — payment. Card and UPI details go straight to them.
            </li>
            <li>
              <strong>Brevo</strong> — order emails. Your name and email address.
            </li>
            <li>
              <strong>Twilio</strong> — SMS and WhatsApp updates. Your phone number.
            </li>
          </ul>
        ),
      },
      {
        heading: 'And the law',
        body: 'Government or legal authorities, where we are required to.',
      },
    ],
  },
  {
    title: 'How we keep it',
    clauses: [
      {
        heading: 'Security',
        body: 'SSL encryption, secure servers, access controls. No transmission over the internet is 100% secure, and we will not claim otherwise.',
      },
      {
        heading: 'Cookies',
        body: 'To keep you signed in, remember your bag, and count visits. Disable them in your browser and parts of the site stop working.',
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
