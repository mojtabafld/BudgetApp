import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CategoryIcon, getCategoryById } from './CategoryIcon';
import { DEFAULT_CATEGORIES } from '../utils/categories';
import { formatCurrency } from '../utils/currency';
import { formatDateDisplay, formatMonthDisplay } from '../utils/date';
import type { Transaction, TransactionType } from '../types';
import {
  Search,
  PlusCircle,
  Edit2,
  Trash2,
  Receipt,
  CreditCard,
  Banknote,
  Building2,
  Coins,
  Eye,
  Tag,
  Repeat,
} from 'lucide-react';

interface TransactionsViewProps {
  onOpenTransactionModal: (type?: 'income' | 'expense', editingTx?: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ onOpenTransactionModal }) => {
  const {
    filteredTransactions,
    deleteTransaction,
    canEdit,
    selectedMonth,
    currency,
    language,
    calendar,
    t,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  // Filter & Sort
  const processedTransactions = useMemo(() => {
    return filteredTransactions
      .filter((tx) => {
        // Type filter
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
        // Category filter
        if (categoryFilter !== 'all' && tx.category_id !== categoryFilter) return false;
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const cat = getCategoryById(tx.category_id);
          const catNameEn = cat.name.toLowerCase();
          const catNameFa = cat.name_fa.toLowerCase();
          const note = (tx.note || '').toLowerCase();
          const tags = (tx.tags || []).join(' ').toLowerCase();
          const user = (tx.created_by?.name || '').toLowerCase();
          return (
            catNameEn.includes(q) ||
            catNameFa.includes(q) ||
            note.includes(q) ||
            tags.includes(q) ||
            user.includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return b.date.localeCompare(a.date);
        if (sortBy === 'date_asc') return a.date.localeCompare(b.date);
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        return 0;
      });
  }, [filteredTransactions, typeFilter, categoryFilter, searchQuery, sortBy]);

  const handleDelete = (tx: Transaction) => {
    if (!canEdit) return;
    if (window.confirm(t('confirm_delete'))) {
      deleteTransaction(tx.id);
    }
  };

  const getMethodIcon = (method?: string) => {
    switch (method) {
      case 'cash':
        return <Banknote className="w-3.5 h-3.5" />;
      case 'card':
        return <CreditCard className="w-3.5 h-3.5" />;
      case 'bank_transfer':
        return <Building2 className="w-3.5 h-3.5" />;
      case 'crypto':
        return <Coins className="w-3.5 h-3.5" />;
      default:
        return <CreditCard className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('nav_transactions')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {formatMonthDisplay(selectedMonth, calendar, language)} • {processedTransactions.length} {t('nav_transactions')}
          </p>
        </div>

        {canEdit ? (
          <button
            onClick={() => onOpenTransactionModal('expense')}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('add_transaction')}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold">
            <Eye className="w-4 h-4" />
            <span>{t('role_viewer_badge')}</span>
          </div>
        )}
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="glass-card rounded-3xl p-4 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_placeholder')}
            className="w-full ps-10 pe-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 border border-transparent dark:border-slate-700/50"
          />
        </div>

        {/* Filter Badges & Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                typeFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t('all_types')}
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                typeFilter === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t('expense_only')}
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                typeFilter === 'income'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t('income_only')}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-transparent dark:border-slate-700 focus:outline-none"
            >
              <option value="all">{t('all_categories')}</option>
              {DEFAULT_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {language === 'fa' ? c.name_fa : c.name}
                </option>
              ))}
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-transparent dark:border-slate-700 focus:outline-none"
            >
              <option value="date_desc">{t('date')} (Newest)</option>
              <option value="date_asc">{t('date')} (Oldest)</option>
              <option value="amount_desc">{t('amount')} (Highest)</option>
              <option value="amount_asc">{t('amount')} (Lowest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="glass-card rounded-3xl p-4 sm:p-6">
        {processedTransactions.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6">
            <Receipt className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('no_transactions_month')}
            </p>
            {canEdit && (
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
          <div className="space-y-3">
            {processedTransactions.map((tx) => {
              const cat = getCategoryById(tx.category_id);
              const isIncome = tx.type === 'income';

              return (
                <div
                  key={tx.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border border-slate-200/50 dark:border-slate-800/60 transition-all"
                >
                  {/* Left: Icon, Category, Note, Date, Tags */}
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm mt-0.5 sm:mt-0"
                      style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                    >
                      <CategoryIcon category={cat} size={20} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                          {language === 'fa' ? cat.name_fa : cat.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isIncome
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isIncome ? t('income') : t('expense')}
                        </span>
                        {tx.is_recurring && (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                            <Repeat className="w-3 h-3" />
                            <span>{t('recurring_badge')}</span>
                          </span>
                        )}
                      </div>

                      {/* Note & Meta */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span>{formatDateDisplay(tx.date, calendar, language)}</span>

                        {tx.note && <span className="font-medium text-slate-700 dark:text-slate-300">• {tx.note}</span>}

                        {tx.payment_method && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-700/60 text-[10px]">
                            {getMethodIcon(tx.payment_method)}
                            <span>{t(`method_${tx.payment_method}` as any)}</span>
                          </span>
                        )}

                        {tx.created_by && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                            <img
                              src={tx.created_by.avatar}
                              alt={tx.created_by.name}
                              className="w-4 h-4 rounded-full object-cover"
                            />
                            {tx.created_by.name}
                          </span>
                        )}
                      </div>

                      {/* Tags */}
                      {tx.tags && tx.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 mt-2">
                          {tx.tags.map((tg, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium"
                            >
                              <Tag className="w-2.5 h-2.5" />
                              {tg}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount & Action Buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-800">
                    <div
                      className={`text-base sm:text-lg font-black tracking-tight ${
                        isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatCurrency(tx.amount, currency, language)}
                    </div>

                    {/* Edit / Delete Buttons (disabled if viewer only) */}
                    {canEdit && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onOpenTransactionModal(tx.type, tx)}
                          className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                          title={t('edit_transaction')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx)}
                          className="p-1.5 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-500 transition-colors"
                          title={t('delete_transaction')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
