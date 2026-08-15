import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from './StatCard';
import { ExpenseDonutChart } from './Charts';
import { CategoryIcon, getCategoryById } from './CategoryIcon';
import { formatCurrency } from '../utils/currency';
import { formatDateDisplay } from '../utils/date';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  AlertCircle,
  Receipt,
} from 'lucide-react';
import type { NavTab } from './Sidebar';

interface DashboardViewProps {
  setActiveTab: (tab: NavTab) => void;
  onOpenTransactionModal: (type?: 'income' | 'expense') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenTransactionModal,
}) => {
  const {
    filteredTransactions,
    transactions,
    activeWorkspace,
    currency,
    language,
    calendar,
    isViewerOnly,
    budgetLimits,
    selectedMonth,
    t,
  } = useApp();

  // Calculate Monthly Metrics
  const { totalIncome, totalExpense, netSavings, savingsRate, categoryExpenses } = useMemo(() => {
    let income = 0;
    let expense = 0;
    const catMap: Record<string, number> = {};

    filteredTransactions.forEach((tx) => {
      if (tx.type === 'income') {
        income += tx.amount;
      } else {
        expense += tx.amount;
        catMap[tx.category_id] = (catMap[tx.category_id] || 0) + tx.amount;
      }
    });

    const net = income - expense;
    const rate = income > 0 ? Math.max(0, Math.round((net / income) * 100)) : 0;

    return {
      totalIncome: income,
      totalExpense: expense,
      netSavings: net,
      savingsRate: rate,
      categoryExpenses: catMap,
    };
  }, [filteredTransactions]);

  // Overall workspace balance across all time
  const overallBalance = useMemo(() => {
    if (!activeWorkspace) return 0;
    const wsTxs = transactions.filter((t) => t.workspace_id === activeWorkspace.id);
    const inc = wsTxs.filter((t) => t.type === 'income').reduce((acc, c) => acc + c.amount, 0);
    const exp = wsTxs.filter((t) => t.type === 'expense').reduce((acc, c) => acc + c.amount, 0);
    return inc - exp;
  }, [transactions, activeWorkspace]);

  // Top 5 recent transactions
  const recentTxs = useMemo(() => {
    return [...filteredTransactions].slice(0, 5);
  }, [filteredTransactions]);

  // Budget status
  const currentMonthBudgets = useMemo(() => {
    return budgetLimits.filter(
      (b) => b.workspace_id === activeWorkspace?.id && b.month === selectedMonth
    );
  }, [budgetLimits, activeWorkspace, selectedMonth]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Viewer Only Mode Warning Banner */}
      {isViewerOnly && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-sm">
          <Eye className="w-5 h-5 shrink-0 text-amber-500" />
          <div className="flex-1">
            <span className="font-bold">{t('role_viewer_badge')}: </span>
            {t('role_viewer_warning')}
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('total_balance')}
          amount={formatCurrency(overallBalance, currency, language)}
          icon={Wallet}
          variant="primary"
          subtitle={activeWorkspace?.name}
        />
        <StatCard
          title={t('monthly_income')}
          amount={formatCurrency(totalIncome, currency, language)}
          icon={TrendingUp}
          variant="success"
          trend={{ value: `${formatCurrency(totalIncome, currency, language)}`, isPositive: true }}
        />
        <StatCard
          title={t('monthly_expense')}
          amount={formatCurrency(totalExpense, currency, language)}
          icon={TrendingDown}
          variant="danger"
          trend={{ value: `${formatCurrency(totalExpense, currency, language)}`, isPositive: false }}
        />
        <StatCard
          title={t('savings_rate')}
          amount={`${savingsRate}%`}
          icon={PiggyBank}
          variant={savingsRate >= 20 ? 'success' : 'warning'}
          subtitle={`${t('net_savings')}: ${formatCurrency(netSavings, currency, language)}`}
        />
      </div>

      {/* Quick Action Buttons (if editable) */}
      {!isViewerOnly && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenTransactionModal('expense')}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold text-sm transition-all active:scale-[0.98]"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>+ {t('expense')}</span>
          </button>
          <button
            onClick={() => onOpenTransactionModal('income')}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold text-sm transition-all active:scale-[0.98]"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>+ {t('income')}</span>
          </button>
        </div>
      )}

      {/* Main Grid: Expense Breakdown Donut & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Donut Chart: 5 Cols */}
        <div className="lg:col-span-5 glass-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
              {t('spending_by_category')}
            </h2>
            <button
              onClick={() => setActiveTab('analytics')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {t('view_all')}
            </button>
          </div>

          <ExpenseDonutChart categoryTotals={categoryExpenses} totalExpense={totalExpense} />
        </div>

        {/* Right / Recent Transactions: 7 Cols */}
        <div className="lg:col-span-7 glass-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-500" />
              <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                {t('recent_transactions')}
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {t('view_all')}
            </button>
          </div>

          {recentTxs.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6">
              <Receipt className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('no_transactions_month')}
              </p>
              {!isViewerOnly && (
                <button
                  onClick={() => onOpenTransactionModal('expense')}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <PlusCircle className="w-4 h-4" />
                  {t('add_first_transaction')}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentTxs.map((tx) => {
                const cat = getCategoryById(tx.category_id);
                const isIncome = tx.type === 'income';
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                        style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                      >
                        <CategoryIcon category={cat} size={18} />
                      </div>

                      <div className="text-start truncate">
                        <div className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">
                          {language === 'fa' ? cat.name_fa : cat.name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>{formatDateDisplay(tx.date, calendar, language)}</span>
                          {tx.created_by && (
                            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400">
                              • {tx.created_by.name}
                            </span>
                          )}
                          {tx.note && (
                            <span className="hidden md:inline text-slate-400 truncate max-w-[150px]">
                              • {tx.note}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`text-sm sm:text-base font-extrabold shrink-0 ${
                        isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
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

      {/* Bottom Section: Category Budget Targets summary */}
      {currentMonthBudgets.length > 0 && (
        <div className="glass-card rounded-3xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
              {t('monthly_budget_targets')}
            </h2>
            <button
              onClick={() => setActiveTab('budgets')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {t('view_all')}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentMonthBudgets.slice(0, 3).map((b) => {
              const cat = getCategoryById(b.category_id);
              const spent = categoryExpenses[b.category_id] || 0;
              const percent = Math.min(100, Math.round((spent / b.limit_amount) * 100));
              const isOver = spent > b.limit_amount;

              return (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                      >
                        <CategoryIcon category={cat} size={16} />
                      </div>
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                        {language === 'fa' ? cat.name_fa : cat.name}
                      </span>
                    </div>
                    {isOver && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500">
                        <AlertCircle className="w-3 h-3" />
                        {t('over_budget')}
                      </span>
                    )}
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden my-2.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver
                          ? 'bg-rose-500'
                          : percent > 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      {t('spent')}: {formatCurrency(spent, currency, language)}
                    </span>
                    <span>
                      {t('budget_limit')}: {formatCurrency(b.limit_amount, currency, language)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
