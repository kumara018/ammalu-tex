'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Laptop, Smartphone, Tablet } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authAPI, addressAPI } from '@/lib/api';
import { DeviceSession } from '@/types';
import toast from 'react-hot-toast';

/**
 * The pieces of an account, each usable on its own page.
 *
 * WHY THESE ARE COMPONENTS AND NOT ONE PAGE ANY MORE.
 *
 * The account page carried all of it at once — details, addresses, a password
 * form, a device list — stacked down a single scroll. That was a deliberate
 * step away from the tab strip it replaced, and it went one step too far: the
 * shopkeeper's reaction to seeing "Current password / New password / Confirm
 * new password / Devices signed in" laid out on the page they had opened to
 * check an order was, reasonably, "why is this showing".
 *
 * They are right. A password field is not something you want to look at; it is
 * something you go to when you have decided to change a password. Amazon —
 * named as the standard here — puts a grid of destinations on Your Account and
 * keeps Login & security on its own page, and that is the correct shape: the
 * hub answers "what can I do", each page answers one of those questions and
 * nothing else.
 *
 * So the sections live here, and the routes compose them. Nothing about the
 * behaviour changed; what changed is that you have to ask for a password form
 * before you are shown one.
 */

const FIELD =
  'w-full border-b border-paper-edge bg-transparent pb-2 text-graphite outline-none transition-colors duration-300 placeholder:text-graphite-faint focus:border-thread';
const LABEL = 'block text-rule uppercase text-graphite-faint';
const ACTION =
  'self-start border-b border-thread pb-1 text-caption uppercase text-graphite transition-colors duration-500 hover:text-thread disabled:text-graphite-faint';

/** Mirrors backend/models.py::Address. */
export interface Addr {
  id: number;
  label?: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}
type AddrDraft = Omit<Addr, 'id' | 'is_default'>;

const EMPTY_ADDR: AddrDraft = {
  label: 'Home', full_name: '', phone: '',
  address_line1: '', address_line2: '', city: '', state: '', pincode: '',
};

/* ── Your details ────────────────────────────────────────────────────────── */

