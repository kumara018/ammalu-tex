'use client';
import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Package, Truck, CheckCircle, Clock, XCircle,
  MapPin, CreditCard, ArrowLeft, Sparkles, Phone, ShieldCheck,
  PackageOpen, Navigation, ExternalLink, AlertTriangle, RefreshCw,
  FileText, RotateCcw,
} from 'lucide-react';
import { ordersAPI } from '@/lib/api';
import { Order } from '@/types';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string; ring: string }> = {
  pending:          { label: 'Order Placed',      icon: Clock,        color: 'text-yellow-700', bg: 'bg-yellow-50',  ring: 'border-yellow-400' },
  confirmed:        { label: 'Confirmed',          icon: CheckCircle,  color: 'text-blue-700',   bg: 'bg-blue-50',    ring: 'border-blue-400' },
  processing:       { label: 'Being Packed',       icon: Package,      color: 'text-purple-700', bg: 'bg-purple-50',  ring: 'border-purple-400' },
  shipped:          { label: 'Shipped',            icon: Truck,        color: 'text-indigo-700', bg: 'bg-indigo-50',  ring: 'border-indigo-400' },
  out_for_delivery: { label: 'Out for Delivery',   icon: Truck,        color: 'text-orange-700', bg: 'bg-orange-50',  ring: 'border-orange-400' },
  delivered:        { label: 'Delivered',          icon: CheckCircle,  color: 'text-green-700',  bg: 'bg-green-50',   ring: 'border-green-400' },
  cancelled:        { label: 'Cancelled',          icon: XCircle,      color: 'text-red-700',    bg: 'bg-red-50',     ring: 'border-red-400' },
};

const CANCEL_REASONS = [
  'Changed my mind',
  'Ordered by mistake',
  'Found a better price elsewhere',
  'Delivery time is too long',
  'Want to change the size/colour',
  'Other',
];

