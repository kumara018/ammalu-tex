'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, ChevronRight, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { ordersAPI } from '@/lib/api';
import { Order } from '@/types';
import { useAuth } from '@/context/AuthContext';

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; badge: string }> = {
  pending:    { label: 'Pending',    icon: Clock,         color: 'text-yellow-600', badge: 'badge-warning' },
  confirmed:  { label: 'Confirmed',  icon: CheckCircle,   color: 'text-blue-600',   badge: 'badge-info' },
  processing: { label: 'Processing', icon: Package,       color: 'text-purple-600', badge: 'badge-default' },
  shipped:    { label: 'Shipped',    icon: Truck,         color: 'text-blue-700',   badge: 'badge-info' },
  delivered:  { label: 'Delivered',  icon: CheckCircle,   color: 'text-green-600',  badge: 'badge-success' },
  cancelled:  { label: 'Cancelled',  icon: XCircle,       color: 'text-red-600',    badge: 'badge-danger' },
};

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    const load = async () => {
      try {
        const res = await ordersAPI.getAll();
        setOrders(res.data);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, [user]);

  if (!user) return null;

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className="card p-5 animate-pulse">
          <div className="flex justify-between mb-4">
            <div className="h-5 bg-gray-200 rounded w-40" />
            <div className="h-5 bg-gray-200 rounded w-20" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );

  if (orders.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <Package size={80} className="mx-auto text-maroon-200 mb-6" />
      <h2 className="text-2xl font-bold text-gray-800 mb-3">No orders yet</h2>
      <p className="text-gray-500 mb-8">You haven&apos;t placed any orders yet. Start shopping!</p>
      <Link href="/products" className="btn-primary inline-flex items-center gap-2">
        Start Shopping
      </Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="section-title mb-6">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => {
          const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
          const Icon = cfg.icon;
          return (
            <Link key={order.id} href={`/orders/${order.id}`} className="block group">
              <div className="card p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <p className="font-bold text-maroon-900 text-sm">{order.order_number}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`${cfg.badge} flex items-center gap-1`}>
                      <Icon size={12} /> {cfg.label}
                    </span>
                    <ChevronRight size={16} className="text-gray-400 group-hover:text-maroon-800 transition-colors" />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex-1">
                    <p className="text-gray-600 text-xs mb-1">Items ordered</p>
                    <p className="font-medium text-gray-800 line-clamp-1">
                      {(order.items_snapshot as any[]).map((i: any) => i.name).join(', ')}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="font-bold text-maroon-900 text-base">₹{order.total.toLocaleString()}</p>
                  </div>
                </div>

                {order.tracking_number && (
                  <div className="mt-3 pt-3 border-t border-orange-50">
                    <p className="text-xs text-gray-500">
                      Tracking: <span className="font-mono font-medium text-maroon-700">{order.tracking_number}</span>
                    </p>
                  </div>
                )}

                <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                  <span className="capitalize">Payment: {order.payment_method.toUpperCase()}</span>
                  <span>·</span>
                  <span className={order.payment_status === 'paid' ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}>
                    {order.payment_status === 'paid' ? '✓ Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
