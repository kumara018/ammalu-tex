'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import MeasureRule from '@/components/home/MeasureRule';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { mediaUrl } from '@/lib/media';

export default function CartPage() {
  const { items, count, total, loading, fetchCart, updateItem, removeItem, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading || !user) return;
    fetchCart();
  }, [user, authLoading]);

  if (authLoading || !user) return null;

  const shipping = 49;
  const grandTotal = total + shipping;

  const handleUpdate = async (itemId: number, qty: number) => {
    try {
      await updateItem(itemId, qty);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to update quantity');
    }
  };

  const handleRemove = async (itemId: number, name: string) => {
    try {
      await removeItem(itemId);
      toast.success(`${name} removed from cart`);
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const handleClear = async () => {
    if (!confirm('Remove all items from cart?')) return;
    try {
      await clearCart();
      toast.success('Cart cleared');
    } catch {
      toast.error('Failed to clear cart');
    }
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="animate-pulse space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="card p-4 flex gap-4">
            <div className="w-24 h-24 bg-paper-shade rounded-sm" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-paper-shade rounded w-1/2" />
              <div className="h-4 bg-paper-shade rounded w-1/3" />
              <div className="h-6 bg-paper-shade rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (items.length === 0) return (
    // An empty bag is not an error and does not need an 80px icon apologising
    // for it. It needs the one sentence that moves the customer on.
    <div className="mx-auto w-full max-w-[104rem] px-6 py-[clamp(5rem,16vh,10rem)] sm:px-10">
      <p className="mb-4 text-rule uppercase text-thread">Nothing in the bag</p>
      <h1 className="max-w-[18ch] font-display text-chapter font-normal text-graphite">
        Your bag is empty
      </h1>
      <p className="mt-6 max-w-[46ch] text-lede text-graphite-muted">
        Six bolts on the shelf, all of them cut and finished here. Start wherever
        the next occasion is.
      </p>
      <Link
        href="/products"
        className="group mt-9 inline-flex items-baseline gap-3 border-b border-thread/60 pb-2 text-caption uppercase text-graphite transition-colors duration-500 hover:border-thread focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-thread"
      >
        See the whole shelf
        <span aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1.5">→</span>
      </Link>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-[104rem] px-6 py-[clamp(2.5rem,7vh,4.5rem)] sm:px-10">
      {/* The docket. The count is a measurement, set in the same register as
          the sizes and the shelf — not a parenthetical in gold. */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="mb-4 text-rule uppercase text-thread">
            {count} piece{count !== 1 ? 's' : ''}
          </p>
          <h1 className="font-display text-chapter font-normal text-graphite">Your bag</h1>
        </div>
        <button
          onClick={handleClear}
          className="flex items-center gap-2 text-caption uppercase text-graphite-faint transition-colors duration-500 hover:text-critical-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-thread"
        >
          <Trash2 size={14} /> Empty the bag
        </button>
      </div>

      <MeasureRule className="mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="card p-4">
              <div className="flex gap-4">
                {/* Image */}
                <div className="w-24 h-24 rounded-sm bg-paper-shade flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.product.images?.[0] && !item.product.images[0].includes('placeholder') ? (
                    <img
                      src={mediaUrl(item.product.images[0])}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-rule uppercase text-graphite-faint">
                      {item.product.category}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product_id}`} className="line-clamp-2 font-display text-[1.05rem] leading-snug text-graphite transition-colors duration-500 hover:text-thread">
                    {item.product.name}
                  </Link>
                  <p className="mt-1.5 text-rule uppercase text-graphite-faint">{item.product.category}</p>
                  <div className="mt-2 flex flex-wrap gap-x-5 text-caption uppercase text-graphite-faint">
                    {item.size  && <span>Size: <b className="text-graphite-muted">{item.size}</b></span>}
                    {item.color && <span>Colour: <b className="text-graphite-muted">{item.color}</b></span>}
                  </div>

                  <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                    {/* Price */}
                    <div>
                      <span className="font-display text-[1.25rem] tabular-nums text-graphite">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                      {item.quantity > 1 && (
                        <span className="ml-2 text-caption uppercase tabular-nums text-graphite-faint">₹{item.product.price.toLocaleString('en-IN')} each</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Qty control */}
                      <div className="inline-flex items-stretch border border-paper-edge">
                        <button
                          onClick={() => handleUpdate(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="px-3 py-2 text-graphite-muted transition-colors duration-500 hover:text-thread disabled:opacity-40"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="flex min-w-[2.75rem] items-center justify-center border-x border-paper-edge font-display text-[1.05rem] tabular-nums text-graphite">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdate(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock || item.quantity >= 10}
                          className="px-3 py-2 text-graphite-muted transition-colors duration-500 hover:text-thread disabled:opacity-40"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => handleRemove(item.id, item.product.name)}
                        className="p-1.5 text-graphite-faint transition-colors duration-500 hover:text-thread-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          {/* bg-paper, not bg-paper-bright: `.card` carries no fill any more,
              and a sticky block with no fill lets the bag lines scroll through
              the totals. This is the page's own ground, so it stays one
              surface — it is opaque, not lighter. */}
          <div className="card bg-paper p-6 sticky top-28">
            <h2 className="mb-6 text-rule uppercase text-thread">What you owe</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-graphite-muted">
                <span>Subtotal ({count} item{count !== 1 ? 's' : ''})</span>
                <span className="font-medium">₹{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-graphite-muted">
                <span>Shipping</span>
                <span className="font-medium">₹{shipping}</span>
              </div>
              <div className="flex items-baseline justify-between border-t border-paper-edge pt-4">
                <span className="text-rule uppercase text-graphite-faint">Total</span>
                <span className="font-display text-band leading-none tabular-nums text-graphite">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="mt-8 flex w-full items-center justify-center gap-3 border border-graphite bg-graphite py-3.5 text-caption uppercase text-paper transition-colors duration-500 hover:bg-thread-deep hover:border-thread-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-thread"
            >
              Go to checkout <ArrowRight size={16} />
            </Link>

            <Link
              href="/products"
              className="mt-5 block text-center text-caption uppercase text-graphite-faint transition-colors duration-500 hover:text-thread"
            >
              Keep looking
            </Link>

            <p className="mt-6 border-t border-paper-edge pt-4 text-center text-rule uppercase text-graphite-faint">
              Payment handled by Razorpay
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
