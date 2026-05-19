'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart, Search, User, Menu, X, ChevronDown,
  LogOut, Package, Settings, MapPin, Phone, LayoutDashboard,
  Home, HelpCircle, UserCog, UserX, RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { STORE, SHORT_ADDRESS } from '@/lib/config';
import { performLogout } from '@/lib/auth';
import { productsAPI } from '@/lib/api';

const CATEGORIES = [
  'Chudithar', 'Tops', 'Lehenga', 'Half Saree', 'Crop Tops', 'Party Wears',
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const router = useRouter();

  const [search, setSearch]               = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDrop, setShowDrop]           = useState(false);
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [userMenuOpen, setUserMenuOpen]   = useState(false);
  const [catMenuOpen, setCatMenuOpen]     = useState(false);
  const userMenuRef  = useRef<HTMLDivElement>(null);
  const catMenuRef   = useRef<HTMLDivElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  /* Close menus on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
      if (catMenuRef.current && !catMenuRef.current.contains(e.target as Node))
        setCatMenuOpen(false);
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node))
        setShowDrop(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Live search — debounced 300 ms */
  useEffect(() => {
    const q = search.trim();
    if (q.length < 2) { setSearchResults([]); setShowDrop(false); return; }
    const t = setTimeout(async () => {
      try {
        const res = await productsAPI.getAll({ search: q, limit: 6 });
        const data = res.data;
        const items: any[] = Array.isArray(data) ? data : (data.products ?? data.items ?? []);
        setSearchResults(items);
        setShowDrop(items.length > 0);
      } catch { setSearchResults([]); }
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch(''); setShowDrop(false); setMobileOpen(false);
    }
  };

  const goToProduct = useCallback((id: number) => {
    router.push(`/products/${id}`);
    setSearch(''); setShowDrop(false);
  }, [router]);

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

            {/* Search with live dropdown */}
            <div ref={searchBoxRef} className="relative flex-1 hidden md:flex max-w-xl mx-auto">
              <form onSubmit={handleSearch} className="w-full">
                <div className="flex w-full rounded-lg overflow-hidden">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => searchResults.length > 0 && setShowDrop(true)}
                    placeholder="Search chudithar, tops, lehenga, half saree..."
                    className="flex-1 px-4 py-2.5 text-gray-900 text-sm outline-none"
                    autoComplete="off"
                  />
                  <button type="submit" className="bg-gold-600 hover:bg-gold-700 px-4 flex items-center transition-colors">
                    <Search size={18} />
                  </button>
                </div>
              </form>

              {/* Live search dropdown */}
              {showDrop && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white shadow-2xl rounded-b-xl border border-gray-100 z-50 overflow-hidden">
                  {searchResults.map((p: any) => (
                    <button
                      key={p.id}
                      onClick={() => goToProduct(p.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 border-b border-gray-50 last:border-0 text-left"
                    >
                      {p.images?.[0] && (
                        <img
                          src={p.images[0].startsWith('http') ? p.images[0] : `https://ammalu-tex.onrender.com${p.images[0]}`}
                          alt=""
                          className="w-10 h-10 rounded object-cover flex-shrink-0 bg-gray-100"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 text-sm font-medium truncate">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.category}</p>
                      </div>
                      <p className="text-maroon-700 font-bold text-sm flex-shrink-0">₹{Number(p.price).toLocaleString('en-IN')}</p>
                    </button>
                  ))}
                  <button
                    onClick={() => { router.push(`/products?search=${encodeURIComponent(search.trim())}`); setShowDrop(false); setSearch(''); }}
                    className="w-full px-4 py-3 text-center text-sm text-maroon-700 hover:bg-orange-50 font-semibold border-t border-gray-100"
                  >
                    <Search size={14} className="inline mr-1.5" />
                    See all results for &quot;{search}&quot;
                  </button>
                </div>
              )}
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2 ml-auto">

              {/* ── Logged-out: Sign In + Create Account buttons ── */}
              {!user && (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-white border border-white/40 hover:bg-maroon-700 rounded-lg transition-colors"
                  >
                    <LogIn size={15} /> Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold bg-gold-600 hover:bg-gold-700 text-white rounded-lg transition-colors"
                  >
                    <User size={15} /> Create Account
                  </Link>
                </div>
              )}

              {/* ── Logged-in: User menu ── */}
              {user && (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex flex-col items-center px-3 py-1 hover:bg-maroon-700 rounded-lg transition-colors"
                  >
                    <User size={20} />
                    <span className="text-[11px] mt-0.5 hidden sm:block">
                      {user.full_name.split(' ')[0]}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-orange-100 py-2 text-gray-800 z-50">
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-orange-100">
                        <p className="font-semibold text-maroon-900">{user.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <span className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${user.is_admin ? 'bg-maroon-100 text-maroon-800' : 'bg-green-50 text-green-700'}`}>
                          {user.is_admin ? '⚙ Admin' : '👤 Customer'}
                        </span>
                      </div>

                      {/* Navigation */}
                      <Link href="/" className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 text-sm" onClick={() => setUserMenuOpen(false)}>
                        <Home size={16} className="text-maroon-700" /> Home
                      </Link>

                      {user.is_admin && (
                        <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 text-sm font-semibold text-maroon-800" onClick={() => setUserMenuOpen(false)}>
                          <LayoutDashboard size={16} className="text-maroon-700" /> Admin Dashboard
                        </Link>
                      )}

                      <Link href="/orders" className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 text-sm" onClick={() => setUserMenuOpen(false)}>
                        <Package size={16} className="text-maroon-700" /> My Orders
                      </Link>

                      <Link href="/account" className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 text-sm" onClick={() => setUserMenuOpen(false)}>
                        <UserCog size={16} className="text-maroon-700" /> Account Settings
                      </Link>

                      <Link href="/support" className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 text-sm" onClick={() => setUserMenuOpen(false)}>
                        <HelpCircle size={16} className="text-maroon-700" /> Help &amp; Policies
                      </Link>

                      {user.is_admin && (
                        <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 text-sm" onClick={() => setUserMenuOpen(false)}>
                          <Settings size={16} className="text-maroon-700" /> Manage Products
                        </Link>
                      )}

                      <hr className="border-orange-100 my-1" />

                      {/* Switch account = sign out → login */}
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                          window.location.href = '/auth/login';
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 text-sm text-gray-700 w-full"
                      >
                        <RefreshCw size={16} className="text-gray-500" /> Switch Account
                      </button>

                      <Link href="/account/delete" className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm text-red-500" onClick={() => setUserMenuOpen(false)}>
                        <UserX size={16} /> Delete Account
                      </Link>

                      <hr className="border-orange-100 my-1" />

                      <button onClick={() => { setUserMenuOpen(false); performLogout(); }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm text-red-600 w-full">
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              )}


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

              {/* Mobile: show Sign In button when logged out */}
              {!user && (
                <Link href="/auth/login" className="sm:hidden flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-gold-600 hover:bg-gold-700 rounded-lg transition-colors">
                  Sign In
                </Link>
              )}

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

              {/* Home */}
              <Link
                href="/"
                className="flex items-center gap-1.5 px-4 h-full text-sm font-medium hover:bg-maroon-700 transition-colors"
              >
                <Home size={15} /> Home
              </Link>

              {/* All Categories dropdown */}
              <div className="relative h-full" ref={catMenuRef}>
                <button
                  onClick={() => setCatMenuOpen(v => !v)}
                  className="flex items-center gap-1.5 px-4 h-full text-sm font-medium hover:bg-maroon-700 transition-colors"
                >
                  <Menu size={16} /> All Categories
                  <ChevronDown size={14} className={`transition-transform duration-200 ${catMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {catMenuOpen && (
                  <div className="absolute top-full left-0 w-56 bg-white shadow-xl rounded-b-xl border border-orange-100 py-2 z-50">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setCatMenuOpen(false);
                          router.push(`/products?category=${encodeURIComponent(cat)}`);
                        }}
                        className="w-full text-left block px-4 py-2.5 text-gray-800 hover:bg-orange-50 hover:text-maroon-800 text-sm font-medium transition-colors"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/orders"
                className="px-4 h-full flex items-center text-sm font-medium hover:bg-maroon-700 transition-colors text-maroon-200"
              >
                My Orders
              </Link>

              <Link
                href="/support"
                className="ml-auto px-4 h-full flex items-center text-sm font-medium hover:bg-maroon-700 transition-colors text-maroon-200"
              >
                Help
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
              {/* Home link */}
              <Link href="/" onClick={() => setMobileOpen(false)}
                className="px-4 py-2.5 rounded-lg hover:bg-maroon-700 text-sm font-medium flex items-center gap-2">
                <Home size={15} /> Home
              </Link>
              <hr className="border-maroon-700 my-1" />
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
                  <Link href="/account" onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 rounded-lg hover:bg-maroon-700 text-sm font-medium flex items-center gap-2">
                    <UserCog size={15} /> Account Settings
                  </Link>
                  <Link href="/support" onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 rounded-lg hover:bg-maroon-700 text-sm font-medium flex items-center gap-2">
                    <HelpCircle size={15} /> Help &amp; Policies
                  </Link>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                      window.location.href = '/auth/login';
                    }}
                    className="px-4 py-2.5 rounded-lg hover:bg-maroon-700 text-sm font-medium text-maroon-200 flex items-center gap-2 w-full text-left">
                    <RefreshCw size={15} /> Switch Account
                  </button>
                  <Link href="/account/delete" onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 rounded-lg hover:bg-red-900 text-sm font-medium text-red-300 flex items-center gap-2">
                    <UserX size={15} /> Delete Account
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
                  <Link href="/support" onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 rounded-lg hover:bg-maroon-700 text-sm font-medium text-maroon-200">
                    Customer Support
                  </Link>
                </>
              )}
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
