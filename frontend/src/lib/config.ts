// ═══════════════════════════════════════════════════
// AMMALU TEX — STORE CONFIGURATION
// Edit this file to update contact details, timings,
// social media and store info across the entire website.
// ═══════════════════════════════════════════════════

export const STORE = {
  name:        'Ammalu Tex',
  tagline:     'Premium Women\'s Textiles',

  // ── Contact Details ──────────────────────────────
  phone1:      '+91 98765 43210',
  phone2:      '+91 98765 43211',
  email:       'info@ammalutex.com',
  supportEmail:'support@ammalutex.com',
  whatsapp:    '919876543210',          // country code + number, no + or spaces

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

  // ── Social Media — paste your real links here ─────
  facebook:    'https://facebook.com/ammalutex',
  instagram:   'https://instagram.com/ammalutex',
  twitter:     'https://x.com/ammalutex',          // X (formerly Twitter)
  youtube:     '',

  // ── Google Maps ───────────────────────────────────
  // Update lat/lng to your exact shop coordinates
  mapLat:      11.3410,
  mapLng:      77.7172,
  googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Texvalley+Gangapuram+Erode+Tamil+Nadu',

  // ── SEO / Meta ────────────────────────────────────
  description: 'Shop premium Chudithar, Tops, Lehenga, Crop Tops & Party Wears at Ammalu Tex. Located at Shop Ground Floor No 129, Texvalley Gangapuram.',
};

// Full address as one line
export const FULL_ADDRESS = `${STORE.shopNo}, ${STORE.area}, ${STORE.city}, ${STORE.state} – ${STORE.pincode}`;

// Short address for navbar
export const SHORT_ADDRESS = `${STORE.shopNo}, ${STORE.area}`;

// WhatsApp chat link (pre-filled message)
export const WHATSAPP_URL = `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent('Hi! I\'m interested in your products at Ammalu Tex.')}`;

// Email link
export const MAIL_URL = `mailto:${STORE.email}`;

// Call link
export const CALL_URL = `tel:${STORE.phone1}`;
