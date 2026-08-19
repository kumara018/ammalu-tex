'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { wishlistAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { mediaUrl } from '@/lib/media';

export default function WishlistPage() {
  const { user } = useAuth();
  const { toggle, refresh } = useWishlist();
  const { addItem } = useCart();
  const router = useRouter();

  const [items, setItems]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await wishlistAPI.getAll();
      setItems(res.data || []);
    } catch {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: number) => {
    await toggle(productId);
    setItems(prev => prev.filter(i => i.product_id !== productId));
  };

  const handleAddToCart = async (item: any) => {
    setAddingId(item.product_id);
    try {
      await addItem(item.product_id, 1);
      toast.success(`${item.product.name} added to cart!`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to add to cart');
    } finally {
      setAddingId(null);
    }
  };

  const handleMoveToCart = async (item: any) => {
    setAddingId(item.product_id);
    try {
      await addItem(item.product_id, 1);
      await toggle(item.product_id);
      setItems(prev => prev.filter(i => i.product_id !== item.product_id));
      toast.success('Moved to cart!');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to move to cart');
    } finally {
      setAddingId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[84rem] px-6 py-[clamp(3rem,9vh,6rem)] sm:px-10">
        <div className="flex justify-center items-center gap-3 text-maroon-700">
          <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-maroon-700" />
          Loading your wishlist...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[84rem] px-6 py-[clamp(2.5rem,7vh,4.5rem)] sm:px-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div>
          <p className="mb-4 text-rule uppercase text-thread">
            {items.length} piece{items.length !== 1 ? 's' : ''} put by
          </p>
          <h1 className="font-display text-chapter font-normal text-graphite">Put by</h1>
        </div>
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="border-t border-paper-edge py-[5vh]">
          <p className="mb-6 text-rule uppercase text-graphite-faint">Nothing put by</p>
          <h2 className="max-w-[20ch] font-display text-band font-normal text-graphite">
            You have not put anything aside yet
          </h2>
          <p className="mt-6 max-w-[46ch] text-lede text-graphite-muted">
            The heart on any piece keeps it here while you think about it. Nothing is
            reserved — putting a piece by does not hold the stock.
          </p>
          <Link
            href="/products"
            className="group mt-9 inline-flex items-baseline gap-3 border-b border-thread/60 pb-2 text-caption uppercase text-graphite transition-colors duration-500 hover:border-thread focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-thread"
          >
            See the whole shelf
            <span aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1.5">→</span>
          </Link>
        </div>
      )}

      {/* Wishlist grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map(item => {
            const p = item.product;
            const discount = p.compare_price
              ? Math.round(((p.compare_price - p.price) / p.compare_price) * 100)
              : null;

            return (
              <div key={item.id} className="card p-4 flex gap-4">
                {/* Image */}
                <Link href={`/products/${p.id}`} className="flex-shrink-0">
                  <div className="h-28 w-24 overflow-hidden border border-paper-edge bg-paper-shade">
                    {p.images?.[0] && !p.images[0].includes('placeholder') ? (
                      <img
                        src={mediaUrl(p.images[0])}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center px-1 text-center text-rule uppercase text-graphite-faint">
                        {p.category}
                      </div>
                    )}
                  </div>
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <p className="text-rule uppercase text-graphite-faint">{p.category}</p>
                  <Link href={`/products/${p.id}`}>
                    <h3 className="mt-1.5 line-clamp-2 font-display text-[1.05rem] leading-snug text-graphite transition-colors duration-500 hover:text-thread">
                      {p.name}
                    </h3>
                  </Link>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="font-display text-[1.2rem] tabular-nums text-graphite">₹{p.price.toLocaleString('en-IN')}</span>
                    {p.compare_price && (
                      <span className="text-xs text-graphite-faint line-through">₹{p.compare_price.toLocaleString()}</span>
                    )}
                    {discount && (
                      <span className="text-caption uppercase tabular-nums text-thread">−{discount}%</span>
                    )}
                  </div>

                  {/* Stock */}
                  {p.stock === 0 && (
                    <span className="mt-1.5 text-rule uppercase text-graphite-faint">Sold out</span>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto pt-3">
                    <button
                      onClick={() => handleMoveToCart(item)}
                      disabled={p.stock === 0 || addingId === p.id}
                      className="flex flex-1 items-center justify-center gap-2 border border-paper-edge py-2.5 text-caption uppercase text-graphite-muted transition-colors duration-500 hover:border-graphite hover:bg-graphite hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread disabled:cursor-not-allowed disabled:border-paper-edge disabled:bg-transparent disabled:text-graphite-faint"
                    >
                      {addingId === p.id
                        ? <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                        : <ShoppingCart size={14} />}
                      {p.stock === 0 ? 'Sold out' : 'Into the bag'}
                    </button>
                    <button
                      onClick={() => handleRemove(p.id)}
                      className="border border-paper-edge p-2.5 text-graphite-faint transition-colors duration-500 hover:border-thread-deep hover:text-thread-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-thread"
                      title="Remove from wishlist"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Continue shopping */}
      {items.length > 0 && (
        <div className="mt-8 text-center">
          <Link href="/products" className="text-caption uppercase text-graphite-faint transition-colors duration-500 hover:text-thread">
            Keep looking
          </Link>
        </div>
      )}
    </div>
  );
}
