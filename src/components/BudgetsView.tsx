import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CategoryIcon, getCategoryById } from './CategoryIcon';
import { DEFAULT_CATEGORIES } from '../utils/categories';
import { formatCurrency } from '../utils/currency';
import { formatMonthDisplay } from '../utils/date';
import { Target, PlusCircle, AlertCircle, CheckCircle2, Eye, ShieldAlert } from 'lucide-react';

export const BudgetsView: React.FC = () => {
  const {
    filteredTransactions,
    activeWorkspace,
    budgetLimits,
    setBudgetLimit,
    selectedMonth,
    currency,
    language,
    calendar,
    canEdit,
    t,
  } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState(DEFAULT_CATEGORIES[0].id);
  const [limitAmount, setLimitAmount] = useState('');

  // Calculate spending per category this month
  const categoryExpenses = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTransactions.forEach((tx) => {
      if (tx.type === 'expense') {
        map[tx.category_id] = (map[tx.category_id] || 0) + tx.amount;
      }
    });
    return map;
  }, [filteredTransactions]);

  // Current month budget limits
  const currentMonthBudgets = useMemo(() => {
    return budgetLimits.filter(
      (b) => b.workspace_id === activeWorkspace?.id && b.month === selectedMonth
    );
  }, [budgetLimits, activeWorkspace, selectedMonth]);

  // Summary Metrics
  const { totalBudgetSet, totalSpentInBudgets } = useMemo(() => {
    let budgetTotal = 0;
    let spentTotal = 0;
    currentMonthBudgets.forEach((b) => {
      budgetTotal += b.limit_amount;
      spentTotal += categoryExpenses[b.category_id] || 0;
    });
    return { totalBudgetSet: budgetTotal, totalSpentInBudgets: spentTotal };
  }, [currentMonthBudgets, categoryExpenses]);

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!limitAmount || isNaN(Number(limitAmount))) return;
    setBudgetLimit(selectedCatId, Number(limitAmount));
    setLimitAmount('');
    setModalOpen(false);
  };

  const expenseCategories = DEFAULT_CATEGORIES.filter((c) => c.type === 'expense');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('monthly_budget_targets')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {formatMonthDisplay(selectedMonth, calendar, language)} • {activeWorkspace?.name}
          </p>
        </div>

        {canEdit ? (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('set_budget')}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold">
            <Eye className="w-4 h-4" />
            <span>{t('role_viewer_badge')}</span>
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-3xl p-5">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            {t('budget_limit')}
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(totalBudgetSet, currency, language)}
          </div>
        </div>

        <div className="glass-card rounded-3xl p-5">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            {t('spent')}
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {formatCurrency(totalSpentInBudgets, currency, language)}
          </div>
        </div>

        <div className="glass-card rounded-3xl p-5">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            {t('remaining')}
          </div>
          <div
            className={`text-2xl font-black ${
              totalBudgetSet - totalSpentInBudgets >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrency(totalBudgetSet - totalSpentInBudgets, currency, language)}
          </div>
        </div>
      </div>

      {/* Budgets Grid */}
      <div className="glass-card rounded-3xl p-5 sm:p-6">
        {currentMonthBudgets.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6">
            <Target className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('no_budgets_set')}</p>
            {canEdit && (
              <button
                onClick={() => setModalOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <PlusCircle className="w-4 h-4" />
                {t('add_category_budget')}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentMonthBudgets.map((b) => {
              const cat = getCategoryById(b.category_id);
              const spent = categoryExpenses[b.category_id] || 0;
              const percent = Math.min(100, Math.round((spent / b.limit_amount) * 100));
              const isOver = spent > b.limit_amount;
              const isNear = percent >= 80 && !isOver;

              return (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                      >
                        <CategoryIcon category={cat} size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {language === 'fa' ? cat.name_fa : cat.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {percent}% {t('budget_used')}
                        </div>
                      </div>
                    </div>

                    <div>
                      {isOver ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          {t('over_budget')}
                        </span>
                      ) : isNear ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {percent}%
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {percent}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden my-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver
                          ? 'bg-rose-500'
                          : isNear
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs mt-2 text-slate-500 dark:text-slate-400 font-medium">
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
        )}
      </div>

      {/* Set Budget Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="glass-modal w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {t('set_budget')}
            </h2>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('category')}
                </label>
                <select
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {language === 'fa' ? c.name_fa : c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('budget_limit')} ({currency})
                </label>
                <input
                  type="number"
                  step="any"
                  value={limitAmount}
                  onChange={(e) => setLimitAmount(e.target.value)}
                  placeholder="500"
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
