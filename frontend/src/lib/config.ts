// ═══════════════════════════════════════════════════
// AMMALU TEX — STORE CONFIGURATION
// Edit this file to update contact details, timings,
// and store info across the entire website.
// ═══════════════════════════════════════════════════

export const STORE = {
  name:        'Ammalu Tex',
  tagline:     'Premium Women\'s Textiles',

  // ── Contact Details ──────────────────────────────
  phone1:      '+91 98765 43210',
  phone2:      '+91 98765 43211',
  email:       'info@ammalutex.com',
  supportEmail:'support@ammalutex.com',
  whatsapp:    '+91 98765 43210',

  // ── Address ──────────────────────────────────────
  shopNo:      'Shop Ground Floor No 129',
  area:        'Texvalley Gangapuram',
  city:        'Erode',
  state:       'Tamil Nadu',
  pincode:     '638004',
  country:     'India',

  // ── Store Timings ─────────────────────────────────
  weekdays:    'Mon – Sat: 9:00 AM – 8:00 PM',
  sunday:      'Sunday: 10:00 AM – 6:00 PM',

  // ── Shipping ──────────────────────────────────────
  freeShippingAbove: 999,
  shippingFee:       49,

  // ── Social Media (paste your links here) ─────────
  facebook:    'https://facebook.com',
  instagram:   'https://instagram.com',
  twitter:     'https://twitter.com',

  // ── SEO / Meta ────────────────────────────────────
  description: 'Shop premium Chudithar, Tops, Lehenga, Crop Tops & Party Wears at Ammalu Tex. Located at Shop Ground Floor No 129, Texvalley Gangapuram.',
};

// Full address as one line
export const FULL_ADDRESS = `${STORE.shopNo}, ${STORE.area}, ${STORE.city}, ${STORE.state} – ${STORE.pincode}`;

// Short address for navbar
export const SHORT_ADDRESS = `${STORE.shopNo}, ${STORE.area}`;
