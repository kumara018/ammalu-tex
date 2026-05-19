'use client';
import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Package, Truck, CheckCircle, Clock, XCircle,
  MapPin, CreditCard, ArrowLeft, AlertCircle, Sparkles,
} from 'lucide-react';
import { ordersAPI } from '@/lib/api';
import { Order } from '@/types';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

function OrderDetailContent() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const isNew = searchParams.get('new') === '1';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/auth/login'); return; }
    const load = async () => {
      try {
        const res = await ordersAPI.getOne(Number(id));
        setOrder(res.data);
      } catch { router.push('/orders'); } finally { setLoading(false); }
    };
    load();
  }, [id, user, authLoading]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const res = await ordersAPI.cancel(Number(id));
      setOrder(res.data);
      toast.success('Order cancelled successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to cancel order');
    } finally { setCancelling(false); }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-64" />
      <div className="card p-6 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-48" />
        <div className="h-24 bg-gray-200 rounded" />
      </div>
    </div>
  );

  if (!order) return null;

  const isCancelled = order.status === 'cancelled';
  const canCancel = ['pending', 'confirmed'].includes(order.status);
  const currentStep = STATUS_STEPS.indexOf(order.status);
  const addr = order.shipping_address as any;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Success banner for new orders */}
      {isNew && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6 text-center">
          <Sparkles size={40} className="mx-auto text-green-600 mb-3" />
          <h2 className="text-xl font-bold text-green-800 mb-1">Order Placed Successfully! 🎉</h2>
          <p className="text-green-700 text-sm">Thank you for shopping at Ammalu Tex! Your order <b>{order.order_number}</b> has been confirmed.</p>
          <p className="text-green-600 text-xs mt-2">You will receive a confirmation shortly. Expected delivery: 3–7 business days.</p>
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
          <button onClick={handleCancel} disabled={cancelling} className="ml-auto text-sm text-red-600 hover:text-red-800 border border-red-300 hover:border-red-500 px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">

          {/* Status tracker */}
          {!isCancelled && (
            <div className="card p-6">
              <h3 className="font-bold text-maroon-900 mb-5">Order Status</h3>
              <div className="relative">
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200">
                  <div
                    className="h-full bg-maroon-800 transition-all duration-500"
                    style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between relative">
                  {STATUS_STEPS.map((s, i) => {
                    const done = i <= currentStep;
                    const icons: any = {
                      pending: Clock, confirmed: CheckCircle, processing: Package, shipped: Truck, delivered: CheckCircle,
                    };
                    const Icon = icons[s];
                    return (
                      <div key={s} className="flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${done ? 'bg-maroon-800 border-maroon-800 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                          <Icon size={16} />
                        </div>
                        <span className={`text-xs font-medium capitalize hidden sm:block ${done ? 'text-maroon-800' : 'text-gray-400'}`}>{s}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {order.tracking_number && (
                <div className="mt-5 pt-4 border-t border-orange-100">
                  <p className="text-sm text-gray-600">Tracking Number: <span className="font-mono font-bold text-maroon-800">{order.tracking_number}</span></p>
                </div>
              )}
            </div>
          )}

          {isCancelled && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-4">
              <XCircle size={32} className="text-red-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-red-800">Order Cancelled</p>
                <p className="text-sm text-red-600 mt-0.5">This order has been cancelled. Any payment will be refunded within 5–7 business days.</p>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="card p-6">
            <h3 className="font-bold text-maroon-900 mb-4">Ordered Items</h3>
            <div className="space-y-4">
              {(order.items_snapshot as any[]).map((item, i) => (
                <div key={i} className="flex items-center gap-4 pb-4 border-b border-orange-50 last:border-0 last:pb-0">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center text-2xl flex-shrink-0">
                    {item.category === 'Lehenga' ? '👗' : item.category === 'Chudithar' ? '👘' : '👚'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Qty: {item.quantity}
                      {item.size ? ` · Size: ${item.size}` : ''}
                      {item.color ? ` · Colour: ${item.color}` : ''}
                    </p>
                    <p className="text-xs text-gray-500">₹{item.price.toLocaleString()} each</p>
                  </div>
                  <p className="font-bold text-maroon-900 flex-shrink-0">₹{item.subtotal.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Price summary */}
          <div className="card p-5">
            <h3 className="font-bold text-maroon-900 mb-4">Price Breakdown</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Shipping</span>
                <span className={order.shipping_fee === 0 ? 'text-green-600' : ''}>
                  {order.shipping_fee === 0 ? 'FREE' : `₹${order.shipping_fee}`}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-orange-100 pt-2.5 flex justify-between font-bold text-base">
                <span>Total Paid</span>
                <span className="text-maroon-900">₹{order.total.toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-orange-50">
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <CreditCard size={12} />
                Payment: <b className="capitalize">{order.payment_method.toUpperCase()}</b>
                <span className={`ml-1 font-medium ${order.payment_status === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                  ({order.payment_status === 'paid' ? 'Paid' : 'Pending'})
                </span>
              </p>
            </div>
          </div>

          {/* Delivery address */}
          <div className="card p-5">
            <h3 className="font-bold text-maroon-900 mb-3 flex items-center gap-2">
              <MapPin size={16} /> Delivery Address
            </h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p className="font-semibold">{addr.full_name}</p>
              <p>{addr.address_line1}</p>
              {addr.address_line2 && <p>{addr.address_line2}</p>}
              <p>{addr.city}, {addr.state} — {addr.pincode}</p>
              <p className="text-gray-500">📞 {addr.phone}</p>
            </div>
          </div>

          <Link href="/products" className="btn-secondary w-full flex items-center justify-center gap-2 py-3">
            Continue Shopping
          </Link>
        </div>
      </div>
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
