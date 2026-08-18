import { getApiBase } from './api';

/**
 * The one place a stored image path becomes a URL.
 *
 * Product images are stored either as an absolute Cloudinary URL (what the
 * admin upload writes today) or as a backend-relative path (`/uploads/…`, from
 * older imports). Seven components were doing that join by hand as
 * `${process.env.NEXT_PUBLIC_API_URL}${path}`.
 *
 * WHY THAT IS WRONG HERE. `next.config.js` inlines that variable at build time
 * with the Render URL as its fallback, while `getApiBase()` resolves at
 * RUNTIME — Render on the real domain, localhost when the page is served from
 * localhost. So on a local production build every one of those call sites
 * pointed at the LIVE backend while the rest of the app talked to localhost.
 * Two independent definitions of "where the backend is", agreeing by
 * coincidence rather than by construction. The identical bug was found and
 * fixed in AuthContext earlier in this work, where it was sending a customer's
 * bearer token to production from a local build.
 *
 * One function, one answer, so images and data can never disagree about which
 * backend they came from.
 */
export function mediaUrl(path?: string | null): string {
  if (!path) return '';
  // Already absolute — Cloudinary, or a full URL stored by an older import.
  if (/^https?:\/\//i.test(path)) return path;
  const base = getApiBase();
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
}
