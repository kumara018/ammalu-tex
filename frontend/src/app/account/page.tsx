'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Eye, EyeOff, Package, MapPin, HelpCircle, Heart,
  Laptop, Smartphone, Tablet, LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authAPI, addressAPI } from '@/lib/api';
import { performLogout } from '@/lib/auth';
import { DeviceSession } from '@/types';
import toast from 'react-hot-toast';

/**
 * THE COUNTER — everything about an account, on one page.
 *
 * WHAT THIS REPLACES. A breadcrumb, a maroon avatar disc, a pill badge, a
 * notice bar, a four-tile grid, a three-tab strip, and a red "Danger Zone"
 * containing "Add Another Account". Seven separate pieces of chrome, three of
 * which navigated to places the same page already showed, and the settings
 * themselves hidden one tab-click deep. The shopkeeper's description of it was
 * "old model", and the specific request was: everything in one account
 * settings place, the way Amazon does it.
 *
 * SO THE INFORMATION ARCHITECTURE IS AMAZON'S AND THE DESIGN IS NOT.
 *
 * Amazon is right about the structure. A grid of plainly-labelled destinations
 * at the top for the things that live on their own pages, then the account's
 * own settings laid out down the page in full — no tabs, because tabs hide two
 * thirds of a settings page behind a click and give you no way to scan for the
 * thing you came for. Everything reachable, nothing nested.
 *
 * Amazon is wrong for this shop about everything else: blue links, grey
 * gradient cards, an orange button. This is the atelier — paper ground, thread
 * rules, graphite type, the display face on anything that names a thing.
 *
 * THREE THINGS THE SHOPKEEPER ASKED ABOUT BY NAME:
 *
 *   "Add Another Account" is gone. It opened a login page in a NEW TAB with a
 *   query flag, quietly keeping two accounts signed in at once against a
 *   backend that caps a customer at four devices and emails them about every
 *   new sign-in. It sat under a heading reading "Danger Zone", which is the
 *   only honest thing about it. Replaced by "Switch account", which does what
 *   its name says: signs this account out and lands on the sign-in page.
 *
 *   THE WAY INTO THE ADMIN DASHBOARD did not exist anywhere in the site. An
 *   admin had to type /admin. It is now a destination in the grid, shown only
 *   to admins.
 *
 *   "Devices signed in" and "Change password" are explained rather than just
 *   listed, because a customer who does not know what a thing is cannot tell
 *   whether it needs their attention. Both are ordinary account security, and
 *   both were asked about — which is itself the evidence they needed a line of
 *   copy.
 */

