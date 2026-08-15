import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ExpenseDonutChart, IncomeExpenseLineChart } from './Charts';
import { CategoryIcon, getCategoryById } from './CategoryIcon';
import { formatCurrency } from '../utils/currency';
import { getRecentMonthKeys, formatMonthDisplay } from '../utils/date';
import {
  TrendingUp,
  PieChart,
  Lightbulb,
  Award,
  Sparkles,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const {
    filteredTransactions,
    transactions,
    activeWorkspace,
    selectedMonth,
    currency,
    language,
    calendar,
    t,
  } = useApp();

  // 1. Current Month Category Breakdown
  const { totalIncome, totalExpense, categoryExpenses, sortedCategories } = useMemo(() => {
    let income = 0;
    let expense = 0;
    const catMap: Record<string, { total: number; count: number }> = {};

    filteredTransactions.forEach((tx) => {
      if (tx.type === 'income') {
        income += tx.amount;
      } else {
        expense += tx.amount;
        if (!catMap[tx.category_id]) {
          catMap[tx.category_id] = { total: 0, count: 0 };
        }
        catMap[tx.category_id].total += tx.amount;
        catMap[tx.category_id].count += 1;
      }
    });

    const categoryTotals: Record<string, number> = {};
    Object.keys(catMap).forEach((k) => {
      categoryTotals[k] = catMap[k].total;
    });

    const sorted = Object.entries(catMap)
      .map(([catId, val]) => ({
        categoryId: catId,
        total: val.total,
        count: val.count,
        percentage: expense > 0 ? (val.total / expense) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    return {
      totalIncome: income,
      totalExpense: expense,
      categoryExpenses: categoryTotals,
      sortedCategories: sorted,
    };
  }, [filteredTransactions]);

  // 2. Six-Month Trend Data for Line Chart
  const recentMonthKeys = useMemo(() => {
    return getRecentMonthKeys(selectedMonth, 6);
  }, [selectedMonth]);

  const { trendIncome, trendExpense } = useMemo(() => {
    if (!activeWorkspace) return { trendIncome: [], trendExpense: [] };

    const incList: number[] = [];
    const expList: number[] = [];

    recentMonthKeys.forEach((mKey) => {
      const monthTxs = transactions.filter(
        (tx) => tx.workspace_id === activeWorkspace.id && tx.date.startsWith(mKey)
      );
      const inc = monthTxs.filter((t) => t.type === 'income').reduce((a, b) => a + b.amount, 0);
      const exp = monthTxs.filter((t) => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
      incList.push(inc);
      expList.push(exp);
    });

    return { trendIncome: incList, trendExpense: expList };
  }, [transactions, activeWorkspace, recentMonthKeys]);

  // Savings insight calculation
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;
  const topCategory = sortedCategories[0] ? getCategoryById(sortedCategories[0].categoryId) : null;
  const topCategoryAmount = sortedCategories[0] ? sortedCategories[0].total : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('nav_analytics')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {formatMonthDisplay(selectedMonth, calendar, language)} • {activeWorkspace?.name}
          </p>
        </div>
      </div>

      {/* Smart Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Insight 1: Savings Status */}
        <div className="glass-card rounded-3xl p-5 border-l-4 border-l-emerald-500 flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>{t('financial_insights')}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {savingsRate >= 15
                ? t('insight_savings_good', { rate: savingsRate })
                : t('insight_savings_low', { rate: 100 - savingsRate })}
            </p>
          </div>
        </div>

        {/* Insight 2: Top Expense Category */}
        <div className="glass-card rounded-3xl p-5 border-l-4 border-l-indigo-500 flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900 dark:text-white mb-1">
              {t('top_spending_categories')}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {topCategory
                ? t('insight_top_cat', {
                    cat: language === 'fa' ? topCategory.name_fa : topCategory.name,
                    amount: formatCurrency(topCategoryAmount, currency, language),
                  })
                : t('no_transactions_month')}
            </p>
          </div>
        </div>
      </div>

      {/* 6-Month Income vs Expense Trend (Line Chart) */}
      <div className="glass-card rounded-3xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
              {t('income_vs_expense')}
            </h2>
          </div>
          <span className="text-xs text-slate-400">6 {t('nav_analytics')}</span>
        </div>

        <IncomeExpenseLineChart
          monthKeys={recentMonthKeys}
          incomeData={trendIncome}
          expenseData={trendExpense}
        />
      </div>

      {/* Grid: Expense Donut Chart + Category Breakdown Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Donut Chart (5 Cols) */}
        <div className="lg:col-span-5 glass-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-indigo-500" />
            <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
              {t('expense_breakdown')}
            </h2>
          </div>

          <ExpenseDonutChart categoryTotals={categoryExpenses} totalExpense={totalExpense} />
        </div>

        {/* Detailed Breakdown Table (7 Cols) */}
        <div className="lg:col-span-7 glass-card rounded-3xl p-5 sm:p-6">
          <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white mb-4">
            {t('top_spending_categories')}
          </h2>

          {sortedCategories.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-slate-400">
              {t('no_transactions_month')}
            </div>
          ) : (
            <div className="space-y-3">
              {sortedCategories.map((item) => {
                const cat = getCategoryById(item.categoryId);
                return (
                  <div
                    key={item.categoryId}
                    className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                        >
                          <CategoryIcon category={cat} size={18} />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {language === 'fa' ? cat.name_fa : cat.name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {item.count} {t('nav_transactions')}
                          </div>
                        </div>
                      </div>

                      <div className="text-end">
                        <div className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                          {formatCurrency(item.total, currency, language)}
                        </div>
                        <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                          {item.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: cat.color,
                        }}
                      />
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
