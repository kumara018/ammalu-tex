'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { STORE } from '@/lib/config';
import { LogoMark } from '@/components/Logo';
import { isAuthRoute } from '@/lib/routes';

/**
 * The counter at the end of the room.
 *
 * WHAT IT REPLACES. A near-black slab with four columns of links, coloured
 * social tiles, a boxed "Store Timings" card and a paragraph of marketing about
 * being a trusted destination. Recolouring it — which is all that had been done
 * — left a dark block under a paper shop and changed nothing about its shape.
 *
 * A footer's real job is small: say where the shop is, how to reach it, and
 * where the policies live. Everything else was there because footers usually
 * have it. So the columns are three instead of four, the links are text
 * instead of tiles, and the marketing paragraph is gone — the address IS the
 * reassurance on a site selling clothes from a real counter in Erode.
 *
 * WHY IT IS DARK, AFTER BEING PAPER FOR ONE PASS. Set on muslin, it read as
 * the same surface as the page and the same surface as the header — the whole
 * site was one flat sheet with hairlines on it, which is under-designed rather
 * than restrained. The room has to end somewhere. Graphite gives the page a
 * floor, puts the wordmark on the strongest contrast available, and makes the
 * three zones — rail, paper, counter — read as three different places.
 *
 * A giant clipped wordmark was tried here — the maker's name stamped into the
 * selvedge — and removed. On a real screen it was not texture, it was a large
 * dead band of near-black below the last usable line, and on a phone it pushed
 * the actual footer content off the top of it. The name is already set at the
 * head of the first column; saying it again at 15rem was decoration paying for
 * itself in scroll distance.
 */

const SHELF = ['Chudithar', 'Lehenga', 'Half Saree', 'Party Wears', 'Tops', 'Crop Tops'];

const POLICIES = [
  { href: '/shipping',     label: 'Shipping' },
  { href: '/cancellation', label: 'Cancellation, return & exchange' },
  { href: '/terms',        label: 'Terms' },
  { href: '/privacy',      label: 'Privacy' },
  { href: '/authentic',    label: 'Authenticity' },
  { href: '/support',      label: 'Help' },
];

/**
 * THE MARKS.
 *
 * This footer had no symbols at all: four columns of identically-weighted
 * links, so "which of these is the phone number" could only be answered by
 * reading every line. A handset, an envelope, a shop and a pin sort that
 * before a word is read, which is the whole job of a footer.
 *
 * Drawn inline at one hairline weight rather than pulled from an icon set —
 * five shapes do not justify a dependency, and these match the weight of the
 * rules already on the page. In thread-pale, the footer's only accent, so
 * nothing here introduces a second colour.
 *
 * ALIGNMENT IS `mt-[0.28em]`, NOT A PIXEL GUESS. The line box beside these is
 * 1.5em and the mark is 1em, so (1.5 − 1) / 2 centres it on the FIRST line —
 * in em, so it stays centred wherever the type scale moves, and on the
 * three-line address it sits against the first line rather than the middle
 * of the block.
 *
 * `aria-hidden` on every one: the link text beside each already says what it
 * is, and "phone icon, phone, +91…" is worse than no icon.
 */
const fico = 'mt-[0.28em] h-4 w-4 shrink-0 text-thread-pale';

function Handset() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={fico}>
      <path d="M6.6 3.2 8.2 6.3 6.6 7.9a10.2 10.2 0 0 0 5.3 5.3l1.7-1.6 3.9 1.6v2.6c0 .6-.5 1.1-1.1 1.1A13.8 13.8 0 0 1 2.5 4.3c0-.6.5-1.1 1.1-1.1h3Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function Envelope() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={fico}>
      <rect x="2.5" y="4.4" width="15" height="11.2" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="m3.1 5.2 6.9 5 6.9-5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function Chat() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={fico}>
      <path d="M17.5 9.4c0 3.4-3.4 6.2-7.5 6.2a9.3 9.3 0 0 1-2.5-.33L2.5 17l1.2-3.1A6.1 6.1 0 0 1 2.5 9.4c0-3.4 3.4-6.2 7.5-6.2s7.5 2.8 7.5 6.2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function Instagram() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={fico}>
      <rect x="3" y="3" width="14" height="14" rx="4.2" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="10" cy="10" r="3.4" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="14.1" cy="5.9" r="0.95" fill="currentColor" />
    </svg>
  );
}

