'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { performLogout } from '@/lib/auth';

/**
 * The account menu that opens under the name in the rail.
 *
 * WHAT IT REPLACES. The rail showed the customer's first name as a plain link
 * to /account. One click, one destination, and everything else a signed-in
 * customer might want — their orders, the pieces they kept, an address, a
 * return, signing out, signing in as somebody else — was a second navigation
 * away, findable only by landing on the account page and reading it.
 *
 * Amazon's structure is the one asked for by name, and it is right: the
 * account-level actions at the top, the places below, one rule between them.
 * That is borrowed. The look is not — this is paper, thread and graphite, a
 * single hairline panel on the shop's own ground.
 *
 * THE PANEL IS NOT A CARD. It has a hairline and a paper fill and no shadow,
 * because a drop shadow on a paper ground reads as a floating tile, which is
 * the one thing this shop's design has consistently refused. It is a slip of
 * paper laid on the counter.
 *
 * Behaviour: closes on Escape (returning focus to the trigger, so a keyboard
 * user is not dropped at the top of the document), on a click outside, and on
 * navigation. Signed out, there is no menu at all — it is a link straight to
 * the sign-in page, because a menu whose every item says "sign in first"
 * wastes a click.
 */

export default function AccountMenu() {
  const { user, sessions, switchAccount } = useAuth();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); trigger.current?.focus(); }
    };
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [open]);

  const linkCls =
    'text-caption uppercase text-graphite-muted transition-colors duration-500 hover:text-thread focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-thread';

  if (!user) {
    return <Link href="/auth/login" className={linkCls}>Sign in</Link>;
  }

  const first = (user.full_name || '').trim().split(' ')[0] || 'Account';

  /* Every saved account except the one currently active. Filtered by id
     rather than by token, because a refreshed token would otherwise make an
     account appear twice — once as itself and once as "another account". */
  const others = (sessions ?? []).filter((s) => s.user.id !== user?.id);

  const item =
    'block w-full px-5 py-2.5 text-left text-caption uppercase text-graphite-muted transition-colors duration-300 hover:bg-paper-shade hover:text-thread focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-thread';

  return (
    <div ref={wrap} className="relative">
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`${linkCls} ${open ? 'text-thread' : ''}`}
      >
        {first}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Your account"
/* HEIGHT CAP: `dvh`, NOT `vh`, AND NINE REMS OF CLEARANCE.
                 `vh` is the LARGEST the viewport gets — on a phone it measures
                 the window as though the address bar were retracted, so with
                 the bar showing this panel is sized taller than the screen it
                 is on and its last item sits underneath browser chrome the
                 customer cannot scroll away. `dvh` tracks the space actually
                 available. On the desktop the two are identical, which is why
                 measuring it here never showed the fault.
                 The subtrahend was 7rem, and the panel opens ~6rem down: that
                 left sixteen pixels between the menu and the bottom edge, so
                 the scrollbar existed but had nowhere to be seen and the last
                 row read as cut off rather than scrollable. */
              className="absolute right-0 top-8 z-50 flex max-h-[calc(100dvh-9rem)] w-60 flex-col overflow-y-auto overscroll-contain border border-paper-edge bg-paper py-2"
        >
          <p className="px-5 pb-2 pt-1 text-rule uppercase text-graphite-faint">
            Hello, {first}
          </p>

          <Link href="/account" role="menuitem" className={item} onClick={() => setOpen(false)}>
            Your account
          </Link>
          {/**
            * THE ACCOUNTS ALREADY SIGNED IN, SWITCHED TO IN ONE TAP.
            *
            * This was a link to the sign-in page, which meant switching back
            * to an account you had signed into five minutes ago asked for the
            * password and the emailed code all over again. The session was
            * never lost — AuthContext keeps a live token per account in
            * `sessions`, and `switchAccount` applies one instantly. The data
            * was there the whole time; only the menu did not use it.
            *
            * Amazon and Google both work this way. Proving you own an account
            * is what signing IN is for; proving it again to return to a
            * session you already hold is a toll on the customer for nothing.
            */}
          {others.length > 0 && (
            <>
              <div className="my-2 h-px bg-paper-edge" />
              <p className="px-5 pb-1 text-rule uppercase text-graphite-faint">
                Also signed in
              </p>
              {others.map((s) => (
                <button
                  key={s.user.id}
                  type="button"
                  role="menuitem"
                  className={item}
                  onClick={async () => {
                    setOpen(false);
                    await switchAccount(s);
                    /* A FULL LOAD, NOT A ROUTER PUSH, AND NOT STAYING PUT.
                     *
                     * Switching account used to leave you on whatever page you
                     * were reading - a product, someone else's order - now
                     * signed in as somebody different. Everything that account
                     * had loaded was still on screen.
                     *
                     * It reloads rather than navigating because the auth
                     * context is not the only thing holding the old account's
                     * data: the cart, the kept pieces and anything else
                     * fetched for the previous user are still in memory, and a
                     * client-side push keeps all of it. A real load starts the
                     * new account clean, which is what every other shop does
                     * here and the only version that cannot show one
                     * customer's bag to another. */
                    window.location.href = s.user.is_admin ? '/admin' : '/';
                  }}
                >
                  <span className="block truncate">{s.user.full_name?.split(' ')[0] || s.user.email}</span>
                  <span className="block truncate text-caption text-graphite-faint">
                    {s.user.is_admin ? 'Admin' : s.user.email}
                  </span>
                </button>
              ))}
            </>
          )}

          {/* A navigation, not a sign-out — you stay signed in until someone
              else actually signs in. */}
          <Link href="/auth/login?switch=1" role="menuitem" className={item} onClick={() => setOpen(false)}>
            {others.length > 0 ? 'Use another account' : 'Switch account'}
          </Link>
          <button
            type="button"
            role="menuitem"
            className={item}
            onClick={() => { setOpen(false); performLogout(); }}
          >
            Sign out
          </button>

          <div className="my-2 h-px bg-paper-edge" />

          <Link href="/orders" role="menuitem" className={item} onClick={() => setOpen(false)}>
            Your orders
          </Link>
          <Link href="/wishlist" role="menuitem" className={item} onClick={() => setOpen(false)}>
            Kept pieces
          </Link>
          <Link href="/account/addresses" role="menuitem" className={item} onClick={() => setOpen(false)}>
            Saved addresses
          </Link>
          <Link href="/account/security" role="menuitem" className={item} onClick={() => setOpen(false)}>
            Sign-in &amp; security
          </Link>
          <Link href="/support" role="menuitem" className={item} onClick={() => setOpen(false)}>
            Help &amp; returns
          </Link>

          {user.is_admin && (
            <>
              <div className="my-2 h-px bg-paper-edge" />
              <Link
                href="/admin"
                role="menuitem"
                className={`${item} text-thread hover:text-thread-deep`}
                onClick={() => setOpen(false)}
              >
                The workroom
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