export function Details() {
  const { user, refresh } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone((user as any).phone || '');
    }
  }, [user]);

  if (!user) return null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { setMsg({ type: 'err', text: 'Your name cannot be empty.' }); return; }
    setSaving(true); setMsg(null);
    try {
      await authAPI.updateProfile({ full_name: fullName.trim(), phone: phone.trim() });
      await refresh();
      setMsg({ type: 'ok', text: 'Saved.' });
      toast.success('Details saved');
    } catch (err: any) {
      setMsg({ type: 'err', text: err.response?.data?.detail || 'Could not save. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="flex max-w-[32rem] flex-col gap-7">
      <div>
        <label htmlFor="acc-name" className={LABEL}>Full name</label>
        <input id="acc-name" type="text" autoComplete="name" value={fullName}
          onChange={(e) => { setFullName(e.target.value); setMsg(null); }}
          className={`${FIELD} mt-2`} placeholder="Your full name" />
      </div>

      <div>
        <label htmlFor="acc-phone" className={LABEL}>Mobile number</label>
        <input id="acc-phone" type="tel" autoComplete="tel" value={phone}
          onChange={(e) => { setPhone(e.target.value); setMsg(null); }}
          className={`${FIELD} mt-2`} placeholder="10-digit mobile number" />
      </div>

      <div>
        <span className={LABEL}>Email</span>
        <p className="mt-2 border-b border-paper-edge pb-2 text-graphite-muted">{user.email}</p>
        <p className="mt-2 text-caption text-graphite-faint">
          Every code and invoice goes here. Ask us at the counter to change it.
        </p>
      </div>

      {msg && (
        <p className={`text-sm ${msg.type === 'ok' ? 'text-graphite' : 'text-red-700'}`}>{msg.text}</p>
      )}

      <button type="submit" disabled={saving} className={ACTION}>
        {saving ? 'Saving…' : 'Save details →'}
      </button>
    </form>
  );
}

/* ── Password ────────────────────────────────────────────────────────────── */

/**
 * CHANGING A PASSWORD GOES THROUGH THE EMAIL, NOT THROUGH THIS PAGE.
 *
 * There was a three-field form here — current, new, confirm — and it was
 * removed on instruction: "if user wants to change the password once give
 * forgot password then they will receive otp or reset password mail then they
 * can change not like portal itself".
 *
 * That instinct is the more secure one, and it is worth writing down why. An
 * in-page form only ever proves the person knows the current password. Anyone
 * who walks up to an unlocked, already-signed-in phone knows nothing and can
 * still change it — they simply cannot, if the change requires a code sent to
 * the address on the account. Routing every change through the reset flow
 * means a password can only be changed by someone holding the mailbox, which
 * is the thing the account is actually anchored to.
 *
 * It is also one flow instead of two. The reset path already existed for
 * people who had forgotten theirs, so keeping a second, weaker path for people
 * who had not meant two code paths to the same outcome — and the weaker one
 * was the one offered first.
 *
 * The identifier is carried through, so the customer does not retype the
 * address we already have.
 */
export function Password({ email }: { email: string }) {
  return (
    <div className="max-w-[38rem]">
      <p className="leading-relaxed text-graphite-muted">
        For your safety a password is changed by email rather than here. We send a
        six-digit code to <span className="text-graphite">{email}</span>; enter it
        with your new password and it is done.
      </p>
      <p className="mt-4 max-w-[52ch] text-caption text-graphite-faint">
        This way somebody who finds your phone already signed in still cannot change
        your password — they would need your mailbox too.
      </p>
      <Link
        href={`/auth/forgot-password?identifier=${encodeURIComponent(email)}`}
        className={`${ACTION} mt-6 inline-block`}
      >
        Send me a code &rarr;
      </Link>
    </div>
  );
}

/* ── Devices ─────────────────────────────────────────────────────────────── */

function deviceIcon(type?: string) {
  if (type === 'mobile') return Smartphone;
  if (type === 'tablet') return Tablet;
  return Laptop;
}
function deviceTypeLabel(type?: string) {
  if (type === 'mobile') return 'Phone';
  if (type === 'tablet') return 'Tablet';
  if (type === 'desktop') return 'Computer';
  return 'Device';
}
function fmtWhen(iso?: string) {
  if (!iso) return 'Unknown';
  const d = new Date(iso);
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'Active now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? '' : 's'} ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function Devices({ onSignOutSelf }: { onSignOutSelf: () => void }) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [loading, setLoading] = useState(true);
  /**
   * A real error state, not a toast. A toast is gone in four seconds and
   * leaves an empty list behind, which is indistinguishable from "you are
   * signed in nowhere" — the reading that produced the question about the
   * "could not load your devices" error.
   */
  const [error, setError] = useState(false);
  const [revokingId, setRevokingId] = useState<number | null>(null);
  const [confirmingAll, setConfirmingAll] = useState(false);
  const [revokingAll, setRevokingAll] = useState(false);

  const load = async () => {
    setLoading(true); setError(false);
    try {
      const res = await authAPI.getSessions();
      setSessions(res.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) load(); /* eslint-disable-next-line */ }, [user]);

  const revoke = async (s: DeviceSession) => {
    setRevokingId(s.id);
    try {
      await authAPI.revokeSession(s.id);
      if (s.is_current) { toast.success('Signed out.'); onSignOutSelf(); return; }
      toast.success(`Signed out of ${s.device_name || 'that device'}.`);
      setSessions((p) => p.filter((x) => x.id !== s.id));
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Could not sign out that device.');
    } finally {
      setRevokingId(null);
    }
  };

  /**
   * Sign out everywhere — ONE transaction on the server, not a loop.
   *
   * A loop over `revoke` would look identical and be wrong for the only case
   * this control exists to serve: somebody who believes their account is
   * compromised. It is not atomic, it races the sliding-session refresh in
   * api.ts, and a partial failure leaves them believing they are safe while an
   * attacker still holds a live token.
   *
   * Two presses, because it is destructive and cannot be undone from here —
   * the first arms it, the second commits. Nobody should log their family out
   * of a shared tablet with one stray tap.
   */
  const revokeAll = async () => {
    if (!confirmingAll) { setConfirmingAll(true); return; }
    setConfirmingAll(false);
    setRevokingAll(true);
    try {
      const res = await authAPI.revokeAllSessions(true);
      const n = res.data?.revoked ?? 0;
      await load();
      toast.success(
        n === 0
          ? 'No other devices were signed in.'
          : `${n} other ${n === 1 ? 'device was' : 'devices were'} signed out. This one is still signed in.`,
      );
    } catch {
      toast.error('Could not sign the other devices out. Please try again.');
    } finally {
      setRevokingAll(false);
    }
  };

  if (error) {
    return (
      <div>
        <p className="text-rule uppercase text-thread">Could not reach the counter</p>
        <p className="mt-2 max-w-[42ch] text-graphite-muted">
          Your account is fine — this is the connection, not your devices.
        </p>
        <button onClick={load} className={`${ACTION} mt-4`}>Try again →</button>
      </div>
    );
  }
  if (loading && sessions.length === 0) return <p className="text-graphite-faint">Looking…</p>;
  if (sessions.length === 0) return <p className="text-graphite-muted">Only this one.</p>;

  return (
    <ul className="flex flex-col">
      {sessions.map((s, i) => {
        const Icon = deviceIcon(s.device_type);
        return (
          <li key={s.id}
            className={`flex flex-wrap items-center gap-x-4 gap-y-2 py-4 ${i > 0 ? 'border-t border-paper-edge' : ''}`}>
            <Icon size={18} className="shrink-0 text-graphite-muted" />
            <div className="min-w-0 flex-1">
              <p className="text-graphite">
                {s.device_name || 'Unknown device'}
                {s.is_current && <span className="ml-2 text-rule uppercase text-thread">This one</span>}
              </p>
              <p className="mt-0.5 text-caption uppercase text-graphite-faint">
                {deviceTypeLabel(s.device_type)} · {s.location || 'Unknown place'} · {fmtWhen(s.last_active_at || s.created_at)}
              </p>
            </div>
            <button onClick={() => revoke(s)} disabled={revokingId === s.id}
              className="shrink-0 text-caption uppercase text-graphite-muted transition-colors duration-500 hover:text-red-700 disabled:text-graphite-faint">
              {revokingId === s.id ? 'Signing out…' : 'Sign out'}
            </button>
          </li>
        );
      })}
      {/**
        * Only offered when there is something to do. A button whose honest
        * outcome is "no other devices were signed in" should not have been
        * shown in the first place.
        */}
      {sessions.filter((x) => !x.is_current).length > 0 && (
        <li className="border-t border-paper-edge pt-4">
          <button
            type="button"
            onClick={revokeAll}
            onBlur={() => setConfirmingAll(false)}
            disabled={revokingAll}
            className="text-caption uppercase text-graphite-faint underline decoration-thread/50 underline-offset-4 transition-colors duration-500 hover:text-graphite disabled:opacity-50"
          >
            {revokingAll
              ? 'Signing out…'
              : confirmingAll
                ? 'Tap again to confirm'
                : 'Sign out of every other device'}
          </button>
        </li>
      )}
    </ul>
  );
}

/* ── Addresses ───────────────────────────────────────────────────────────── */

export function Addresses() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Addr[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<AddrDraft>(EMPTY_ADDR);

  const load = async () => {
    setLoading(true); setError(false);
    try {
      const res = await addressAPI.getAll();
      setRows(res.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) load(); /* eslint-disable-next-line */ }, [user]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const required: (keyof AddrDraft)[] = ['full_name', 'phone', 'address_line1', 'city', 'state', 'pincode'];
    if (required.some((k) => !String(draft[k] ?? '').trim())) {
      toast.error('Fill in every line except the second address line.');
      return;
    }
    setSaving(true);
    try {
      await addressAPI.add({ ...draft, is_default: rows.length === 0 });
      setDraft(EMPTY_ADDR);
      setOpen(false);
      await load();
      toast.success('Address saved');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Could not save that address.');
    } finally {
      setSaving(false);
    }
  };

  const makeUsual = async (id: number) => {
    setBusy(id);
    try { await addressAPI.setDefault(id); await load(); }
    catch { toast.error('Could not set that as the usual address.'); }
    finally { setBusy(null); }
  };

  const remove = async (id: number) => {
    setBusy(id);
    try { await addressAPI.remove(id); setRows((p) => p.filter((a) => a.id !== id)); }
    catch { toast.error('Could not remove that address.'); }
    finally { setBusy(null); }
  };

  if (error) {
    return (
      <div>
        <p className="text-rule uppercase text-thread">Could not reach the counter</p>
        <button onClick={load} className={`${ACTION} mt-3`}>Try again →</button>
      </div>
    );
  }
  if (loading && rows.length === 0) return <p className="text-graphite-faint">Looking…</p>;

  return (
    <>
      {rows.length === 0 ? (
        <p className="text-graphite-muted">None saved yet.</p>
      ) : (
        <ul className="flex flex-col">
          {rows.map((a, i) => (
            <li key={a.id} className={`flex flex-wrap items-start gap-x-6 gap-y-3 py-5 ${i > 0 ? 'border-t border-paper-edge' : ''}`}>
              <div className="min-w-0 flex-1">
                <p className="text-graphite">
                  {a.full_name}
                  {a.is_default && <span className="ml-2 text-rule uppercase text-thread">Usual</span>}
                </p>
                <p className="mt-1 max-w-[46ch] text-sm leading-relaxed text-graphite-muted">
                  {a.address_line1}{a.address_line2 ? `, ${a.address_line2}` : ''}, {a.city}, {a.state} {a.pincode}
                </p>
                <p className="mt-1 text-caption uppercase text-graphite-faint">{a.phone}</p>
              </div>
              <div className="flex shrink-0 gap-x-5">
                {!a.is_default && (
                  <button onClick={() => makeUsual(a.id)} disabled={busy === a.id}
                    className="text-caption uppercase text-graphite-muted transition-colors duration-500 hover:text-thread disabled:text-graphite-faint">
                    Make usual
                  </button>
                )}
                <button onClick={() => remove(a.id)} disabled={busy === a.id}
                  className="text-caption uppercase text-graphite-muted transition-colors duration-500 hover:text-red-700 disabled:text-graphite-faint">
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!open ? (
        <button onClick={() => setOpen(true)} className={`${ACTION} ${rows.length ? 'mt-6' : 'mt-4'}`}>
          Add an address →
        </button>
      ) : (
        <form onSubmit={add} className="mt-6 flex max-w-[36rem] flex-col gap-6 border-t border-paper-edge pt-6">
          {([
            ['full_name', 'Full name', 'text', 'name'],
            ['phone', 'Mobile number', 'tel', 'tel'],
            ['address_line1', 'Address', 'text', 'address-line1'],
            ['address_line2', 'Address, second line (optional)', 'text', 'address-line2'],
            ['city', 'City', 'text', 'address-level2'],
            ['state', 'State', 'text', 'address-level1'],
            ['pincode', 'Pincode', 'text', 'postal-code'],
          ] as [keyof AddrDraft, string, string, string][]).map(([key, label, type, ac]) => (
            <div key={key}>
              <label htmlFor={`ad-${key}`} className={LABEL}>{label}</label>
              <input id={`ad-${key}`} type={type} autoComplete={ac}
                value={draft[key] ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                className={`${FIELD} mt-2`} />
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
            <button type="submit" disabled={saving} className={ACTION}>
              {saving ? 'Saving…' : 'Save address →'}
            </button>
            <button type="button" onClick={() => { setOpen(false); setDraft(EMPTY_ADDR); }}
              className="text-caption uppercase text-graphite-faint transition-colors duration-500 hover:text-graphite">
              Cancel
            </button>
          </div>
        </form>
      )}
    </>
  );
}

/* ── Shared chrome for a sub-page ────────────────────────────────────────── */

export function SubPage({ title, note, children }: {
  title: string; note?: string; children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[74rem] px-6 py-[clamp(2.5rem,7vh,4.5rem)] sm:px-10">
      <Link
        href="/account"
        className="group inline-flex items-center gap-3 text-rule uppercase text-graphite-faint transition-colors duration-500 hover:text-thread focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-thread"
      >
        <span aria-hidden="true" className="inline-block transition-transform duration-500 group-hover:-translate-x-1 motion-reduce:transition-none">&larr;</span>
        Your account
      </Link>

      <h1 className="mt-8 font-display text-band leading-tight text-graphite">{title}</h1>
      {note && <p className="mt-3 max-w-[52ch] leading-relaxed text-graphite-muted">{note}</p>}

      <div className="mt-12 border-t border-paper-edge pt-10">{children}</div>
    </div>
  );
}
