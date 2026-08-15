import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { CurrencyCode } from '../types';
import { CURRENCIES } from '../utils/currency';
import { X, Wallet } from 'lucide-react';

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({ isOpen, onClose }) => {
  const { createWorkspace, language, t } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('DKK');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createWorkspace(name.trim(), description.trim() || undefined, currency);
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
      <div className="glass-modal w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {t('create_workspace')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Wallet / Workspace Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vacation Trip 2026, Office Team, Home Budget"
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('currency')}
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
            >
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {language === 'fa' ? c.name_fa : c.name} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description..."
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
