import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  amount: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'default';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  amount,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
          glow: 'hover:shadow-glow',
        };
      case 'success':
        return {
          iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          glow: 'hover:shadow-glow-success',
        };
      case 'danger':
        return {
          iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
          glow: 'hover:shadow-glow-danger',
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          glow: '',
        };
      default:
        return {
          iconBg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
          glow: '',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className={`glass-card glass-card-hover rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between ${styles.glow}`}
    >
      {/* Top Row: Title & Icon */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
          {title}
        </span>
        <div className={`p-2.5 rounded-2xl border ${styles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* Middle Row: Amount */}
      <div className="my-1">
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {amount}
        </div>
      </div>

      {/* Bottom Row: Subtitle / Trend */}
      {(subtitle || trend) && (
        <div className="flex items-center gap-2 mt-2 text-xs">
          {trend && (
            <span
              className={`flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full ${
                trend.isPositive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}
            >
              {trend.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {trend.value}
            </span>
          )}
          {subtitle && <span className="text-slate-400 dark:text-slate-500 truncate">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
