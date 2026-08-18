'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle, ShieldCheck, RefreshCw, Trash2, AlertCircle,
  Clock, UserX, Pause, ChevronRight,
} from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

type Mode   = 'choose' | 'deactivate' | 'delete';
type Step   = 'warning' | 'otp' | 'done';

export default function DeleteAccountPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [mode,      setMode]      = useState<Mode>('choose');
  const [step,      setStep]      = useState<Step>('warning');
  const [otp,       setOtp]       = useState('');
  const [emailHint, setEmailHint] = useState('');
  const [devOtp,    setDevOtp]    = useState('');
  const [timer,     setTimer]     = useState(0);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  const startTimer = () => {
    setTimer(60);
    const iv = setInterval(() => {
      setTimer(t => { if (t <= 1) { clearInterval(iv); return 0; } return t - 1; });
    }, 1000);
  };

  // ── Send OTP (deactivation or deletion) ──────────────────────────────────
  const handleSendOtp = async () => {
    setLoading(true); setError('');
    try {
      const res = mode === 'deactivate'
        ? await authAPI.requestDeactivateAccount()
        : await authAPI.requestDeleteAccount();
      setEmailHint(res.data.email_hint || '');
      setDevOtp(res.data.dev_otp || '');
      setStep('otp');
      startTimer();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send OTP.');
    } finally { setLoading(false); }
  };

  // ── Confirm OTP ───────────────────────────────────────────────────────────
  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { setError('Enter the 6-digit OTP'); return; }
    setLoading(true); setError('');
    try {
      if (mode === 'deactivate') {
        await authAPI.confirmDeactivateAccount({ otp_code: otp });
        setStep('done');
        toast.success('Account deactivated. You have 7 days to reactivate.');
        setTimeout(() => { logout(); window.location.href = '/'; }, 3000);
      } else {
        await authAPI.confirmDeleteAccount({ otp_code: otp });
        setStep('done');
        toast.success('Deletion scheduled. Log in within 24 hours to cancel.');
        setTimeout(() => { logout(); window.location.href = '/'; }, 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid OTP.');
    } finally { setLoading(false); }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-graphite-muted mb-4">Please sign in to manage your account.</p>
          <Link href="/auth/login" className="btn-primary px-6 py-2">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-lg mx-auto">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-graphite-faint mb-6">
          <Link href="/" className="hover:text-maroon-700">Home</Link>
          <ChevronRight size={12} />
          <Link href="/account" className="hover:text-maroon-700">My Account</Link>
          <ChevronRight size={12} />
          <span className="text-graphite font-medium">Delete / Deactivate</span>
        </nav>

        {/* ── MODE CHOICE ─────────────────────────────────────────────── */}
        {mode === 'choose' && (
          <div className="card p-8">
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-transparent flex items-center justify-center">
                <UserX size={30} className="text-red-600" />
              </div>
            </div>
            <h1 className="font-display text-band font-normal text-center text-graphite mb-2">
              Account Options
            </h1>
            <p className="text-center text-graphite-faint text-sm mb-8">
              Choose how you want to proceed with your <strong>{user.full_name}</strong> account.
            </p>

            {/* Option 1 — Deactivate */}
            <button
              onClick={() => { setMode('deactivate'); setStep('warning'); }}
              className="w-full mb-4 p-5 rounded-sm border-2 border-orange-200 hover:border-orange-400 hover:bg-maroon-50 text-left transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-orange-100 rounded-sm group-hover:bg-orange-200 transition-colors flex-shrink-0">
                  <Pause size={20} className="text-orange-700" />
                </div>
                <div>
                  <p className="font-normal text-graphite mb-1">Temporarily Deactivate</p>
                  <p className="text-sm text-graphite-faint leading-relaxed">
                    Suspend your account for up to <strong>7 days</strong>. Your data is preserved.
                    Simply log back in to reactivate. After 7 days, the account is permanently deleted.
                  </p>
                  <p className="text-xs text-orange-600 font-medium mt-2">
                    Reversible within 7 days &nbsp;·&nbsp; Data preserved &nbsp;·&nbsp; Like Amazon
                  </p>
                </div>
              </div>
            </button>

            {/* Option 2 — Permanent delete */}
            <button
              onClick={() => { setMode('delete'); setStep('warning'); }}
              className="w-full p-5 rounded-sm border-2 border-red-200 hover:border-red-400 hover:bg-transparent text-left transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-red-100 rounded-sm group-hover:bg-red-200 transition-colors flex-shrink-0">
                  <Trash2 size={20} className="text-red-700" />
                </div>
                <div>
                  <p className="font-normal text-graphite mb-1">Permanently Delete Account</p>
                  <p className="text-sm text-graphite-faint leading-relaxed">
                    Schedule permanent deletion in <strong>24 hours</strong>. All your data —
                    orders, addresses, reviews — will be erased. This cannot be undone after 24 hours.
                  </p>
                  <p className="text-xs text-red-600 font-medium mt-2">
                    ✓ 24-hour cancellation window &nbsp;·&nbsp; Cannot be recovered after
                  </p>
                </div>
              </div>
            </button>

            <Link href="/account"
              className="block mt-5 text-center text-sm text-graphite-faint hover:text-graphite-muted hover:underline">
              ← Back to Account Settings
            </Link>
          </div>
        )}

        {/* ── DEACTIVATE / DELETE — WARNING STEP ─────────────────────── */}
        {mode !== 'choose' && step === 'warning' && (
          <div className="card p-8">
            <div className="flex justify-center mb-5">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                mode === 'deactivate' ? 'bg-orange-100' : 'bg-red-100'
              }`}>
                {mode === 'deactivate'
                  ? <Pause size={30} className="text-orange-600" />
                  : <Trash2 size={30} className="text-red-600" />}
              </div>
            </div>

            <h1 className="font-display text-band font-normal text-center text-graphite mb-2">
              {mode === 'deactivate' ? 'Temporarily Deactivate Account' : 'Permanently Delete Account'}
            </h1>
            <p className="text-center text-graphite-faint text-sm mb-6">
              {mode === 'deactivate'
                ? 'Your account will be suspended. Log in within 7 days to reactivate.'
                : 'Your account will be scheduled for permanent deletion in 24 hours.'}
            </p>

            {/* What happens */}
            <div className={`rounded-sm p-4 mb-5 border ${
              mode === 'deactivate'
                ? 'bg-maroon-50 border-orange-200'
                : 'border-l-2 border-red-700/50 bg-transparent'
            }`}>
              <p className={`font-semibold flex items-center gap-2 mb-2 ${
                mode === 'deactivate' ? 'text-orange-700' : 'text-red-700'
              }`}>
                <AlertTriangle size={15} />
                {mode === 'deactivate' ? 'During deactivation:' : 'What will be deleted:'}
              </p>
              {mode === 'deactivate' ? (
                <ul className="text-orange-700 text-sm space-y-1 ml-5 list-disc">
                  <li>You cannot log in or place orders</li>
                  <li>Your cart, orders and addresses are preserved</li>
                  <li>Log back in anytime within 7 days to reactivate instantly</li>
                  <li>After 7 days the account is permanently deleted</li>
                </ul>
              ) : (
                <ul className="text-red-600 text-sm space-y-1 ml-5 list-disc">
                  <li>Your account and profile</li>
                  <li>All saved addresses</li>
                  <li>Order history and reviews</li>
                  <li>Cart and wishlist</li>
                </ul>
              )}
            </div>

            {mode === 'deactivate' && (
              <div className="border-l-2 border-green-700/50 pl-4 p-4 mb-5">
                <p className="text-green-800 text-sm font-medium flex items-center gap-2">
                  <Clock size={14} /> 7-day reactivation window
                </p>
                <p className="text-green-700 text-xs mt-1">
                  Simply sign in within 7 days and your account will be instantly restored —
                  orders, addresses, reviews all intact.
                </p>
              </div>
            )}

            {mode === 'delete' && (
              <div className="border-l-2 border-amber-700/50 pl-4 p-4 mb-5">
                <p className="text-amber-800 text-sm font-medium">
                  ⏳ 24-hour cancellation window
                </p>
                <p className="text-amber-700 text-xs mt-1">
                  Sign in within 24 hours to cancel the deletion and keep your account.
                </p>
              </div>
            )}

            {error && (
              <div className="mb-4 flex items-center gap-2 border-l-2 border-red-700/50 pl-4 p-3">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setMode('choose'); setError(''); }}
                className="flex-1 py-3 rounded-sm border border-paper-edge text-graphite-muted hover:bg-paper text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className={`flex-1 py-3 rounded-sm text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  mode === 'deactivate'
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {loading
                  ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  : <>{mode === 'deactivate' ? <Pause size={15} /> : <Trash2 size={15} />} Send OTP</>}
              </button>
            </div>
          </div>
        )}

        {/* ── OTP STEP ────────────────────────────────────────────────── */}
        {step === 'otp' && (
          <div className="card p-8">
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                <ShieldCheck size={30} className="text-orange-600" />
              </div>
            </div>
            <h1 className="text-xl font-normal text-center text-graphite mb-2">
              {mode === 'deactivate' ? 'Confirm Deactivation' : 'Confirm Deletion'}
            </h1>
            <p className="text-center text-graphite-faint text-sm mb-5">
              OTP sent to <strong>{emailHint}</strong>
            </p>

            {devOtp && (
              <div className="border-l-2 border-amber-700/50 pl-4 p-4 mb-4">
                <p className="text-amber-800 text-xs font-semibold mb-1">Dev mode</p>
                <p className="text-amber-900 text-sm">OTP: <span className="font-mono font-normal text-lg tracking-widest">{devOtp}</span></p>
              </div>
            )}

            {error && (
              <div className="mb-4 flex items-center gap-2 border-l-2 border-red-700/50 pl-4 p-3">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleConfirm}>
              <div className="mb-5">
                <label className="label">6-Digit OTP *</label>
                <input
                  type="text" inputMode="numeric" maxLength={6}
                  value={otp}
                  onChange={e => { setOtp(e.target.value.replace(/\D/g,'').slice(0,6)); setError(''); }}
                  placeholder="• • • • • •"
                  className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                  autoComplete="one-time-code" autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className={`w-full py-3 rounded-sm text-white text-sm font-medium flex items-center justify-center gap-2 mb-4 disabled:opacity-60 ${
                  mode === 'deactivate'
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {loading
                  ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  : <>{mode === 'deactivate' ? <Pause size={15} /> : <Trash2 size={15} />}{' '}
                    {mode === 'deactivate' ? 'Confirm Deactivation' : 'Confirm Deletion'}</>}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={handleSendOtp} disabled={timer > 0 || loading}
                  className="flex items-center gap-1 text-maroon-700 hover:underline disabled:text-graphite-faint font-medium">
                  <RefreshCw size={13} />
                  {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                </button>
                <button type="button" onClick={() => { setStep('warning'); setOtp(''); setError(''); }}
                  className="text-graphite-faint hover:underline">
                  ← Back
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── DONE STEP ───────────────────────────────────────────────── */}
        {step === 'done' && (
          <div className="card p-8 text-center">
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <ShieldCheck size={30} className="text-green-600" />
              </div>
            </div>
            {mode === 'deactivate' ? (
              <>
                <h1 className="text-xl font-normal text-graphite mb-2">Account Deactivated</h1>
                <p className="text-graphite-faint text-sm mb-4">
                  Your account has been temporarily suspended.
                </p>
                <div className="bg-maroon-50 border border-orange-200 rounded-sm p-4 mb-4">
                  <p className="text-orange-800 text-sm font-medium">
                    You have <strong>7 days</strong> to reactivate.
                  </p>
                  <p className="text-orange-700 text-xs mt-1">
                    Simply log in with your email and password to instantly restore your account.
                    After 7 days, the account will be permanently deleted.
                  </p>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-xl font-normal text-graphite mb-2">Deletion Scheduled</h1>
                <p className="text-graphite-faint text-sm mb-4">
                  Your account will be permanently deleted in <strong>24 hours</strong>.
                </p>
                <div className="border-l-2 border-green-700/50 pl-4 p-4 mb-4">
                  <p className="text-green-800 text-sm font-medium">
                    Changed your mind? Simply log in within 24 hours to cancel.
                  </p>
                </div>
              </>
            )}
            <p className="text-graphite-faint text-xs">Signing you out in 3 seconds…</p>
          </div>
        )}

      </div>
    </div>
  );
}
