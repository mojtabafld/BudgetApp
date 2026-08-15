import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { UserRole } from '../types';
import {
  UserPlus,
  ShieldCheck,
  Edit3,
  Eye,
  Trash2,
  Copy,
  Check,
  Info,
} from 'lucide-react';

export const MembersView: React.FC = () => {
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
  const [errorMsg, setErrorMsg] = useState('');

  const isOwner = currentUserRole === 'owner';

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!inviteInput.trim()) return;

    const success = addMemberToWorkspace(inviteInput.trim(), inviteRole);
    if (success) {
      setInviteInput('');
    } else {
      setErrorMsg('Failed to invite member. Make sure you have owner permissions.');
    }
  };

  const handleCopyShareLink = () => {
    const link = `${window.location.origin}/?join=${activeWorkspace.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('nav_members')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {activeWorkspace?.name} • {activeWorkspace?.members.length} {t('nav_members')}
          </p>
        </div>

        {/* Copy Share Link Button */}
        <button
          onClick={handleCopyShareLink}
          className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs sm:text-sm border border-indigo-200 dark:border-indigo-800 transition-all active:scale-95"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? t('link_copied') : t('copy_invite_link')}</span>
        </button>
      </div>

      {/* Permission Roles Explanation Card */}
      <div className="glass-card rounded-3xl p-5 border-l-4 border-l-indigo-500">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {t('manage_members')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <strong>{t('role_owner')}</strong>: Full control, manage members & budget settings. <br />
              <strong>{t('role_editor')}</strong>: Can view, add, edit, and delete transactions in real-time. <br />
              <strong>{t('role_viewer')}</strong>: Can view all transactions and charts with read-only access (no editing allowed).
            </p>
          </div>
        </div>
      </div>

      {/* Invite New Member Section (if owner) */}
      {isOwner && (
        <div className="glass-card rounded-3xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5 text-indigo-500" />
            <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
              {t('invite_member')}
            </h2>
          </div>

          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value)}
                placeholder={t('member_email_placeholder')}
                required
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="w-full sm:w-48">
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as UserRole)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="editor">{t('role_editor')}</option>
                <option value="viewer">{t('role_viewer')}</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 active:scale-95 transition-all shrink-0"
            >
              {t('add_member_btn')}
            </button>
          </form>

          {errorMsg && <p className="text-xs text-rose-500 mt-2">{errorMsg}</p>}
        </div>
      )}

      {/* Members List */}
      <div className="glass-card rounded-3xl p-5 sm:p-6">
        <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white mb-4">
          {t('nav_members')} ({activeWorkspace?.members.length})
        </h2>

        <div className="space-y-3">
          {activeWorkspace?.members.map((member) => {
            const isSelf = member.user_id === currentUser.id;
            const isMemberOwner = member.role === 'owner';

            return (
              <div
                key={member.user_id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60"
              >
                {/* Member Info */}
                <div className="flex items-center gap-3.5 truncate">
                  <img
                    src={member.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                    alt={member.name}
                    className="w-11 h-11 rounded-full ring-2 ring-indigo-500/30 object-cover shrink-0"
                  />
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                        {member.name}
                      </span>
                      {isSelf && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 truncate">{member.email}</div>
                  </div>
                </div>

                {/* Role & Permissions Action */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  {/* Role Badge / Switcher */}
                  {isOwner && !isMemberOwner && !isSelf ? (
                    <select
                      value={member.role}
                      onChange={(e) => updateMemberRole(member.user_id, e.target.value as UserRole)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-600 focus:outline-none"
                    >
                      <option value="editor">{t('role_editor')}</option>
                      <option value="viewer">{t('role_viewer')}</option>
                    </select>
                  ) : (
                    <div
                      className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl ${
                        member.role === 'owner'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : member.role === 'editor'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {member.role === 'owner' && <ShieldCheck className="w-3.5 h-3.5" />}
                      {member.role === 'editor' && <Edit3 className="w-3.5 h-3.5" />}
                      {member.role === 'viewer' && <Eye className="w-3.5 h-3.5" />}
                      <span>
                        {member.role === 'owner'
                          ? t('role_owner')
                          : member.role === 'editor'
                          ? t('role_editor')
                          : t('role_viewer')}
                      </span>
                    </div>
                  )}

                  {/* Remove Member Button */}
                  {isOwner && !isMemberOwner && !isSelf && (
                    <button
                      onClick={() => removeMemberFromWorkspace(member.user_id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                      title="Remove Member"
                    >
                      <Trash2 className="w-4 h-4" />
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
