import PolicyDoc, { type PolicySection } from '@/components/system/PolicyDoc';
import { STORE } from '@/lib/config';

/**
 * Shipping policy.
 *
 * WHAT WAS HERE. A maroon gradient banner with a 🚚 emoji set at 3rem, two
 * bordered cards, four numbered circles in maroon discs, two more cards of
 * green ticks, and three buttons at the bottom. Nine boxes and five colours to
 * deliver four facts: how long, how much, where, and how you follow it.
 *
 * The emoji is the tell. A shop that photographs its own cloth in natural
 * light does not illustrate its delivery promise with a cartoon lorry — that
 * is a placeholder that shipped. And the two delivery options were set as
 * cards where the SERVICE NAME was the largest text; a customer reading this
 * page has already chosen the shop and wants the number of days.
 *
 * So the timetable is a ruled two-up with the duration set largest, the four
 * steps are numbered rows because they genuinely happen in that order, and
 * everything else is the document.
 */

export const metadata = {
  title: 'Shipping Policy — Ammalu Tex',
  description:
    'Standard delivery in 5–7 business days across India via Delhivery, with a flat shipping fee. Coverage, tracking and packaging.',
};

const OPTIONS = [
  {
    name: 'Standard',
    time: '5–7 days',
    unit: 'business days',
    cost: `Flat ₹${STORE.shippingFee}`,
    note: 'Pan-India, including remote areas, carried by Delhivery.',
  },
  {
    name: 'Express',
    time: '1–3 days',
    unit: 'business days',
    cost: 'Additional charge',
    note: 'Available in selected cities. Choose it at checkout.',
  },
];

function Timetable() {
  return (
    <div className="grid gap-x-14 gap-y-9 sm:grid-cols-2">
      {OPTIONS.map(({ name, time, unit, cost, note }) => (
        <div key={name} className="border-t border-thread/50 pt-5">
          <p className="text-rule uppercase text-thread">{name} delivery</p>
          <p className="mt-4 font-display text-band font-normal leading-none text-graphite">
            {time}
          </p>
          <p className="mt-2 text-caption uppercase text-graphite-faint">{unit}</p>
          <p className="mt-4 text-graphite">{cost}</p>
          <p className="mt-2 max-w-[38ch] text-graphite-muted">{note}</p>
        </div>
      ))}
    </div>
  );
}

const SECTIONS: PolicySection[] = [
  {
    title: 'What it costs',
    clauses: [
      {
        heading: 'The flat fee',
        body: (
          <>
            A flat shipping fee of <strong>₹{STORE.shippingFee}</strong> applies to every order.
          </>
        ),
      },
      {
        heading: 'Weight',
        body: 'The final shipping cost is calculated from the parcel weight and is shown at checkout before you pay. There is nothing added afterwards.',
      },
    ],
  },
  {
    title: 'What happens after you pay',
    clauses: [
      {
        heading: 'Four steps',
        body: (
          <ol>
            <li>
              <strong>Order placed.</strong> Your bag becomes an order the moment payment succeeds.
            </li>
            <li>
              <strong>Confirmed.</strong> We confirm and process it within 24 hours.
            </li>
            <li>
              <strong>Dispatched.</strong> Packed at the shop and handed to Delhivery.
            </li>
            <li>
              <strong>Delivered.</strong> To your door, against the delivery code sent to you.
            </li>
          </ol>
        ),
      },
    ],
  },
  {
    title: 'Where we deliver',
    clauses: [
      {
        heading: 'Coverage',
        body: (
          <ul>
            <li>All 28 states and 8 union territories.</li>
            <li>Tier 1, tier 2 and tier 3 cities.</li>
            <li>Rural and remote areas, which typically add one or two days.</li>
            <li>Jammu &amp; Kashmir and the North-East, on standard timelines.</li>
          </ul>
        ),
      },
    ],
  },
  {
    title: 'Following your parcel',
    clauses: [
      {
        heading: 'Tracking',
        body: (
          <ul>
            <li>The tracking number is sent by SMS and email as soon as it exists.</li>
            <li>Status comes straight from Delhivery, not from a copy we keep.</li>
            <li>
              You can check it any time under <strong>My orders</strong>.
            </li>
            <li>The delivery agent's contact is shared on the day of delivery.</li>
          </ul>
        ),
      },
    ],
  },
  {
    title: 'How it is packed',
    clauses: [
      {
        heading: 'Every parcel',
        body: 'Garments are folded and packed in protective covers so they arrive in the condition they left in.',
      },
      {
        heading: 'Delicate cloth',
        body: 'Silk and embroidered pieces are wrapped individually in tissue and placed in rigid boxes.',
      },
    ],
  },
  {
    title: 'When it is late',
    clauses: [
      {
        heading: 'What we cannot control',
        body: 'We are not responsible for delays caused by the courier, by weather, or by government action. We are responsible for telling you about them — if a parcel stops moving, call the shop and we will chase Delhivery ourselves rather than sending you to them.',
      },
    ],
  },
];

export default function ShippingPage() {
  return (
    <PolicyDoc
      eyebrow="Getting it to you"
      title="Shipping"
      standfirst="Delivered across India by Delhivery. How long it takes, what it costs, and how to follow the parcel."
      updated="21 May 2026"
      summary={<Timetable />}
      sections={SECTIONS}
      footnote="Every parcel leaves from the counter at Texvalley. If something has gone wrong with yours, the person who packed it can look it up."
    />
  );
}
