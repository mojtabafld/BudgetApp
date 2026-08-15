import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  Eye,
  EyeOff,
  Globe,
  ShieldCheck,
} from 'lucide-react';

interface AuthScreenProps {
  onSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const { loginOrRegister, language, setLanguage } = useApp();
  const isFa = language === 'fa';

  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError(isFa ? 'لطفاً تمام فیلدها را تکمیل فرمایید.' : 'Please fill in all fields.');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setError(isFa ? 'لطفاً نام خود را وارد کنید.' : 'Please enter your name.');
      return;
    }

    if (password.length < 4) {
      setError(isFa ? 'رمز عبور باید حداقل ۴ کاراکتر باشد.' : 'Password must be at least 4 characters.');
      return;
    }

    setLoading(true);

    try {
      const success = await loginOrRegister({
        name: mode === 'signup' ? name.trim() : email.split('@')[0],
        email: email.trim(),
        password: password.trim(),
        isSignUp: mode === 'signup',
      });

      if (success) {
        onSuccess();
      } else {
        setError(isFa ? 'خطا در احراز هویت. لطفاً مجدداً تلاش کنید.' : 'Authentication failed. Please try again.');
      }
    } catch {
      setError(isFa ? 'خطایی رخ داد.' : 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-slate-950 text-white overflow-y-auto selection:bg-indigo-500">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Navbar: Language Toggle */}
      <div className="w-full max-w-md flex items-center justify-between py-4 relative z-10 safe-top">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Budget Master" className="w-8 h-8 rounded-xl shadow-sm" />
          <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            Budget Master
          </span>
        </div>

        <button
          onClick={() => setLanguage(language === 'en' ? 'fa' : 'en')}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold backdrop-blur-md border border-white/10 transition-all active:scale-95"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          <span>{language === 'en' ? 'فارسی' : 'English'}</span>
        </button>
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-md glass-modal rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative z-10 my-auto animate-in zoom-in-95">
        {/* Card Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {mode === 'signup'
              ? isFa
                ? 'ایجاد حساب کاربری'
                : 'Create an Account'
              : isFa
              ? 'ورود به حساب کاربری'
              : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'signup'
              ? isFa
                ? 'برای مدیریت هوشمند بودجه و اشتراک‌گذاری داده‌ها'
                : 'Start tracking & sharing your personal finances'
              : isFa
              ? 'اطلاعات حساب خود را جهت ورود وارد کنید'
              : 'Enter your credentials to access your workspaces'}
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'signup'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isFa ? 'ثبت‌نام (جدید)' : 'Sign Up'}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError('');
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'signin'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isFa ? 'ورود' : 'Sign In'}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {isFa ? 'نام و نام خانوادگی' : 'Full Name'}
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isFa ? 'مثلاً علی محمدی' : 'e.g. David Miller'}
                  className="w-full ps-10 pe-4 py-3 rounded-2xl bg-white/5 text-white text-sm border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              {isFa ? 'آدرس ایمیل' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full ps-10 pe-4 py-3 rounded-2xl bg-white/5 text-white text-sm border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              {isFa ? 'رمز عبور' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full ps-10 pe-11 py-3 rounded-2xl bg-white/5 text-white text-sm border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
          >
            <span>
              {loading
                ? isFa
                  ? 'در حال برقراری ارتباط...'
                  : 'Processing...'
                : mode === 'signup'
                ? isFa
                  ? 'ثبت‌نام و ورود'
                  : 'Create Account & Enter'
                : isFa
                ? 'ورود به اپلیکیشن'
                : 'Sign In'}
            </span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </form>

        {/* Security Note */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{isFa ? 'نشست شما تا زمان خروج دستی ذخیره می‌ماند' : 'Your session stays saved until manual logout'}</span>
        </div>
      </div>
    </div>
  );
};
