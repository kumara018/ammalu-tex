'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

interface FormFields {
  full_name: string; email: string; phone: string;
  password: string; confirm_password: string; agree_terms: boolean;
}
interface Errors { [k: string]: string; }

const RULES = [
  { test: (p: string) => p.length >= 8,          label: 'At least 8 characters' },
  { test: (p: string) => /[A-Z]/.test(p),        label: 'One uppercase letter' },
  { test: (p: string) => /[a-z]/.test(p),        label: 'One lowercase letter' },
  { test: (p: string) => /\d/.test(p),           label: 'One number' },
  { test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p), label: 'One special character (!@#$...)' },
];

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<FormFields>({
    full_name: '', email: '', phone: '', password: '', confirm_password: '', agree_terms: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const set = (field: keyof FormFields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [field]: val });
    setErrors({ ...errors, [field]: '' });
    setApiError('');
  };

  const validate = (): boolean => {
    const e: Errors = {};

    if (!form.full_name.trim()) {
      e.full_name = 'Full name is required';
    } else if (form.full_name.trim().length < 2) {
      e.full_name = 'Name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(form.full_name.trim())) {
      e.full_name = 'Name must contain only letters and spaces';
    }

    if (!form.email.trim()) {
      e.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = 'Enter a valid email address (e.g. name@gmail.com)';
    }

    const cleanPhone = form.phone.replace(/\s|-/g, '');
    if (!cleanPhone) {
      e.phone = 'Mobile number is required';
    } else if (!/^(\+91|91|0)?[6-9]\d{9}$/.test(cleanPhone)) {
      e.phone = 'Enter a valid 10-digit Indian mobile number';
    }

    const failedRules = RULES.filter((r) => !r.test(form.password));
    if (!form.password) {
      e.password = 'Password is required';
    } else if (failedRules.length > 0) {
      e.password = `Password must have: ${failedRules.map((r) => r.label).join(', ')}`;
    }

    if (!form.confirm_password) {
      e.confirm_password = 'Please confirm your password';
    } else if (form.password !== form.confirm_password) {
      e.confirm_password = 'Passwords do not match. Please re-enter.';
    }

    if (!form.agree_terms) {
      e.agree_terms = 'You must agree to the Terms & Conditions to create an account';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      const res = await authAPI.register({
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.replace(/\s|-/g, ''),
        password: form.password,
        confirm_password: form.confirm_password,
        agree_terms: form.agree_terms,
      });
      login(res.data.access_token, res.data.user);
      toast.success('Account created successfully! Welcome to Ammalu Tex!');
      router.push('/');
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setApiError(detail.map((d: any) => d.msg).join(', '));
      } else {
        setApiError(detail || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const InputRow = ({ label, children, error, required = true }: any) => (
    <div>
      <label className="label">{label}{required && ' *'}</label>
      {children}
      {error && <p className="error-msg mt-1"><AlertCircle size={13} />{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#fff9f2]">
      <div className="w-full max-w-lg">
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

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <InputRow label="Full Name" error={errors.full_name}>
              <input
                type="text"
                value={form.full_name}
                onChange={set('full_name')}
                placeholder="Enter your full name"
                className={`input-field ${errors.full_name ? 'input-error' : ''}`}
                autoComplete="name"
              />
            </InputRow>

            <InputRow label="Email Address" error={errors.email}>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="your@email.com"
                className={`input-field ${errors.email ? 'input-error' : ''}`}
                autoComplete="email"
              />
            </InputRow>

            <InputRow label="Mobile Number" error={errors.phone}>
              <input
                type="tel"
                value={form.phone}
                onChange={set('phone')}
                placeholder="+91 98765 43210"
                className={`input-field ${errors.phone ? 'input-error' : ''}`}
                autoComplete="tel"
                maxLength={13}
              />
            </InputRow>

            <InputRow label="Password" error={errors.password}>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Create a strong password"
                  className={`input-field pr-12 ${errors.password ? 'input-error' : ''}`}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* Password strength */}
              {form.password && (
                <div className="mt-2 grid grid-cols-2 gap-1">
                  {RULES.map((r) => {
                    const ok = r.test(form.password);
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

            <InputRow label="Confirm Password" error={errors.confirm_password}>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirm_password}
                  onChange={set('confirm_password')}
                  placeholder="Re-enter your password"
                  className={`input-field pr-12 ${errors.confirm_password ? 'input-error' : ''}`}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1">
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </InputRow>

            {/* Terms */}
            <div>
              <label className={`flex items-start gap-3 cursor-pointer group ${errors.agree_terms ? 'text-red-600' : 'text-gray-700'}`}>
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={form.agree_terms}
                    onChange={set('agree_terms')}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${form.agree_terms ? 'bg-maroon-800 border-maroon-800' : errors.agree_terms ? 'border-red-400' : 'border-gray-300 group-hover:border-maroon-400'}`}>
                    {form.agree_terms && <CheckCircle size={12} className="text-white" fill="white" />}
                  </div>
                </div>
                <span className="text-sm leading-relaxed">
                  I agree to Ammalu Tex&apos;s{' '}
                  <Link href="/support#terms" className="text-maroon-800 underline font-medium" target="_blank">
                    Terms & Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="/support#privacy" className="text-maroon-800 underline font-medium" target="_blank">
                    Privacy Policy
                  </Link>. I confirm I am 18 years or older.
                </span>
              </label>
              {errors.agree_terms && (
                <p className="error-msg mt-1.5"><AlertCircle size={13} />{errors.agree_terms}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2"
            >
              {loading ? (
                <><span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> Creating account...</>
              ) : (
                <><UserPlus size={18} /> Create Account</>
              )}
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
