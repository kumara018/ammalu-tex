/** @type {import('next').NextConfig} */
const path = require('path');
const RENDER_URL = 'https://ammalu-tex.onrender.com';

/**
 * THE API ORIGIN, AND WHY THIS FUNCTION EXISTS.
 *
 * The sibling shop went dark and nobody could see why. Every page that needed data
 * showed its error state — "The rail didn't load", "0 PIECES", "We could not
 * load your devices" — while the backend itself was healthy, answered 200 in
 * under half a second, and returned correct CORS headers for the real origin.
 *
 * The cause was one environment variable. NEXT_PUBLIC_API_URL on the host held
 * `rzp_live_…` — a Razorpay key ID pasted into the wrong box. The CSP is built
 * from that variable, so the shipped policy read:
 *
 *   connect-src 'self' rzp_live_… http://localhost:8000 …
 *
 * and the browser blocked every single call to the Render backend, because the
 * origin the code actually calls was not on the list. img-src too, so product
 * photographs would have been blocked even if the data had arrived.
 *
 * THE REAL DEFECT WAS THE ONE THAT LET A TYPO DO THAT, AND IT IS NOW FIXED.
 * `lib/api.ts::getApiBase()` used to decide the API origin at runtime without
 * reading this variable at all — it returned RENDER_URL on any non-localhost
 * host. The policy was built from one source of truth and the requests from
 * another, and nothing checked they agreed.
 *
 * That also made the backend unmovable by configuration: setting this variable
 * changed the policy and nothing else, so the browser got a policy naming the
 * new origin while the code still called the old one. It surfaced during the
 * move off Render — the shop had a healthy new API, correct DNS, a valid
 * certificate, and a frontend that could not be pointed at it.
 *
 * getApiBase() now reads this same variable, so there is ONE source of truth
 * and the value below is genuinely the origin the browser will call. What
 * remains here is validation: a value that is not a URL cannot possibly be an
 * API origin, so anything that is not an absolute http(s) origin is rejected
 * loudly in the build log and RENDER_URL kept instead. A misconfigured
 * variable costs a warning rather than a shop.
 */
function apiOrigin() {
  const raw = (process.env.NEXT_PUBLIC_API_URL || '').trim();
  if (!raw) return RENDER_URL;
  try {
    const u = new URL(raw);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error('protocol');
    return u.origin; // normalised: no trailing slash, no path, no stray whitespace
  } catch {
    console.warn(
      `\n  next.config.js: NEXT_PUBLIC_API_URL is not a valid http(s) URL (${JSON.stringify(raw)}).` +
        `\n  Ignoring it and using ${RENDER_URL}, which is what lib/api.ts calls anyway.` +
        `\n  If this was meant to be the Razorpay key, it belongs in NEXT_PUBLIC_RAZORPAY_KEY_ID.\n`
    );
    return RENDER_URL;
  }
}

/** Just the host of whatever apiOrigin() resolved to, for next/image. */
function apiHostname() {
  try {
    return new URL(apiOrigin()).hostname;
  } catch {
    return new URL(RENDER_URL).hostname;
  }
}

const nextConfig = {
  // Explicitly set Turbopack workspace root so Vercel (no parent lockfile)
  // doesn't fail with "path argument must be string, received undefined".
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Embed the API URL at build time.
  // Vercel env var takes priority; Render URL is the production fallback.
  env: {
    NEXT_PUBLIC_API_URL: apiOrigin(),
  },

  /**
   * Hosts next/image is allowed to optimise from.
   *
   * The API host is derived from the SAME value the CSP and lib/api.ts use, so
   * moving the backend cannot leave this list behind. It was hardcoded to
   * Render, which meant any backend-relative image would have 400'd from the
   * optimiser the moment the API moved — the one remaining place where the
   * origin was written down a second time.
   */
  images: {
    remotePatterns: [
      { protocol: 'http',  hostname: 'localhost', port: '8000' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      ...[apiHostname(), new URL(RENDER_URL).hostname]
        .filter((h, i, all) => all.indexOf(h) === i)
        .map((hostname) => ({ protocol: 'https', hostname })),
    ],
  },

  /**
   * Security headers. There were none at all before this.
   *
   * Content-Security-Policy
   *   The one that limits the damage of an injected script. Written for what
   *   this site actually loads: Razorpay's checkout, the Render API, Cloudinary
   *   for product media, and the site's own assets. Nothing else may execute or
   *   be connected to.
   *
   *   'unsafe-inline' and 'unsafe-eval' are present for scripts, and that is an
   *   honest compromise rather than an oversight: Next's inline bootstrap
   *   requires them and Razorpay injects inline script of its own. Removing
   *   them needs a nonce-based CSP wired through the document, which is real
   *   work and would break the payment modal if got wrong. The policy still
   *   blocks the main prize — loading script from an attacker's domain.
   *
   *   `res.cloudinary.com` is not optional. The backend uploads product
   *   photographs and videos there and stores the absolute URL, so a policy
   *   written from the frontend's own relative paths blocks every product
   *   picture on the site. That exact mistake was made on the sister shop and
   *   only found by loading the built site in a real browser.
   *
   * Strict-Transport-Security
   *   Two years, subdomains included. A customer who once reached the shop over
   *   https never silently downgrades.
   *
   * X-Frame-Options / frame-ancestors
   *   Nothing here should ever be framed. Both are set because older browsers
   *   honour only the header and newer ones only the directive.
   *
   * Permissions-Policy
   *   Nothing needs the camera, the microphone or geolocation, so they are off.
   *   A dependency that asks fails loudly instead of silently prompting.
   */
  async headers() {
    // The configured origin, with RENDER_URL always allowed alongside it.
    // getApiBase() now reads the same variable, so only one of these is ever
    // called — but during a backend cutover the pages still in Vercel's cache,
    // and any rollback of the variable, both call the OLD origin. A policy
    // allowing only the new one would turn a routine revert into an outage.
    // Localhost stays listed so the built site can be verified on a laptop;
    // a security gate that only runs in production is a gate nobody runs.
    // Drop RENDER_URL once Render is gone.
    const api = apiOrigin() === RENDER_URL ? RENDER_URL : `${apiOrigin()} ${RENDER_URL}`;
    const local = 'http://localhost:8000 http://127.0.0.1:8000';
    const media = 'https://res.cloudinary.com';
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://*.razorpay.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: " + api + ' ' + local + ' ' + media + ' https://*.razorpay.com',
      "media-src 'self' data: blob: " + media,
      "font-src 'self' data:",
      /* nominatim.openstreetmap.org is checkout's reverse geocoder: it turns the
         coordinates from "Use my current location" into a street, city, state
         and pincode. Without it here the browser BLOCKS that request, so the
         feature finds the customer and then fails with "could not turn that
         into an address" — the same shape of bug as geolocation=() in
         Permissions-Policy, our own header saying no. */
      "connect-src 'self' " + api + ' ' + local + ' https://*.razorpay.com https://lumberjack.razorpay.com https://nominatim.openstreetmap.org',
      'frame-src https://api.razorpay.com https://*.razorpay.com',
      "worker-src 'self' blob:",
      'upgrade-insecure-requests',
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
