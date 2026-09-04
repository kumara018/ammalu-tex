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
 *
 * EACH FACT APPEARS ONCE. The timetable above already gives the fee, the two
 * timings and the coverage, so the sections below no longer restate them —
 * "What it costs" was the same ₹49 a second time and has gone entirely.
 *
 * ITS WEIGHT CLAUSE WAS FALSE. It said the final cost "is calculated from the
 * parcel weight and is shown at checkout". It is not: routers/orders.py sets
 * `shipping_fee = 49.0` outright, and weight appears nowhere in order pricing
 * on either shop. Describing a pricing model the shop does not operate is
 * worse than saying nothing, so it is gone rather than reworded.
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
    title: 'Where we deliver',
    clauses: [
      {
        heading: 'Coverage',
        body: (
          <ul>
            <li>All 28 states and 8 union territories.</li>
            <li>Tier 1, tier 2 and tier 3 cities.</li>
            <li>Rural and remote addresses — one to two days longer.</li>
            <li>Jammu &amp; Kashmir and the North-East, on standard timelines.</li>
          </ul>
        ),
      },
    ],
  },
  {
    title: 'After you pay',
    clauses: [
      {
        heading: 'The four steps',
        body: (
          <ol>
            <li>
              <strong>Ordered.</strong> Your bag becomes an order the moment payment succeeds.
            </li>
            <li>
              <strong>Confirmed.</strong> Within 24 hours.
            </li>
            <li>
              <strong>Dispatched.</strong> Packed at the counter and handed to Delhivery.
            </li>
            <li>
              <strong>Delivered.</strong> To your door, against the code sent to you.
            </li>
          </ol>
        ),
      },
      {
        heading: 'Following it',
        body: (
          <ul>
            <li>Tracking number by SMS and email, as soon as it exists.</li>
            <li>
              Live status under <strong>My orders</strong>, read from Delhivery directly.
            </li>
            <li>The agent&rsquo;s contact is shared on the delivery day.</li>
          </ul>
        ),
      },
    ],
  },
  {
    title: 'How it is packed',
    clauses: [
      {
        heading: 'Every garment',
        body: 'Folded into a protective cover, so it arrives as it left the shop.',
      },
      {
        heading: 'Silk and embroidered pieces',
        body: 'Wrapped individually in tissue and boxed rigid.',
      },
    ],
  },
  {
    title: 'When it is late',
    clauses: [
      {
        heading: 'Not our doing',
        body: (
          <ul>
            <li>Courier delays, weather, and government action are outside our control.</li>
            <li>Telling you about them is not — call the shop.</li>
            <li>We chase Delhivery ourselves rather than sending you to them.</li>
          </ul>
        ),
      },
    ],
  },
];

export default function ShippingPage() {
  return (
    <PolicyDoc
      eyebrow="Getting it to you"
      title="Shipping"
      standfirst="Delivered across India by Delhivery."
      updated="3 September 2026"
      summary={<Timetable />}
      sections={SECTIONS}
      footnote="Every parcel leaves from the counter at Texvalley. If something has gone wrong with yours, the person who packed it can look it up."
    />
  );
}
