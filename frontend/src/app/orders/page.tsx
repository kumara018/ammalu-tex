'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, ChevronRight, Clock, CheckCircle, Truck, XCircle, AlertCircle, RefreshCw, RotateCcw } from 'lucide-react';
import { ordersAPI, returnsAPI } from '@/lib/api';
import { Order, ReturnRequest } from '@/types';
import { useAuth } from '@/context/AuthContext';

// Mirrors orders/[id]/page.tsx's RETURN_STATUS_LABEL — kept in sync so a
// return/exchange reads the same everywhere a customer sees it. No "Return:"/
// "Exchange:" prefix baked in here — the card adds that itself, since which
// word applies depends on request_type.
/**
 * ELEVEN LABELS, FOUR COLOURS.
 *
 * This map used to spend EIGHT hues on these eleven states — yellow, blue,
 * green, red, purple, cyan, indigo, amber. Eight hues is not a legend anybody
 * learns, and the label sitting inside the chip already names the state
 * exactly. So the colour stopped trying to identify WHICH state and now says
 * only what a customer actually needs at a glance:
 *
 *   positive  it went well          approved, refunded, completed
 *   critical  it did not            rejected
 *   caution   waiting on somebody   pending, refund_initiated
 *   neutral   in flight, no action  under_review, pickup_scheduled,
 *                                   picked_up, processing, replacement_shipped
 *
 * "In flight" is deliberately the neutral rather than a fifth hue: those five
 * states need no decision from the customer, and colouring them competes with
 * the two that do.
 */
const RETURN_STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending:             { label: 'Pending Review',       color: 'bg-caution-soft text-caution border-caution' },
  under_review:        { label: 'Under Review',         color: 'bg-paper-shade text-graphite border-paper-edge'       },
  approved:            { label: 'Approved',             color: 'bg-positive-soft text-positive border-positive'    },
  rejected:            { label: 'Rejected',             color: 'bg-critical-soft text-critical border-critical'          },
  pickup_scheduled:    { label: 'Pickup Scheduled',     color: 'bg-paper-shade text-graphite border-paper-edge' },
  picked_up:           { label: 'Picked Up',            color: 'bg-paper-shade text-graphite border-paper-edge'       },
  processing:          { label: 'Processing',           color: 'bg-paper-shade text-graphite border-paper-edge' },
  replacement_shipped: { label: 'Replacement Shipped',  color: 'bg-paper-shade text-graphite border-paper-edge' },
  refund_initiated:    { label: 'Refund Initiated',     color: 'bg-caution-soft text-caution border-caution'    },
  refunded:            { label: 'Refund Credited',      color: 'bg-positive-soft text-positive border-positive'    },
  completed:           { label: 'Completed',            color: 'bg-positive-soft text-positive border-positive'    },
};

// Same colour families as RETURN_STATUS_LABEL above, in the banner's -50/
// -200/-800 shade pattern instead of the pill's -100/-300/-700, so the top
// banner can switch to the return's own colour once one is active.
const RETURN_BANNER_COLOR: Record<string, string> = {
  pending:             'border-l-2 border-caution/50 text-caution-deep',
  under_review:        'border-l-2 border-paper-edge/50 text-graphite',
  approved:            'border-l-2 border-positive/50 bg-transparent text-positive-deep',
  rejected:            'border-l-2 border-critical/50 bg-transparent text-critical-deep',
  pickup_scheduled:    'border-l-2 border-paper-edge/50 text-graphite',
  picked_up:           'bg-paper-shade border-paper-edge text-graphite',
  processing:          'border-l-2 border-paper-edge/50 text-graphite',
  replacement_shipped: 'border-l-2 border-paper-edge/50 text-graphite',
  refund_initiated:    'border-l-2 border-caution/50 bg-transparent text-caution-deep',
  refunded:            'border-l-2 border-positive/50 bg-transparent text-positive-deep',
  completed:           'border-l-2 border-positive/50 bg-transparent text-positive-deep',
};

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; badge: string; banner: string }> = {
  pending:          { label: 'Pending',          icon: Clock,        color: 'text-caution', badge: 'badge-warning', banner: 'border-l-2 border-caution/50 text-caution-deep' },
  confirmed:        { label: 'Confirmed',         icon: CheckCircle,  color: 'text-graphite',   badge: 'badge-info',    banner: 'border-l-2 border-paper-edge/50 text-graphite' },
  processing:       { label: 'Processing',        icon: Package,      color: 'text-graphite', badge: 'badge-default', banner: 'border-l-2 border-paper-edge/50 text-graphite' },
  shipped:          { label: 'Shipped',           icon: Truck,        color: 'text-graphite',   badge: 'badge-info',    banner: 'border-l-2 border-paper-edge/50 text-graphite' },
  out_for_delivery: { label: 'Out for Delivery',  icon: Truck,        color: 'text-caution', badge: 'badge-warning', banner: 'bg-maroon-50 border-caution text-caution-deep' },
  delivered:        { label: 'Delivered',         icon: CheckCircle,  color: 'text-positive',  badge: 'badge-success', banner: 'border-l-2 border-positive/50 bg-transparent text-positive-deep' },
  cancelled:        { label: 'Cancelled',         icon: XCircle,      color: 'text-critical',    badge: 'badge-danger',  banner: 'border-l-2 border-critical/50 bg-transparent text-critical-deep' },
};

function getDeliveryLine(status: string): string {
  if (status === 'delivered') return 'Delivered';
  if (status === 'cancelled') return 'Cancelled';
  return 'Expected: 3–7 business days';
}

