import React from 'react';
import { useApp } from '../context/AppContext';
import type { NavTab } from './Sidebar';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Target,
  Plus,
} from 'lucide-react';

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
  const { t, canEdit } = useApp();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-card border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1.5 safe-bottom">
      <div className="flex items-center justify-around relative">
        {/* Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'dashboard'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 font-normal'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t('nav_dashboard')}</span>
        </button>

        {/* Transactions */}
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'transactions'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 font-normal'
          }`}
        >
          <Receipt className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t('nav_transactions')}</span>
        </button>

        {/* Center Floating Action Button (+) */}
        <div className="-mt-6">
          <button
            onClick={onOpenTransactionModal}
            disabled={!canEdit}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
              canEdit
                ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-indigo-500/40 ring-4 ring-white dark:ring-slate-900'
                : 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed shadow-none'
            }`}
            title={canEdit ? t('add_transaction') : t('role_viewer_badge')}
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Analytics */}
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'analytics'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 font-normal'
          }`}
        >
          <PieChart className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t('nav_analytics')}</span>
        </button>

        {/* Budgets / Targets */}
        <button
          onClick={() => setActiveTab('budgets')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'budgets'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 font-normal'
          }`}
        >
          <Target className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t('nav_budgets')}</span>
        </button>
      </div>
    </div>
  );
};
