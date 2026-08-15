import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CategoryIcon } from './CategoryIcon';
import { DEFAULT_CATEGORIES } from '../utils/categories';
import { getTodayISOString } from '../utils/date';
import type { Transaction, TransactionType } from '../types';
import {
  X,
  TrendingDown,
  TrendingUp,
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
  const {
    addTransaction,
    updateTransaction,
    currency,
    language,
    canEdit,
    t,
  } = useApp();

  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(getTodayISOString());
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'bank_transfer' | 'crypto'>('card');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // Filter categories by type
  const availableCategories = DEFAULT_CATEGORIES.filter((c) => c.type === type);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(String(editingTransaction.amount));
      setCategoryId(editingTransaction.category_id);
      setDate(editingTransaction.date);
      setNote(editingTransaction.note || '');
      setPaymentMethod(editingTransaction.payment_method || 'card');
      setTags(editingTransaction.tags || []);
    } else {
      setType(initialType);
      setAmount('');
      const defaultCat = DEFAULT_CATEGORIES.find((c) => c.type === initialType);
      setCategoryId(defaultCat ? defaultCat.id : DEFAULT_CATEGORIES[0].id);
      setDate(getTodayISOString());
      setNote('');
      setPaymentMethod('card');
      setTags([]);
    }
  }, [editingTransaction, initialType, isOpen]);

  // When type changes, ensure valid category
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const validCat = DEFAULT_CATEGORIES.find((c) => c.type === newType);
    if (validCat) {
      setCategoryId(validCat.id);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, {
        type,
        amount: numAmount,
        category_id: categoryId,
        date,
        note: note.trim() || undefined,
        payment_method: paymentMethod,
        tags,
      });
    } else {
      addTransaction({
        type,
        amount: numAmount,
        category_id: categoryId,
        date,
        note: note.trim() || undefined,
        payment_method: paymentMethod,
        tags,
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
      <div className="glass-modal w-full max-w-lg rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            {editingTransaction ? t('edit_transaction') : t('add_transaction')}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4.5 mt-4">
          {/* Income vs Expense Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
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
              onClick={() => handleTypeChange('income')}
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

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('amount')} ({currency})
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t('amount_placeholder')}
                autoFocus
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xl font-black border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Category Picker (Icons Grid) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('select_category')}
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
              {availableCategories.map((cat) => {
                const isSelected = cat.id === categoryId;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 ring-2 ring-indigo-500/30'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center mb-1 shadow-sm"
                      style={{ backgroundColor: `${cat.color}25`, color: cat.color }}
                    >
                      <CategoryIcon category={cat} size={16} />
                    </div>
                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-full">
                      {language === 'fa' ? cat.name_fa : cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('date_label')}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('payment_method')}
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="card">{t('method_card')}</option>
                <option value="cash">{t('method_cash')}</option>
                <option value="bank_transfer">{t('method_bank')}</option>
                <option value="crypto">{t('method_crypto')}</option>
              </select>
            </div>
          </div>

          {/* Note / Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('note')}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('note_placeholder')}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder={t('tags_placeholder')}
                className="flex-1 px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
              >
                + Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((tg) => (
                  <span
                    key={tg}
                    className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium"
                  >
                    #{tg}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tg)}
                      className="hover:text-rose-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-black text-white shadow-md active:scale-95 transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25'
              }`}
            >
              {editingTransaction ? t('save') : t('add_transaction')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
