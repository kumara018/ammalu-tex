'use client';

import { usePathname } from 'next/navigation';
import AtelierRail from './AtelierRail';
import { isAuthRoute } from '@/lib/routes';

/**
 * Decides whether the navigation appears at all.
 *
 * The auth screens are a single focused card on an otherwise empty page — no
 * rail, no footer, no competing links. The only way back to the shop is the
 * mark above the card. Every extra affordance on a sign-in page is an
 * invitation to abandon it.
 *
 * A separate gate rather than an early return inside the rail, so that
 * component's hook order stays untouched: an early return above its hooks
 * would be a conditional-hook bug, and below them it would still run every
 * effect and subscription on a page that never shows it.
 */
export default function NavGate() {
  const pathname = usePathname();
  if (isAuthRoute(pathname)) return null;
  return <AtelierRail />;
}

/** The same rule for the ambient chrome (the sound toggle). */
export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isAuthRoute(pathname)) return null;
  return <>{children}</>;
}
