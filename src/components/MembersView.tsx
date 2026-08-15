import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { UserRole } from '../types';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Edit3,
  Eye,
  Trash2,
  Copy,
  Check,
  Mail,
  Lock,
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

  const [emailOrName, setEmailOrName] = useState('');
  const [role, setRole] = useState<UserRole>('editor');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!activeWorkspace) {
    return (
      <div className="p-8 text-center text-slate-400">
        No active workspace selected.
      </div>
    );
  }

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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>{t('members_title')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {activeWorkspace.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            {t('members_desc')}
          </p>
        </div>

        {/* Copy Invite Link */}
        <button
          onClick={handleCopyLink}
          className="self-start md:self-center flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-indigo-500" />}
          <span>{copied ? t('copied') : t('copy_invite_link')}</span>
        </button>
      </div>

      {/* Grid: Invite Box & Members List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Invite Form / Role Permissions Info */}
        <div className="space-y-6">
          {/* Invite Card */}
          <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('invite_member')}
              </h2>
            </div>

            {isOwner ? (
              <form onSubmit={handleAddMember} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    {t('email_or_name')}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="user@example.com"
                      value={emailOrName}
                      onChange={(e) => setEmailOrName(e.target.value)}
                      className="w-full ps-10 pe-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    {t('role')}
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="editor">{t('role_editor')} (Can Add/Edit Data)</option>
                    <option value="viewer">{t('role_viewer')} (View Only)</option>
                  </select>
                </div>

                {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
                {success && <p className="text-xs text-emerald-500 font-medium">{success}</p>}

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{t('add_member_btn')}</span>
                </button>
              </form>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Restricted Permission</span>
                </div>
                <p>Only the owner of this workspace ({activeWorkspace.name}) can invite new members.</p>
              </div>
            )}
          </div>

          {/* Role Explanations */}
          <div className="glass-card p-5 rounded-3xl space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Permission Types
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{t('role_owner')}</span>
                  <p className="text-[11px] text-slate-400">Full workspace control, invitations, and limits.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <Edit3 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{t('role_editor')}</span>
                  <p className="text-[11px] text-slate-400">Can view and add/edit/delete shared transactions.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <Eye className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{t('role_viewer')}</span>
                  <p className="text-[11px] text-slate-400">Read-only live visibility with editing locked.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Active Members Table */}
        <div className="lg:col-span-2 glass-card p-5 sm:p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t('members_list')} ({activeWorkspace.members?.length || 1})
            </h2>
          </div>

          <div className="space-y-3">
            {activeWorkspace.members?.map((member) => {
              const isSelf = member.user_id === currentUser?.id;
              const isWsOwner = member.user_id === activeWorkspace.owner_id;

              return (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 transition-all hover:border-indigo-500/30"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`}
                      alt={member.name}
                      className="w-11 h-11 rounded-2xl object-cover ring-2 ring-slate-200 dark:ring-slate-700 shadow-sm"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{member.name}</span>
                        {isSelf && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                            {t('you')}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">{member.email}</div>
                    </div>
                  </div>

                  {/* Actions & Role Selector */}
                  <div className="flex items-center gap-3">
                    {isWsOwner ? (
                      <span className="flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                        <ShieldCheck className="w-4 h-4" />
                        {t('role_owner')}
                      </span>
                    ) : isOwner ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={member.role}
                          onChange={(e) => updateMemberRole(member.user_id, e.target.value as UserRole)}
                          className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="editor">{t('role_editor')}</option>
                          <option value="viewer">{t('role_viewer')}</option>
                        </select>
                        <button
                          onClick={() => removeMemberFromWorkspace(member.user_id)}
                          className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          title={t('remove_member')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                        {member.role === 'editor' ? (
                          <>
                            <Edit3 className="w-4 h-4 text-blue-500" />
                            {t('role_editor')}
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 text-amber-500" />
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
      </div>
    </div>
  );
};
