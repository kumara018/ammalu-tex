'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, ShieldCheck, RefreshCw, Trash2, AlertCircle } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { performLogout } from '@/lib/auth';
import toast from 'react-hot-toast';

type Step = 'warning' | 'otp' | 'done';

export default function DeleteAccountPage() {
  const { user } = useAuth();
  const router = useRouter();

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

  const handleSendOtp = async () => {
    setLoading(true); setError('');
    try {
      const res = await authAPI.requestDeleteAccount();
      setEmailHint(res.data.email_hint || '');
      setDevOtp(res.data.dev_otp || '');
      setStep('otp');
      startTimer();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send OTP.');
    } finally { setLoading(false); }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { setError('Enter the 6-digit OTP'); return; }
    setLoading(true); setError('');
    try {
      await authAPI.confirmDeleteAccount({ otp_code: otp });
      setStep('done');
      toast.success('Account scheduled for deletion in 5 minutes.');
      setTimeout(() => { performLogout(); }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid OTP.');
    } finally { setLoading(false); }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff9f2]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to manage your account.</p>
          <Link href="/auth/login" className="btn-primary px-6 py-2">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff9f2] px-4 py-12">
      <div className="max-w-md mx-auto">

        <Link href="/" className="text-maroon-700 hover:underline text-sm flex items-center gap-1 mb-6">
          ← Back to Home
        </Link>

        <div className="card p-8 shadow-lg">

          {/* ── Step 1: Warning ── */}
          {step === 'warning' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 size={30} className="text-red-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Delete Account</h1>
              <p className="text-center text-gray-500 text-sm mb-6">This action cannot be undone after 5 minutes.</p>

              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 space-y-2">
                <p className="font-semibold text-red-700 flex items-center gap-2">
                  <AlertTriangle size={16} /> What will be deleted:
                </p>
                <ul className="text-red-600 text-sm space-y-1 ml-6 list-disc">
                  <li>Your account and profile</li>
                  <li>All saved addresses</li>
                  <li>Order history</li>
                  <li>Reviews you've written</li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <p className="text-amber-800 text-sm font-medium">
                  ⏳ You have <strong>5 minutes</strong> to cancel. Simply log in within 5 minutes to restore your account.
                </p>
              </div>

              {error && (
                <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                  <AlertCircle size={16} className="text-red-500" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Link href="/" className="flex-1 btn-outline text-center py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium">
                  Cancel
                </Link>
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  {loading
                    ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    : <><Trash2 size={16} /> Continue</>}
                </button>
              </div>
            </>
          )}

          {/* ── Step 2: OTP ── */}
          {step === 'otp' && (
            <form onSubmit={handleConfirm}>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                  <ShieldCheck size={30} className="text-orange-600" />
                </div>
              </div>
              <h1 className="text-xl font-bold text-center text-gray-900 mb-2">Confirm Deletion</h1>
              <p className="text-center text-gray-500 text-sm mb-6">
                OTP sent to <strong>{emailHint}</strong>
              </p>

              {devOtp && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                  <p className="text-amber-800 text-xs font-semibold mb-1">⚠️ Dev mode — email not configured</p>
                  <p className="text-amber-900 text-sm">OTP: <span className="font-mono font-bold text-lg tracking-widest">{devOtp}</span></p>
                </div>
              )}

              {error && (
                <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                  <AlertCircle size={16} className="text-red-500" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="mb-6">
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

              <button type="submit" disabled={loading || otp.length !== 6}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 mb-4">
                {loading
                  ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  : <><Trash2 size={16} /> Confirm Delete Account</>}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={handleSendOtp} disabled={timer > 0 || loading}
                  className="flex items-center gap-1 text-maroon-700 hover:underline disabled:text-gray-400 font-medium">
                  <RefreshCw size={13} />
                  {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                </button>
                <button type="button" onClick={() => { setStep('warning'); setOtp(''); setError(''); }}
                  className="text-gray-500 hover:underline">
                  ← Back
                </button>
              </div>
            </form>
          )}

          {/* ── Step 3: Done ── */}
          {step === 'done' && (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <ShieldCheck size={30} className="text-green-600" />
                </div>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Deletion Scheduled</h1>
              <p className="text-gray-500 text-sm mb-4">
                Your account will be permanently deleted in <strong>5 minutes</strong>.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <p className="text-green-800 text-sm font-medium">
                  ✅ Changed your mind? Simply log in within 5 minutes to cancel.
                </p>
              </div>
              <p className="text-gray-400 text-xs">Signing you out in 3 seconds...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
