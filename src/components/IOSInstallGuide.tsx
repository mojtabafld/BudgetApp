import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Share, PlusSquare, Smartphone, Check } from 'lucide-react';

interface IOSInstallGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IOSInstallGuide: React.FC<IOSInstallGuideProps> = ({ isOpen, onClose }) => {
  const { language } = useApp();
  const isFa = language === 'fa';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in">
      <div className="glass-modal w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-5 sm:zoom-in-95 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isFa ? 'نصب روی آیفون و آیپد (iOS)' : 'Install on iPhone & iPad'}
              </h2>
              <p className="text-xs text-slate-400">
                {isFa ? 'تجربه برنامه به صورت کاملاً بومی و فول‌اسکرین' : 'Fast native full-screen experience'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Step Visual Guide for iOS Safari */}
        <div className="space-y-3 py-1">
          {/* Step 1 */}
          <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-sm shrink-0">
              ۱
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span>{isFa ? 'لمس دکمه اشتراک‌گذاری (Share)' : 'Tap the Share Button'}</span>
                <Share className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {isFa
                  ? 'در مرورگر سافاری، روی آیکون Share در پایین صفحه (یا بالای آیپد) ضربه بزنید.'
                  : 'In Safari browser, tap the Share icon in the toolbar at the bottom of your screen.'}
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-sm shrink-0">
              ۲
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span>{isFa ? 'انتخاب «Add to Home Screen»' : 'Select "Add to Home Screen"'}</span>
                <PlusSquare className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {isFa
                  ? 'منو را به پایین اسکرول کرده و گزینه «افزودن به صفحه اصلی» را انتخاب کنید.'
                  : 'Scroll down the share sheet and choose "Add to Home Screen".'}
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-sm shrink-0">
              ۳
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span>{isFa ? 'تایید و افزودن (Add)' : 'Tap "Add" in Top Right'}</span>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {isFa
                  ? 'در گوشه بالا روی «Add» ضربه بزنید تا آیکون اپ مستقیماً به صفحه گوشی اضافه شود.'
                  : 'Tap Add in the top right corner to install BudgetMaster on your Home Screen!'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/25 active:scale-95 transition-all"
        >
          {isFa ? 'متوجه شدم' : 'Got it!'}
        </button>
      </div>
    </div>
  );
};
