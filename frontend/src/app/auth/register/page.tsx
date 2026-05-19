'use client';
import { useState } from 'react';
import { type ReactNode } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

// ─── Password rules ───────────────────────────────────────────────────────────
const RULES = [
  { test: (p: string) => p.length >= 8,                     label: 'At least 8 characters'    },
  { test: (p: string) => /[A-Z]/.test(p),                   label: 'One uppercase letter'      },
  { test: (p: string) => /[a-z]/.test(p),                   label: 'One lowercase letter'      },
  { test: (p: string) => /\d/.test(p),                      label: 'One number'                },
  { test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p), label: 'One special character'     },
];

// ─── Country codes ────────────────────────────────────────────────────────────
const COUNTRY_CODES = [
  { code: '+91',  flag: '🇮🇳', label: 'IN +91'  },
  { code: '+1',   flag: '🇺🇸', label: 'US +1'   },
  { code: '+44',  flag: '🇬🇧', label: 'UK +44'  },
  { code: '+971', flag: '🇦🇪', label: 'AE +971' },
  { code: '+65',  flag: '🇸🇬', label: 'SG +65'  },
  { code: '+60',  flag: '🇲🇾', label: 'MY +60'  },
  { code: '+61',  flag: '🇦🇺', label: 'AU +61'  },
];

