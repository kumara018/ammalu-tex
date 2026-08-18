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
  const { user } = useAuth();
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
          className="absolute right-0 top-8 z-50 w-60 border border-paper-edge bg-paper py-2"
        >
          <p className="px-5 pb-2 pt-1 text-rule uppercase text-graphite-faint">
            Hello, {first}
          </p>

          <Link href="/account" role="menuitem" className={item} onClick={() => setOpen(false)}>
            Your account
          </Link>
          <button
            type="button"
            role="menuitem"
            className={item}
            onClick={() => { setOpen(false); performLogout('/auth/login'); }}
          >
            Switch account
          </button>
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
          <Link href="/account#addresses" role="menuitem" className={item} onClick={() => setOpen(false)}>
            Saved addresses
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