function Shop() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={fico}>
      <path d="M3.4 8.4v8.2h13.2V8.4" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M2.5 8.4 4 3.4h12l1.5 5a2.4 2.4 0 0 1-4.75 0 2.4 2.4 0 0 1-4.85 0 2.4 2.4 0 0 1-4.75 0Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M8.2 16.6v-4.1h3.6v4.1" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function Pin() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={fico}>
      <path d="M2.5 5.6 7.5 3.6l5 2 5-2v10.8l-5 2-5-2-5 2V5.6Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M7.5 3.6v10.8M12.5 5.6v10.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export default function AtelierFooter() {
  const pathname = usePathname();
  // Auth screens are one focused card on an otherwise empty page. A footer
  // full of links there is an invitation to abandon signing in.
  if (isAuthRoute(pathname)) return null;

  return (
    <footer className="relative z-10 overflow-hidden px-6 pb-[4vh] pt-[4.5vh] text-paper/75 sm:px-10">
      {/**
       * WHY THIS IS NOT A FLAT SLAB ANY MORE.
       *
       * It was one value — `bg-graphite`, #332722 — across the full width and
       * the full height, with text at 45–70% over it. Flat dark plus faded
       * text is the definition of dull: nothing in the whole block varies, so
       * the eye has nowhere to go and the counter reads as the page having
       * run out rather than as a room having an end.
       *
       * Three things fix it, and none of them is "use a brighter colour":
       *
       *   LIGHT. The ground is now lit from the top left, the way the shop is
       *   — a warm #402C25 falling to #1B100D at the base. It is the same
       *   family, so the palette is untouched; it simply has a direction now.
       *
       *   A GLOW. One very wide, very faint thread-coloured radial behind the
       *   first column, where the name sits. It is the lamp over the counter.
       *
       *   AN EDGE. A thread hairline across the top, brightest in the middle
       *   and fading at both ends — the woven edge where the paper stops and
       *   the counter starts. A hard 1px line at full strength would read as
       *   a border; this reads as light catching a fold.
       *
       * All three are painted, none animate, and the whole thing is two
       * absolutely-positioned divs behind content that was already there.
       */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(120% 90% at 18% 0%, rgba(193,135,111,0.16) 0%, rgba(193,135,111,0) 58%),' +
            'linear-gradient(168deg, #402C25 0%, #2C1D18 46%, #1B100D 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(to right, rgba(193,135,111,0) 0%, rgba(193,135,111,0.65) 30%, rgba(227,188,172,0.8) 50%, rgba(193,135,111,0.65) 70%, rgba(193,135,111,0) 100%)',
        }}
      />
      {/* The measure, in thread, across the top edge — the counter's own rule. */}
      <div aria-hidden="true" className="mx-auto mb-[7vh] w-full max-w-[104rem] opacity-30">
        <svg viewBox="0 0 400 14" preserveAspectRatio="none" className="h-3.5 w-full text-paper">
          <line x1="0" y1="0.5" x2="400" y2="0.5" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          {Array.from({ length: 41 }, (_, i) => (
            <line key={i} x1={i * 10} y1="0" x2={i * 10} y2={i % 5 === 0 ? 9 : 4}
                  stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
      </div>

      <div className="mx-auto grid w-full max-w-[104rem] gap-x-8 gap-y-12 sm:grid-cols-2 min-[900px]:grid-cols-12 xl:gap-x-12">

        <div className="min-w-0 min-[900px]:col-span-3">
          {/* THE MARK, AND A WAY HOME.
              This was a `<p>`: the shop's name set at the head of the footer,
              with no mark beside it and nothing clickable about it. Every
              visitor who has ever used a website tries the name in the footer
              to get back to the front page, and on this one it did nothing.
              It is the stamp and the name now, and it is a link. */}
          <Link
            href="/"
            aria-label={`${STORE.name} — back to the front page`}
            /* THE LOCK-UP RIDES UP BY THE MEASURED CAP-HEIGHT DIFFERENCE.
               `leading-none` alone was not enough and I said it was — the
               honest number, taken by rasterising both strings and finding the
               first row of real ink rather than trusting font-metric APIs, is
               that the wordmark's cap-top still sat 6.4px below the column
               headings' cap-top.
               The reason is this face's ascent: 38.0 for a 38.4px size, almost
               the entire em. So even with the line box collapsed to the font
               size, the baseline lands 38px down and the cap-top 10px below the
               box top, while the 10.5px heading's cap-top is only 3.6px down.
               Boxes aligned; letters did not.
               6.4 / 38.4 = 0.167em, and `text-band` is clamp(1.5rem, 3.2vw,
               2.4rem), so the same fraction of it is the clamp below — correct
               at every width rather than tuned to 1440. It is on the LINK so
               the mark and the name rise together and the lock-up stays
               intact. */
            className="group -mt-[clamp(0.25rem,0.533vw,0.4rem)] inline-block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-thread-pale"
          >
            {/* THE MARK BELONGS TO THE NAME, NOT TO THE NAME PLUS THE TAGLINE.
                The lock-up was one `items-center` row holding the mark beside a
                two-line block, so the mark centred on the BLOCK — which put it
                level with the gap between the name and the tagline, reading as
                a stamp sitting low against its own wordmark.
                It now centres on the wordmark alone. `mt-1` is the last 4px of
                that: `items-center` centres the mark on the line BOX, and this
                face puts its cap-top 10px below the top of a 38.4px box, so
                the ink's centre is about 4px lower than the box's.
                `-mt-0.5` then lifts it 6px above that geometric answer, which
                is a judgement rather than a measurement: the sprig carries its
                weight low and reads as sitting under the wordmark when its box
                is centred on it. Optical centring, and the owner's eye on the
                rendered lock-up, is the only authority for this number. */}
            <span className="flex items-center gap-2">
            <LogoMark
              size={34}
              className="-mt-0.5 shrink-0 text-thread-pale transition-colors duration-500 group-hover:text-paper"
            />
            {/* `leading-none` is doing alignment work, not typography.
                Measured against the three column headings beside it: their
                cap-tops sit at the same y, but the wordmark's sat 3.7px lower,
                which is what reads as the brand name hanging below the rest of
                the row. The cause is half-leading — `text-band` puts a 43px
                line box around a 38.4px face, and half of that 4.6px gap sits
                ABOVE the letterforms. Collapsing the line box to the font size
                removes it. Expressed this way rather than as a negative margin
                because `text-band` is a clamp() that scales with the viewport,
                so a fixed -4px nudge would only be correct at one width. */}
            {/* Name and tagline as one block, so the mark sits beside the
                signature rather than beside a name with a line loose under it.
                The header has carried the tagline since it was added and this
                did not, which is the sort of gap that only shows when the two
                are seen together. */}
              <span className="font-display text-band font-normal leading-none text-paper transition-colors duration-500 group-hover:text-thread-pale">
                {STORE.name}
              </span>
            </span>
            {/* ONE LINE, AND ENOUGH ROOM TO STAY THAT WAY.
                This broke into "TIMELESS FABRICS. THOUGHTFUL / CHOICES." on the
                owner's screen while measuring clean on mine, which is the
                signature of a line that only just fits: at 1440 it renders 242px
                into 261px of column, 19px of slack. Any wider face — a font that
                has not loaded yet, another platform's rendering of the fallback —
                spends that and wraps.
                So it is held on one line explicitly, and the tracking is eased
                from 0.19em to 0.13em to pay for it: about 222px now, 39px of
                slack, and still unmistakably letterspaced. The size is untouched,
                so it still matches the masthead's tagline exactly.
                The indent keeps it under the wordmark rather than under the mark,
                which is how the masthead sets the same two lines. */}
            <span className="mt-1.5 block whitespace-nowrap pl-[2.625rem] text-[0.55rem] uppercase leading-none tracking-[0.13em] text-thread-pale/90">
              {STORE.tagline}
            </span>
          </Link>
          <address className="mt-5 flex gap-2.5 not-italic text-paper/80">
            <Shop />
            <span>
            {STORE.shopNo}<br />
            {STORE.area}<br />
            {STORE.city}, {STORE.state} {STORE.pincode}
            </span>
          </address>
          <p className="mt-5 text-paper/55">
            {STORE.weekdays}<br />{STORE.weekend}
          </p>
          {/* Delivery was stated on the homepage's counter section, which was
              otherwise a verbatim copy of this footer and has been removed. It
              is the one fact from there that was not already here. */}
          <p className="mt-5 text-paper/55">
            Delivered across India · ₹{STORE.shippingFee} flat
          </p>
          {/* The map, under the address it belongs to.
              The sister shop has carried this since its footer was rebuilt and
              this one never did — which meant the only shop with a real
              counter in Texvalley was the one you could not find on a map. It
              sits with the address rather than under "speak to us": it is a
              location, not a way of reaching a person. */}
          <a
            href={STORE.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex gap-2.5 border-b border-paper/25 pb-0.5 text-paper/70 transition-colors duration-500 hover:border-thread-pale hover:text-thread-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread-pale"
          >
            <Pin />
            Find us on the map
          </a>
        </div>

        <div className="min-w-0 min-[900px]:col-span-2">
          <h2 className="text-rule uppercase text-thread-pale/90">The shelf</h2>
          <ul className="mt-5 space-y-2.5">
            {SHELF.map((name) => (
              <li key={name}>
                <Link
                  href={`/products?category=${encodeURIComponent(name)}`}
                  className="text-paper/80 transition-colors duration-500 hover:text-thread-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread-pale"
                >
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0 min-[900px]:col-span-3">
          <h2 className="text-rule uppercase text-thread-pale/90">Good to know</h2>
          <ul className="mt-5 space-y-2.5">
            {POLICIES.map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className="text-paper/80 transition-colors duration-500 hover:text-thread-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread-pale"
                >
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0 min-[900px]:col-span-4">
          <h2 className="text-rule uppercase text-thread-pale/90">Speak to us</h2>
          <ul className="mt-5 space-y-2.5">
            <li className="flex gap-2.5">
              <Handset />
              <a href={`tel:${STORE.phone1}`} className="text-paper/80 transition-colors duration-500 hover:text-thread-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread-pale">
                {STORE.phone1}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Handset />
              <a href={`tel:${STORE.phone2}`} className="text-paper/80 transition-colors duration-500 hover:text-thread-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread-pale">
                {STORE.phone2}
              </a>
            </li>
            <li className="flex min-w-0 gap-2.5">
              <Envelope />
              <a href={`mailto:${STORE.email}`} className="break-all text-paper/80 transition-colors duration-500 hover:text-thread-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread-pale">
                {STORE.email}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Chat />
              <a
                href={`https://wa.me/${STORE.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-paper/80 transition-colors duration-500 hover:text-thread-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread-pale"
              >
                WhatsApp
              </a>
            </li>
            {/* THE SHOP'S INSTAGRAM, WHICH WAS NOWHERE ON THE SITE.
                It has been in `lib/config.ts` all along and rendered only by
                components/Footer.tsx — a footer this layout does not mount. So
                the one place customers actually look for a textile shop's
                photographs led nowhere, and the link existed in the codebase
                the entire time. It belongs beside WhatsApp: both are places to
                reach the shop rather than facts about it. */}
            <li className="flex gap-2.5">
              <Instagram />
              <a
                href={STORE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-paper/80 transition-colors duration-500 hover:text-thread-pale focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread-pale"
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-[7vh] flex w-full max-w-[104rem] flex-wrap items-baseline justify-between gap-4 border-t border-paper/15 pt-7">
        <p className="text-caption uppercase text-paper/50">
          © {new Date().getFullYear()} {STORE.name}
        </p>
        <p className="text-caption uppercase text-paper/50">
          {STORE.area}, {STORE.city}
        </p>
      </div>

    </footer>
  );
}
