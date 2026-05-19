'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, Truck, Shield, RotateCcw, Headphones, Sparkles } from 'lucide-react';
import { productsAPI } from '@/lib/api';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';

const CATEGORIES = [
  { name: 'Chudithar',   emoji: '👘', desc: 'Traditional & Casual',   gradient: 'from-rose-100 to-pink-200',    border: 'border-rose-300'   },
  { name: 'Tops',        emoji: '👕', desc: 'Trendy & Stylish',        gradient: 'from-orange-100 to-amber-200', border: 'border-orange-300' },
  { name: 'Lehenga',     emoji: '👗', desc: 'Bridal & Festive',        gradient: 'from-purple-100 to-pink-200',  border: 'border-purple-300' },
  { name: 'Half Saree',  emoji: '🥻', desc: 'Traditional & Elegant',   gradient: 'from-teal-100 to-cyan-200',    border: 'border-teal-300'   },
  { name: 'Crop Tops',   emoji: '🎽', desc: 'Casual & Modern',         gradient: 'from-sky-100 to-blue-200',     border: 'border-blue-300'   },
  { name: 'Party Wears', emoji: '✨', desc: 'Glam & Elegant',          gradient: 'from-yellow-100 to-amber-200', border: 'border-yellow-300' },
];

const FEATURES = [
  { icon: Truck,       title: 'Free Shipping',     desc: 'On orders above ₹999' },
  { icon: Shield,      title: '100% Authentic',    desc: 'Genuine quality products' },
  { icon: RotateCcw,   title: 'Easy Returns',      desc: '7-day hassle-free returns' },
  { icon: Headphones,  title: 'Customer Support',  desc: 'Mon–Sat, 9AM to 8PM' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [featRes, newRes] = await Promise.all([
          productsAPI.getAll({ featured: true, limit: 8 }),
          productsAPI.getAll({ sort_by: 'created_at', sort_order: 'desc', limit: 8 }),
        ]);
        setFeatured(featRes.data);
        setNewArrivals(newRes.data);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-brand-gradient text-white">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #fff 0%, transparent 50%), radial-gradient(circle at 80% 20%, #c8860a 0%, transparent 40%)' }}
        />
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-gold-600/20 border border-gold-500/30 rounded-full px-4 py-1.5 text-gold-300 text-sm font-medium mb-6">
              <Sparkles size={14} /> New Collection 2024 — Now Available
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight mb-4">
              Discover Premium<br />
              <span className="text-gold-400">Women&apos;s Textiles</span>
            </h1>
            <p className="text-maroon-200 text-lg md:text-xl mb-8 leading-relaxed">
              Shop the finest Chudithar, Tops, Lehenga, Crop Tops & Party Wears at
              Ammalu Tex — Texvalley Gangapuram.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products" className="btn-gold inline-flex items-center gap-2">
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link href="/products?featured=true" className="inline-flex items-center gap-2 font-semibold py-2.5 px-6 rounded-lg border-2 border-white text-white hover:bg-white/15 transition-all duration-200 active:scale-95">
                View Featured
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-gold-600/10 rounded-full translate-x-1/2 -translate-y-1/2 hidden lg:block" />
        <div className="absolute right-24 bottom-0 w-48 h-48 bg-maroon-600/20 rounded-full translate-y-1/2 hidden lg:block" />
      </section>

      {/* Features bar */}
      <section className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-y border-orange-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-orange-200">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-gradient-to-br from-amber-50 to-orange-50 flex items-center gap-3 px-5 py-5 hover:from-orange-100 hover:to-amber-100 transition-colors">
                <div className="p-2.5 bg-maroon-100 rounded-xl flex-shrink-0">
                  <Icon size={20} className="text-maroon-700" />
                </div>
                <div>
                  <p className="font-bold text-sm text-maroon-900">{title}</p>
                  <p className="text-xs text-maroon-600 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-gold-600 font-medium text-sm mb-1 uppercase tracking-wider">Browse by</p>
            <h2 className="section-title">Shop by Category</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map(({ name, emoji, desc, gradient, border }) => (
            <Link
              key={name}
              href={`/products?category=${encodeURIComponent(name)}`}
              className={`group card bg-gradient-to-br ${gradient} border-2 ${border} hover:shadow-lg transition-all duration-300 hover:-translate-y-1 p-6 flex flex-col items-center text-center`}
            >
              <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{emoji}</span>
              <h3 className="font-bold text-maroon-900 text-sm leading-tight">{name}</h3>
              <p className="text-xs text-maroon-600 mt-1">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-orange-50/50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-gold-600 font-medium text-sm mb-1 uppercase tracking-wider">Hand-picked</p>
              <h2 className="section-title">Featured Products</h2>
            </div>
            <Link href="/products?featured=true" className="text-maroon-800 hover:text-maroon-600 font-semibold text-sm flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="bg-gray-200 aspect-[3/4]" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-8 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-12">No featured products yet.</p>
          )}
        </div>
      </section>

      {/* Banner */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="bg-brand-gradient rounded-2xl p-8 md:p-12 text-white text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
              🎉 Special Festival Offer
            </h2>
            <p className="text-maroon-200 mb-6 max-w-xl mx-auto">
              Get up to 40% off on selected Lehenga and Party Wear collections.
              Limited time offer — don&apos;t miss out!
            </p>
            <Link href="/products?category=Lehenga" className="btn-gold inline-flex items-center gap-2">
              Shop Lehenga <ArrowRight size={18} />
            </Link>
          </div>
          <div className="absolute inset-0 opacity-5 text-[200px] flex items-center justify-center">✨</div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-gold-600 font-medium text-sm mb-1 uppercase tracking-wider">Just In</p>
            <h2 className="section-title">New Arrivals</h2>
          </div>
          <Link href="/products?sort_by=created_at&sort_order=desc" className="text-maroon-800 hover:text-maroon-600 font-semibold text-sm flex items-center gap-1">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="bg-gray-200 aspect-[3/4]" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-8 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : newArrivals.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-12">Products coming soon.</p>
        )}
      </section>

      {/* Testimonials */}
      <section className="bg-maroon-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="section-title text-center mb-8">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Priya M.', review: 'Excellent quality chudithar! The fabric is so soft and the colours are vibrant. Fast delivery too. Highly recommended!', rating: 5 },
              { name: 'Kavitha R.', review: 'Bought a lehenga for my sister\'s wedding. Got so many compliments. Ammalu Tex never disappoints — premium quality at great prices.', rating: 5 },
              { name: 'Deepa S.', review: 'The party wear collection is amazing! Ordered online and it arrived in 3 days. Perfect fit and gorgeous design. Will order again.', rating: 5 },
            ].map(({ name, review, rating }) => (
              <div key={name} className="card p-6">
                <div className="flex mb-3">
                  {Array(rating).fill(0).map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">&ldquo;{review}&rdquo;</p>
                <p className="font-semibold text-maroon-800 text-sm">{name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
