import Link from 'next/link';
import PolicyDoc, { type PolicySection } from '@/components/system/PolicyDoc';
import { STORE, WHATSAPP_URL } from '@/lib/config';

/**
 * Cancellation, return and exchange policy.
 *
 * The most consulted document on the site, and the one where getting the
 * design wrong costs real money — a customer who cannot find out how long they
 * have will phone the shop, or will assume the answer is "no".
 *
 * WHAT WAS HERE. The three windows were three coloured blocks — red for
 * cancel, blue for return, green for exchange — with the duration set in
 * 12px bold inside a sentence. Traffic-light colour on a policy page means
 * something is wrong, safe and go, and none of those are true: all three are
 * ordinary things a customer is entitled to do. And the number, which is the
 * entire reason anyone opens this page, was the smallest text in the block.
 *
 * So the windows are a ruled three-up where the DURATION is the largest thing
 * on the page, set in the display face, in one colour. Everything else is the
 * document.
 */

export const metadata = {
  title: 'Cancellation, Return & Exchange Policy — Ammalu Tex',
  description:
    'Cancel within 1 hour of purchase, return within 4 hours of delivery, exchange within 12 hours. The windows, the reasons, and how the refund is paid.',
};

const WINDOWS = [
  {
    action: 'Cancel',
    window: '1 hour',
    of: 'of placing the order',
    note: 'Instant and automatic. No reason needed, no approval.',
  },
  {
    action: 'Return',
    window: '4 hours',
    of: 'of delivery',
    note: 'Size issue or damage, with photographs. Refunded to your original payment method.',
  },
  {
    action: 'Exchange',
    window: '12 hours',
    of: 'of delivery',
    note: 'Same two reasons. Swap for anything of equal or higher value.',
  },
];

function Windows() {
  return (
    <div className="grid gap-x-10 gap-y-9 sm:grid-cols-3">
      {WINDOWS.map(({ action, window, of, note }) => (
        <div key={action} className="border-t border-thread/50 pt-5">
          <p className="text-rule uppercase text-thread">{action} within</p>
          <p className="mt-4 font-display text-band font-normal leading-none text-graphite">
            {window}
          </p>
          <p className="mt-2 text-caption uppercase text-graphite-faint">{of}</p>
          <p className="mt-4 max-w-[34ch] text-graphite-muted">{note}</p>
        </div>
      ))}
    </div>
  );
}

