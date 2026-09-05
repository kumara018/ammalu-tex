import axios from 'axios';

/** Used only when nothing valid is configured. See getApiBase below. */
const FALLBACK_API = 'https://ammalu-tex.onrender.com';

/**
 * The one place that decides which backend the browser talks to.
 *
 * Exported so nothing has to reimplement it. Three call sites in AuthContext
 * used `process.env.NEXT_PUBLIC_API_URL || <render url>` instead, and because
 * next.config inlines that variable with the Render fallback, a build served
 * from localhost sent the customer's bearer token to the LIVE backend on two of
 * them. CORS blocked it, which means the "fetch fresh user data" path had never
 * worked locally at all.
 *
 * WHY THIS READS THE ENVIRONMENT AND NO LONGER HARDCODES A HOST.
 *
 * It used to return the Render URL for every non-localhost host and ignore
 * NEXT_PUBLIC_API_URL completely — while next.config.js built the Content
 * Security Policy FROM that variable. The policy and the requests came from
 * two different sources of truth, and nothing checked they agreed.
 *
 * The consequence that actually blocked a migration: the API origin could not
 * be changed by configuration. Setting the variable on the host moved the CSP
 * and nothing else, so the browser was handed a policy naming the new origin
 * while the code carried on calling the old one — a change that looks applied,
 * deploys green, and serves a shop that quietly cannot reach its backend.
 *
 * next.config.js validates this variable and rewrites it to a bare origin
 * before it reaches the bundle, so what arrives here has already been checked
 * and normalised. The guard below is belt and braces — this value decides
 * where a customer's bearer token is sent, as the AuthContext bug above shows.
 */
export function getApiBase(): string {
  /*
   * Local development keeps its local backend with no configuration at all,
   * and this is checked FIRST on purpose: it means a production value left in
   * a developer's environment can never point their browser — and the token in
   * their localStorage — at the live shop. That is the same failure the
   * AuthContext note above describes, closed off at the source this time.
   */
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:8000';
    }
  }

  const configured = (process.env.NEXT_PUBLIC_API_URL || '').trim();
  if (configured) {
    try {
      const url = new URL(configured);
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        return url.origin; // normalised: no trailing slash, no path
      }
    } catch {
      // Deliberately silent here. next.config.js has already printed the
      // reason into the build log, where somebody can actually see it.
    }
  }
  return FALLBACK_API;
}

const API_BASE = getApiBase();

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 65000, // 65s — Render cold starts can take up to 60s
});

// Attach JWT token to every request. Callers that need to authenticate as a
// specific (soon-to-change) account — e.g. logging out of one saved account
// while switching to another — can set config.headers.Authorization
// themselves; that explicit value is left alone instead of being clobbered
// by whatever localStorage holds when this interceptor actually runs (it
// runs as a microtask, i.e. after the current account switch has already
// written the new token to localStorage — see authAPI.logout).
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined' && !config.headers.Authorization) {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Sliding session: the backend silently re-issues a fresh, longer-lived
// token on any authenticated call once the current one is due for renewal
// (see auth.py::get_current_user) — pick it up here so it applies no matter
// which API call triggered it, not just /me. This is what keeps a device
// signed in indefinitely as long as it's actually being used, matching
// Amazon/Flipkart rather than forcing a re-login once a fixed window passes.
function _applyNewTokenHeader(res: any) {
  const newToken = res?.headers?.['x-new-token'];
  if (newToken && typeof window !== 'undefined') {
    localStorage.setItem('token', newToken);
    document.cookie = `auth_token=${newToken}; path=/; max-age=7776000; SameSite=Lax`; // 90 days
  }
}

