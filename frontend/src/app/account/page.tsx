'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package, MapPin, HelpCircle, Heart, LayoutDashboard, ShieldCheck, User,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { performLogout } from '@/lib/auth';

/**
 * THE COUNTER — a hub, and nothing else on it.
 *
 * THE MISTAKE THIS CORRECTS. The previous version put every part of an account
 * on one page: details, addresses, a password form, a device list, all stacked
 * down a single scroll. That was a deliberate move away from the tab strip
 * before it — tabs hide two thirds of a settings page behind a click — and it
 * over-corrected. Opening your account to check an order and being shown
 * "Current password / New password / Confirm new password" is a page answering
 * a question nobody asked, and the shopkeeper said so plainly.
 *
 * A password field is not something you look at. It is something you go to
 * once you have decided to change a password. Amazon — named as the standard —
 * gets this right: Your Account is a grid of destinations, and Login &
 * security is its own page. The hub answers "what can I do here"; each page
 * answers exactly one of those questions.
 *
 * So this page is now only the grid, everything on it leads somewhere real,
 * and the same destinations sit in the menu under the name in the rail
 * (components/nav/AccountMenu.tsx) — which is what "everything should be in
 * the account menu" asks for: never more than one click from anywhere.
 *
 * The sections themselves live in components/account/Sections.tsx so the hub
 * and the sub-pages cannot drift apart.
 */

export default function AccountPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) router.replace('/auth/login');
  }, [user, authLoading, router]);

  if (!user) return null;

  const initial = (user.full_name || user.email || '?').trim().charAt(0).toUpperCase();

  const places = [
    { icon: Package,     label: 'Your orders',     note: 'Track, return or exchange', href: '/orders' },
    { icon: ShieldCheck, label: 'Sign-in & security', note: 'Password and devices',   href: '/account/security' },
    { icon: MapPin,      label: 'Saved addresses', note: 'Where orders are sent',     href: '/account/addresses' },
    { icon: User,        label: 'Your details',    note: 'Name and number',           href: '/account/security#details' },
    { icon: Heart,       label: 'Kept pieces',     note: 'Everything you saved',      href: '/wishlist' },
    { icon: HelpCircle,  label: 'Help & policies', note: 'Shipping, returns, terms',  href: '/support' },
    ...(user.is_admin
      ? [{ icon: LayoutDashboard, label: 'The workroom', note: 'Manage the shop', href: '/admin', accent: true }]
      : []),
  ];

  return (
    <div className="mx-auto w-full max-w-[74rem] px-6 py-[clamp(2.5rem,7vh,4.5rem)] sm:px-10">

      {/* No breadcrumb. The mark in the rail is the way home, and a two-item
          breadcrumb reading "Home > My Account" tells a customer only where
          they already know they are. */}
      <header className="flex flex-wrap items-center gap-x-5 gap-y-4">
        <span aria-hidden="true" className="relative grid h-16 w-16 shrink-0 place-items-center">
          <svg viewBox="0 0 64 64" className="absolute inset-0 h-full w-full text-thread">
            <ellipse cx="32" cy="32" rx="24" ry="28" fill="none" stroke="currentColor"
                     strokeWidth="1.6" strokeLinecap="round" strokeDasharray="4 5" />
          </svg>
          <span className="font-display text-[1.6rem] leading-none text-graphite">{initial}</span>
        </span>

        <div className="min-w-0">
          <h1 className="font-display text-band leading-tight text-graphite">{user.full_name}</h1>
          <p className="mt-1 text-sm text-graphite-muted">{user.email}</p>
          {user.is_admin && <p className="mt-2 text-rule uppercase text-thread">Shop account</p>}
        </div>
      </header>

      {/* Each tile carries its own hairline with a real gap, rather than the
          `gap-px` + background trick: the tile count is not fixed (the
          workroom only exists for admins) and the column count changes at
          every breakpoint, so anything depending on a full last row shows a
          filled empty cell on some screen. */}
      <nav aria-label="Your account" className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {places.map(({ icon: Icon, label, note, href, accent }) => (
          <Link
            key={label}
            href={href}
            className="group flex items-start gap-4 border border-paper-edge bg-paper p-6 transition-colors duration-500 hover:border-thread/50 hover:bg-paper-shade focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-thread"
          >
            <Icon size={20} className={`mt-0.5 shrink-0 ${accent ? 'text-thread' : 'text-graphite-muted'} transition-colors duration-500 group-hover:text-thread`} />
            <span className="min-w-0">
              <span className="block font-display text-[1.15rem] leading-snug text-graphite">{label}</span>
              <span className="mt-1 block text-caption uppercase text-graphite-faint">{note}</span>
            </span>
          </Link>
        ))}
      </nav>

      {/* Leaving, in order of how permanent it is. Kept on the hub because
          these are one-line actions, not pages — sending someone to a screen
          whose only content is a "Sign out" button would be worse. */}
      <section className="mt-14 flex flex-col items-start gap-5 border-t border-paper-edge pt-10">
        <p className="text-rule uppercase text-graphite-faint">Leaving</p>

        {/* A navigation, not a sign-out. Signing out first cost you the
            session you arrived with the moment you changed your mind. */}
        <Link
          href="/auth/login?switch=1"
          className="border-b border-paper-edge pb-1 text-caption uppercase text-graphite transition-colors duration-500 hover:border-thread hover:text-thread"
        >
          Switch account →
        </Link>
        <p className="-mt-3 max-w-[46ch] text-caption text-graphite-faint">
          Opens the sign-in page so someone else can use their own account. You stay
          signed in here until they do — change your mind and nothing is lost.
        </p>

        <button
          onClick={() => performLogout()}
          className="border-b border-paper-edge pb-1 text-caption uppercase text-graphite transition-colors duration-500 hover:border-thread hover:text-thread"
        >
          Sign out →
        </button>

        <Link
          href="/account/delete"
          className="border-b border-red-700/30 pb-1 text-caption uppercase text-red-700 transition-colors duration-500 hover:border-red-700"
        >
          Delete my account →
        </Link>
      </section>
    </div>
  );
}
