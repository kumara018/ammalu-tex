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
    title: 'The two valid reasons',
    clauses: [
      {
        heading: 'For any return or exchange',
        body: (
          <ul>
            <li>The size does not fit.</li>
            <li>The piece arrived damaged.</li>
          </ul>
        ),
      },
      {
        heading: 'There is no third',
        body: 'A change of mind is not one. Cancelling inside the first hour needs no reason at all.',
      },
      {
        heading: 'Proof',
        body: '2–3 clear photographs, showing the problem you have stated. Requests without them are refused — that is what keeps the policy workable for everybody else.',
      },
    ],
  },
  {
    title: 'How the windows work',
    clauses: [
      {
        heading: 'Counted by the system',
        body: 'Timed automatically from purchase or delivery. A request raised after its window has closed cannot be accepted.',
      },
    ],
  },
  {
    title: 'Cancelling',
    clauses: [
      {
        heading: 'Inside the hour',
        body: (
          <ul>
            <li>
              Do it yourself from <strong>My orders</strong>.
            </li>
            <li>
              The order becomes <strong>Cancelled</strong> and the stock is released at once.
            </li>
            <li>If you had paid, Razorpay refunds you automatically — nothing to request.</li>
            <li>Email and WhatsApp confirm it, with the date the money should land.</li>
          </ul>
        ),
      },
      {
        heading: 'After the hour',
        body: 'It has gone into processing and cannot be cancelled. Wait for delivery and raise a return.',
      },
    ],
  },
  {
    title: 'Returning for a refund',
    clauses: [
      {
        heading: 'What happens, in order',
        body: (
          <ol>
            <li>Raise it within 4 hours of delivery, with your photographs.</li>
            <li>
              We review it. This one is <strong>not automatic</strong>.
            </li>
            <li>Approved, we schedule a pickup.</li>
            <li>
              Pickup confirmed, Razorpay refunds your original payment method automatically.
            </li>
            <li>Refund Initiated and Refund Processed both reach you, with credit dates.</li>
          </ol>
        ),
      },
    ],
  },
  {
    title: 'Exchanging',
    clauses: [
      {
        heading: 'What you may swap to',
        body: (
          <ul>
            <li>A different size, a different colour, or a different piece entirely.</li>
            <li>
              It must cost the <strong>same or more</strong>.
            </li>
            <li>Costs more — pay the difference through Razorpay to confirm it.</li>
            <li>
              Costs less — <strong>not allowed</strong>. No money is refunded on a price difference.
            </li>
          </ul>
        ),
      },
      {
        heading: 'The two legs',
        body: 'Approved, we collect the original. The replacement ships once that pickup is verified.',
      },
    ],
  },
  {
    title: 'Raising a request',
    clauses: [
      {
        heading: 'Where',
        body: (
          <>
            <strong>My orders → View order</strong>, then Cancel, Return or Exchange. Only the
            options still inside their window appear.
          </>
        ),
      },
      {
        heading: 'What to attach',
        body: (
          <ul>
            <li>Which of the two reasons applies.</li>
            <li>2–3 photographs.</li>
            <li>For an exchange, the replacement piece, size and colour.</li>
          </ul>
        ),
      },
      {
        heading: 'Following it',
        body: 'Approval, pickup and refund all show on the order page, and each step reaches you by email and WhatsApp.',
      },
    ],
  },
  {
    title: 'What we cannot accept',
    clauses: [
      {
        heading: 'The list',
        body: (
          <ul>
            <li>Anything raised after its window has closed.</li>
            <li>A change of mind.</li>
            <li>Photographs that do not show the problem claimed.</li>
            <li>Pieces used, washed, or damaged after delivery rather than on arrival.</li>
            <li>
              Anything marked <strong>Non-Returnable</strong> on its product page — unless it
              arrived damaged.
            </li>
            <li>Swapping to a cheaper piece to be paid the difference.</li>
          </ul>
        ),
      },
    ],
  },
  {
    title: 'Who pays the shipping',
    clauses: [
      {
        heading: 'We do',
        body: 'For a genuine size issue, damage, or our mistake — both the pickup and sending the replacement.',
      },
      {
        heading: 'Nobody does',
        body: 'A cancellation before dispatch carries no shipping charge at all.',
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
        body: `${STORE.weekdays} · ${STORE.weekend}`,
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
          Three windows, counted automatically. Full terms in the{' '}
          <Link href="/terms">terms</Link>.
        </>
      }
      updated="3 September 2026"
      summary={<Windows />}
      sections={SECTIONS}
      footnote="If your window has closed and something has genuinely gone wrong with the garment, still call. The windows are how the system works; they are not the whole of how we work."
    />
  );
}
