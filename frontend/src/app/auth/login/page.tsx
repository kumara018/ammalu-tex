'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/lib/api';
import { redirectAfterLogin } from '@/lib/auth';
import toast from 'react-hot-toast';

type Step = 'credentials' | 'otp';

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.replace(user.is_admin ? '/admin' : '/');
    }
  }, [user, router]);

  // Step 1
  const [identifier, setIdentifier] = useState('');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);

  // Step 2
  const [otp,       setOtp]       = useState('');
  const [emailHint, setEmailHint] = useState('');
  const [devOtp,    setDevOtp]    = useState('');   // shown when SMTP not configured
  const [timer,     setTimer]     = useState(60);   // resend countdown

  const [step,    setStep]    = useState<Step>('credentials');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    setTimer(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current!); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // ── Step 1: verify credentials → send OTP ──────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) { setError('Email or mobile number is required'); return; }
    if (!password)           { setError('Password is required');               return; }

    setLoading(true);
    setError('');
    try {
      const res = await authAPI.sendLoginOtp({ identifier: identifier.trim(), password });
      setEmailHint(res.data.email_hint || '');
      setDevOtp(res.data.dev_otp || '');
      setStep('otp');
      startTimer();
      toast.success('OTP sent! Check your email.');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: verify OTP → login ─────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { setError('Enter the 6-digit OTP sent to your email'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await authAPI.verifyLoginOtp({ identifier: identifier.trim(), otp_code: otp });
      const { access_token, user } = res.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      login(access_token, user);
      toast.success(`Welcome back, ${user.full_name.split(' ')[0]}! 👋`);
      redirectAfterLogin(user.is_admin);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ─────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (timer > 0 || loading) return;
    setLoading(true);
    setError('');
    setDevOtp('');
    try {
      const res = await authAPI.sendLoginOtp({ identifier: identifier.trim(), password });
      setDevOtp(res.data.dev_otp || '');
      setOtp('');
      startTimer();
      toast.success('New OTP sent!');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fff9f2]">

      {/* Standalone header — brand only, no full navbar */}
      <div className="bg-brand-gradient text-white py-4 px-6 flex items-center justify-between shadow-md">
        <Link href="/" className="flex flex-col leading-tight">
          <span className="text-xl font-display font-bold tracking-wide">Ammalu Tex</span>
          <span className="text-gold-300 text-[10px] font-medium tracking-widest uppercase">Premium Women's Textiles</span>
        </Link>
        <Link href="/" className="text-sm text-maroon-200 hover:text-white transition-colors">
          ← Back to Shop
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 'credentials' ? 'Sign in to your account' : 'Verify your identity'}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {step === 'credentials'
              ? 'Enter your email or mobile number'
              : `OTP sent to ${emailHint}`}
          </p>
        </div>

        <div className="card p-8 shadow-lg">

          {/* Error banner */}
          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* ── STEP 1: Credentials ────────────────────────────────────────── */}
          {step === 'credentials' && (
            <form onSubmit={handleSendOtp} noValidate autoComplete="on" className="space-y-5">

              <div>
                <label className="label">Email or Mobile Number *</label>
                <input
                  id="identifier" name="username" type="text"
                  value={identifier}
                  onChange={e => { setIdentifier(e.target.value); setError(''); }}
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
                    id="password" name="password"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="Enter your password"
                    className="input-field pr-12"
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                {loading
                  ? <><span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> Sending OTP...</>
                  : <><Mail size={18} /> Send OTP</>}
              </button>
            </form>
          )}

          {/* ── STEP 2: OTP ────────────────────────────────────────────────── */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} noValidate className="space-y-5">

              {/* Dev-mode OTP notice (only visible when SMTP not configured) */}
              {devOtp && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-amber-800 text-xs font-semibold mb-1">
                    ⚠️ Email not configured — development mode
                  </p>
                  <p className="text-amber-900 text-sm">
                    Your OTP:{' '}
                    <span className="font-mono font-bold text-xl tracking-[0.3em]">{devOtp}</span>
                  </p>
                </div>
              )}

              <div>
                <label className="label">6-Digit OTP *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={otp}
                  onChange={e => {
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setError('');
                  }}
                  placeholder="• • • • • •"
                  className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                  maxLength={6}
                  autoComplete="one-time-code"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  Sent to <strong>{emailHint}</strong>. Check inbox + spam folder.
                </p>
              </div>

              <button type="submit" disabled={loading || otp.length !== 6}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-60">
                {loading
                  ? <><span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> Verifying...</>
                  : <><ShieldCheck size={18} /> Verify & Sign In</>}
              </button>

              {/* Resend + Back */}
              <div className="flex items-center justify-between text-sm pt-1">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={timer > 0 || loading}
                  className="flex items-center gap-1.5 font-medium text-maroon-700 hover:underline disabled:text-gray-400 disabled:no-underline"
                >
                  <RefreshCw size={14} />
                  {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('credentials'); setOtp(''); setError(''); setDevOtp(''); }}
                  className="text-gray-500 hover:text-gray-700 hover:underline"
                >
                  ← Change email/password
                </button>
              </div>
            </form>
          )}

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
    </div>
  );
}
