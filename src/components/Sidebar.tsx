import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Target,
  Users,
  PlusCircle,
  Eye,
  Smartphone,
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
    <aside className="hidden lg:flex flex-col w-64 border-r border-[var(--color-rule)] bg-[var(--color-paper)] p-5 gap-6 shrink-0 h-[calc(100vh-61px)] sticky top-[61px]">
      {/* Quick Add Action Button */}
      <button
        onClick={onOpenTransactionModal}
        disabled={isViewerOnly}
        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full font-bold text-xs uppercase tracking-wider transition-all ${
          isViewerOnly
            ? 'bg-[var(--color-paper-3)] text-[var(--color-ink-3)] cursor-not-allowed'
            : 'hallmark-btn-primary'
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
            <PlusCircle className="w-4 h-4" />
            <span>{t('add_transaction')}</span>
          </>
        )}
      </button>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-[var(--color-paper-3)] text-[var(--color-accent)] font-bold shadow-sm'
                  : 'text-[var(--color-ink-2)] hover:bg-[var(--color-paper-2)] hover:text-[var(--color-ink)]'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink-3)]'
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* PWA Install Footer Badge */}
      <button
        onClick={onOpenInstallGuide}
        className="w-full p-3.5 rounded-2xl bg-[var(--color-paper-2)] border border-[var(--color-rule)] hover:border-[var(--color-accent)] text-start transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-xs font-bold text-[var(--color-ink)] mb-1">
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-[var(--color-accent)]" />
            <span>Budget Master</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-extrabold">
            PWA / iOS
          </span>
        </div>
        <p className="text-[11px] text-[var(--color-ink-2)] leading-relaxed">
          {t('install_desc')}
        </p>
      </button>
    </aside>
  );
};
