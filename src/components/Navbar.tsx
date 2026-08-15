import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatMonthDisplay, shiftMonth } from '../utils/date';
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Globe,
  Users,
  Wallet,
  ShieldCheck,
  Eye,
  Edit3,
  Check,
  Plus,
  LogOut,
  UserCheck,
} from 'lucide-react';

interface NavbarProps {
  onOpenShareModal: () => void;
  onOpenWorkspaceModal: () => void;
  onNavigateToMembers?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenShareModal,
  onOpenWorkspaceModal,
  onNavigateToMembers,
}) => {
  const {
    currentUser,
    workspaces,
    activeWorkspace,
    switchWorkspace,
    currentUserRole,
    isViewerOnly,
    isDbOnline,
    selectedMonth,
    setSelectedMonth,
    theme,
    setTheme,
    language,
    setLanguage,
    calendar,
    setCalendar,
    logout,
    t,
  } = useApp();

  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const wsRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wsRef.current && !wsRef.current.contains(e.target as Node)) {
        setWorkspaceMenuOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = () => {
    setSelectedMonth(shiftMonth(selectedMonth, -1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(shiftMonth(selectedMonth, +1));
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-card border-b border-slate-200/80 dark:border-slate-800/80 px-4 lg:px-6 py-2.5 safe-top">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left Side: Brand Logo & Workspace Picker */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="Budget Master" className="w-9 h-9 rounded-xl shadow-sm" />
            <div className="hidden sm:block">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-500 to-emerald-500 bg-clip-text text-transparent">
                {t('app_title')}
              </span>
            </div>
          </div>

          {/* Workspace Switcher */}
          <div className="relative" ref={wsRef}>
            <button
              onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium transition-all"
            >
              <Wallet className="w-4 h-4 text-indigo-500" />
              <span className="max-w-[110px] sm:max-w-[150px] truncate">
                {activeWorkspace?.name || 'My Wallet'}
              </span>
              {isDbOnline && (
                <span
                  className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                  title="Connected to PostgreSQL Database"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  DB
                </span>
              )}
              {isViewerOnly && (
                <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
                  <Eye className="w-3 h-3" />
                  {t('role_viewer')}
                </span>
              )}
            </button>

            {/* Workspace Dropdown Menu */}
            {workspaceMenuOpen && (
              <div className="absolute start-0 mt-2 w-64 glass-modal rounded-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 px-2 py-1 uppercase tracking-wider">
                  {t('workspace')}
                </div>
                <div className="space-y-1 my-1">
                  {workspaces.map((ws) => {
                    const isSelected = ws.id === activeWorkspace?.id;
                    const isOwner = ws.owner_id === currentUser?.id;
                    return (
                      <button
                        key={ws.id}
                        onClick={() => {
                          switchWorkspace(ws.id);
                          setWorkspaceMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Wallet className={`w-4 h-4 ${isSelected ? 'text-indigo-500' : 'text-slate-400'}`} />
                          <div className="text-start truncate">
                            <div className="truncate">{ws.name}</div>
                            <div className="text-[10px] text-slate-400">
                              {isOwner ? t('role_owner') : `${ws.members?.length || 1} members`}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-indigo-500" />}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setWorkspaceMenuOpen(false);
                      onOpenWorkspaceModal();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('create_workspace')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Month Navigator */}
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          <button
            onClick={language === 'fa' ? handleNextMonth : handlePrevMonth}
            className="p-1 sm:p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all active:scale-95"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
          </button>

          <div className="px-2 sm:px-3 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 min-w-[100px] sm:min-w-[130px] text-center tracking-tight">
            {formatMonthDisplay(selectedMonth, calendar, language)}
          </div>

          <button
            onClick={language === 'fa' ? handlePrevMonth : handleNextMonth}
            className="p-1 sm:p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all active:scale-95"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>

        {/* Right Side: Quick Toggles (Share, Language/Calendar, Theme, User) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Share Button (Desktop Quick Action) */}
          <button
            onClick={onOpenShareModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-semibold transition-all border border-indigo-200/50 dark:border-indigo-800/50"
            title={t('manage_members')}
          >
            <Users className="w-4 h-4" />
            <span>{t('share_button')}</span>
          </button>

          {/* Language & Calendar Toggle Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={`${t('language')} / ${t('calendar')}`}
            >
              <Globe className="w-4 h-4" />
            </button>

            {langMenuOpen && (
              <div className="absolute end-0 mt-2 w-52 glass-modal rounded-2xl p-2 z-50 animate-in fade-in zoom-in-95 space-y-2">
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 uppercase">
                    {t('language')}
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    <button
                      onClick={() => {
                        setLanguage('en');
                        setLangMenuOpen(false);
                      }}
                      className={`px-2 py-1.5 text-xs rounded-lg font-medium transition-all ${
                        language === 'en'
                          ? 'bg-indigo-600 text-white'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      English (EN)
                    </button>
                    <button
                      onClick={() => {
                        setLanguage('fa');
                        setLangMenuOpen(false);
                      }}
                      className={`px-2 py-1.5 text-xs rounded-lg font-medium font-persian transition-all ${
                        language === 'fa'
                          ? 'bg-indigo-600 text-white'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      فارسی (FA)
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 uppercase">
                    {t('calendar')}
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    <button
                      onClick={() => {
                        setCalendar('gregorian');
                        setLangMenuOpen(false);
                      }}
                      className={`px-2 py-1.5 text-xs rounded-lg font-medium transition-all ${
                        calendar === 'gregorian'
                          ? 'bg-indigo-600 text-white'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Gregorian
                    </button>
                    <button
                      onClick={() => {
                        setCalendar('jalali');
                        setLangMenuOpen(false);
                      }}
                      className={`px-2 py-1.5 text-xs rounded-lg font-medium font-persian transition-all ${
                        calendar === 'jalali'
                          ? 'bg-indigo-600 text-white'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      شمسی (Jalali)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={t('theme')}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* User Profile Menu with Management & Logout */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={currentUser?.name || 'User'}
            >
              <img
                src={currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                alt={currentUser?.name || 'User'}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-indigo-500/40 object-cover"
              />
            </button>

            {userMenuOpen && (
              <div className="absolute end-0 mt-2 w-64 glass-modal rounded-2xl p-3 z-50 animate-in fade-in zoom-in-95 space-y-2">
                {/* Active User Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <img
                    src={currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                    alt={currentUser?.name}
                    className="w-10 h-10 rounded-full ring-2 ring-indigo-500 object-cover"
                  />
                  <div className="text-start truncate">
                    <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {currentUser?.name}
                    </div>
                    <div className="text-xs text-slate-400 truncate">{currentUser?.email}</div>
                    <div className="inline-flex items-center gap-1 text-[10px] mt-1 font-semibold text-indigo-500 dark:text-indigo-400">
                      {currentUserRole === 'owner' && <ShieldCheck className="w-3 h-3 text-emerald-500" />}
                      {currentUserRole === 'editor' && <Edit3 className="w-3 h-3 text-blue-500" />}
                      {currentUserRole === 'viewer' && <Eye className="w-3 h-3 text-amber-500" />}
                      <span>
                        {currentUserRole === 'owner'
                          ? t('role_owner')
                          : currentUserRole === 'editor'
                          ? t('role_editor')
                          : t('role_viewer')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Management Option: Members & Permissions Management */}
                <div className="space-y-1 pt-1">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      if (onNavigateToMembers) {
                        onNavigateToMembers();
                      } else {
                        onOpenShareModal();
                      }
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <UserCheck className="w-4 h-4 text-indigo-500" />
                    <span>{language === 'fa' ? 'مدیریت اعضا و اشتراک‌گذاری' : 'Manage Members & Access'}</span>
                  </button>
                </div>

                {/* Log Out Button */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('logout')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
