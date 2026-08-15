import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Target,
  Plus,
} from 'lucide-react';
import type { NavTab } from './Sidebar';

interface BottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenTransactionModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenTransactionModal,
}) => {
  const { t, isViewerOnly } = useApp();

  // 4 Primary Navigation Tabs for clean mobile experience
  const leftItems: { id: NavTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: t('nav_dashboard'), icon: LayoutDashboard },
    { id: 'transactions', label: t('nav_transactions'), icon: Receipt },
  ];

  const rightItems: { id: NavTab; label: string; icon: React.ElementType }[] = [
    { id: 'analytics', label: t('nav_analytics'), icon: PieChart },
    { id: 'budgets', label: t('nav_budgets'), icon: Target },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--color-paper-2)] border-t border-[var(--color-rule)] px-4 py-1.5 safe-bottom">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {/* Left 2 Items */}
        <div className="flex items-center gap-2 sm:gap-4">
          {leftItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                  isActive
                    ? 'text-[var(--color-accent)] font-bold'
                    : 'text-[var(--color-ink-3)] hover:text-[var(--color-ink)]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Center Floating Plus Button */}
        <button
          type="button"
          onClick={onOpenTransactionModal}
          disabled={isViewerOnly}
          className={`-mt-5 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 ${
            isViewerOnly
              ? 'bg-[var(--color-paper-3)] text-[var(--color-ink-3)] cursor-not-allowed'
              : 'bg-[var(--color-accent)]'
          }`}
          aria-label="Add transaction"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Right 2 Items */}
        <div className="flex items-center gap-2 sm:gap-4">
          {rightItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                  isActive
                    ? 'text-[var(--color-accent)] font-bold'
                    : 'text-[var(--color-ink-3)] hover:text-[var(--color-ink)]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
