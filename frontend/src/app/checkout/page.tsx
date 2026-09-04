'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CreditCard, AlertCircle, CheckCircle,
  Lock, Package, ArrowLeft, MapPin, Navigation, Plus, Star, CalendarDays,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

/** One piece bought without going through the bag — mirrors schemas.BuyNowItem. */
interface BuyNowItem { product_id: number; quantity: number; size?: string | null; color?: string | null; }
import { useAuth } from '@/context/AuthContext';
import { ordersAPI, addressAPI } from '@/lib/api';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import PaymentOutcome, { type Outcome, isMoneyAtRisk } from './PaymentOutcome';

const INDIA_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman & Nicobar Islands','Chandigarh','Dadra & Nagar Haveli','Daman & Diu',
  'Delhi','Jammu & Kashmir','Ladakh','Lakshadweep','Puducherry',
];

type PayMethod = 'razorpay' | 'emi';
interface Errors { [k: string]: string; }

function FieldErr({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="error-msg mt-1.5"><AlertCircle size={13} />{msg}</p>;
}

declare global {
  interface Window { Razorpay: any; }
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();

  /**
   * A direct purchase shows and charges for ONE piece. Buy Now used to add to
   * the bag first, and this page orders the whole bag and empties it — so
   * buying one piece charged for everything saved.
   */
  const [buyNow, setBuyNow] = useState<BuyNowItem | null>(null);
  const isDirect = buyNow !== null;
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (new URLSearchParams(window.location.search).get('buy') !== '1') return;
    try {
      const raw = sessionStorage.getItem('buyNow');
      const parsed = raw ? JSON.parse(raw) as BuyNowItem : null;
      if (parsed?.product_id) setBuyNow(parsed);
    } catch { /* fall through to the bag */ }
  }, []);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Declare state first so useEffect hooks below can reference them
  const [step,    setStep]    = useState<1 | 2 | 3>(1);
  const [placing, setPlacing] = useState(false);
  /*
   * WHETHER RAZORPAY'S SCRIPT HAS ARRIVED, WHICH IS NOT THE SAME AS BEING ONLINE.
   *
   * The pay button used to be live from first paint while the script was still
   * downloading. Tapping it in that window found no window.Razorpay and showed
   * "You appear to be offline" — to somebody who was plainly online, on a shop
   * that had just started taking real money. On a phone on mobile data that
   * window is seconds long, and the customer is told the shop is broken at the
   * exact moment they were trying to pay.
   *
   * The sister shop has always gated the button on this. This is that gate.
   */
  const [scriptReady, setScriptReady] = useState(false);
  /**
   * How the payment ended. Null while nothing has been attempted.
   *
   * Every ending used to be a toast that re-enabled the pay button — including
   * the two where the customer's money may already have gone. See
   * ./PaymentOutcome for why each ending has to be told apart.
   */
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const outcomeRef = useRef<HTMLDivElement>(null);
  const [openBox, setOpenBox] = useState(false);

  // Set synchronously the instant an order is confirmed — clearCart() empties
  // `items`, which would otherwise race this effect's redirect-to-cart branch
  // and bounce a customer who just paid back to an empty cart page.
  const orderPlacedRef = useRef(false);

  useEffect(() => {
    if (authLoading || !user) return;
    if (orderPlacedRef.current) return;
    if (typeof window !== 'undefined'
        && new URLSearchParams(window.location.search).get('buy') === '1') return;
    if (items.length === 0) { router.push('/cart'); return; }
    const markReady = () => setScriptReady(true);

    // Already parsed and running from an earlier visit to this route.
    if ((window as any).Razorpay) { markReady(); return; }

    /*
     * The tag is reused rather than recreated. This effect depends on `items`,
     * so every change to the bag used to remove the script and append a fresh
     * one — reopening the download window, and with it the chance of tapping
     * Pay while nothing was loaded.
     *
     * A tag that is still downloading is not a tag that is ready, so this waits
     * on its load event rather than assuming. Treating "a script tag exists" as
     * "Razorpay is available" would be the same bug in a narrower window.
     */
    const existing = document.querySelector<HTMLScriptElement>('script[data-razorpay]');
    if (existing) {
      existing.addEventListener('load', markReady);
      return () => existing.removeEventListener('load', markReady);
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpay = 'true';
    script.onload = markReady;
    // A blocked or failed script is indistinguishable from a dead pay button
    // unless it is said out loud.
    script.onerror = () => setOutcome({ kind: 'offline' });
    document.body.appendChild(script);
  }, [user, items, authLoading]);

  // Any outcome replaces the task the customer was doing, so move focus to it.
  // A screen reader user who pressed Pay and heard nothing has no way to find
  // out what happened.
  useEffect(() => {
    if (outcome) outcomeRef.current?.focus();
  }, [outcome]);

  // Warn user before refresh / tab close while on checkout or during payment
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (items.length === 0) return; // cart already empty — order placed, no need to warn
      const msg = placing
        ? 'Your payment is being processed! Leaving now may cause issues.'
        : 'You are in the middle of checkout. Your order has not been placed yet.';
      e.preventDefault();
      e.returnValue = msg;
      return msg;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [items.length, placing]);

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddrId, setSelectedAddrId] = useState<number | null>(null);
  const [showNewAddrForm, setShowNewAddrForm] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    addressAPI.getAll().then(res => {
      const addrs = res.data || [];
      setSavedAddresses(addrs);
      const def = addrs.find((a: any) => a.is_default);
      if (def) {
        setSelectedAddrId(def.id);
        setAddr({
          full_name:     def.full_name,
          phone:         def.phone,
          address_line1: def.address_line1,
          address_line2: def.address_line2 || '',
          city:          def.city,
          state:         def.state,
          pincode:       def.pincode,
        });
      } else if (addrs.length === 0) {
        setShowNewAddrForm(true);
      }
    }).catch(() => setShowNewAddrForm(true));
  }, [user]);

  const [addr, setAddr] = useState({
    full_name:     user?.full_name || '',
    phone:         user?.phone || '',
    address_line1: '',
    address_line2: '',
    city:          '',
    state:         'Tamil Nadu',
    pincode:       '',
  });
  const [addrErrors, setAddrErrors] = useState<Errors>({});
  const [payMethod, setPayMethod] = useState<PayMethod>('razorpay');

  // Use GPS to fill address
  const detectLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`
          );
          const data = await res.json();
          const a = data.address || {};
          setAddr(prev => ({
            ...prev,
            address_line1: [a.road, a.neighbourhood, a.suburb].filter(Boolean).join(', ') || prev.address_line1,
            city:  a.city || a.town || a.village || a.county || prev.city,
            state: a.state || prev.state,
            pincode: a.postcode || prev.pincode,
          }));
          toast.success('Location detected!');
        } catch { toast.error('Could not fetch address from location'); }
        finally { setGpsLoading(false); }
      },
      /**
       * SAY WHAT ACTUALLY WENT WRONG.
       *
       * This reported "Location access denied. Please allow location." for
       * EVERY failure, including the two that have nothing to do with
       * permission — so somebody who had already granted access was told to
       * grant it again, and went looking in browser settings for a problem
       * that was not there.
       *
       * GeolocationPositionError carries a code: 1 is a real refusal, 2 means
       * the device could not get a fix, 3 means it ran out of time. On a
       * desktop without GPS the browser resolves position over Wi-Fi, which
       * regularly needs more than the 10s this allowed — a TIMEOUT reported as
       * a denial.
       *
       * The options are wrong for that case too. `maximumAge: 300000` accepts
       * a fix the browser already has, which is usually instant and is exactly
       * what you want when someone is filling in a delivery address they have
       * not moved from. The timeout goes to 20s so a genuine Wi-Fi lookup can
       * finish.
       */
      (err) => {
        const msg =
          err.code === err.PERMISSION_DENIED
            ? 'Location permission is off for this site. Allow it in your browser, then try again.'
            : err.code === err.POSITION_UNAVAILABLE
            ? 'Your device could not get a location fix. Please type the address instead.'
            : 'Finding your location took too long. Try again, or type the address.';
        toast.error(msg);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 300000 }
    );
  };

  const shipping   = 49;
  const grandTotal = total + shipping;

  const setA = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddr({ ...addr, [f]: e.target.value });
    setAddrErrors({ ...addrErrors, [f]: '' });
  };

  const validateAddr = (): boolean => {
    const e: Errors = {};
    if (!addr.full_name.trim())      e.full_name     = 'Full name is required';
    if (!addr.phone.trim())          e.phone         = 'Mobile number is required';
    else if (!/^(\+91|91|0)?[6-9]\d{9}$/.test(addr.phone.replace(/\s|-/g,'')))
                                     e.phone         = 'Enter a valid 10-digit Indian mobile number';
    if (!addr.address_line1.trim())  e.address_line1 = 'Street address is required';
    if (!addr.city.trim())           e.city          = 'City is required';
    if (!addr.state)                 e.state         = 'State is required';
    if (!addr.pincode.trim())        e.pincode       = 'Pincode is required';
    else if (!/^\d{6}$/.test(addr.pincode.trim()))
                                     e.pincode       = 'Pincode must be exactly 6 digits';
    setAddrErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddrNext = () => {
    if (validateAddr()) setStep(2);
    else toast.error('Please fill all required address fields correctly');
  };

  const handlePayNext = () => setStep(3);

  // ── Finalize the order — only ever called after Razorpay confirms payment ──
  const finalizeOrder = async (method: string, paymentProof: {
    razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string;
  }) => {
    setPlacing(true);
    try {
      const res = await ordersAPI.place({
        ...(buyNow ? { buy_now: buyNow } : {}),
        shipping_address: {
          full_name:    addr.full_name.trim(),
          phone:        addr.phone.replace(/\s|-/g, ''),
          address_line1: addr.address_line1.trim(),
          address_line2: addr.address_line2.trim() || undefined,
          city:         addr.city.trim(),
          state:        addr.state,
          pincode:      addr.pincode.trim(),
        },
        payment: { method, ...paymentProof },
        open_box_delivery: openBox,
      });
      orderPlacedRef.current = true;
      if (isDirect) sessionStorage.removeItem('buyNow');   // the bag was never ordered
      else await clearCart();
      toast.success('Order placed successfully!');
      router.push(`/orders/${res.data.id}?new=1`);
    } catch (err: any) {
      const d = err.response?.data?.detail;
      const detail = Array.isArray(d) ? d.map((x: any) => x.msg).join('. ') : (d || undefined);
      /**
       * THE WORST CASE, AND IT USED TO BE A TOAST.
       *
       * Reaching here on a card payment means Razorpay took the money AND the
       * signature verified — and then the order failed to save. Saying
       * "Failed to place order" and putting the pay button back invites a
       * second charge on top of a first that already succeeded. Cash on
       * delivery has no proof and nothing has moved, so that stays a toast.
       */
      if (paymentProof?.razorpay_payment_id) {
        setOutcome({ kind: 'orphaned', paymentId: paymentProof.razorpay_payment_id, detail });
      } else {
        toast.error(detail || 'Failed to place order');
      }
    } finally { setPlacing(false); }
  };

  /**
   * True only when a Razorpay window can actually open. Anything else sets the
   * offline outcome and stops.
   *
   * "No script yet" and "no connection" are different states, but the button is
   * disabled for the whole time the script is loading, so by the time this runs
   * a missing script means it failed to arrive — which is the same thing to the
   * customer as being offline, and is reported that way.
   */
  const canOpenRazorpay = () => {
    if (typeof window === 'undefined') return false;
    if (!navigator.onLine || !scriptReady || !(window as any).Razorpay) {
      setOutcome({ kind: 'offline' });
      return false;
    }
    return true;
  };

  // ── Razorpay flow (card / net banking / UPI via Razorpay modal) ──
  const openRazorpay = async (isEmi = false) => {
    if (!validateAddr()) { toast.error('Please fill all address fields'); return; }
    /*
     * The check lives here, before the first server call, because this function
     * creates a Razorpay order and only then reaches for window.Razorpay. Going
     * ahead without the script would leave an order on Razorpay's side that no
     * customer was ever shown a window for.
     *
     * The EMI button calls this directly, so a guard sitting only in
     * handleRazorpay would have covered one of the two ways to pay.
     */
    if (!canOpenRazorpay()) return;
    setPlacing(true);
    try {
      const orderRes = await api.post('/api/payments/create-order', { amount: grandTotal });
      const { order_id, key_id } = orderRes.data;

      const options: any = {
        key:         key_id,
        amount:      grandTotal * 100,
        currency:    'INR',
        name:        'Ammalu Tex',
        description: 'Premium Textile Purchase',
        order_id:    order_id,
        prefill: {
          name:    addr.full_name,
          contact: addr.phone,
          email:   user?.email,
        },
        theme: { color: '#8b1538' },
        handler: async (response: any) => {
          const paymentProof = {
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
          };
          try {
            await api.post('/api/payments/verify', paymentProof);
            // Order is only ever created after this — the backend independently
            // re-verifies the same signature before writing anything to the DB.
            await finalizeOrder(isEmi ? 'emi' : 'razorpay', paymentProof);
          } catch {
            // The charge may well have succeeded — we simply could not confirm
            // it. Offering a retry here is how a customer pays twice.
            setOutcome({ kind: 'unverified', paymentId: paymentProof.razorpay_payment_id });
            setPlacing(false);
          }
        },
        modal: { ondismiss: () => { setPlacing(false); setOutcome({ kind: 'dismissed' }); } },
      };

      // For EMI: open standard Razorpay modal (EMI tab appears automatically inside)
      // No custom config — Razorpay shows EMI for eligible credit cards automatically

      const rzp = new window.Razorpay(options);

      /**
       * A DECLINED CARD USED TO PRODUCE NO RESPONSE AT ALL.
       *
       * Without this subscription the Razorpay window just closes on a
       * decline and the page sits exactly as it was. The customer cannot tell
       * whether they were charged, so they either pay again or abandon the
       * order. Nothing has been charged in this state, so it is safe — and it
       * is the one failure where offering another attempt is the right answer.
       */
      rzp.on('payment.failed', (resp: {
        error?: { description?: string; reason?: string; metadata?: { payment_id?: string } };
      }) => {
        const e = resp?.error ?? {};
        setPlacing(false);
        setOutcome({
          kind: 'declined',
          description: e.description || 'The payment could not be completed.',
          reason: e.reason,
          paymentId: e.metadata?.payment_id,
        });
      });

      rzp.open();
    } catch {
      toast.error('Payment gateway error. Please try again.');
      setPlacing(false);
    }
  };

  /**
   * Every attempt starts from a clean slate, and never opens into a state that
   * cannot succeed. Opening the Razorpay window with no connection produces a
   * blank modal and no error, which reads as the shop being broken.
   */
  const handleRazorpay = async () => {
    setOutcome(null);
    return openRazorpay(false);
  };

  const handlePlaceOrder = async () => {
    if (!validateAddr()) {
      toast.error('Please complete all required fields'); return;
    }
    // Cleared for EMI too — a stale banner from a previous attempt must not
    // outlive the attempt that replaces it.
    if (payMethod === 'emi') { setOutcome(null); await openRazorpay(true); return; }
    await handleRazorpay();
  };

  const STEPS = ['Where it goes', 'How you pay', 'Check and place'] as const;

  /**
   * When the money may already have moved, paying again is the one thing the
   * customer must not be able to do by reflex. The outcome panel says so in
   * words; this makes it true of the button as well.
   */
  const atRisk = outcome ? isMoneyAtRisk(outcome) : false;

  return (
    <div className="mx-auto w-full max-w-[104rem] px-6 py-[clamp(2.5rem,7vh,4.5rem)] sm:px-10">
      {/* The outcome takes the top of the page when there is one — it is the
          answer to the thing the customer just did, so it goes above the form
          rather than below it. */}
      {outcome && (
        <div ref={outcomeRef} tabIndex={-1} className="mb-[clamp(2.5rem,7vh,4.5rem)] focus:outline-none">
          <PaymentOutcome outcome={outcome} onRetry={handleRazorpay} retrying={placing} />
        </div>
      )}

      <Link
        href="/cart"
        className="group inline-flex items-baseline gap-3 text-rule uppercase text-graphite-faint transition-colors duration-500 hover:text-thread focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-thread"
      >
        <span aria-hidden="true" className="inline-block transition-transform duration-500 group-hover:-translate-x-1 motion-reduce:transition-none">&larr;</span>
        Back to the bag
      </Link>

      {/* The operation count, the same instrument as the sign-in flow: the
          current step in thread, the ones behind you struck through, the ones
          ahead still pale. You can see how far in you are and how much is
          left, which is the one thing a multi-step form usually refuses to
          say. */}
      <div className="mb-[clamp(2.5rem,7vh,4.5rem)] mt-8 flex items-center gap-5">
        <ol className="flex items-baseline gap-x-6">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const done = n < step;
            const now = n === step;
            return (
              <li
                key={label}
                aria-current={now ? 'step' : undefined}
                className={`flex items-baseline gap-2.5 text-rule uppercase tabular-nums ${
                  now ? 'text-thread'
                  : done ? 'text-graphite-faint line-through decoration-thread/60'
                  : 'text-paper-edge'
                }`}
              >
                <span>{String(n).padStart(2, '0')}</span>
                <span className={now ? '' : 'hidden sm:inline'}>{label}</span>
              </li>
            );
          })}
        </ol>
        <span aria-hidden="true" className="h-px flex-1 bg-paper-edge" />
      </div>

      <h1 className="sr-only">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">

          {/* ── STEP 1: Address ── */}
          {step === 1 && (
            <div className="card p-6">
              <h2 className="font-normal text-lg text-maroon-900 mb-5 flex items-center gap-2">
                <Package size={20} /> Delivery Address
              </h2>

              {/* Saved addresses */}
              {savedAddresses.length > 0 && (
                <div className="mb-5">
                  <p className="text-sm font-semibold text-graphite-muted mb-3">Saved Addresses</p>
                  <div className="space-y-2">
                    {savedAddresses.map((a: any) => (
                      <label key={a.id}
                        className={`flex items-start gap-3 p-3 rounded-sm border-2 cursor-pointer transition-colors ${selectedAddrId === a.id ? 'border-maroon-700 bg-maroon-50' : 'border-paper-edge hover:border-maroon-300'}`}
                      >
                        <input type="radio" name="saved_addr" className="mt-1 accent-maroon-700"
                          checked={selectedAddrId === a.id}
                          onChange={() => {
                            setSelectedAddrId(a.id);
                            setShowNewAddrForm(false);
                            setAddr({ full_name: a.full_name, phone: a.phone, address_line1: a.address_line1, address_line2: a.address_line2 || '', city: a.city, state: a.state, pincode: a.pincode });
                          }}
                        />
                        <div className="flex-1 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-graphite">{a.full_name}</span>
                            {a.label && <span className="text-rule uppercase text-graphite-faint">{a.label}</span>}
                            {a.is_default && <span className="text-rule uppercase text-thread">Default</span>}
                          </div>
                          <p className="text-graphite-faint mt-0.5">{a.address_line1}{a.address_line2 ? `, ${a.address_line2}` : ''}, {a.city}, {a.state} – {a.pincode}</p>
                          <p className="text-graphite-faint">{a.phone}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <button onClick={() => { setShowNewAddrForm(v => !v); setSelectedAddrId(null); }}
                    className="mt-3 flex items-center gap-1.5 text-sm text-maroon-700 font-medium hover:underline">
                    <Plus size={15} /> {showNewAddrForm ? 'Cancel' : 'Add new address'}
                  </button>
                </div>
              )}

              {/* Address form (new or when no saved addresses) */}
              {(showNewAddrForm || savedAddresses.length === 0) && (
              <div className="space-y-4">
                {/* GPS detect button */}
                <button type="button" onClick={detectLocation} disabled={gpsLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-maroon-300 rounded-sm text-maroon-700 text-sm font-medium hover:bg-maroon-50 transition-colors">
                  {gpsLoading
                    ? <><span className="animate-spin h-4 w-4 border-2 border-maroon-600 border-t-transparent rounded-full" /> Detecting location...</>
                    : <><Navigation size={16} /> Use my current location</>}
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name *</label>
                    <input type="text" value={addr.full_name} onChange={setA('full_name')} placeholder="Your full name" className={`input-field ${addrErrors.full_name ? 'input-error' : ''}`} />
                    <FieldErr msg={addrErrors.full_name} />
                  </div>
                  <div>
                    <label className="label">Mobile Number *</label>
                    <input type="tel" value={addr.phone} onChange={setA('phone')} placeholder="+91 98765 43210" className={`input-field ${addrErrors.phone ? 'input-error' : ''}`} maxLength={13} />
                    <FieldErr msg={addrErrors.phone} />
                  </div>
                </div>
                <div>
                  <label className="label">Street Address *</label>
                  <input type="text" value={addr.address_line1} onChange={setA('address_line1')} placeholder="House No, Street, Area" className={`input-field ${addrErrors.address_line1 ? 'input-error' : ''}`} />
                  <FieldErr msg={addrErrors.address_line1} />
                </div>
                <div>
                  <label className="label">Landmark (Optional)</label>
                  <input type="text" value={addr.address_line2} onChange={setA('address_line2')} placeholder="Landmark, Apartment number" className="input-field" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="label">City *</label>
                    <input type="text" value={addr.city} onChange={setA('city')} placeholder="City" className={`input-field ${addrErrors.city ? 'input-error' : ''}`} />
                    <FieldErr msg={addrErrors.city} />
                  </div>
                  <div>
                    <label className="label">State *</label>
                    <select value={addr.state} onChange={setA('state')} className={`input-field ${addrErrors.state ? 'input-error' : ''}`}>
                      <option value="">Select State</option>
                      {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <FieldErr msg={addrErrors.state} />
                  </div>
                  <div>
                    <label className="label">Pincode *</label>
                    <input type="text" value={addr.pincode} onChange={setA('pincode')} placeholder="600001" className={`input-field ${addrErrors.pincode ? 'input-error' : ''}`} maxLength={6} />
                    <FieldErr msg={addrErrors.pincode} />
                  </div>
                </div>
              </div>
              )}
              {/* end new address form */}

              <button onClick={handleAddrNext} className="btn-primary w-full mt-6 py-3 flex items-center justify-center gap-2">
                <MapPin size={18} /> Continue to Payment →
              </button>
            </div>
          )}

          {/* ── STEP 2: Payment ── */}
          {step === 2 && (
            <div className="card p-6">
              <h2 className="font-normal text-lg text-maroon-900 mb-5 flex items-center gap-2">
                How you pay
              </h2>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {([
                  { val: 'razorpay', icon: CreditCard,    label: 'Card / UPI / Net Banking', sub: 'Visa • Master • UPI • Wallets' },
                  { val: 'emi',      icon: CalendarDays,  label: 'Pay in EMI',               sub: 'No-cost EMI available' },
                ] as const).map(({ val, icon: Icon, label, sub }) => (
                  <button key={val} onClick={() => setPayMethod(val)}
                    className={`flex flex-col items-center gap-1.5 p-4 rounded-sm border-2 text-sm font-medium transition-all ${payMethod === val ? 'border-maroon-800 bg-maroon-50 text-maroon-800' : 'border-paper-edge text-graphite-muted hover:border-maroon-300'}`}>
                    <Icon size={22} />
                    <span className="text-center leading-tight font-semibold">{label}</span>
                    <span className="text-[10px] text-graphite-faint">{sub}</span>
                  </button>
                ))}
              </div>

              {/* Razorpay info */}
              {payMethod === 'razorpay' && (
                <div className="border-l-2 border-paper-edge/50 pl-4 p-4 space-y-2">
                  <p className="text-rule uppercase text-thread">Through Razorpay</p>
                  <p className="text-graphite-muted">Razorpay takes the payment on its own page and hands us back a receipt. Accepted there:</p>
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {['Credit Card','Debit Card','Net Banking','UPI','Wallets','EMI'].map(m => (
                      <span key={m} className="text-caption uppercase text-graphite">{m}</span>
                    ))}
                  </div>
                  <p className="text-caption uppercase text-graphite-faint">Your card never reaches us. Razorpay holds it.</p>
                </div>
              )}

              {/* EMI info */}
              {payMethod === 'emi' && (
                <div className="border-l-2 border-paper-edge/50 pl-4 p-4 space-y-2">
                  <p className="text-rule uppercase text-thread">In instalments</p>
                  <p className="text-graphite-muted">Split the total across months. Credit cards only.</p>
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {['3 months', '6 months', '9 months', '12 months', 'No-cost EMI'].map(m => (
                      <span key={m} className="text-caption uppercase text-graphite">{m}</span>
                    ))}
                  </div>
                  {grandTotal < 1000 ? (
                    <div className="bg-maroon-50 border border-caution rounded-sm p-3">
                      <p className="text-sm text-graphite">This order is ₹{grandTotal}. Instalments need a total of ₹1,000 or more.</p>
                      <p className="mt-1 text-sm text-graphite-muted">Card or UPI above will work.</p>
                    </div>
                  ) : (
                    <p className="text-caption uppercase text-graphite-faint">The instalment plans appear on Razorpay's screen.</p>
                  )}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">← Back</button>
                <button onClick={handlePayNext} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                  <Lock size={16} /> Review Order →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Confirm ── */}
          {step === 3 && (
            <div className="card p-6">
              <h2 className="font-normal text-lg text-maroon-900 mb-5 flex items-center gap-2">
                Check it over
              </h2>

              {/* Address summary */}
              <div className="bg-maroon-50 rounded-sm p-4 mb-4">
                <div className="flex justify-between">
                  <div>
                    <p className="text-rule uppercase text-graphite-faint mb-2">Delivering to</p>
                    <p className="font-semibold text-graphite">{addr.full_name}</p>
                    <p className="text-sm text-graphite-muted">{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}</p>
                    <p className="text-sm text-graphite-muted">{addr.city}, {addr.state} — {addr.pincode}</p>
                    <p className="text-sm text-graphite-faint">📞 {addr.phone}</p>
                  </div>
                  <button onClick={() => setStep(1)} className="text-sm text-maroon-700 hover:underline font-medium">Edit</button>
                </div>
              </div>

              {/* Payment summary */}
              <div className="bg-maroon-50 rounded-sm p-4 mb-4">
                <div className="flex justify-between">
                  <div>
                    <p className="text-rule uppercase text-graphite-faint mb-2">Payment</p>
                    <p className="font-semibold text-graphite flex items-center gap-2">
                      {payMethod === 'razorpay' && <><CreditCard size={16} /> Razorpay (Card / Net Banking / UPI)</>}
                      {payMethod === 'emi'      && <><CalendarDays size={16} /> EMI — Pay in Instalments</>}
                    </p>
                  </div>
                  <button onClick={() => setStep(2)} className="text-sm text-maroon-700 hover:underline font-medium">Edit</button>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3 mb-5">
                <p className="text-rule uppercase text-graphite-faint">Items ({items.length})</p>
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-sm bg-maroon-50 flex items-center justify-center text-xl flex-shrink-0">
                      {item.product.category === 'Lehenga' ? '👗' : item.product.category === 'Chudithar' ? '👘' : '👚'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-graphite truncate">{item.product.name}</p>
                      <p className="text-xs text-graphite-faint">Qty: {item.quantity}{item.size ? ` · ${item.size}` : ''}{item.color ? ` · ${item.color}` : ''}</p>
                    </div>
                    <p className="font-semibold text-maroon-900 text-sm">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* Open Box Delivery option */}
              <label className="mb-4 flex cursor-pointer items-start gap-3 border-l border-thread py-1 pl-4 transition-colors duration-500">
                <input type="checkbox" checked={openBox} onChange={e => setOpenBox(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-thread flex-shrink-0" />
                <div>
                  <p className="text-graphite">Ask the agent to open the parcel with you</p>
                  <p className="mt-1 text-sm leading-relaxed text-graphite-muted">
                    Inspect the package before accepting. If the product is damaged or doesn't match,
                    you can refuse delivery on the spot for a full refund.
                  </p>
                </div>
              </label>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1 py-3">← Back</button>
                <button onClick={handlePlaceOrder} disabled={placing || atRisk || !scriptReady}
                  className="btn-gold flex-1 py-3.5 flex items-center justify-center gap-2 text-base font-normal rounded-sm disabled:opacity-60">
                  {placing
                    ? <><span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> Processing...</>
                    : !scriptReady
                      ? <><span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> Preparing...</>
                      : <><Lock size={18} /> {payMethod === 'razorpay' ? 'Pay with Razorpay' : 'Choose EMI Plan'} · ₹{grandTotal.toLocaleString()}</>
                  }
                </button>
              </div>
              {atRisk ? (
                <p className="mx-auto mt-3 max-w-[46ch] text-center text-xs text-graphite-faint">
                  Paying again is disabled until we have checked the payment above — we do not
                  want to take your money twice.
                </p>
              ) : (
                <p className="text-xs text-graphite-faint text-center mt-3">By placing this order, you agree to our Terms of Service.</p>
              )}
            </div>
          )}
        </div>

        {/* Order Summary sidebar */}
        <div className="lg:col-span-1">
          {/* Opaque because it is sticky — see the note on the bag's summary. */}
          <div className="card bg-paper p-5 sticky top-28">
            <h3 className="font-normal text-maroon-900 mb-4">Price Details</h3>
            <div className="space-y-2.5 text-sm">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-graphite-muted">
                  <span className="truncate mr-2">{item.product.name} × {item.quantity}</span>
                  <span className="font-medium flex-shrink-0">₹{(item.product.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-maroon-200 pt-2.5 flex justify-between text-graphite-muted">
                <span>Subtotal</span><span className="font-medium">₹{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-graphite-muted">
                <span>Shipping</span>
                <span className="font-medium">₹{shipping}</span>
              </div>
              <div className="border-t-2 border-maroon-100 pt-2.5 flex justify-between font-normal text-base">
                <span className="text-maroon-900">Total</span>
                <span className="text-maroon-900">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-maroon-200 space-y-1.5">
              <p className="text-rule uppercase text-graphite-faint">Payment handled by Razorpay</p>
              <p className="text-xs text-graphite-faint">↩️ 7-day easy returns</p>
              <p className="text-xs text-graphite-faint">✅ 100% Authentic Products</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
