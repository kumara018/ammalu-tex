import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require the user to be logged in
const PROTECTED = ['/admin', '/cart', '/orders', '/checkout'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  const needsAuth = PROTECTED.some((r) => pathname.startsWith(r));

  if (needsAuth && !token) {
    // Not logged in → send to login page
    const url = new URL('/auth/login', request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/cart', '/orders/:path*', '/checkout'],
};
