'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart, Search, User, Menu, X, ChevronDown,
  LogOut, Package, Settings, MapPin, Phone, LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { STORE, SHORT_ADDRESS } from '@/lib/config';
import { performLogout } from '@/lib/auth';

const CATEGORIES = [
  'Chudithar', 'Tops', 'Lehenga', 'Half Saree', 'Crop Tops', 'Party Wears',
];

export default function Navbar() {
  const { user } = useAuth();
  const { count } = useCart();
  const router = useRouter();

  const [search, setSearch]         = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [catMenuOpen, setCatMenuOpen]   = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  /* Close user-menu on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setMobileOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 shadow-md">

      {/* Top bar */}
      <div className="bg-maroon-950 text-maroon-100 text-xs py-1.5 px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><MapPin size={11} /> {SHORT_ADDRESS}</span>
          <span className="hidden sm:flex items-center gap-1"><Phone size={11} /> {STORE.phone1}</span>
        </div>
        <span className="text-gold-400 font-medium">Free shipping on orders above ₹999</span>
      </div>

      {/* Main navbar */}
      <nav className="bg-brand-gradient text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 h-16">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <div className="flex flex-col leading-tight">
                <span className="text-xl font-display font-bold text-white tracking-wide">{STORE.name}</span>
                <span className="text-gold-300 text-[10px] font-medium tracking-widest uppercase">{STORE.tagline}</span>
              </div>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 hidden md:flex max-w-xl mx-auto">
              <div className="flex w-full rounded-lg overflow-hidden">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search chudithar, tops, lehenga, half saree..."
                  className="flex-1 px-4 py-2.5 text-gray-900 text-sm outline-none"
                />
                <button type="submit" className="bg-gold-600 hover:bg-gold-700 px-4 flex items-center transition-colors">
                  <Search size={18} />
                </button>
              </div>
            </form>

            {/* Right section */}
            <div className="flex items-center gap-2 ml-auto">

              {/* ── User menu ── */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex flex-col items-center px-3 py-1 hover:bg-maroon-700 rounded-lg transition-colors"
                >
                  <User size={20} />
                  <span className="text-[11px] mt-0.5 hidden sm:block">
                    {user ? user.full_name.split(' ')[0] : 'Account'}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-1 w-60 bg-white rounded-xl shadow-xl border border-orange-100 py-2 text-gray-800 z-50">

                    {/* ── LOGGED IN ── */}
                    {user ? (
                      <>
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-orange-100">
                          <p className="font-semibold text-maroon-900">{user.full_name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          <span className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${user.is_admin ? 'bg-maroon-100 text-maroon-800' : 'bg-green-50 text-green-700'}`}>
                            {user.is_admin ? '⚙ Admin' : '👤 Customer'}
                          </span>
                        </div>

                        {/* Admin-only: Admin Panel */}
                        {user.is_admin && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 text-sm font-semibold text-maroon-800"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <LayoutDashboard size={16} className="text-maroon-700" />
                            Admin Dashboard
                          </Link>
                        )}

                        {/* All users: My Orders */}
                        <Link
                          href="/orders"
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 text-sm"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Package size={16} className="text-maroon-700" />
                          My Orders
                        </Link>

                        {/* Admin settings shortcut */}
                        {user.is_admin && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 text-sm"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Settings size={16} className="text-maroon-700" />
                            Manage Products
                          </Link>
                        )}

                        <hr className="border-orange-100 my-1" />

                        {/* Logout */}
                        <button
                          onClick={() => { setUserMenuOpen(false); performLogout(); }}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm text-red-600 w-full"
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </>
                    ) : (
                      /* ── NOT LOGGED IN ── */
                      <>
                        <div className="px-4 py-3 border-b border-orange-100">
                          <p className="text-sm text-gray-500">Sign in to track orders, manage your account and more.</p>
                        </div>
                        <Link
                          href="/auth/login"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 text-sm font-semibold text-maroon-800"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <LogIn size={16} /> Sign In
                        </Link>
                        <Link
                          href="/auth/register"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 text-sm"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User size={16} /> Create Account
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link
                href={user ? '/cart' : '/auth/login'}
                className="relative flex flex-col items-center px-3 py-1 hover:bg-maroon-700 rounded-lg transition-colors"
              >
                <div className="relative">
                  <ShoppingCart size={20} />
                  {count > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gold-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {count > 99 ? '99+' : count}
                    </span>
                  )}
                </div>
                <span className="text-[11px] mt-0.5 hidden sm:block">Cart</span>
              </Link>

              {/* Mobile toggle */}
              <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 hover:bg-maroon-700 rounded-lg">
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Category bar — desktop */}
        <div className="bg-maroon-900 hidden md:block">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-1 h-10">

              {/* All Categories dropdown */}
              <button
                onMouseEnter={() => setCatMenuOpen(true)}
                onMouseLeave={() => setCatMenuOpen(false)}
                className="relative flex items-center gap-1 px-4 h-full text-sm font-medium hover:bg-maroon-700 transition-colors"
              >
                <Menu size={16} /> All Categories <ChevronDown size={14} />
                {catMenuOpen && (
                  <div className="absolute top-full left-0 w-52 bg-white shadow-xl rounded-b-xl border border-orange-100 py-2 z-50">
                    {CATEGORIES.map((cat) => (
                      <Link
                        key={cat}
                        href={`/products?category=${encodeURIComponent(cat)}`}
                        className="block px-4 py-2.5 text-gray-800 hover:bg-orange-50 hover:text-maroon-800 text-sm font-medium transition-colors"
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                )}
              </button>

              {/* Individual category links */}
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat}
                  href={`/products?category=${encodeURIComponent(cat)}`}
                  className="px-3 h-full flex items-center text-sm font-medium hover:bg-maroon-700 transition-colors text-maroon-100 hover:text-white whitespace-nowrap"
                >
                  {cat}
                </Link>
              ))}

              <Link
                href="/support"
                className="ml-auto px-4 h-full flex items-center text-sm font-medium hover:bg-maroon-700 transition-colors text-maroon-200"
              >
                Support
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-maroon-900 border-t border-maroon-700">
            <form onSubmit={handleSearch} className="p-4">
              <div className="flex rounded-lg overflow-hidden">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 px-4 py-2.5 text-gray-900 text-sm outline-none"
                />
                <button type="submit" className="bg-gold-600 px-4 flex items-center">
                  <Search size={18} />
                </button>
              </div>
            </form>
            <div className="px-4 pb-4 flex flex-col gap-1">
              {CATEGORIES.map((cat) => (
                <Link key={cat} href={`/products?category=${encodeURIComponent(cat)}`}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 rounded-lg hover:bg-maroon-700 text-sm font-medium">
                  {cat}
                </Link>
              ))}
              <hr className="border-maroon-700 my-2" />
              {user ? (
                <>
                  {user.is_admin && (
                    <Link href="/admin" onClick={() => setMobileOpen(false)}
                      className="px-4 py-2.5 rounded-lg hover:bg-maroon-700 text-sm font-semibold text-gold-300 flex items-center gap-2">
                      <LayoutDashboard size={15} /> Admin Dashboard
                    </Link>
                  )}
                  <Link href="/orders" onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 rounded-lg hover:bg-maroon-700 text-sm font-medium flex items-center gap-2">
                    <Package size={15} /> My Orders
                  </Link>
                  <button onClick={() => { setMobileOpen(false); performLogout(); }}
                    className="px-4 py-2.5 rounded-lg hover:bg-red-900 text-sm font-medium text-red-300 flex items-center gap-2 w-full text-left">
                    <LogOut size={15} /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 rounded-lg hover:bg-maroon-700 text-sm font-semibold text-gold-300">
                    Sign In
                  </Link>
                  <Link href="/auth/register" onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 rounded-lg hover:bg-maroon-700 text-sm font-medium">
                    Create Account
                  </Link>
                </>
              )}
              <Link href="/support" onClick={() => setMobileOpen(false)}
                className="px-4 py-2.5 rounded-lg hover:bg-maroon-700 text-sm font-medium text-maroon-200">
                Customer Support
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

// needed for the "Sign In" icon in the guest menu
function LogIn({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );
}
