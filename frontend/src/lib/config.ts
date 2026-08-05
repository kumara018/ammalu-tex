// ═══════════════════════════════════════════════════
// AMMALU TEX — STORE CONFIGURATION
// ═══════════════════════════════════════════════════

export const STORE = {
  name:        'Ammalu Tex',
  tagline:     'Premium Women\'s Textiles',

  // ── Contact Details ──────────────────────────────
  phone1:      '+91 99941 68839',
  phone2:      '+91 94439 48272',
  email:       'admin@ammalutex.com',
  supportEmail:'pnagaraji272@gmail.com',
  whatsapp:    '919994168839',   // country code + number, no + or spaces

  // ── Address ──────────────────────────────────────
  shopNo:      'Shop Ground Floor No 129',
  area:        'Texvalley Gangapuram',
  city:        'Erode',
  state:       'Tamil Nadu',
  pincode:     '638004',
  country:     'India',

  // ── Store Timings ─────────────────────────────────
  weekdays:    'Mon – Fri: 10:00 AM – 8:00 PM',
  weekend:     'Sat – Sun: 10:00 AM – 9:30 PM',

  // ── Shipping ──────────────────────────────────────
  shippingFee: 49,

  // ── Social Media ─────────────────────────────────
  facebook:    'https://facebook.com/kumara018',
  instagram:   'https://instagram.com/ammalutexpartywears',
  twitter:     'https://x.com/kumara018',

  // ── Google Maps ───────────────────────────────────
  googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Texvalley+Gangapuram+Erode+Tamil+Nadu',

  // ── SEO / Meta ────────────────────────────────────
  description: 'Shop premium Chudithar, Tops, Lehenga, Crop Tops & Party Wears at Ammalu Tex. Located at Shop Ground Floor No 129, Texvalley Gangapuram.',
};

export const FULL_ADDRESS  = `${STORE.shopNo}, ${STORE.area}, ${STORE.city}, ${STORE.state} – ${STORE.pincode}`;
export const SHORT_ADDRESS = `${STORE.shopNo}, ${STORE.area}`;
export const WHATSAPP_URL  = `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent('Hi! I\'m interested in your products at Ammalu Tex.')}`;
export const MAIL_URL      = `mailto:${STORE.email}`;
export const CALL_URL      = `tel:${STORE.phone1}`;
