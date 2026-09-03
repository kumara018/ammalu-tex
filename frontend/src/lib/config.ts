// ═══════════════════════════════════════════════════
// AMMALU TEX — STORE CONFIGURATION
// ═══════════════════════════════════════════════════

export const STORE = {
  name:        'Ammalu Tex',
  tagline:     'Timeless fabrics. Thoughtful choices.',

  // ── Contact Details ──────────────────────────────
  phone1:      '+91 99941 68839',
  phone2:      '+91 94439 48272',
  /* THE SHOP'S CONTACT ADDRESS. This is where customers write TO, and it is
     the mailbox the shop actually reads — shown on the footer and every
     policy page.

     admin@ammalutex.com is not listed anywhere any more. It was a paid
     Hostinger mailbox and the plan was not renewed, so mail sent to it now
     bounces, and advertising an address that bounces is worse than not
     advertising one.

     SENDING IS UNTOUCHED BY THAT. Order mail goes out through Brevo's HTTP
     API, and what authorises it is DNS — the SPF include, the brevo1/brevo2
     DKIM records and the brevo-code TXT, all still present on the domain.
     Brevo never logged into the mailbox. `SMTP_EMAIL` on the server stays set
     to the domain address on purpose: a From on the shop's own domain is what
     keeps DKIM aligned, and sending as an address does not require an inbox
     behind it. Replies land here, in the Gmail, which is where they already
     went. */
  email:       'ammalutexpartywear@gmail.com',
  supportEmail:'ammalutexpartywear@gmail.com',
  whatsapp:    '919994168839',   // country code + number, no + or spaces

  // ── Address ──────────────────────────────────────
  shopNo:      'Shop Ground Floor No 129',
  area:        'Texvalley Gangapuram',
  city:        'Erode',
  state:       'Tamil Nadu',
  pincode:     '638102',
  country:     'India',

  // ── Store Timings ─────────────────────────────────
  weekdays:    'Mon – Fri: 10:00 AM – 8:00 PM',
  weekend:     'Sat – Sun: 10:00 AM – 9:30 PM',

  // ── Shipping ──────────────────────────────────────
  shippingFee: 49,

  // ── Social Media ─────────────────────────────────
  instagram:   'https://www.instagram.com/ammalutexpartywears',

  // ── Google Maps ───────────────────────────────────
  /* THE SHOP ITSELF, BY ITS GOOGLE PLACE ID — not a text search.
     The previous value searched for "Texvalley Gangapuram Erode Tamil Nadu",
     which drops the customer on the mall, or on whatever Google decides that
     phrase means today. A `cid` link resolves to this exact listing, with its
     reviews, photographs and hours, and cannot drift as the search index
     changes. 511591655254571759 is 0x71989e66180baef from the place URL.
     Coordinates 11.3716624, 77.6444374. */
  googleMapsUrl: 'https://www.google.com/maps?cid=511591655254571759',

  // ── SEO / Meta ────────────────────────────────────
  description: 'Shop premium Chudithar, Tops, Lehenga, Crop Tops & Party Wears at Ammalu Tex. Located at Shop Ground Floor No 129, Texvalley Gangapuram.',
};

export const FULL_ADDRESS  = `${STORE.shopNo}, ${STORE.area}, ${STORE.city}, ${STORE.state} – ${STORE.pincode}`;
export const SHORT_ADDRESS = `${STORE.shopNo}, ${STORE.area}`;
export const WHATSAPP_URL  = `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent('Hi! I\'m interested in your products at Ammalu Tex.')}`;
export const MAIL_URL      = `mailto:${STORE.email}`;
export const CALL_URL      = `tel:${STORE.phone1}`;
