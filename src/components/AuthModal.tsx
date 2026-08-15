import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, User, UserCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { users, currentUser, switchUser, createAccount, t } = useApp();

  const [mode, setMode] = useState<'switch' | 'create'>('switch');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    createAccount(name.trim(), email.trim());
    setName('');
    setEmail('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
      <div className="glass-modal w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {t('switch_user')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setMode('switch')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'switch'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            {t('demo_accounts')}
          </button>
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'create'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            + New Account
          </button>
        </div>

        {mode === 'switch' ? (
          <div className="space-y-2 py-2">
            <div className="text-xs text-slate-400 mb-2 leading-relaxed">
              Select a demo user to test different collaborative roles (Owner, Editor, Viewer):
            </div>
            {users.map((u) => {
              const isCurrent = u.id === currentUser.id;
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    switchUser(u.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 text-start">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700"
                    />
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        {u.name}
                      </div>
                      <div className="text-xs text-slate-400">{u.email}</div>
                    </div>
                  </div>
                  {isCurrent && <UserCheck className="w-5 h-5 text-indigo-500" />}
                </button>
              );
            })}
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. David Miller"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="david@example.com"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
            >
              Create & Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
