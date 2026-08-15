import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/categories';
import { CategoryIcon } from './CategoryIcon';
import type { Transaction, TransactionType } from '../types';
import {
  X,
  PlusCircle,
  TrendingDown,
  TrendingUp,
  Tag,
  CreditCard,
  Banknote,
  Building2,
  Bitcoin,
  Calendar,
  FileText,
  Repeat,
} from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: TransactionType;
  editingTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  initialType = 'expense',
  editingTransaction,
}) => {
  const { addTransaction, updateTransaction, currency, t, language } = useApp();

  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<
    'cash' | 'card' | 'bank_transfer' | 'crypto'
  >('card');
  const [tagsInput, setTagsInput] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurringMonths, setRecurringMonths] = useState<number>(12);
  const [error, setError] = useState<string>('');

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setCategoryId(editingTransaction.category_id);
      setDate(editingTransaction.date);
      setNote(editingTransaction.note || '');
      setPaymentMethod(editingTransaction.payment_method || 'card');
      setTagsInput(editingTransaction.tags?.join(', ') || '');
      setIsRecurring(Boolean(editingTransaction.is_recurring));
      setRecurringMonths(editingTransaction.recurring_months || 12);
    } else {
      setType(initialType);
      setAmount('');
      setCategoryId(type === 'expense' ? EXPENSE_CATEGORIES[0].id : INCOME_CATEGORIES[0].id);
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
      setPaymentMethod('card');
      setTagsInput('');
      setIsRecurring(false);
      setRecurringMonths(12);
    }
    setError('');
  }, [editingTransaction, initialType, isOpen]);

  useEffect(() => {
    if (!editingTransaction) {
      setCategoryId(type === 'expense' ? EXPENSE_CATEGORIES[0].id : INCOME_CATEGORIES[0].id);
    }
  }, [type, editingTransaction]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError(t('required_field'));
      return;
    }

    if (!categoryId) {
      setError(t('required_field'));
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, {
        type,
        amount: parsedAmount,
        category_id: categoryId,
        date,
        note,
        payment_method: paymentMethod,
        tags,
        is_recurring: isRecurring,
        recurring_months: recurringMonths,
      });
    } else {
      addTransaction({
        type,
        amount: parsedAmount,
        category_id: categoryId,
        date,
        note,
        payment_method: paymentMethod,
        tags,
        is_recurring: isRecurring,
        recurring_months: recurringMonths,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-modal w-full max-w-lg rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${
                type === 'expense'
                  ? 'bg-rose-500 shadow-lg shadow-rose-500/25'
                  : 'bg-emerald-500 shadow-lg shadow-emerald-500/25'
              }`}
            >
              {type === 'expense' ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {editingTransaction ? t('edit_transaction') : t('add_transaction')}
              </h2>
              <p className="text-xs text-slate-400">
                {type === 'expense' ? t('expense') : t('income')} • {currency}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Toggle: Expense / Income */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              type === 'expense'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>{t('expense')}</span>
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              type === 'income'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{t('income')}</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('amount')} ({currency})
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                required
                placeholder={t('amount_placeholder')}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 text-xl font-black rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 tracking-tight"
                autoFocus
              />
              <span className="absolute end-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                {currency}
              </span>
            </div>
            {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
          </div>

          {/* Category Selector Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              {t('category')}
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1">
              {categories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/60 shadow-sm scale-95'
                        : 'border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <CategoryIcon category={cat} size={20} />
                    <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 truncate w-full">
                      {language === 'fa' ? cat.name_fa : cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('date_label')}
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full ps-10 pe-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Recurring Expense Feature Toggle (e.g. House Rent, Bills) */}
          {type === 'expense' && (
            <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Repeat className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {t('recurring_toggle')}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {t('recurring_desc')}
                    </div>
                  </div>
                </div>

                {/* Switch checkbox */}
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Repeat Duration selection if enabled */}
              {isRecurring && (
                <div className="pt-2 border-t border-indigo-200/40 dark:border-indigo-800/40 flex items-center justify-between gap-2 animate-in fade-in">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t('recurring_duration')}:
                  </span>
                  <select
                    value={recurringMonths}
                    onChange={(e) => setRecurringMonths(Number(e.target.value))}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={6}>{t('recurring_6_months')}</option>
                    <option value={12}>{t('recurring_12_months')}</option>
                    <option value={24}>{t('recurring_24_months')}</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('payment_method')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'card', label: t('method_card'), icon: CreditCard },
                { id: 'bank_transfer', label: t('method_bank'), icon: Building2 },
                { id: 'cash', label: t('method_cash'), icon: Banknote },
                { id: 'crypto', label: t('method_crypto'), icon: Bitcoin },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="truncate">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note / Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('note')}
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute start-3.5 top-3" />
              <input
                type="text"
                placeholder={t('note_placeholder')}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full ps-10 pe-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Tags
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('tags_placeholder')}
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full ps-10 pe-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 rounded-2xl text-white text-xs sm:text-sm font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
                type === 'expense'
                  ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/25'
                  : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('save')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