function OrderDetailContent() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const isNew = searchParams.get('new') === '1';

  const [order, setOrder]             = useState<Order | null>(null);
  const [loading, setLoading]         = useState(true);
  const [tracking, setTracking]       = useState<any>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason]       = useState('');
  const [customReason, setCustomReason]       = useState('');
  const [cancelling, setCancelling]           = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    const load = async () => {
      try {
        const res = await ordersAPI.getOne(Number(id));
        setOrder(res.data);
      } catch { router.push('/orders'); } finally { setLoading(false); }
    };
    load();
  }, [id, user, authLoading]);

  const fetchTracking = async () => {
    setTrackLoading(true);
    try {
      const res = await ordersAPI.track(Number(id));
      setTracking(res.data);
    } catch { toast.error('Could not fetch tracking info'); } finally { setTrackLoading(false); }
  };

  const handleCancelConfirm = async () => {
    const reason = cancelReason === 'Other' ? customReason.trim() : cancelReason;
    if (!reason) { toast.error('Please select a reason'); return; }
    setCancelling(true);
    try {
      const res = await ordersAPI.cancel(Number(id), reason);
      setOrder(res.data);
      setShowCancelModal(false);
      toast.success('Order cancelled successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Could not cancel order');
    } finally { setCancelling(false); }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-64" />
      <div className="card p-6 space-y-4"><div className="h-6 bg-gray-200 rounded w-48" /><div className="h-24 bg-gray-200 rounded" /></div>
    </div>
  );

  if (!order) return null;

  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';
  // Can cancel up to "shipped" — not once out for delivery or delivered
  const canCancel = ['pending', 'confirmed', 'processing', 'shipped'].includes(order.status);
  const currentStep = STATUS_STEPS.indexOf(order.status);
  const addr = order.shipping_address as any;

  // Delhivery tracking events (parsed clean list)
  const trackingEvents: any[] = tracking?.tracking_events || [];
  // Fallback: Shiprocket format
  const srEvents: any[] = tracking?.raw_data?.tracking_data?.shipment_track_activities || [];
  const allEvents = trackingEvents.length > 0 ? trackingEvents : srEvents;
  const currentLocation = tracking?.status_location || tracking?.current_status?.location || order.status_location;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Success banner for new orders */}
      {isNew && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6 text-center">
          <Sparkles size={40} className="mx-auto text-green-600 mb-3" />
          <h2 className="text-xl font-bold text-green-800 mb-1">Order Placed Successfully! 🎉</h2>
          <p className="text-green-700 text-sm">Thank you for shopping at Ammalu Tex! Your order <b>{order.order_number}</b> has been confirmed.</p>
          <p className="text-green-600 text-xs mt-2">You will receive a confirmation via Email, SMS & WhatsApp shortly.</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Link href="/orders" className="p-2 hover:bg-orange-100 rounded-lg"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-xl font-bold text-maroon-900">Order {order.order_number}</h1>
          <p className="text-sm text-gray-500">Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        {canCancel && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="ml-auto text-sm text-red-600 hover:text-red-800 border border-red-300 hover:border-red-500 px-4 py-2 rounded-lg transition-colors"
          >
            Cancel Order
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">

          {/* ── Status Timeline ── */}
          {!isCancelled && (
            <div className="card p-6">
              <h3 className="font-bold text-maroon-900 mb-5 flex items-center gap-2">
                <Package size={18} /> Order Status
              </h3>

              {/* Progress bar */}
              <div className="relative mb-2">
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200">
                  <div
                    className="h-full bg-maroon-800 transition-all duration-700"
                    style={{ width: `${Math.max(0, (currentStep / (STATUS_STEPS.length - 1)) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between relative">
                  {STATUS_STEPS.map((s, i) => {
                    const done = i <= currentStep;
                    const active = i === currentStep;
                    const cfg = STATUS_CONFIG[s];
                    const Icon = cfg.icon;
                    return (
                      <div key={s} className="flex flex-col items-center gap-2 z-10">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                          ${done
                            ? (s === 'out_for_delivery' ? 'bg-orange-600 border-orange-600 text-white' :
                               s === 'delivered' ? 'bg-green-600 border-green-600 text-white' :
                               'bg-maroon-800 border-maroon-800 text-white')
                            : 'bg-white border-gray-300 text-gray-400'}
                          ${active ? 'ring-4 ring-offset-2 ring-maroon-200 scale-110' : ''}`}>
                          <Icon size={16} />
                        </div>
                        <span className={`text-[10px] font-medium text-center hidden sm:block leading-tight ${done ? 'text-maroon-800 font-semibold' : 'text-gray-400'}`} style={{ maxWidth: 64 }}>
                          {cfg.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Current location badge */}
              {currentLocation && (
                <div className="mt-5 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5">
                  <Navigation size={15} className="text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-blue-800 font-medium">{currentLocation}</span>
                </div>
              )}

              {/* Tracking number + courier */}
              {(order.tracking_number || order.awb_code) && (
                <div className="mt-4 pt-4 border-t border-orange-100 space-y-2">
                  {order.courier_name && (
                    <p className="text-sm text-gray-600">Courier: <span className="font-semibold text-maroon-800">{order.courier_name}</span></p>
                  )}
                  <p className="text-sm text-gray-600">
                    AWB / Tracking: <span className="font-mono font-bold text-maroon-800">{order.awb_code || order.tracking_number}</span>
                  </p>
                  {order.estimated_delivery && (
                    <p className="text-sm text-gray-600">
                      Estimated Delivery: <span className="font-semibold text-green-700">{order.estimated_delivery}</span>
                    </p>
                  )}
                  <div className="flex gap-3 flex-wrap mt-2">
                    {order.tracking_url && (
                      <a href={order.tracking_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-white bg-maroon-800 hover:bg-maroon-900 px-3 py-1.5 rounded-lg transition-colors">
                        <ExternalLink size={13} /> Track on {order.courier_name || 'Courier'} Website
                      </a>
                    )}
                    <button onClick={fetchTracking} disabled={trackLoading}
                      className="inline-flex items-center gap-1.5 text-sm text-maroon-700 border border-maroon-300 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60">
                      <RefreshCw size={13} className={trackLoading ? 'animate-spin' : ''} />
                      {trackLoading ? 'Loading...' : 'Refresh Tracking'}
                    </button>
                  </div>
                </div>
              )}

              {/* Estimated delivery banner for pre-ship statuses */}
              {['confirmed', 'processing'].includes(order.status) && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2">
                  <Truck size={16} className="text-blue-600 flex-shrink-0" />
                  <p className="text-sm text-blue-700 font-medium">Estimated Delivery: 3–7 Business Days</p>
                </div>
              )}
            </div>
          )}

          {/* ── Live Tracking History (Delhivery / Shiprocket) ── */}
          {allEvents.length > 0 && (
            <div className="card p-6">
              <h3 className="font-bold text-maroon-900 mb-4 flex items-center gap-2">
                <Navigation size={18} /> Live Tracking History
                {order.courier_name && <span className="text-xs font-normal text-gray-400 ml-1">via {order.courier_name}</span>}
              </h3>
              <div className="space-y-0">
                {allEvents.slice(0, 12).map((ev: any, i: number) => (
                  <div key={i} className="flex gap-3 relative">
                    {i < allEvents.length - 1 && (
                      <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-orange-100 z-0" />
                    )}
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center z-10 border-2 ${i === 0 ? 'bg-maroon-800 border-maroon-800 text-white' : 'bg-white border-orange-300 text-orange-500'}`}>
                      <MapPin size={14} />
                    </div>
                    <div className="pb-5 flex-1">
                      <p className={`text-sm font-semibold ${i === 0 ? 'text-maroon-900' : 'text-gray-700'}`}>
                        {ev.activity || ev.status || 'Update'}
                      </p>
                      {ev.location && (
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <MapPin size={11} /> {ev.location}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {ev.datetime ? new Date(ev.datetime).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Open Box Delivery ── */}
          {order.open_box_delivery && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
              <PackageOpen size={24} className="text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-800 text-sm">Open Box Delivery Requested</p>
                <p className="text-xs text-blue-600 mt-0.5">You can inspect the package before accepting delivery.</p>
              </div>
            </div>
          )}

          {/* ── Delivery OTP ── */}
          {order.status === 'out_for_delivery' && order.delivery_otp && (
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-300 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={22} className="text-orange-700" />
                <h3 className="font-bold text-orange-900">Your Delivery OTP</h3>
              </div>
              <p className="text-sm text-gray-700 mb-4">Your order is out for delivery! Share this OTP with the delivery agent when they arrive.</p>
              <div className="bg-white border-2 border-orange-300 rounded-xl p-4 text-center mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Delivery OTP</p>
                <p className="text-5xl font-bold tracking-[0.4em] font-mono text-orange-700">{order.delivery_otp}</p>
              </div>
              {(order.delivery_person_name || order.delivery_person_phone) && (
                <div className="bg-white border border-orange-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Your Delivery Agent</p>
                  {order.delivery_person_name && <p className="text-sm font-semibold text-gray-800">{order.delivery_person_name}</p>}
                  {order.delivery_person_phone && (
                    <a href={`tel:${order.delivery_person_phone}`}
                      className="flex items-center gap-1.5 text-sm text-maroon-700 hover:underline font-medium mt-1">
                      <Phone size={14} /> {order.delivery_person_phone}
                    </a>
                  )}
                </div>
              )}
              <p className="text-xs text-orange-700 mt-3 font-medium">⚠️ Never share this OTP via phone call or message. Only share it in person at your door.</p>
            </div>
          )}

          {/* ── Cancelled ── */}
          {isCancelled && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <div className="flex items-center gap-4 mb-3">
                <XCircle size={32} className="text-red-500 flex-shrink-0" />
                <div>
                  <p className="font-bold text-red-800">Order Cancelled</p>
                  <p className="text-sm text-red-600 mt-0.5">
                    {order.cancelled_by === 'user' ? 'Cancelled by you.' : 'Cancelled by store.'}
                    {order.cancel_reason ? ` Reason: ${order.cancel_reason}` : ''}
                  </p>
                </div>
              </div>
              {order.payment_status === 'refunded' ? (
                <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
                  <RotateCcw size={18} className="text-purple-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-purple-800">Refund Initiated ✅</p>
                    <p className="text-xs text-purple-600 mt-0.5">₹{order.total.toLocaleString()} will be credited within 5–7 business days.</p>
                  </div>
                </div>
              ) : order.payment_method !== 'cod' && (
                <p className="text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5">
                  💰 Refund will be processed within 5–7 business days to your original payment method.
                </p>
              )}
            </div>
          )}

          {/* ── Items ── */}
          <div className="card p-6">
            <h3 className="font-bold text-maroon-900 mb-4">Ordered Items</h3>
            <div className="space-y-4">
              {(order.items_snapshot as any[]).map((item, i) => {
                const emoji = item.category === 'Lehenga' ? '👗' : item.category === 'Chudithar' ? '👘' : item.category === 'Half Saree' ? '🥻' : item.category === 'Crop Tops' ? '🎽' : item.category === 'Party Wears' ? '✨' : '👚';
                const imgSrc = item.image ? (item.image.startsWith('http') ? item.image : `${process.env.NEXT_PUBLIC_API_URL}${item.image}`) : null;
                return (
                  <div key={i} className="flex items-start gap-4 pb-4 border-b border-orange-50 last:border-0 last:pb-0">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden border border-orange-100">
                      {imgSrc ? (
                        <img src={imgSrc} alt={item.name} className="w-full h-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                      ) : <span>{emoji}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Qty: {item.quantity}
                        {item.size ? ` · Size: ${item.size}` : ''}
                        {item.color ? ` · Colour: ${item.color}` : ''}
                      </p>
                      <p className="text-xs text-gray-500">₹{Number(item.price).toLocaleString()} each</p>
                      {isDelivered && item.product_id && (
                        <Link href={`/products/${item.product_id}#reviews`}
                          className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-maroon-700 hover:text-maroon-900 border border-maroon-300 hover:border-maroon-500 rounded-lg px-2.5 py-1 transition-colors">
                          ✍️ Write a Review
                        </Link>
                      )}
                    </div>
                    <p className="font-bold text-maroon-900 flex-shrink-0">₹{Number(item.subtotal).toLocaleString()}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-5">
          {/* Price summary */}
          <div className="card p-5">
            <h3 className="font-bold text-maroon-900 mb-4">Price Breakdown</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-700"><span>Subtotal</span><span>₹{order.subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-700">
                <span>Shipping</span>
                <span className={order.shipping_fee === 0 ? 'text-green-600' : ''}>{order.shipping_fee === 0 ? 'FREE' : `₹${order.shipping_fee}`}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{order.discount.toLocaleString()}</span></div>
              )}
              <div className="border-t border-orange-100 pt-2.5 flex justify-between font-bold text-base">
                <span>Total Paid</span><span className="text-maroon-900">₹{order.total.toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-orange-50 space-y-2">
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <CreditCard size={12} />
                Mode: <b className="capitalize">
                  {order.payment_method === 'razorpay' ? 'Online (Razorpay)' :
                   order.payment_method === 'upi' ? 'UPI' : 'Cash on Delivery'}
                </b>
              </p>
              <p className="text-xs flex items-center gap-1.5">
                <span className={`inline-block font-bold px-2 py-0.5 rounded-full text-[10px] border
                  ${order.payment_status === 'paid'     ? 'text-green-700 bg-green-50 border-green-300'   :
                    order.payment_status === 'refunded' ? 'text-purple-700 bg-purple-50 border-purple-300' :
                    'text-amber-700 bg-amber-50 border-amber-300'}`}>
                  {order.payment_status === 'paid' ? '✅ PAID' :
                   order.payment_status === 'refunded' ? '↩️ REFUNDED' : '⏳ PENDING'}
                </span>
              </p>
            </div>
          </div>

          {/* Invoice */}
          <div className="card p-5">
            <h3 className="font-bold text-maroon-900 mb-3 flex items-center gap-2"><FileText size={16} /> Invoice</h3>
            <p className="text-xs text-gray-500 mb-3">Download or share your order invoice</p>
            <Link href={`/orders/${order.id}/invoice`}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-maroon-800 hover:bg-maroon-900 text-white text-sm font-medium rounded-xl transition-colors">
              <FileText size={15} /> View & Download Invoice
            </Link>
          </div>

          {/* Delivery address */}
          <div className="card p-5">
            <h3 className="font-bold text-maroon-900 mb-3 flex items-center gap-2"><MapPin size={16} /> Delivery Address</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p className="font-semibold">{addr.full_name}</p>
              <p>{addr.address_line1}</p>
              {addr.address_line2 && <p>{addr.address_line2}</p>}
              <p>{addr.city}, {addr.state} — {addr.pincode}</p>
              <p className="text-gray-500">📞 {addr.phone}</p>
            </div>
          </div>

          {canCancel && (
            <button onClick={() => setShowCancelModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-red-600 border border-red-300 hover:bg-red-50 rounded-xl transition-colors">
              <XCircle size={16} /> Cancel This Order
            </button>
          )}

          <Link href="/products" className="btn-secondary w-full flex items-center justify-center gap-2 py-3">
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* ── Cancel Confirmation Modal ── */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4" onClick={() => setShowCancelModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Cancel Order?</h3>
                <p className="text-sm text-gray-500">{order.order_number}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Please tell us why you want to cancel. This helps us improve.
              {order.payment_method !== 'cod' && <span className="block mt-1 text-orange-600 font-medium">Your payment will be refunded within 5–7 business days.</span>}
            </p>

            {/* Reason selector */}
            <div className="space-y-2 mb-4">
              {CANCEL_REASONS.map(reason => (
                <label key={reason} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${cancelReason === reason ? 'border-maroon-500 bg-orange-50' : 'border-gray-200 hover:border-maroon-300'}`}>
                  <input type="radio" name="cancel_reason" value={reason} checked={cancelReason === reason}
                    onChange={() => setCancelReason(reason)} className="accent-maroon-700" />
                  <span className="text-sm text-gray-700">{reason}</span>
                </label>
              ))}
            </div>

            {cancelReason === 'Other' && (
              <textarea
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
                placeholder="Please describe your reason..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-maroon-400 resize-none mb-4"
              />
            )}

            <div className="flex gap-3">
              <button onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors">
                Keep Order
              </button>
              <button onClick={handleCancelConfirm} disabled={cancelling || !cancelReason}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {cancelling ? <><RefreshCw size={14} className="animate-spin" /> Cancelling...</> : <><XCircle size={14} /> Yes, Cancel</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-64" /><div className="card p-6 h-48 bg-gray-200 rounded" /></div>}>
      <OrderDetailContent />
    </Suspense>
  );
}