const SECTIONS: PolicySection[] = [
  {
    title: 'How the windows work',
    clauses: [
      {
        heading: 'Counted by the system, not by hand',
        body: 'Each window is timed automatically from the moment of purchase or the moment of delivery, and enforced by the system. A request raised after its window has closed cannot be accepted, so please act promptly.',
      },
    ],
  },
  {
    title: 'Cancelling an order',
    clauses: [
      {
        heading: 'Within 1 hour of purchase',
        body: (
          <>
            You can cancel an order yourself from <strong>My Orders</strong> up to{' '}
            <strong>1 hour</strong> after placing it. No reason is required and no approval is
            needed.
          </>
        ),
      },
      {
        heading: 'What happens immediately',
        body: (
          <>
            The order moves to <strong>Cancelled</strong> and the reserved stock is released. If
            payment had gone through, a refund is{' '}
            <strong>automatically initiated with Razorpay</strong> the instant you cancel — you get
            an email and a WhatsApp message confirming it, with the expected credit date.
          </>
        ),
      },
      {
        heading: 'After the hour',
        body: 'The order has already moved into processing and dispatch, and can no longer be cancelled. You can request a return once it has been delivered instead.',
      },
    ],
  },
  {
    title: 'Returning for a refund',
    clauses: [
      {
        heading: 'The only two valid reasons',
        body: (
          <ul>
            <li>The size does not fit, or</li>
            <li>The item arrived damaged.</li>
          </ul>
        ),
      },
      {
        heading: 'Proof',
        body: 'You will need to upload 2–3 clear photographs of the product. Requests without valid proof are rejected — this is what keeps the policy workable for everybody else.',
      },
      {
        heading: 'What happens, in order',
        body: (
          <ol>
            <li>Raise the request within 4 hours of delivery, with photographs and a clear reason.</li>
            <li>
              Our team reviews it. This is <strong>not automatic</strong> — a valid reason and proof
              are required for approval.
            </li>
            <li>Once approved, pickup is scheduled with our courier partner.</li>
            <li>
              The moment pickup is confirmed, the refund is{' '}
              <strong>automatically initiated with Razorpay</strong> to your original payment
              method.
            </li>
            <li>
              You receive “Refund Initiated” and “Refund Processed” notifications by email and
              WhatsApp, each with the expected credit date.
            </li>
          </ol>
        ),
      },
    ],
  },
  {
    title: 'Exchanging for something else',
    clauses: [
      {
        heading: 'The same two reasons',
        body: 'A size issue or damage, with 2–3 photographs as proof — but instead of a refund, you get a replacement.',
      },
      {
        heading: 'You are not limited to the same piece',
        body: (
          <>
            You can exchange for a different size, a different colour, or an{' '}
            <strong>entirely different product</strong>.
          </>
        ),
      },
      {
        heading: 'Equal or higher value',
        body: (
          <>
            The replacement must cost the <strong>same or more</strong> than your original item. If
            it costs more, you pay the difference online through Razorpay to confirm the exchange.
            You <strong>cannot</strong> choose a cheaper item in order to be paid the difference —
            no refund is issued for a price difference on an exchange.
          </>
        ),
      },
      {
        heading: 'The two legs',
        body: 'Once approved, we arrange pickup of the original item, and your replacement ships after the pickup is verified.',
      },
    ],
  },
  {
    title: 'How to raise a request',
    clauses: [
      {
        heading: 'From the order',
        body: (
          <>
            Go to <strong>My Orders → View order</strong> and choose Cancel, Return or Exchange.
            Only the options still inside their window will be shown.
          </>
        ),
      },
      {
        heading: 'What you will be asked for',
        body: 'The valid reason — size issue or damage — 2–3 photographs, and for an exchange, the replacement product, size and colour.',
      },
      {
        heading: 'Following it',
        body: 'Approval, pickup and refund or replacement are all tracked on the order page, and you get email and WhatsApp updates at every step.',
      },
    ],
  },
  {
    title: 'What is not eligible',
    clauses: [
      {
        heading: 'Seven exclusions',
        body: (
          <ul>
            <li>Cancellation requested more than 1 hour after purchase.</li>
            <li>
              Return or exchange requested after its window — 4 hours or 12 hours from delivery —
              has closed.
            </li>
            <li>
              Any reason other than a genuine size issue or damage. A change of mind is not a valid
              reason.
            </li>
            <li>
              Requests without the required photographs, or with photographs that do not support the
              stated reason.
            </li>
            <li>Items used, washed, or damaged after delivery rather than on arrival.</li>
            <li>
              Items marked <strong>Non-Returnable</strong> on the product page, except where the
              item received is genuinely damaged.
            </li>
            <li>
              Choosing a cheaper replacement on an exchange in order to be refunded the difference.
            </li>
          </ul>
        ),
      },
    ],
  },
  {
    title: 'Who pays the shipping',
    clauses: [
      {
        heading: 'A genuine fault',
        body: 'For a genuine size issue, damage, or our error, we bear the pickup and the forward shipping cost of the return or replacement.',
      },
      {
        heading: 'Before dispatch',
        body: 'A cancellation before dispatch involves no shipping charge at all.',
      },
    ],
  },
  {
    title: 'Talking to a person',
    clauses: [
      {
        heading: 'Support',
        body: (
          <>
            <a href={`mailto:${STORE.supportEmail}`}>{STORE.supportEmail}</a> · WhatsApp{' '}
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              {STORE.phone1}
            </a>{' '}
            · <a href={`tel:${STORE.phone2.replace(/\s/g, '')}`}>{STORE.phone2}</a>
          </>
        ),
      },
      {
        heading: 'Hours',
        body: 'Monday to Saturday, 9:00 am to 8:00 pm.',
      },
    ],
  },
];

export default function CancellationPage() {
  return (
    <PolicyDoc
      eyebrow="Changing your mind"
      title="Cancellation, return & exchange"
      standfirst={
        <>
          Three windows, counted automatically. What each one allows, what proof we need, and how
          the money comes back — the full terms are also summarised in the{' '}
          <Link href="/terms">terms</Link>.
        </>
      }
      updated="4 August 2026"
      summary={<Windows />}
      sections={SECTIONS}
      footnote="If your window has closed and something has genuinely gone wrong with the garment, still call. The windows are how the system works; they are not the whole of how we work."
    />
  );
}
