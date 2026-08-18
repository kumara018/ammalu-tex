/** @type {import('next').NextConfig} */
const path = require('path');
const RENDER_URL = 'https://ammalu-tex.onrender.com';

const nextConfig = {
  // Explicitly set Turbopack workspace root so Vercel (no parent lockfile)
  // doesn't fail with "path argument must be string, received undefined".
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Embed the API URL at build time.
  // Vercel env var takes priority; Render URL is the production fallback.
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || RENDER_URL,
  },

  images: {
    remotePatterns: [
      { protocol: 'http',  hostname: 'localhost',              port: '8000' },
      { protocol: 'https', hostname: 'ammalu-tex.onrender.com'              },
      { protocol: 'https', hostname: 'res.cloudinary.com'                   },
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
    // BOTH origins the browser may legitimately call, because getApiBase()
    // decides at RUNTIME: the Render URL on the real domain, localhost when the
    // page is served from localhost. A policy built only from the build-time
    // value blocks every API call during local production verification, which
    // makes the whole gate unrunnable and therefore ignored.
    const api = process.env.NEXT_PUBLIC_API_URL || RENDER_URL;
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
      "connect-src 'self' " + api + ' ' + local + ' https://*.razorpay.com https://lumberjack.razorpay.com',
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
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
