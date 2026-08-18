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
          className="flex items-center gap-2 text-caption uppercase text-graphite-faint transition-colors duration-500 hover:text-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-thread"
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
                    <span className="text-3xl">
                      {item.product.category === 'Lehenga' ? '👗' : item.product.category === 'Chudithar' ? '👘' : '👚'}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product_id}`} className="font-semibold text-graphite hover:text-maroon-800 line-clamp-2 text-sm leading-snug">
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-graphite-faint mt-1">{item.product.category}</p>
                  <div className="flex gap-3 mt-1 text-xs text-graphite-faint">
                    {item.size  && <span>Size: <b className="text-graphite-muted">{item.size}</b></span>}
                    {item.color && <span>Colour: <b className="text-graphite-muted">{item.color}</b></span>}
                  </div>

                  <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                    {/* Price */}
                    <div>
                      <span className="font-normal text-maroon-900">₹{(item.product.price * item.quantity).toLocaleString()}</span>
                      {item.quantity > 1 && (
                        <span className="text-xs text-graphite-faint ml-1">₹{item.product.price.toLocaleString()} each</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Qty control */}
                      <div className="flex items-center border border-paper-edge rounded-sm overflow-hidden">
                        <button
                          onClick={() => handleUpdate(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="px-2.5 py-1.5 hover:bg-paper-shade disabled:opacity-40 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 py-1.5 font-semibold text-sm min-w-[32px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdate(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock || item.quantity >= 10}
                          className="px-2.5 py-1.5 hover:bg-paper-shade disabled:opacity-40 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => handleRemove(item.id, item.product.name)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-transparent rounded-sm transition-colors"
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
          <div className="card p-6 sticky top-28">
            <h2 className="font-normal text-lg text-maroon-900 mb-5">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-graphite-muted">
                <span>Subtotal ({count} item{count !== 1 ? 's' : ''})</span>
                <span className="font-medium">₹{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-graphite-muted">
                <span>Shipping</span>
                <span className="font-medium">₹{shipping}</span>
              </div>
              <div className="border-t border-maroon-200 pt-3 flex justify-between font-normal text-lg">
                <span className="text-maroon-900">Total</span>
                <span className="text-maroon-900">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <Link href="/checkout" className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 mt-6 text-base">
              Proceed to Checkout <ArrowRight size={18} />
            </Link>

            <Link href="/products" className="block text-center text-sm text-maroon-700 hover:underline mt-4">
              ← Continue Shopping
            </Link>

            <div className="mt-5 pt-4 border-t border-maroon-200">
              <p className="text-xs text-graphite-faint text-center">Secure checkout with SSL encryption</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
