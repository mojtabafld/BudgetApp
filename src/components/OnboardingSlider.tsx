import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wallet,
  TrendingUp,
  PieChart,
  Users,
  ShieldCheck,
  Eye,
  Edit3,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Smartphone,
  Globe,
  Coins,
} from 'lucide-react';

interface OnboardingSliderProps {
  onComplete: () => void;
}

export const OnboardingSlider: React.FC<OnboardingSliderProps> = ({ onComplete }) => {
  const { language, setLanguage } = useApp();
  const isFa = language === 'fa';

  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const slides = [
    {
      id: 1,
      badge: isFa ? 'مدیریت هوشمند مالی' : 'Smart Budget Tracking',
      title: isFa ? 'کنترل دقیق درآمد و هزینه‌ها' : 'Master Your Personal Finances',
      description: isFa
        ? 'تمام درآمدها و مخارج خود را به تفکیک ماه با واحد پول کرون دانمارک (DKK) ثبت کنید و سقف بودجه تعیین کنید.'
        : 'Track monthly income and expenses seamlessly with default Danish Krone (DKK), categorize transactions, and set spending limits.',
      gradient: 'from-indigo-600 via-indigo-700 to-purple-800',
      iconBg: 'bg-indigo-500/20 text-indigo-400',
      renderGraphic: () => (
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Glowing Circles */}
          <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
          
          {/* Center Card */}
          <div className="relative z-10 w-44 h-44 rounded-3xl bg-gradient-to-tr from-indigo-600/90 to-purple-600/90 backdrop-blur-xl p-5 border border-white/20 shadow-2xl flex flex-col justify-between transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-2xl bg-white/20 text-white shadow-sm">
                <Wallet className="w-6 h-6" />
              </div>
              <span className="text-xs font-black text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                +24.5%
              </span>
            </div>

            <div>
              <span className="text-[11px] text-white/70 font-medium">Total Balance</span>
              <div className="text-xl font-black text-white tracking-tight">32.450 kr.</div>
            </div>
          </div>

          {/* Floating Badges */}
          <div className="absolute -top-2 -right-2 bg-emerald-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-2xl shadow-lg flex items-center gap-1.5 animate-bounce">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Salary +32.000 kr.</span>
          </div>

          <div className="absolute -bottom-2 -left-2 bg-slate-900/90 text-white text-xs font-bold px-3 py-1.5 rounded-2xl border border-white/10 shadow-lg flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>DKK Default Currency</span>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      badge: isFa ? 'اشتراک‌گذاری مشارکتی' : 'Real-time Collaboration',
      title: isFa ? 'بودجه مشترک با کنترل دسترسی' : 'Share Budgets with Custom Roles',
      description: isFa
        ? 'کیف‌پول‌ها را با خانواده، همکاران یا شرکا به اشتراک بگذارید و سطح دسترسی «ویرایشگر» یا «فقط مشاهده» تعیین کنید.'
        : 'Collaborate with family members or partners. Grant full edit privileges or view-only access with instant data sync.',
      gradient: 'from-blue-600 via-indigo-700 to-emerald-700',
      iconBg: 'bg-blue-500/20 text-blue-400',
      renderGraphic: () => (
        <div className="relative w-64 h-64 flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>

          {/* Center Collaboration Hub */}
          <div className="relative z-10 w-48 rounded-3xl bg-slate-900/90 backdrop-blur-xl p-4 border border-white/20 shadow-2xl space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                Shared Family Budget
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>

            {/* Member 1: Owner */}
            <div className="flex items-center justify-between text-xs bg-white/5 p-2 rounded-xl">
              <span className="text-white/90 font-medium">You</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Owner
              </span>
            </div>

            {/* Member 2: Editor */}
            <div className="flex items-center justify-between text-xs bg-white/5 p-2 rounded-xl">
              <span className="text-white/90 font-medium">Partner</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 flex items-center gap-1">
                <Edit3 className="w-3 h-3" /> Editor
              </span>
            </div>

            {/* Member 3: Viewer */}
            <div className="flex items-center justify-between text-xs bg-white/5 p-2 rounded-xl">
              <span className="text-white/90 font-medium">Auditor</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 flex items-center gap-1">
                <Eye className="w-3 h-3" /> Read Only
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      badge: isFa ? 'تحلیل بصری و PWA' : 'Visual Analytics & PWA',
      title: isFa ? 'نمودارهای تعاملی و نصب روی گوشی' : 'Interactive Charts & Native Feel',
      description: isFa
        ? 'نمودارهای دایره‌ای و روندهای خطی را تحلیل کنید. پشتیبانی کامل از تقویم جلالی/میلادی و نصب مستقیم روی صفحه اصلی iOS و اندروید.'
        : 'Analyze donut and 6-month trend line charts. Enjoy dual calendar support and install as a native-like PWA on iOS and Android.',
      gradient: 'from-purple-600 via-indigo-600 to-emerald-600',
      iconBg: 'bg-purple-500/20 text-purple-400',
      renderGraphic: () => (
        <div className="relative w-64 h-64 flex items-center justify-center">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>

          {/* Center Chart Graphics Card */}
          <div className="relative z-10 w-48 rounded-3xl bg-slate-900/90 backdrop-blur-xl p-4 border border-white/20 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <PieChart className="w-5 h-5" />
              </div>
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Smartphone className="w-5 h-5" />
              </div>
            </div>

            {/* Simulated Chart Bars */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[10px] text-white/70">
                <span>Housing</span>
                <span>40%</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full w-[40%] rounded-full"></div>
              </div>

              <div className="flex justify-between text-[10px] text-white/70">
                <span>Food & Dining</span>
                <span>25%</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[25%] rounded-full"></div>
              </div>

              <div className="flex justify-between text-[10px] text-white/70">
                <span>Savings</span>
                <span>35%</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[35%] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  // Touch Swipe Handlers (Telegram-like smooth swipe)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isFa) {
      if (isRightSwipe && currentSlide < slides.length - 1) {
        setCurrentSlide((prev) => prev + 1);
      } else if (isLeftSwipe && currentSlide > 0) {
        setCurrentSlide((prev) => prev - 1);
      }
    } else {
      if (isLeftSwipe && currentSlide < slides.length - 1) {
        setCurrentSlide((prev) => prev + 1);
      } else if (isRightSwipe && currentSlide > 0) {
        setCurrentSlide((prev) => prev - 1);
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const current = slides[currentSlide];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between bg-slate-950 text-white overflow-hidden select-none transition-colors duration-500"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Dynamic Animated Ambient Glow */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${current.gradient} opacity-25 blur-3xl transition-all duration-700 pointer-events-none`}
      />

      {/* Top Bar: Skip button & Language Toggle */}
      <div className="relative z-10 flex items-center justify-between p-6 safe-top">
        <button
          onClick={() => setLanguage(language === 'en' ? 'fa' : 'en')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-semibold border border-white/10 transition-all active:scale-95"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          <span>{language === 'en' ? 'فارسی' : 'English'}</span>
        </button>

        <button
          onClick={onComplete}
          className="text-xs font-bold text-white/60 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition-all"
        >
          {isFa ? 'رد شدن' : 'Skip'}
        </button>
      </div>

      {/* Center: Slide Visual & Copy */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center max-w-md mx-auto">
        {/* Animated Graphic Container */}
        <div className="mb-6 transform transition-all duration-500 animate-in zoom-in-95">
          {current.renderGraphic()}
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-indigo-300 text-xs font-bold mb-3 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>{current.badge}</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3 transition-all duration-300">
          {current.title}
        </h1>

        {/* Description */}
        <p className="text-sm text-slate-300 leading-relaxed max-w-sm transition-all duration-300">
          {current.description}
        </p>
      </div>

      {/* Bottom Controls: Dots & Action Button */}
      <div className="relative z-10 p-6 pb-10 max-w-md w-full mx-auto space-y-6 safe-bottom">
        {/* Pagination Dots (Telegram style pill indicator) */}
        <div className="flex items-center justify-center gap-2">
          {slides.map((s, idx) => {
            const isActive = idx === currentSlide;
            return (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  isActive ? 'w-8 bg-indigo-500 shadow-glow' : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            );
          })}
        </div>

        {/* Main Action Button */}
        <div className="flex items-center gap-3">
          {currentSlide > 0 && (
            <button
              onClick={() => setCurrentSlide(currentSlide - 1)}
              className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
              aria-label="Previous slide"
            >
              <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
            </button>
          )}

          <button
            onClick={handleNext}
            className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <span>{currentSlide === slides.length - 1 ? (isFa ? 'شروع و ورود به برنامه' : 'Get Started') : (isFa ? 'بعدی' : 'Continue')}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};