function getCategoryEmoji(category?: string): string {
  if (!category) return '👚';
  if (category === 'Lehenga') return '👗';
  if (category === 'Chudithar') return '👘';
  if (category === 'Half Saree') return '🥻';
  if (category === 'Crop Tops') return '🎽';
  if (category === 'Party Wears') return '✨';
  return '👚';
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [returnsByOrder, setReturnsByOrder] = useState<Record<number, ReturnRequest>>({});
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const [ordersRes, returnsRes] = await Promise.all([
        ordersAPI.getAll(),
        returnsAPI.getAll().catch(() => ({ data: [] as ReturnRequest[] })), // never block the order list on this
      ]);
      setOrders(ordersRes.data);
      // Newest-first from the API — first occurrence per order_id is the
      // most recent return/exchange request for that order.
      const map: Record<number, ReturnRequest> = {};
      for (const rr of returnsRes.data as ReturnRequest[]) {
        if (!(rr.order_id in map)) map[rr.order_id] = rr;
      }
      setReturnsByOrder(map);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  if (authLoading || !user) return null;

  if (loading) return (
    <div className="mx-auto w-full max-w-[84rem] px-6 py-[clamp(3rem,9vh,6rem)] space-y-4 sm:px-10">
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className="card overflow-hidden animate-pulse">
          <div className="h-10 bg-paper-shade" />
          <div className="p-5 space-y-3">
            <div className="flex justify-between">
              <div className="h-5 bg-paper-shade rounded w-40" />
              <div className="h-5 bg-paper-shade rounded w-20" />
            </div>
            <div className="h-4 bg-paper-shade rounded w-1/2" />
            <div className="h-4 bg-paper-shade rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );

  if (error) return (
    <div className="mx-auto w-full max-w-[104rem] px-6 py-[clamp(5rem,16vh,10rem)] sm:px-10">
      <h2 className="font-display text-band font-normal text-graphite mb-3">Couldn&apos;t load your orders</h2>
      <p className="text-graphite-faint mb-8">Something went wrong on our end. Please try again.</p>
      <button onClick={load} className="btn-primary inline-flex items-center gap-2">
        <RefreshCw size={16} /> Try Again
      </button>
    </div>
  );

  if (orders.length === 0) return (
    <div className="mx-auto w-full max-w-[104rem] px-6 py-[clamp(5rem,16vh,10rem)] sm:px-10">
      <h2 className="font-display text-band font-normal text-graphite mb-3">No orders yet</h2>
      <p className="text-graphite-faint mb-8">You haven&apos;t placed any orders yet. Start shopping!</p>
      <Link href="/products" className="btn-primary inline-flex items-center gap-2">
        Start Shopping
      </Link>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-[84rem] px-6 py-[clamp(2.5rem,7vh,4.5rem)] sm:px-10">
      <h1 className="font-display text-chapter font-normal text-graphite mb-8">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => {
          const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
          const Icon = cfg.icon;
          const items = order.items_snapshot as any[];
          const deliveryLine = getDeliveryLine(order.status);
          const activeReturn = returnsByOrder[order.id];

          return (
            <Link key={order.id} href={`/orders/${order.id}`} className="block group">
              <div className="card overflow-hidden transition-all">

                {/* Colored status banner — once a return/exchange is active, this
                    shows the compound status ("Delivered → Pickup Scheduled")
                    and switches to the return's own colour, so the banner never
                    looks like a plain closed order while something is actually
                    in progress. */}
                <div className={`border-b px-5 py-2.5 flex items-center justify-between ${activeReturn ? (RETURN_BANNER_COLOR[activeReturn.status] || cfg.banner) : cfg.banner}`}>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {activeReturn ? <RotateCcw size={14} /> : <Icon size={14} />}
                    <span>
                      {activeReturn
                        ? `${cfg.label} → ${activeReturn.request_type === 'exchange' ? 'Exchange' : 'Return'}: ${RETURN_STATUS_LABEL[activeReturn.status]?.label || activeReturn.status}`
                        : cfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium opacity-80">
                    <span>{deliveryLine}</span>
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                <div className="p-5">
                  {/* Order number + date */}
                  <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                    <div>
                      <p className="font-normal text-maroon-900 text-sm">{order.order_number}</p>
                      <p className="text-xs text-graphite-faint mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-graphite-faint">Total</p>
                      <p className="font-normal text-maroon-900 text-base">₹{order.total.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Product emoji row */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex -space-x-1">
                      {items.slice(0, 4).map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex h-9 w-9 items-center justify-center overflow-hidden border border-paper-edge bg-paper-shade"
                          title={item.name}
                        >
                          {getCategoryEmoji(item.category)}
                        </div>
                      ))}
                      {items.length > 4 && (
                        <div className="flex h-9 w-9 items-center justify-center border border-paper-edge bg-paper-shade text-caption text-graphite-faint">
                          +{items.length - 4}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-graphite-muted font-medium line-clamp-1">
                        {items.map((i: any) => i.name).join(', ')}
                      </p>
                      <p className="text-xs text-graphite-faint mt-0.5">
                        {items.length} {items.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </div>

                  {/* Tracking + payment */}
                  <div className="flex items-center gap-3 text-xs text-graphite-faint flex-wrap">
                    <span className="capitalize">Payment: {order.payment_method.toUpperCase()}</span>
                    <span>·</span>
                    <span className={order.payment_status === 'paid' ? 'text-positive font-medium' : 'text-caution font-medium'}>
                      {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                    {order.tracking_number && (
                      <>
                        <span>·</span>
                        <span>
                          Tracking: <span className="font-mono font-medium text-maroon-700">{order.tracking_number}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
