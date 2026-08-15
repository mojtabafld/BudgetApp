import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from './StatCard';
import { CategoryIcon, getCategoryById } from './CategoryIcon';
import { formatCurrency } from '../utils/currency';
import { formatDateDisplay } from '../utils/date';
import type { NavTab } from './Sidebar';
import {
  Wallet,
  TrendingUp,
  PieChart,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Repeat,
  Plus,
} from 'lucide-react';

interface DashboardViewProps {
  setActiveTab: (tab: NavTab) => void;
  onOpenTransactionModal: (type?: 'income' | 'expense') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenTransactionModal,
}) => {
  const {
    activeWorkspace,
    filteredTransactions,
    transactions,
    currency,
    language,
    calendar,
    canEdit,
    t,
  } = useApp();

  // Calculations for current month
  const { totalIncome, totalExpense, netSavings, savingsRate } = useMemo(() => {
    let income = 0;
    let expense = 0;

    filteredTransactions.forEach((tx) => {
      if (tx.type === 'income') {
        income += tx.amount;
      } else {
        expense += tx.amount;
      }
    });

    const net = income - expense;
    const rate = income > 0 ? Math.max(0, Math.round((net / income) * 100)) : 0;

    return {
      totalIncome: income,
      totalExpense: expense,
      netSavings: net,
      savingsRate: rate,
    };
  }, [filteredTransactions]);

  // Overall Total Balance for this workspace
  const totalBalance = useMemo(() => {
    if (!activeWorkspace) return 0;
    const wsTxs = transactions.filter((tx) => tx.workspace_id === activeWorkspace.id);
    let bal = 0;
    wsTxs.forEach((tx) => {
      if (tx.type === 'income') bal += tx.amount;
      else bal -= tx.amount;
    });
    return bal;
  }, [transactions, activeWorkspace]);

  // Top spending categories this month
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTransactions
      .filter((tx) => tx.type === 'expense')
      .forEach((tx) => {
        map[tx.category_id] = (map[tx.category_id] || 0) + tx.amount;
      });

    return Object.entries(map)
      .map(([catId, amount]) => {
        const cat = getCategoryById(catId);
        const percent = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
        return { cat, amount, percent };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, totalExpense]);

  const recentTransactions = useMemo(() => {
    return [...filteredTransactions].slice(0, 5);
  }, [filteredTransactions]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Actions Strip */}
      <div className="hallmark-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider">
            <Wallet className="w-4 h-4" />
            <span>{activeWorkspace?.name || 'Workspace'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)] tracking-tight">
            {t('nav_dashboard')}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-ink-2)] max-w-xl">
            {language === 'fa'
              ? 'نمای کلی وضعیت مالی، تراز درآمد و مخارج در واحد پول کرون دانمارک (DKK)'
              : 'Overview of your monthly cashflow, savings targets, and financial ledger.'}
          </p>
        </div>

        {/* Action Buttons */}
        {canEdit && (
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onOpenTransactionModal('expense')}
              className="hallmark-btn-primary flex items-center gap-2 text-xs sm:text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('expense')}</span>
            </button>

            <button
              onClick={() => onOpenTransactionModal('income')}
              className="hallmark-btn-secondary flex items-center gap-2 text-xs sm:text-sm text-[var(--color-success)]"
            >
              <TrendingUp className="w-4 h-4" />
              <span>{t('income')}</span>
            </button>
          </div>
        )}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title={t('total_balance')}
          amount={formatCurrency(totalBalance, currency, language)}
          subtitle={language === 'fa' ? 'موجودی کل کیف‌پول' : 'All-time wallet balance'}
          variant="default"
          icon={Wallet}
        />

        <StatCard
          title={t('monthly_income')}
          amount={formatCurrency(totalIncome, currency, language)}
          subtitle={language === 'fa' ? 'درآمد این ماه' : 'Total monthly inflows'}
          variant="income"
          icon={ArrowUpRight}
        />

        <StatCard
          title={t('monthly_expense')}
          amount={formatCurrency(totalExpense, currency, language)}
          subtitle={language === 'fa' ? 'مخارج این ماه' : 'Total monthly outflows'}
          variant="expense"
          icon={ArrowDownRight}
        />

        <StatCard
          title={t('savings_rate')}
          amount={`${savingsRate}%`}
          subtitle={formatCurrency(netSavings, currency, language)}
          variant="savings"
          icon={TrendingUp}
        />
      </div>

      {/* Main Grid: Spending Breakdown & Recent Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Category Spending Breakdown */}
        <div className="lg:col-span-2 hallmark-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[var(--color-paper-3)] border border-[var(--color-rule)] text-[var(--color-ink)]">
                <PieChart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[var(--color-ink)]">
                  {t('spending_by_category')}
                </h2>
                <p className="text-xs text-[var(--color-ink-2)]">
                  {filteredTransactions.filter((tx) => tx.type === 'expense').length} {language === 'fa' ? 'هزینه ثبت شده' : 'expenses recorded'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('analytics')}
              className="text-xs font-bold text-[var(--color-accent)] hover:underline flex items-center gap-1"
            >
              <span>{t('nav_analytics')}</span>
              <ArrowUpRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          </div>

          {categoryBreakdown.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Receipt className="w-10 h-10 mx-auto text-[var(--color-ink-3)]" />
              <p className="text-xs">{t('no_transactions_month')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categoryBreakdown.map(({ cat, amount, percent }) => (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-2.5">
                      <CategoryIcon category={cat} size={18} />
                      <span className="font-semibold text-[var(--color-ink)]">
                        {language === 'fa' ? cat.name_fa : cat.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[var(--color-ink)] tabular-nums">
                        {formatCurrency(amount, currency, language)}
                      </span>
                      <span className="text-[11px] font-bold text-[var(--color-ink-2)] w-10 text-end tabular-nums">
                        {percent}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-[var(--color-paper-3)] h-2 rounded-full overflow-hidden border border-[var(--color-rule)]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: cat.color || 'var(--color-accent)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Recent Transactions */}
        <div className="hallmark-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[var(--color-paper-3)] border border-[var(--color-rule)] text-[var(--color-ink)]">
                <Receipt className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-[var(--color-ink)]">
                {t('recent_transactions')}
              </h2>
            </div>

            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs font-bold text-[var(--color-accent)] hover:underline"
            >
              {t('view_all')}
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <p className="text-xs">{t('no_transactions_month')}</p>
              {canEdit && (
                <button
                  onClick={() => onOpenTransactionModal('expense')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-accent)] hover:underline mt-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('add_first_transaction')}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((tx) => {
                const cat = getCategoryById(tx.category_id);
                const isIncome = tx.type === 'income';

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[var(--color-paper)] border border-[var(--color-rule)] hover:border-[var(--color-accent)] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: `${cat.color}15`,
                          borderColor: `${cat.color}30`,
                          color: cat.color,
                        }}
                      >
                        <CategoryIcon category={cat} size={16} />
                      </div>

                      <div className="truncate">
                        <div className="text-xs font-bold text-[var(--color-ink)] truncate flex items-center gap-1.5">
                          <span>{language === 'fa' ? cat.name_fa : cat.name}</span>
                          {tx.is_recurring && (
                            <Repeat className="w-3 h-3 text-[var(--color-accent)]" />
                          )}
                        </div>
                        <div className="text-[11px] text-[var(--color-ink-3)]">
                          {formatDateDisplay(tx.date, calendar, language)}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`text-xs font-extrabold tabular-nums shrink-0 ${
                        isIncome ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatCurrency(tx.amount, currency, language)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