/** Mirrors backend/models.py::Address. */
interface Addr {
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

/**
 * A section of the counter. The numeral is the only ornament.
 *
 * `id` is optional and exists so the destinations grid can point AT a section
 * rather than at a page — and `scroll-mt` is not optional with it, because the
 * rail is sticky and an anchor without it lands the heading underneath the
 * header. That is the bug the old "Saved Addresses" tile had in a worse form:
 * it pointed at an anchor that did not exist at all.
 */
function Part({ id, n, title, note, children }: {
  id?: string; n: string; title: string; note?: string; children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-paper-edge pt-8">
      <div className="flex flex-col gap-x-10 gap-y-4 sm:flex-row">
        <div className="sm:w-[16rem] sm:shrink-0">
          <p className="text-rule uppercase text-graphite-faint">{n}</p>
          <h2 className="mt-1.5 font-display text-[1.4rem] leading-tight text-graphite">{title}</h2>
          {note && <p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-graphite-muted">{note}</p>}
        </div>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </section>
  );
}

export default function AccountPage() {
  const { user, loading: authLoading, refresh } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) router.replace('/auth/login');
  }, [user, authLoading, router]);

  // ── Details ───────────────────────────────────────────────────────────────
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone((user as any).phone || '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { setProfileMsg({ type: 'err', text: 'Your name cannot be empty.' }); return; }
    setSaving(true); setProfileMsg(null);
    try {
      await authAPI.updateProfile({ full_name: fullName.trim(), phone: phone.trim() });
      await refresh();
      setProfileMsg({ type: 'ok', text: 'Saved.' });
      toast.success('Details saved');
    } catch (err: any) {
      setProfileMsg({ type: 'err', text: err.response?.data?.detail || 'Could not save. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  /**
   * ── Addresses ───────────────────────────────────────────────────────────
   *
   * THIS FEATURE EXISTED ON THE BACKEND AND NOWHERE ELSE. `addressAPI` has had
   * getAll / add / update / remove / setDefault the whole time, and the account
   * page advertised "Saved Addresses" as a tile — pointing at `/account#addr`,
   * an anchor no element on the page ever carried. So the link did nothing at
   * all: it navigated to the page you were already on and scrolled nowhere.
   *
   * There is no addresses page to link to either, so with "everything in one
   * account settings place" the right move is not to build a second page — it
   * is to put the addresses here, where the request says they belong.
   */
  const [addresses, setAddresses] = useState<Addr[]>([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [addrError, setAddrError] = useState(false);
  const [addrBusy, setAddrBusy] = useState<number | null>(null);
  const [addrOpen, setAddrOpen] = useState(false);
  const [addrSaving, setAddrSaving] = useState(false);
  const [draft, setDraft] = useState<AddrDraft>(EMPTY_ADDR);

  const loadAddresses = async () => {
    setAddrLoading(true); setAddrError(false);
    try {
      const res = await addressAPI.getAll();
      setAddresses(res.data);
    } catch {
      setAddrError(true);
    } finally {
      setAddrLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const required: (keyof AddrDraft)[] = ['full_name', 'phone', 'address_line1', 'city', 'state', 'pincode'];
    const missing = required.find((k) => !String(draft[k] ?? '').trim());
    if (missing) { toast.error('Fill in every line except the second address line.'); return; }
    setAddrSaving(true);
    try {
      await addressAPI.add({ ...draft, is_default: addresses.length === 0 });
      setDraft(EMPTY_ADDR);
      setAddrOpen(false);
      await loadAddresses();
      toast.success('Address saved');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Could not save that address.');
    } finally {
      setAddrSaving(false);
    }
  };

  const handleSetDefault = async (id: number) => {
    setAddrBusy(id);
    try { await addressAPI.setDefault(id); await loadAddresses(); }
    catch { toast.error('Could not set that as the usual address.'); }
    finally { setAddrBusy(null); }
  };

  const handleRemoveAddress = async (id: number) => {
    setAddrBusy(id);
    try { await addressAPI.remove(id); setAddresses(p => p.filter(a => a.id !== id)); }
    catch { toast.error('Could not remove that address.'); }
    finally { setAddrBusy(null); }
  };

  // ── Password ──────────────────────────────────────────────────────────────
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPw) { setPwMsg({ type: 'err', text: 'Enter your current password.' }); return; }
    if (newPw.length < 6) { setPwMsg({ type: 'err', text: 'A new password needs at least 6 characters.' }); return; }
    if (newPw !== confirmPw) { setPwMsg({ type: 'err', text: 'The two new passwords do not match.' }); return; }
    setPwSaving(true); setPwMsg(null);
    try {
      await authAPI.updateProfile({ current_password: currentPw, new_password: newPw });
      setPwMsg({ type: 'ok', text: 'Password changed.' });
      toast.success('Password changed');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err: any) {
      setPwMsg({ type: 'err', text: err.response?.data?.detail || 'Could not change it — check your current password.' });
    } finally {
      setPwSaving(false);
    }
  };

  // ── Devices ───────────────────────────────────────────────────────────────
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  /**
   * The devices list gets its own error state rather than a toast.
   *
   * A toast is gone in four seconds and leaves an empty list behind, which is
   * indistinguishable from "you are signed in nowhere" — the exact reading
   * that produced the question "what is that we could not load your devices
   * error". A failure here is almost always the network, and saying so on the
   * page, with a way to try again, is the difference between a fault and a
   * hiccup.
   */
  const [sessionsError, setSessionsError] = useState(false);
  const [revokingId, setRevokingId] = useState<number | null>(null);

  const loadSessions = async () => {
    setSessionsLoading(true); setSessionsError(false);
    try {
      const res = await authAPI.getSessions();
      setSessions(res.data);
    } catch {
      setSessionsError(true);
    } finally {
      setSessionsLoading(false);
      setSessionsLoaded(true);
    }
  };

  useEffect(() => {
    if (user && !sessionsLoaded) loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleRevoke = async (session: DeviceSession) => {
    setRevokingId(session.id);
    try {
      await authAPI.revokeSession(session.id);
      if (session.is_current) { toast.success('Signed out.'); performLogout(); return; }
      toast.success(`Signed out of ${session.device_name || 'that device'}.`);
      setSessions(prev => prev.filter(s => s.id !== session.id));
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Could not sign out that device.');
    } finally {
      setRevokingId(null);
    }
  };

  if (!user) return null;

  const initial = (user.full_name || user.email || '?').trim().charAt(0).toUpperCase();

  /**
   * The destinations. Everything here lives on its own page; everything below
   * belongs to the account itself and is therefore ON this page.
   */
  const places = [
    { icon: Package,   label: 'Your orders',     note: 'Track, return or exchange', href: '/orders' },
    { icon: Heart,     label: 'Kept pieces',     note: 'Everything you saved',      href: '/wishlist' },
    { icon: MapPin,    label: 'Saved addresses', note: 'Where orders are sent',     href: '#addresses' },
    { icon: HelpCircle, label: 'Help & policies', note: 'Shipping, returns, terms', href: '/support' },
    ...(user.is_admin
      ? [{ icon: LayoutDashboard, label: 'The workroom', note: 'Manage the shop', href: '/admin', accent: true }]
      : []),
  ];

  const field = 'w-full border-b border-paper-edge bg-transparent pb-2 text-graphite outline-none transition-colors duration-300 placeholder:text-graphite-faint focus:border-thread';
  const lbl = 'block text-rule uppercase text-graphite-faint';

  return (
    <div className="mx-auto w-full max-w-[74rem] px-6 py-[clamp(2.5rem,7vh,4.5rem)] sm:px-10">

      {/* ── Who is at the counter ──────────────────────────────────────────
          No breadcrumb. The rail at the top of every page already carries the
          way home on the mark, and a two-item breadcrumb that reads
          "Home > My Account" tells a customer only where they already know
          they are. */}
      <header className="flex flex-wrap items-center gap-x-5 gap-y-4">
        {/* The initial in a stitched ring — the shop's own mark, holding the
            customer's letter instead of the shop's. */}
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
          {user.is_admin && (
            <p className="mt-2 text-rule uppercase text-thread">Shop account</p>
          )}
        </div>
      </header>

      {/* ── The destinations ─────────────────────────────────────────────── */}
      {/**
        * Each tile carries its own hairline, laid out with a real gap.
        *
        * The first version joined them into one ruled block with the
        * `gap-px` + background trick, which is lovely when the grid is full
        * and wrong the moment it is not: an admin sees five tiles in three
        * columns, and the sixth cell showed the container's colour as a solid
        * filled rectangle — a tile with nothing in it. The tile count is not
        * fixed (the workroom only exists for admins) and the column count
        * changes at every breakpoint, so any arrangement that depends on the
        * last row being full is a bug waiting for a different screen.
        */}
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

      <div className="mt-14 flex flex-col gap-14">

        {/* ── 01 Your details ────────────────────────────────────────────── */}
        <Part n="01" title="Your details" note="The name and number we use on an order and on a delivery.">
          <form onSubmit={handleSaveProfile} className="flex max-w-[32rem] flex-col gap-7">
            <div>
              <label htmlFor="acc-name" className={lbl}>Full name</label>
              <input id="acc-name" type="text" autoComplete="name" value={fullName}
                onChange={e => { setFullName(e.target.value); setProfileMsg(null); }}
                className={`${field} mt-2`} placeholder="Your full name" />
            </div>

            <div>
              <label htmlFor="acc-phone" className={lbl}>Mobile number</label>
              <input id="acc-phone" type="tel" autoComplete="tel" value={phone}
                onChange={e => { setPhone(e.target.value); setProfileMsg(null); }}
                className={`${field} mt-2`} placeholder="10-digit mobile number" />
            </div>

            <div>
              <span className={lbl}>Email</span>
              <p className="mt-2 border-b border-paper-edge pb-2 text-graphite-muted">{user.email}</p>
              <p className="mt-2 text-caption text-graphite-faint">
                Every code and invoice goes here. Ask us at the counter to change it.
              </p>
            </div>

            {profileMsg && (
              <p className={`text-sm ${profileMsg.type === 'ok' ? 'text-graphite' : 'text-red-700'}`}>
                {profileMsg.text}
              </p>
            )}

            <button type="submit" disabled={saving}
              className="self-start border-b border-thread pb-1 text-caption uppercase text-graphite transition-colors duration-500 hover:text-thread disabled:text-graphite-faint">
              {saving ? 'Saving…' : 'Save details →'}
            </button>
          </form>
        </Part>

        {/* ── 02 Addresses ───────────────────────────────────────────────── */}
        <Part
          id="addresses"
          n="02"
          title="Saved addresses"
          note="Somewhere to send an order without typing it out again. The usual one is filled in for you at checkout."
        >
          {addrError ? (
            <div>
              <p className="text-rule uppercase text-thread">Could not reach the counter</p>
              <button onClick={loadAddresses}
                className="mt-3 border-b border-thread pb-1 text-caption uppercase text-graphite transition-colors hover:text-thread">
                Try again →
              </button>
            </div>
          ) : addrLoading && addresses.length === 0 ? (
            <p className="text-graphite-faint">Looking…</p>
          ) : (
            <>
              {addresses.length === 0 ? (
                <p className="text-graphite-muted">None saved yet.</p>
              ) : (
                <ul className="flex flex-col">
                  {addresses.map((a, i) => (
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
                          <button onClick={() => handleSetDefault(a.id)} disabled={addrBusy === a.id}
                            className="text-caption uppercase text-graphite-muted transition-colors duration-500 hover:text-thread disabled:text-graphite-faint">
                            Make usual
                          </button>
                        )}
                        <button onClick={() => handleRemoveAddress(a.id)} disabled={addrBusy === a.id}
                          className="text-caption uppercase text-graphite-muted transition-colors duration-500 hover:text-red-700 disabled:text-graphite-faint">
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {!addrOpen ? (
                <button onClick={() => setAddrOpen(true)}
                  className={`border-b border-thread pb-1 text-caption uppercase text-graphite transition-colors duration-500 hover:text-thread ${addresses.length ? 'mt-6' : 'mt-4'}`}>
                  Add an address →
                </button>
              ) : (
                <form onSubmit={handleAddAddress} className="mt-6 flex max-w-[36rem] flex-col gap-6 border-t border-paper-edge pt-6">
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
                      <label htmlFor={`ad-${key}`} className={lbl}>{label}</label>
                      <input
                        id={`ad-${key}`} type={type} autoComplete={ac}
                        value={draft[key] ?? ''}
                        onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
                        className={`${field} mt-2`}
                      />
                    </div>
                  ))}
                  <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
                    <button type="submit" disabled={addrSaving}
                      className="border-b border-thread pb-1 text-caption uppercase text-graphite transition-colors duration-500 hover:text-thread disabled:text-graphite-faint">
                      {addrSaving ? 'Saving…' : 'Save address →'}
                    </button>
                    <button type="button" onClick={() => { setAddrOpen(false); setDraft(EMPTY_ADDR); }}
                      className="text-caption uppercase text-graphite-faint transition-colors duration-500 hover:text-graphite">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </Part>

        {/* ── 03 Password ────────────────────────────────────────────────── */}
        <Part
          n="03"
          title="Password"
          note="Change it here whenever you like — you will need the current one. If you have forgotten it, sign out and use “Forgotten password” instead."
        >
          <form onSubmit={handleChangePassword} className="flex max-w-[32rem] flex-col gap-7">
            <div>
              <label htmlFor="pw-cur" className={lbl}>Current password</label>
              <div className="relative mt-2">
                <input id="pw-cur" type={showPw ? 'text' : 'password'} autoComplete="current-password"
                  value={currentPw} onChange={e => { setCurrentPw(e.target.value); setPwMsg(null); }}
                  className={`${field} pr-10`} />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? 'Hide passwords' : 'Show passwords'}
                  className="absolute right-0 top-0 text-graphite-faint transition-colors hover:text-thread">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="pw-new" className={lbl}>New password</label>
              <input id="pw-new" type={showPw ? 'text' : 'password'} autoComplete="new-password"
                value={newPw} onChange={e => { setNewPw(e.target.value); setPwMsg(null); }}
                className={`${field} mt-2`} />
              <p className="mt-2 text-caption text-graphite-faint">At least 6 characters.</p>
            </div>

            <div>
              <label htmlFor="pw-conf" className={lbl}>Confirm new password</label>
              <input id="pw-conf" type={showPw ? 'text' : 'password'} autoComplete="new-password"
                value={confirmPw} onChange={e => { setConfirmPw(e.target.value); setPwMsg(null); }}
                className={`${field} mt-2`} />
            </div>

            {pwMsg && (
              <p className={`text-sm ${pwMsg.type === 'ok' ? 'text-graphite' : 'text-red-700'}`}>{pwMsg.text}</p>
            )}

            <button type="submit" disabled={pwSaving}
              className="self-start border-b border-thread pb-1 text-caption uppercase text-graphite transition-colors duration-500 hover:text-thread disabled:text-graphite-faint">
              {pwSaving ? 'Changing…' : 'Change password →'}
            </button>
          </form>
        </Part>

        {/* ── 04 Devices ─────────────────────────────────────────────────── */}
        <Part
          n="04"
          title="Where you are signed in"
          note="You can stay signed in on up to four devices at once. If you see one you do not recognise, sign it out and change your password."
        >
          {sessionsError ? (
            <div>
              <p className="text-rule uppercase text-thread">Could not reach the counter</p>
              <p className="mt-2 max-w-[42ch] text-graphite-muted">
                Your account is fine — this is the connection, not your devices.
              </p>
              <button onClick={loadSessions} disabled={sessionsLoading}
                className="mt-4 border-b border-thread pb-1 text-caption uppercase text-graphite transition-colors hover:text-thread">
                {sessionsLoading ? 'Trying…' : 'Try again →'}
              </button>
            </div>
          ) : sessionsLoading && sessions.length === 0 ? (
            <p className="text-graphite-faint">Looking…</p>
          ) : sessions.length === 0 ? (
            <p className="text-graphite-muted">Only this one.</p>
          ) : (
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
                    <button onClick={() => handleRevoke(s)} disabled={revokingId === s.id}
                      className="shrink-0 text-caption uppercase text-graphite-muted transition-colors duration-500 hover:text-red-700 disabled:text-graphite-faint">
                      {revokingId === s.id ? 'Signing out…' : 'Sign out'}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Part>

        {/* ── 05 Leaving ─────────────────────────────────────────────────── */}
        <Part n="05" title="Leaving" note="Nothing here is undone by accident — deleting asks you to confirm on its own page.">
          <div className="flex flex-col items-start gap-5">
            <button
              onClick={() => performLogout('/auth/login')}
              className="border-b border-paper-edge pb-1 text-caption uppercase text-graphite transition-colors duration-500 hover:border-thread hover:text-thread"
            >
              Switch account →
            </button>
            <p className="-mt-3 max-w-[46ch] text-caption text-graphite-faint">
              Signs you out of this account and opens the sign-in page, so someone else can use their own.
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
          </div>
        </Part>
      </div>
    </div>
  );
}
