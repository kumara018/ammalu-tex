'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { performLogin, redirectAfterLogin } from '@/lib/auth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) { setError('Email or mobile number is required'); return; }
    if (!password)           { setError('Password is required');               return; }

    setLoading(true);
    setError('');

    const result = await performLogin(identifier, password);

    if (result.success) {
      // Sync React state (so Navbar shows user name immediately)
      const token = localStorage.getItem('token')!;
      const user  = JSON.parse(localStorage.getItem('user')!);
      login(token, user);

      toast.success(`Welcome back, ${result.name!.split(' ')[0]}! 👋`);

      // Hard navigation → admin page reads from localStorage cleanly
      // Admin login  → /admin
      // User  login  → /
      redirectAfterLogin(result.isAdmin!);
    } else {
      setError(result.error!);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#fff9f2]">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <h1 className="text-3xl font-display font-bold text-maroon-900">Ammalu Tex</h1>
            <p className="text-gold-600 text-xs font-medium tracking-widest uppercase">Premium Textiles</p>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">Sign in to your account</h2>
          <p className="text-gray-500 text-sm mt-1">Use your email or mobile number</p>
        </div>

        <div className="card p-8 shadow-lg">

          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            <div>
              <label className="label">Email or Mobile Number *</label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                placeholder="email@example.com or 9876543210"
                className="input-field"
                autoComplete="username"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="label mb-0">Password *</label>
                <Link href="/auth/forgot-password" className="text-xs text-maroon-700 hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter your password"
                  className="input-field pr-12"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading
                ? <><span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> Signing in...</>
                : <><LogIn size={18} /> Sign In</>}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-orange-100 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="text-maroon-800 font-semibold hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
