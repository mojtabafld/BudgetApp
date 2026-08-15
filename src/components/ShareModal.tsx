import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { UserRole } from '../types';
import {
  X,
  UserPlus,
  ShieldCheck,
  Edit3,
  Eye,
  Trash2,
  Copy,
  Check,
  Users,
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

  const [emailOrName, setEmailOrName] = useState('');
  const [role, setRole] = useState<UserRole>('editor');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen || !activeWorkspace) return null;

  const isOwner = currentUserRole === 'owner';

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!emailOrName.trim()) {
      setError(t('invalid_email'));
      return;
    }

    const ok = addMemberToWorkspace(emailOrName.trim(), role);
    if (ok) {
      setSuccess(t('invite_success'));
      setEmailOrName('');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError('Could not add member');
    }
  };

  const handleCopyLink = () => {
    const inviteUrl = `${window.location.origin}/join?ws=${activeWorkspace.id}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
      <div className="glass-modal w-full max-w-lg rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {t('manage_members')}
              </h2>
              <p className="text-xs text-slate-400">
                {activeWorkspace.name}
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

        {/* Invite New Member Form (Only Owner can invite) */}
        {isOwner ? (
          <form onSubmit={handleAddMember} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {t('invite_member')}
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder={t('email_or_name')}
                value={emailOrName}
                onChange={(e) => setEmailOrName(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="editor">{t('role_editor')} (Can Edit)</option>
                <option value="viewer">{t('role_viewer')} (View Only)</option>
              </select>
              <button
                type="submit"
                className="py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>{t('add_member_btn')}</span>
              </button>
            </div>

            {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
            {success && <p className="text-xs text-emerald-500 font-medium">{success}</p>}
          </form>
        ) : (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <Eye className="w-4 h-4 shrink-0" />
            <span>Only the workspace owner can invite or modify member permissions.</span>
          </div>
        )}

        {/* Members List */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            {t('members_list')} ({activeWorkspace.members?.length || 1})
          </label>

          <div className="max-h-60 overflow-y-auto space-y-2 pe-1">
            {activeWorkspace.members?.map((member) => {
              const isSelf = member.user_id === currentUser?.id;
              const isWsOwner = member.user_id === activeWorkspace.owner_id;

              return (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`}
                      alt={member.name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <span>{member.name}</span>
                        {isSelf && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {t('you')}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{member.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isWsOwner ? (
                      <span className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {t('role_owner')}
                      </span>
                    ) : isOwner ? (
                      <>
                        <select
                          value={member.role}
                          onChange={(e) => updateMemberRole(member.user_id, e.target.value as UserRole)}
                          className="text-[11px] font-bold px-2 py-1 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:outline-none"
                        >
                          <option value="editor">{t('role_editor')}</option>
                          <option value="viewer">{t('role_viewer')}</option>
                        </select>
                        <button
                          onClick={() => removeMemberFromWorkspace(member.user_id)}
                          className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title={t('remove_member')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl">
                        {member.role === 'editor' ? (
                          <>
                            <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                            {t('role_editor')}
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5 text-amber-500" />
                            {t('role_viewer')}
                          </>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Share Link Box */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? t('copied') : t('copy_invite_link')}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {t('modal_cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};