// Auto-logout ONLY when token is confirmed invalid (401 on /api/auth/me).
// Never logout on network errors, timeouts, 5xx, or server cold-starts.
api.interceptors.response.use(
  (res) => {
    _applyNewTokenHeader(res);
    return res;
  },
  async (err) => {
    const url    = err.config?.url || '';
    const status = err.response?.status;

    // Skip all auth-related endpoints — they handle their own errors
    const isAuthEndpoint =
      url.includes('/api/auth/login')             ||
      url.includes('/api/auth/register')          ||
      url.includes('/api/auth/forgot')            ||
      url.includes('/api/auth/reset')             ||
      url.includes('/api/auth/send-login-otp')    ||
      url.includes('/api/auth/verify-login-otp')  ||
      url.includes('/api/auth/me');

    // Only act on 401s from non-auth endpoints
    if (status === 401 && !isAuthEndpoint && typeof window !== 'undefined') {
      // Double-check: confirm /api/auth/me ALSO returns 401
      // (avoids logging out during a brief server restart or 401 glitch)
      try {
        await api.get('/api/auth/me');
        // /api/auth/me succeeded → token is valid, this was a one-off 401, ignore
      } catch (meErr: unknown) {
        const meStatus = (meErr as { response?: { status?: number } })?.response?.status;
        // Only logout if we get a definitive 401 — not a timeout/network/5xx error
        if (meStatus === 401) {
          /*
           * ONE DEAD ACCOUNT MUST NOT SIGN OUT THE OTHERS.
           *
           * This used to remove `sessions` — the whole saved-account list — the
           * moment any single token expired. A customer signed into two
           * accounts lost both, was thrown to the login page, and had to type
           * two sets of credentials to get back to where they were. That is the
           * precise opposite of what the account switcher is for: the switcher
           * exists so you never re-prove an account you already hold, and this
           * threw all of them away over one.
           *
           * Only the token that actually failed is dropped. If another signed-in
           * account remains, we move to it rather than to the login page —
           * which is what every shop with account switching does, because being
           * shown a login form while you are still signed into something is
           * both wrong and alarming.
           */
          const dead = localStorage.getItem('token');
          let remaining: Array<{ token: string; user: { is_admin?: boolean } }> = [];
          try {
            remaining = JSON.parse(localStorage.getItem('sessions') || '[]')
              .filter((s: { token?: string }) => s?.token && s.token !== dead);
          } catch {
            remaining = [];   // unreadable list — treat as none rather than throw
          }

          if (remaining.length > 0) {
            const next = remaining[0];
            localStorage.setItem('sessions', JSON.stringify(remaining));
            localStorage.setItem('token', next.token);
            localStorage.setItem('user', JSON.stringify(next.user));
            document.cookie = `auth_token=${next.token}; path=/; max-age=7776000; SameSite=Lax`;
            // A full load, not a push: the dead account's bag and kept pieces
            // are still in memory. Same reasoning as switching by hand.
            window.location.href = next.user?.is_admin ? '/admin' : '/';
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('sessions');
            document.cookie = 'auth_token=; path=/; max-age=0';
            window.location.href = '/auth/login';
          }
        }
        // meStatus undefined (timeout/network) or 5xx → server is down, keep user logged in
      }
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register:            (data: object) => api.post('/api/auth/register', data),
  verifyRegisterOtp:   (data: object) => api.post('/api/auth/verify-register-otp', data),
  resendRegisterOtp:   (data: object) => api.post('/api/auth/resend-register-otp', data),
  login:               (data: object) => api.post('/api/auth/login', data),
  // Does this phone or email have an account? Asked by the sign-in form's
  // first step so a new customer is sent to Create Account rather than being
  // failed on a password they never had. Answers one bit and a masked echo.
  lookup:              (data: object) => api.post('/api/auth/lookup', data),
  sendLoginOtp:        (data: object) => api.post('/api/auth/send-login-otp', data),
  verifyLoginOtp:      (data: object) => api.post('/api/auth/verify-login-otp', data),
  evictAndLogin:       (data: object) => api.post('/api/auth/sessions/evict-and-login', data),
  // token: pass the account's own token explicitly when signing it out while
  // switching to another saved account — see the request interceptor above.
  logout:              (token?: string) => api.post('/api/auth/logout', {}, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined),
  getMe:               ()             => api.get('/api/auth/me'),
  updateProfile:       (data: object) => api.put('/api/auth/me', data),
  forgotPassword:      (data: object) => api.post('/api/auth/forgot-password', data),
  resetPassword:       (data: object) => api.post('/api/auth/reset-password', data),
  requestDeleteAccount:    ()             => api.post('/api/auth/request-delete-account'),
  confirmDeleteAccount:    (data: object) => api.post('/api/auth/confirm-delete-account', data),
  cancelDeleteAccount:     ()             => api.post('/api/auth/cancel-delete-account'),
  requestDeactivateAccount:()             => api.post('/api/auth/request-deactivate-account'),
  confirmDeactivateAccount:(data: object) => api.post('/api/auth/confirm-deactivate-account', data),
  getSessions:         ()             => api.get('/api/auth/sessions'),
  revokeSession:       (id: number)   => api.delete(`/api/auth/sessions/${id}`),
  /**
   * Sign out everywhere, in ONE transaction on the server.  (AUTH-SPEC R5)
   *
   * Not a loop over revokeSession. The loop is fine for tidying up an old
   * tablet and wrong for the case this exists to serve — a customer who thinks
   * their account is compromised: it is not atomic, it races the sliding-session
   * refresh below, and a partial failure leaves them believing they are safe
   * when an attacker still holds a live token.
   */
  revokeAllSessions:   (exceptCurrent = true) =>
    api.post('/api/auth/sessions/revoke-all', { except_current: exceptCurrent }),
};

export const productsAPI = {
  /* `config` carries an AbortSignal for search-as-you-type. It must be a
     SECOND argument: a signal passed inside `params` would be serialised into
     the query string and silently never abort anything. */
  getAll:           (params?: object, config?: object) => api.get('/api/products/', { params, ...config }),
  getOne:           (id: number)               => api.get(`/api/products/${id}`),
  getCategories:    ()                         => api.get('/api/products/categories'),
  getReviews:       (id: number)               => api.get(`/api/products/${id}/reviews`),
  canReview:        (id: number)               => api.get(`/api/products/${id}/can-review`),
  addReview:        (id: number, data: object) => api.post(`/api/products/${id}/reviews`, data),
  getRecentReviews: (limit = 6)               => api.get('/api/products/recent-reviews', { params: { limit, min_rating: 4 } }),
};

export const cartAPI = {
  get:    ()                             => api.get('/api/cart/'),
  add:    (data: object)                 => api.post('/api/cart/', data),
  update: (id: number, quantity: number) => api.put(`/api/cart/${id}?quantity=${quantity}`),
  remove: (id: number)                   => api.delete(`/api/cart/${id}`),
  clear:  ()                             => api.delete('/api/cart/'),
};

export const ordersAPI = {
  place:       (data: object)                => api.post('/api/orders/', data),
  getAll:      ()                            => api.get('/api/orders/'),
  getOne:      (id: number)                  => api.get(`/api/orders/${id}`),
  cancel:      (id: number, reason?: string) => api.post(`/api/orders/${id}/cancel`, { reason: reason || '' }),
  track:       (id: number)                  => api.get(`/api/orders/${id}/track`),
  sendInvoice: (id: number)                  => api.post(`/api/orders/${id}/send-invoice`),
};

export const addressAPI = {
  getAll:     ()                             => api.get('/api/addresses/'),
  add:        (data: object)                 => api.post('/api/addresses/', data),
  update:     (id: number, data: object)     => api.put(`/api/addresses/${id}`, data),
  remove:     (id: number)                   => api.delete(`/api/addresses/${id}`),
  setDefault: (id: number)                   => api.put(`/api/addresses/${id}/set-default`),
};

export const adminAPI = {
  /** What actually broke, in real customers' browsers. Admin-only. */
  getClientErrors:     ()             => api.get('/api/client-errors/recent'),
  /** Which third parties are actually switched on. Admin-only, never returns a key. */
  getIntegrations:     ()             => api.get('/api/diagnostics/integrations'),
  dashboard:          ()                           => api.get('/api/admin/dashboard'),
  getProducts:        ()                           => api.get('/api/admin/products'),
  createProduct:      (data: object)               => api.post('/api/admin/products', data),
  updateProduct:      (id: number, data: object)   => api.put(`/api/admin/products/${id}`, data),
  deleteProduct:      (id: number)                 => api.delete(`/api/admin/products/${id}`),
  uploadImage:        (form: FormData)             => api.post('/api/admin/products/upload-image', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadVideo:        (form: FormData)             => api.post('/api/admin/products/upload-video', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getOrders:               (status?: string)            => api.get('/api/admin/orders', { params: status ? { status } : {} }),
  updateOrderStatus:       (id: number, data: object)   => api.put(`/api/admin/orders/${id}/status`, data),
  createDelhiveryShipment: (id: number)                 => api.post(`/api/admin/orders/${id}/create-delhivery-shipment`),
  syncDelhivery:           (id: number)                 => api.post(`/api/admin/orders/${id}/sync-delhivery`),
  checkServiceability:     (id: number)                 => api.get(`/api/admin/orders/${id}/check-serviceability`),
  initiateRefund:          (id: number)                 => api.post(`/api/payments/admin/orders/${id}/initiate-refund`),
  markRefunded:            (id: number)                 => api.post(`/api/payments/admin/orders/${id}/mark-refunded`),
  resetToRefundInitiated:  (id: number)                 => api.post(`/api/payments/admin/orders/${id}/reset-to-refund-initiated`),
  getUsers:                ()                           => api.get('/api/admin/users'),
  updateSettings:          (data: object)               => api.put('/api/admin/settings', data),
};

export const supportAPI = {
  submitRating:     (data: object) => api.post('/api/support/rating', data),
  getRatingSummary: ()             => api.get('/api/support/rating/summary'),
  // CS Interaction flow
  createInteraction: (data: object) => api.post('/api/support/interactions', data),
  listInteractions:  ()             => api.get('/api/support/interactions'),
  getRatingPage:     (token: string) => api.get(`/api/support/rate/${token}`),
  submitTokenRating: (token: string, data: object) => api.post(`/api/support/rate/${token}`, data),
};

export const returnsAPI = {
  create:      (data: object)    => api.post('/api/returns/', data),
  getAll:      ()                => api.get('/api/returns/'),
  getOne:      (id: number)      => api.get(`/api/returns/${id}`),
  uploadImage: (form: FormData)  => api.post('/api/returns/upload-image', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const wishlistAPI = {
  getAll:  ()                => api.get('/api/wishlist/'),
  getIds:  ()                => api.get('/api/wishlist/ids'),
  add:     (product_id: number) => api.post('/api/wishlist/', { product_id }),
  remove:  (product_id: number) => api.delete(`/api/wishlist/${product_id}`),
};

export const adminReturnsAPI = {
  getAll:       ()                          => api.get('/api/admin/returns'),
  updateStatus: (id: number, data: object) => api.put(`/api/admin/returns/${id}/status`, data),
  syncDelhivery: (id: number)               => api.post(`/api/admin/returns/${id}/sync-delhivery`),
  retryPickup:      (id: number)            => api.post(`/api/admin/returns/${id}/retry-pickup`),
  retryReplacement: (id: number)            => api.post(`/api/admin/returns/${id}/retry-replacement`),
  attachAwb:        (id: number, awb: string) => api.post(`/api/admin/returns/${id}/attach-awb`, { awb }),
};

export const adminNotifAPI = {
  getAll:    ()           => api.get('/api/admin/notifications'),
  readOne:   (id: number) => api.put(`/api/admin/notifications/${id}/read`),
  readAll:   ()           => api.put('/api/admin/notifications/read-all'),
};

export default api;
