import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Target,
  Users,
  Sparkles,
  PlusCircle,
  Eye,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'transactions' | 'analytics' | 'budgets' | 'members';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenTransactionModal: () => void;
  onOpenInstallGuide: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenTransactionModal,
  onOpenInstallGuide,
}) => {
  const { t, isViewerOnly } = useApp();

  const navItems: { id: NavTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: t('nav_dashboard'), icon: LayoutDashboard },
    { id: 'transactions', label: t('nav_transactions'), icon: Receipt },
    { id: 'analytics', label: t('nav_analytics'), icon: PieChart },
    { id: 'budgets', label: t('nav_budgets'), icon: Target },
    { id: 'members', label: t('nav_members'), icon: Users },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 glass-card border-r border-slate-200/80 dark:border-slate-800/80 p-4 gap-6 shrink-0 h-[calc(100vh-61px)] sticky top-[61px]">
      {/* Quick Add Action Button (disabled if viewer only) */}
      <button
        onClick={onOpenTransactionModal}
        disabled={isViewerOnly}
        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-sm shadow-lg transition-all ${
          isViewerOnly
            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
            : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-indigo-500/25 active:scale-[0.98]'
        }`}
        title={isViewerOnly ? t('role_viewer_warning') : t('add_transaction')}
      >
        {isViewerOnly ? (
          <>
            <Eye className="w-4 h-4" />
            <span>{t('role_viewer_badge')}</span>
          </>
        ) : (
          <>
            <PlusCircle className="w-5 h-5" />
            <span>{t('add_transaction')}</span>
          </>
        )}
      </button>

      {/* Main Navigation Links */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? 'text-indigo-600 dark:text-indigo-400 scale-110' : 'text-slate-400'
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Pro / Tips Card */}
      <button
        onClick={onOpenInstallGuide}
        className="w-full p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-emerald-500/10 hover:from-indigo-500/20 hover:to-emerald-500/20 border border-indigo-500/20 text-start transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Budget Master PWA</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
            iOS / PWA
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          {t('install_desc')}
        </p>
      </button>
    </aside>
  );
};
