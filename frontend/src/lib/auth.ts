/**
 * Auth helper — handles login redirect logic in one place.
 *
 * Flow:
 *   Admin  login → /admin
 *   User   login → /
 *   No token     → /auth/login  (enforced by middleware)
 */

import { authAPI } from './api';

export interface LoginResult {
  success: boolean;
  isAdmin?: boolean;
  name?: string;
  error?: string;
}

/** Call this from the login page after the user submits the form. */
export async function performLogin(
  identifier: string,
  password: string
): Promise<LoginResult> {
  try {
    const res = await authAPI.login({ identifier: identifier.trim(), password });
    const { access_token, user } = res.data;

    // 1. Store in localStorage (for AuthContext)
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(user));

    // 2. Store in cookie (for Next.js middleware route protection)
    document.cookie = `auth_token=${access_token}; path=/; max-age=86400; SameSite=Lax`;

    return { success: true, isAdmin: user.is_admin, name: user.full_name };
  } catch (err: any) {
    const msg =
      err.response?.data?.detail ||
      'Login failed. Please check your credentials.';
    return { success: false, error: msg };
  }
}

/** Call this on logout from any page. */
export function performLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  document.cookie = 'auth_token=; path=/; max-age=0';
  window.location.href = '/';
}

/** Returns the redirect URL based on user role. */
export function getRedirectUrl(isAdmin: boolean): string {
  return isAdmin ? '/admin' : '/';
}
