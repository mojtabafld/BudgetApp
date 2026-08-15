import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { UserRole } from '../types';
import {
  X,
  Copy,
  Check,
  Trash2,
  Share2,
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const {
    activeWorkspace,
    currentUser,
    currentUserRole,
    addMemberToWorkspace,
    updateMemberRole,
    removeMemberFromWorkspace,
    t,
  } = useApp();

  const [inviteInput, setInviteInput] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('editor');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isOwner = currentUserRole === 'owner';

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteInput.trim()) return;
    addMemberToWorkspace(inviteInput.trim(), inviteRole);
    setInviteInput('');
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/?join=${activeWorkspace.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
      <div className="glass-modal w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {t('manage_members')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Copy Invite Link */}
        <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-between gap-2">
          <div className="truncate text-xs text-indigo-900 dark:text-indigo-200">
            <span className="font-bold">{activeWorkspace.name}</span>
          </div>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? t('link_copied') : t('copy_invite_link')}</span>
          </button>
        </div>

        {/* Invite Form (if owner) */}
        {isOwner && (
          <form onSubmit={handleInvite} className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {t('invite_member')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value)}
                placeholder={t('member_email_placeholder')}
                required
                className="flex-1 px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as UserRole)}
                className="px-2.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs border border-slate-200 dark:border-slate-700 font-semibold"
              >
                <option value="editor">{t('role_editor')}</option>
                <option value="viewer">{t('role_viewer')}</option>
              </select>
              <button
                type="submit"
                className="px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
              >
                +
              </button>
            </div>
          </form>
        )}

        {/* Members List */}
        <div className="space-y-2 max-h-56 overflow-y-auto pt-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {t('nav_members')} ({activeWorkspace.members.length})
          </div>
          {activeWorkspace.members.map((m) => {
            const isSelf = m.user_id === currentUser.id;
            const isMemberOwner = m.role === 'owner';

            return (
              <div
                key={m.user_id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <img
                    src={m.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                    alt={m.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="truncate">
                    <div className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                      {m.name} {isSelf && '(You)'}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{m.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isOwner && !isMemberOwner && !isSelf ? (
                    <select
                      value={m.role}
                      onChange={(e) => updateMemberRole(m.user_id, e.target.value as UserRole)}
                      className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-[11px] font-semibold"
                    >
                      <option value="editor">{t('role_editor')}</option>
                      <option value="viewer">{t('role_viewer')}</option>
                    </select>
                  ) : (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        m.role === 'owner'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : m.role === 'editor'
                          ? 'bg-blue-500/10 text-blue-600'
                          : 'bg-amber-500/10 text-amber-600'
                      }`}
                    >
                      {m.role === 'owner'
                        ? t('role_owner')
                        : m.role === 'editor'
                        ? t('role_editor')
                        : t('role_viewer')}
                    </span>
                  )}

                  {isOwner && !isMemberOwner && !isSelf && (
                    <button
                      onClick={() => removeMemberFromWorkspace(m.user_id)}
                      className="p-1 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
