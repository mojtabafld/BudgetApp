import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  amount: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'income' | 'expense' | 'savings';
  icon?: React.ElementType;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  amount,
  subtitle,
  trend,
  variant = 'default',
  icon: Icon,
}) => {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'income':
        return 'text-[var(--color-success)] bg-[var(--color-success-subtle)] border-[var(--color-success)]/20';
      case 'expense':
        return 'text-[var(--color-danger)] bg-[var(--color-danger-subtle)] border-[var(--color-danger)]/20';
      case 'savings':
        return 'text-[var(--color-accent)] bg-[var(--color-accent-subtle)] border-[var(--color-accent)]/20';
      default:
        return 'text-[var(--color-ink-2)] bg-[var(--color-paper-3)] border-[var(--color-rule)]';
    }
  };

  return (
    <div className="hallmark-card p-5 sm:p-6 flex flex-col justify-between space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[var(--color-ink-2)] uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl border ${getBadgeStyle()}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Main Metric Value (Tabular Numeric Display) */}
      <div className="space-y-1">
        <div className="text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)] tracking-tight tabular-nums">
          {amount}
        </div>
        {subtitle && (
          <p className="text-xs text-[var(--color-ink-2)] font-medium">
            {subtitle}
          </p>
        )}
      </div>

      {/* Trend Indicator */}
      {trend && (
        <div className="pt-2 border-t border-[var(--color-rule)] flex items-center gap-1.5 text-xs font-semibold">
          {trend.isPositive ? (
            <span className="flex items-center gap-1 text-[var(--color-success)]">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{trend.value}%</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[var(--color-danger)]">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>-{trend.value}%</span>
            </span>
          )}
          <span className="text-[var(--color-ink-3)] text-[11px]">vs. last month</span>
        </div>
      )}
    </div>
  );
};
