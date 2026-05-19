'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingCart, Star, Truck, RotateCcw, Shield,
  ArrowLeft, AlertCircle, CheckCircle, ChevronRight,
} from 'lucide-react';
import { productsAPI } from '@/lib/api';
import { Product, Review } from '@/types';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLoginPrompt } from '@/context/LoginPromptContext';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { promptLogin } = useLoginPrompt();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [sizeErr, setSizeErr] = useState(false);
  const [colorErr, setColorErr] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [tab, setTab] = useState<'desc' | 'reviews'>('desc');

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, rRes] = await Promise.all([
          productsAPI.getOne(Number(id)),
          productsAPI.getReviews(Number(id)),
        ]);
        setProduct(pRes.data);
        setReviews(rRes.data);
        if (pRes.data.size_options?.length) setSelectedSize(pRes.data.size_options[0]);
        if (pRes.data.colors?.length) setSelectedColor(pRes.data.colors[0]);
      } catch { router.push('/products'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      promptLogin('Sign in to add this item to your cart and place an order.');
      return;
    }
    let hasErr = false;
    if (product!.size_options?.length > 0 && !selectedSize) { setSizeErr(true); hasErr = true; }
    if (product!.colors?.length > 0 && !selectedColor) { setColorErr(true); hasErr = true; }
    if (hasErr) { toast.error('Please select size and colour before adding to cart'); return; }

    setAdding(true);
    try {
      await addItem(product!.id, quantity, selectedSize, selectedColor);
      toast.success('Added to cart!');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to add to cart');
    } finally { setAdding(false); }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push('/cart');
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-pulse">
        <div className="bg-gray-200 aspect-square rounded-2xl" />
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-8 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded w-1/3" />
          <div className="h-24 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );

  if (!product) return null;

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-maroon-800">Home</Link>
        <ChevronRight size={14} />
        <Link href="/products" className="hover:text-maroon-800">Products</Link>
        <ChevronRight size={14} />
        <Link href={`/products?category=${product.category}`} className="hover:text-maroon-800">{product.category}</Link>
        <ChevronRight size={14} />
        <span className="text-maroon-800 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="relative bg-gradient-to-br from-orange-50 to-pink-50 aspect-square rounded-2xl overflow-hidden mb-3">
            {product.images && product.images[activeImg] && !product.images[activeImg].includes('placeholder') ? (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}${product.images[activeImg]}`}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-8xl">
                {product.category === 'Lehenga' ? '👗' : product.category === 'Chudithar' ? '👘' : product.category === 'Party Wears' ? '✨' : product.category === 'Crop Tops' ? '👚' : '👕'}
              </div>
            )}
            {discount && (
              <div className="absolute top-4 left-4 bg-maroon-800 text-white text-sm font-bold px-3 py-1.5 rounded-full">
                {discount}% OFF
              </div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-lg border-2 overflow-hidden transition-colors ${i === activeImg ? 'border-maroon-800' : 'border-gray-200'}`}>
                  <img src={`${process.env.NEXT_PUBLIC_API_URL}${img}`} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-maroon-600 font-medium text-sm mb-1">{product.category}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

          {/* Rating */}
          {product.rating_count > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1 bg-green-600 text-white text-sm px-2.5 py-0.5 rounded-full font-semibold">
                <Star size={13} fill="white" /> {product.rating_avg.toFixed(1)}
              </div>
              <span className="text-gray-500 text-sm">{product.rating_count} rating{product.rating_count !== 1 ? 's' : ''}</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-3xl font-bold text-maroon-900">₹{product.price.toLocaleString()}</span>
            {product.compare_price && (
              <span className="text-lg text-gray-400 line-through">₹{product.compare_price.toLocaleString()}</span>
            )}
            {discount && <span className="text-green-600 font-semibold text-sm">{discount}% off</span>}
          </div>
          <p className="text-xs text-gray-500 mb-5">Inclusive of all taxes. {product.price >= 999 ? '✓ Free shipping' : `Add ₹${(999 - product.price).toFixed(0)} more for free shipping`}</p>

          <hr className="border-orange-100 mb-5" />

          {/* Fabric */}
          {product.fabric && (
            <div className="flex gap-3 mb-4 text-sm">
              <span className="text-gray-500 w-20 flex-shrink-0">Fabric:</span>
              <span className="font-medium text-gray-800">{product.fabric}</span>
            </div>
          )}

          {/* Size */}
          {product.size_options && product.size_options.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Select Size *</label>
                {sizeErr && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />Required</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.size_options.map((size) => (
                  <button key={size} onClick={() => { setSelectedSize(size); setSizeErr(false); }}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${selectedSize === size ? 'border-maroon-800 bg-maroon-800 text-white' : 'border-gray-200 text-gray-700 hover:border-maroon-400'}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Select Colour *</label>
                {colorErr && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />Required</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button key={color} onClick={() => { setSelectedColor(color); setColorErr(false); }}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${selectedColor === color ? 'border-maroon-800 bg-maroon-50 text-maroon-800' : 'border-gray-200 text-gray-700 hover:border-maroon-400'}`}>
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <label className="label">Quantity</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-maroon-400 font-bold text-lg flex items-center justify-center">-</button>
              <span className="text-lg font-bold w-8 text-center">{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-maroon-400 font-bold text-lg flex items-center justify-center">+</button>
              <span className="text-sm text-gray-500 ml-1">{product.stock} available</span>
            </div>
          </div>

          {/* Stock */}
          {product.stock === 0 ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-red-700 text-sm font-medium">
              ❌ This product is currently out of stock. Check back later.
            </div>
          ) : product.stock <= 5 ? (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4 text-orange-700 text-sm">
              ⚠️ Only {product.stock} left in stock — order soon!
            </div>
          ) : null}

          {/* Buttons */}
          <div className="flex gap-3 mb-6">
            <button onClick={handleAddToCart} disabled={adding || product.stock === 0}
              className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3">
              <ShoppingCart size={18} />
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
            <button onClick={handleBuyNow} disabled={adding || product.stock === 0}
              className="flex-1 btn-primary flex items-center justify-center gap-2 py-3">
              Buy Now
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: Truck, text: 'Free Shipping above ₹999' },
              { icon: RotateCcw, text: '7-day Easy Returns' },
              { icon: Shield, text: '100% Authentic' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-1.5 p-3 bg-orange-50 rounded-xl text-center">
                <Icon size={18} className="text-maroon-700" />
                <span className="text-xs text-gray-600 leading-tight">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12 card overflow-hidden">
        <div className="flex border-b border-orange-100">
          {(['desc', 'reviews'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${tab === t ? 'text-maroon-800 border-b-2 border-maroon-800 bg-maroon-50' : 'text-gray-500 hover:text-maroon-700'}`}>
              {t === 'desc' ? 'Description & Details' : `Reviews (${product.rating_count})`}
            </button>
          ))}
        </div>
        <div className="p-6">
          {tab === 'desc' ? (
            <div className="prose prose-sm max-w-none text-gray-700">
              <p className="leading-relaxed">{product.description}</p>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {product.fabric && (
                  <div className="bg-orange-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Fabric</p>
                    <p className="font-semibold text-maroon-900 mt-1">{product.fabric}</p>
                  </div>
                )}
                {product.size_options?.length > 0 && (
                  <div className="bg-orange-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Sizes</p>
                    <p className="font-semibold text-maroon-900 mt-1">{product.size_options.join(', ')}</p>
                  </div>
                )}
                {product.colors?.length > 0 && (
                  <div className="bg-orange-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Colours</p>
                    <p className="font-semibold text-maroon-900 mt-1">{product.colors.join(', ')}</p>
                  </div>
                )}
                <div className="bg-orange-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Category</p>
                  <p className="font-semibold text-maroon-900 mt-1">{product.category}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Stock</p>
                  <p className="font-semibold text-maroon-900 mt-1">{product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="border-b border-orange-50 pb-4 last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-maroon-100 flex items-center justify-center text-maroon-800 font-bold text-sm">
                          {r.user.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{r.user.full_name}</p>
                          <div className="flex">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star key={i} size={12} fill={i < r.rating ? '#facc15' : 'none'} className={i < r.rating ? 'text-yellow-400' : 'text-gray-300'} />
                            ))}
                          </div>
                        </div>
                        <span className="ml-auto text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('en-IN')}</span>
                      </div>
                      {r.title && <p className="font-medium text-sm text-gray-800 mb-1">{r.title}</p>}
                      {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <Star size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No reviews yet</p>
                  <p className="text-sm mt-1">Be the first to review this product</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