// ─── InputRow defined OUTSIDE the component ───────────────────────────────────
// IMPORTANT: If this is inside the component, React unmounts+remounts the input
// on every keystroke (new function reference = new component type) → focus loss.
interface InputRowProps {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}
function InputRow({ label, error, required = true, children }: InputRowProps) {
  return (
    <div>
      <label className="label">{label}{required && ' *'}</label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
          <AlertCircle size={13} />{error}
        </p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const { login } = useAuth();

  const [fullName,    setFullName]    = useState('');
  const [email,       setEmail]       = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone,       setPhone]       = useState('');
  const [password,    setPassword]    = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [agreeTerms,  setAgreeTerms]  = useState(false);
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [apiError,    setApiError]    = useState('');

  const clearErr = (key: string) =>
    setErrors(prev => ({ ...prev, [key]: '' }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    const name = fullName.trim();
    if (!name)                              e.fullName = 'Full name is required';
    else if (name.length < 2)              e.fullName = 'Name must be at least 2 characters';
    else if (!/^[a-zA-Z\s]+$/.test(name)) e.fullName = 'Name must contain only letters and spaces';

    const em = email.trim();
    if (!em)                                        e.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) e.email = 'Enter a valid email address';

    const ph = phone.replace(/\D/g, '');
    if (!ph) {
      e.phone = 'Mobile number is required';
    } else if (countryCode === '+91' && !/^[6-9]\d{9}$/.test(ph)) {
      e.phone = 'Enter a valid 10-digit Indian number (starts with 6–9)';
    } else if (countryCode !== '+91' && (ph.length < 7 || ph.length > 15)) {
      e.phone = 'Enter a valid mobile number (7–15 digits)';
    }

    const failed = RULES.filter(r => !r.test(password));
    if (!password)         e.password = 'Password is required';
    else if (failed.length) e.password = `Need: ${failed.map(r => r.label).join(', ')}`;

    if (!confirm)                  e.confirm = 'Please confirm your password';
    else if (password !== confirm) e.confirm = 'Passwords do not match';

    if (!agreeTerms) e.terms = 'You must agree to the Terms & Conditions';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      const fullPhone = countryCode + phone.replace(/\D/g, '');
      const res = await authAPI.register({
        full_name:        fullName.trim(),
        email:            email.trim().toLowerCase(),
        phone:            fullPhone,
        password,
        confirm_password: confirm,
        agree_terms:      agreeTerms,
      });
      login(res.data.access_token, res.data.user);
      toast.success('Account created! Welcome to Ammalu Tex! 🎉');
      // Hard navigation — signals Chrome/Safari to offer "Save Password"
      window.location.href = '/';
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) setApiError(detail.map((d: any) => d.msg).join('. '));
      else setApiError(detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#fff9f2]">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <h1 className="text-3xl font-display font-bold text-maroon-900">Ammalu Tex</h1>
            <p className="text-gold-600 text-xs font-medium tracking-widest uppercase">Premium Textiles</p>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
          <p className="text-gray-500 text-sm mt-1">Join thousands of happy customers.</p>
        </div>

        <div className="card p-8 shadow-lg">

          {apiError && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate autoComplete="on" className="space-y-4">

            {/* Full Name */}
            <InputRow label="Full Name" error={errors.fullName}>
              <input
                id="full_name" name="name" type="text"
                value={fullName}
                onChange={e => { setFullName(e.target.value); clearErr('fullName'); setApiError(''); }}
                placeholder="Enter your full name"
                className={`input-field ${errors.fullName ? 'border-red-400' : ''}`}
                autoComplete="name"
              />
            </InputRow>

            {/* Email */}
            <InputRow label="Email Address" error={errors.email}>
              <input
                id="email" name="email" type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); clearErr('email'); setApiError(''); }}
                placeholder="your@email.com"
                className={`input-field ${errors.email ? 'border-red-400' : ''}`}
                autoComplete="email"
              />
            </InputRow>

            {/* Mobile Number — country code dropdown + number field */}
            <InputRow label="Mobile Number" error={errors.phone}>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={e => { setCountryCode(e.target.value); clearErr('phone'); }}
                  className="input-field w-32 flex-shrink-0 px-2 cursor-pointer"
                  aria-label="Country code"
                >
                  {COUNTRY_CODES.map(c => (
                    <option key={c.code} value={c.code}>{c.flag} {c.label}</option>
                  ))}
                </select>
                <input
                  id="phone" name="tel" type="tel"
                  value={phone}
                  onChange={e => {
                    setPhone(e.target.value.replace(/[^\d]/g, ''));
                    clearErr('phone');
                    setApiError('');
                  }}
                  placeholder={countryCode === '+91' ? '9876543210' : 'Mobile number'}
                  className={`input-field flex-1 ${errors.phone ? 'border-red-400' : ''}`}
                  autoComplete="tel-national"
                  inputMode="numeric"
                  maxLength={15}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {countryCode === '+91'
                  ? 'Enter 10-digit number starting with 6–9'
                  : 'Enter number without country code'}
              </p>
            </InputRow>

            {/* Password */}
            <InputRow label="Password" error={errors.password}>
              <div className="relative">
                <input
                  id="password" name="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); clearErr('password'); setApiError(''); }}
                  placeholder="Create a strong password"
                  className={`input-field pr-12 ${errors.password ? 'border-red-400' : ''}`}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* Strength checklist */}
              {password && (
                <div className="mt-2 grid grid-cols-2 gap-1">
                  {RULES.map(r => {
                    const ok = r.test(password);
                    return (
                      <div key={r.label} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-green-600' : 'text-gray-400'}`}>
                        <CheckCircle size={11} className={ok ? 'text-green-500' : 'text-gray-300'} />
                        {r.label}
                      </div>
                    );
                  })}
                </div>
              )}
            </InputRow>

            {/* Confirm Password */}
            <InputRow label="Confirm Password" error={errors.confirm}>
              <div className="relative">
                <input
                  id="confirm_password" name="confirm_password"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); clearErr('confirm'); setApiError(''); }}
                  placeholder="Re-enter your password"
                  className={`input-field pr-12 ${errors.confirm ? 'border-red-400' : ''}`}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1">
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </InputRow>

            {/* Terms checkbox */}
            <div>
              <label className={`flex items-start gap-3 cursor-pointer group ${errors.terms ? 'text-red-600' : 'text-gray-700'}`}>
                <div className="relative mt-0.5 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={e => { setAgreeTerms(e.target.checked); clearErr('terms'); }}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                    ${agreeTerms ? 'bg-maroon-800 border-maroon-800'
                      : errors.terms ? 'border-red-400'
                      : 'border-gray-300 group-hover:border-maroon-400'}`}>
                    {agreeTerms && <CheckCircle size={12} className="text-white" fill="white" />}
                  </div>
                </div>
                <span className="text-sm leading-relaxed">
                  I agree to Ammalu Tex&apos;s{' '}
                  <Link href="/support#terms" className="text-maroon-800 underline font-medium" target="_blank">
                    Terms & Conditions
                  </Link>{' '}and{' '}
                  <Link href="/support#privacy" className="text-maroon-800 underline font-medium" target="_blank">
                    Privacy Policy
                  </Link>.
                </span>
              </label>
              {errors.terms && (
                <p className="flex items-center gap-1 text-red-600 text-xs mt-1.5">
                  <AlertCircle size={13} />{errors.terms}
                </p>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
              {loading
                ? <><span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> Creating account...</>
                : <><UserPlus size={18} /> Create Account</>}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-orange-100 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-maroon-800 font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
