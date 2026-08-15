import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type {
  User,
  Workspace,
  WorkspaceMember,
  Transaction,
  BudgetLimit,
  Language,
  CalendarType,
  Theme,
  CurrencyCode,
  UserRole,
} from '../types';
import { StorageService } from '../utils/storage';
import { ApiService } from '../utils/api';
import { getCurrentMonthKey } from '../utils/date';
import { translations } from '../utils/i18n';
import confetti from 'canvas-confetti';

interface AppContextType {
  // Auth & Workspace
  users: User[];
  currentUser: User;
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  currentUserRole: UserRole;
  canEdit: boolean;
  isViewerOnly: boolean;
  isDbOnline: boolean;

  // Preferences
  language: Language;
  calendar: CalendarType;
  theme: Theme;
  currency: CurrencyCode;

  // Data & Filters
  selectedMonth: string;
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  budgetLimits: BudgetLimit[];

  // Methods
  switchUser: (userId: string) => void;
  createAccount: (name: string, email: string) => void;
  switchWorkspace: (workspaceId: string) => void;
  createWorkspace: (name: string, description?: string, currency?: CurrencyCode) => Workspace;
  addMemberToWorkspace: (emailOrName: string, role: UserRole) => boolean;
  updateMemberRole: (userId: string, role: UserRole) => void;
  removeMemberFromWorkspace: (userId: string) => void;

  addTransaction: (data: {
    type: 'income' | 'expense';
    amount: number;
    category_id: string;
    date: string;
    note?: string;
    payment_method?: 'cash' | 'card' | 'bank_transfer' | 'crypto';
    tags?: string[];
  }) => boolean;
  updateTransaction: (id: string, updates: Partial<Transaction>) => boolean;
  deleteTransaction: (id: string) => boolean;

  setBudgetLimit: (categoryId: string, limitAmount: number) => void;
  setSelectedMonth: (month: string) => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  setCalendar: (cal: CalendarType) => void;
  setCurrency: (curr: CurrencyCode) => void;

  t: (key: keyof typeof translations.en, replacements?: Record<string, string | number>) => string;
  triggerConfetti: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State Initialization
  const [users, setUsers] = useState<User[]>(() => StorageService.getUsers());
  const [currentUserId, setCurrentUserId] = useState<string>(() => StorageService.getCurrentUserId());
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => StorageService.getWorkspaces());
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(() => StorageService.getActiveWorkspaceId());
  const [transactions, setTransactions] = useState<Transaction[]>(() => StorageService.getTransactions());
  const [budgetLimits, setBudgetLimits] = useState<BudgetLimit[]>(() => StorageService.getBudgetLimits());
  const [isDbOnline, setIsDbOnline] = useState<boolean>(false);

  // Preferences: Default to English and Gregorian as requested
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('budgetmaster_lang') as Language) || 'en';
  });

  const [calendar, setCalendarState] = useState<CalendarType>(() => {
    return (localStorage.getItem('budgetmaster_cal') as CalendarType) || 'gregorian';
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('budgetmaster_theme') as Theme) || 'dark';
  });

  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey());

  // Fetch initial data from backend PostgreSQL database if available
  useEffect(() => {
    async function syncWithDatabase() {
      const health = await ApiService.checkHealth();
      if (health.database === 'connected') {
        setIsDbOnline(true);
        console.log('🔗 PostgreSQL database active. Syncing latest data...');

        const [remoteTxs, remoteWs, remoteBudgets, remoteUsers] = await Promise.all([
          ApiService.getTransactions(),
          ApiService.getWorkspaces(),
          ApiService.getBudgets(),
          ApiService.getUsers(),
        ]);

        if (remoteTxs && remoteTxs.length > 0) {
          setTransactions(remoteTxs);
          StorageService.saveTransactions(remoteTxs);
        }
        if (remoteWs && remoteWs.length > 0) {
          setWorkspaces(remoteWs);
          StorageService.saveWorkspaces(remoteWs);
        }
        if (remoteBudgets && remoteBudgets.length > 0) {
          setBudgetLimits(remoteBudgets);
          StorageService.saveBudgetLimits(remoteBudgets);
        }
        if (remoteUsers && remoteUsers.length > 0) {
          setUsers(remoteUsers);
          localStorage.setItem('budgetmaster_users_v1', JSON.stringify(remoteUsers));
        }
      }
    }
    syncWithDatabase();
  }, []);

  // Find Current User
  const currentUser = useMemo(() => {
    const found = users.find((u) => u.id === currentUserId);
    return found || users[0] || { id: 'unknown', name: 'User', email: 'user@example.com', created_at: '' };
  }, [users, currentUserId]);

  // Find Active Workspace
  const activeWorkspace = useMemo(() => {
    const found = workspaces.find((w) => w.id === activeWorkspaceId);
    return found || workspaces[0];
  }, [workspaces, activeWorkspaceId]);

  // Workspace Currency
  const currency = activeWorkspace?.currency || 'DKK';

  // Calculate User's Role in Active Workspace
  const currentUserRole = useMemo<UserRole>(() => {
    if (!activeWorkspace || !currentUser) return 'viewer';
    if (activeWorkspace.owner_id === currentUser.id) return 'owner';
    const member = activeWorkspace.members.find((m) => m.user_id === currentUser.id);
    return member?.role || 'viewer';
  }, [activeWorkspace, currentUser]);

  const canEdit = currentUserRole === 'owner' || currentUserRole === 'editor';
  const isViewerOnly = !canEdit;

  // Filtered transactions for active workspace and selected month
  const filteredTransactions = useMemo(() => {
    if (!activeWorkspace) return [];
    return transactions.filter(
      (tx) => tx.workspace_id === activeWorkspace.id && tx.date.startsWith(selectedMonth)
    );
  }, [transactions, activeWorkspace, selectedMonth]);

  // Sync Theme to DOM & Storage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('budgetmaster_theme', theme);
  }, [theme]);

  // Sync Language & RTL to DOM & Storage
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('lang', language);
    root.setAttribute('dir', language === 'fa' ? 'rtl' : 'ltr');
    localStorage.setItem('budgetmaster_lang', language);
  }, [language]);

  // Sync Calendar
  useEffect(() => {
    localStorage.setItem('budgetmaster_cal', calendar);
  }, [calendar]);

  // Switch User
  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
    StorageService.setCurrentUserId(userId);
  };

  // Create User
  const createAccount = (name: string, email: string) => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      created_at: new Date().toISOString(),
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('budgetmaster_users_v1', JSON.stringify(updatedUsers));
    ApiService.saveUser(newUser);
    switchUser(newUser.id);
  };

  // Switch Workspace
  const switchWorkspace = (workspaceId: string) => {
    setActiveWorkspaceId(workspaceId);
    StorageService.setActiveWorkspaceId(workspaceId);
  };

  // Create Workspace
  const createWorkspace = (name: string, description?: string, curr: CurrencyCode = 'DKK'): Workspace => {
    const newWs: Workspace = {
      id: `ws_${Date.now()}`,
      name,
      description,
      owner_id: currentUser.id,
      currency: curr,
      members: [
        {
          user_id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          avatar: currentUser.avatar,
          role: 'owner',
          joined_at: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
    };
    const updated = [...workspaces, newWs];
    setWorkspaces(updated);
    StorageService.saveWorkspaces(updated);
    ApiService.createWorkspace(newWs);
    switchWorkspace(newWs.id);
    return newWs;
  };

  // Add Member
  const addMemberToWorkspace = (emailOrName: string, role: UserRole): boolean => {
    if (currentUserRole !== 'owner') return false;
    // Check if user already exists
    let targetUser = users.find(
      (u) => u.email.toLowerCase() === emailOrName.toLowerCase() || u.name.toLowerCase() === emailOrName.toLowerCase()
    );

    if (!targetUser) {
      targetUser = {
        id: `user_${Date.now()}`,
        name: emailOrName.split('@')[0],
        email: emailOrName.includes('@') ? emailOrName : `${emailOrName}@example.com`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${emailOrName}`,
        created_at: new Date().toISOString(),
      };
      const updatedUsers = [...users, targetUser];
      setUsers(updatedUsers);
      localStorage.setItem('budgetmaster_users_v1', JSON.stringify(updatedUsers));
      ApiService.saveUser(targetUser);
    }

    const existingMember = activeWorkspace.members.find((m) => m.user_id === targetUser!.id);
    if (existingMember) {
      updateMemberRole(targetUser.id, role);
      return true;
    }

    const newMember: WorkspaceMember = {
      user_id: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
      avatar: targetUser.avatar,
      role: role,
      joined_at: new Date().toISOString(),
    };

    const updatedWorkspaces = workspaces.map((w) => {
      if (w.id === activeWorkspace.id) {
        return {
          ...w,
          members: [...w.members, newMember],
        };
      }
      return w;
    });

    setWorkspaces(updatedWorkspaces);
    StorageService.saveWorkspaces(updatedWorkspaces);
    ApiService.addMember(activeWorkspace.id, targetUser.id, role);
    return true;
  };

  // Update Member Role
  const updateMemberRole = (userId: string, role: UserRole) => {
    if (currentUserRole !== 'owner') return;
    const updatedWorkspaces = workspaces.map((w) => {
      if (w.id === activeWorkspace.id) {
        return {
          ...w,
          members: w.members.map((m) => (m.user_id === userId ? { ...m, role } : m)),
        };
      }
      return w;
    });
    setWorkspaces(updatedWorkspaces);
    StorageService.saveWorkspaces(updatedWorkspaces);
    ApiService.addMember(activeWorkspace.id, userId, role);
  };

  // Remove Member
  const removeMemberFromWorkspace = (userId: string) => {
    if (currentUserRole !== 'owner') return;
    const updatedWorkspaces = workspaces.map((w) => {
      if (w.id === activeWorkspace.id) {
        return {
          ...w,
          members: w.members.filter((m) => m.user_id !== userId),
        };
      }
      return w;
    });
    setWorkspaces(updatedWorkspaces);
    StorageService.saveWorkspaces(updatedWorkspaces);
  };

  // Add Transaction
  const addTransaction = (data: {
    type: 'income' | 'expense';
    amount: number;
    category_id: string;
    date: string;
    note?: string;
    payment_method?: 'cash' | 'card' | 'bank_transfer' | 'crypto';
    tags?: string[];
  }): boolean => {
    if (!canEdit) return false;

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      workspace_id: activeWorkspace.id,
      type: data.type,
      amount: data.amount,
      category_id: data.category_id,
      date: data.date,
      note: data.note,
      payment_method: data.payment_method || 'card',
      tags: data.tags || [],
      created_by: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
      },
      created_at: new Date().toISOString(),
    };

    const updated = [newTx, ...transactions];
    setTransactions(updated);
    StorageService.saveTransactions(updated);
    ApiService.createTransaction(newTx);

    if (data.type === 'income') {
      triggerConfetti();
    }
    return true;
  };

  // Update Transaction
  const updateTransaction = (id: string, updates: Partial<Transaction>): boolean => {
    if (!canEdit) return false;
    const updated = transactions.map((t) => (t.id === id ? { ...t, ...updates } : t));
    setTransactions(updated);
    StorageService.saveTransactions(updated);
    ApiService.updateTransaction(id, updates);
    return true;
  };

  // Delete Transaction
  const deleteTransaction = (id: string): boolean => {
    if (!canEdit) return false;
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    StorageService.saveTransactions(updated);
    ApiService.deleteTransaction(id);
    return true;
  };

  // Set Budget Limit
  const setBudgetLimit = (categoryId: string, limitAmount: number) => {
    if (!canEdit) return;
    const existingIndex = budgetLimits.findIndex(
      (b) => b.workspace_id === activeWorkspace.id && b.category_id === categoryId && b.month === selectedMonth
    );

    let updated: BudgetLimit[];
    let budgetItem: BudgetLimit;
    if (existingIndex >= 0) {
      updated = [...budgetLimits];
      updated[existingIndex].limit_amount = limitAmount;
      budgetItem = updated[existingIndex];
    } else {
      budgetItem = {
        id: `bl_${Date.now()}`,
        workspace_id: activeWorkspace.id,
        category_id: categoryId,
        month: selectedMonth,
        limit_amount: limitAmount,
      };
      updated = [...budgetLimits, budgetItem];
    }
    setBudgetLimits(updated);
    StorageService.saveBudgetLimits(updated);
    ApiService.saveBudget(budgetItem);
  };

  // Set Currency
  const setCurrency = (curr: CurrencyCode) => {
    if (currentUserRole !== 'owner') return;
    const updated = workspaces.map((w) => (w.id === activeWorkspace.id ? { ...w, currency: curr } : w));
    setWorkspaces(updated);
    StorageService.saveWorkspaces(updated);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const setCalendar = (cal: CalendarType) => {
    setCalendarState(cal);
  };

  const setTheme = (th: Theme) => {
    setThemeState(th);
  };

  // Translation helper
  const t = (key: keyof typeof translations.en, replacements?: Record<string, string | number>): string => {
    const dict = translations[language] || translations.en;
    let text = dict[key] || translations.en[key] || String(key);

    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return text;
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.85 },
      colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
    });
  };

  return (
    <AppContext.Provider
      value={{
        users,
        currentUser,
        workspaces,
        activeWorkspace,
        currentUserRole,
        canEdit,
        isViewerOnly,
        isDbOnline,
        language,
        calendar,
        theme,
        currency,
        selectedMonth,
        transactions,
        filteredTransactions,
        budgetLimits,
        switchUser,
        createAccount,
        switchWorkspace,
        createWorkspace,
        addMemberToWorkspace,
        updateMemberRole,
        removeMemberFromWorkspace,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        setBudgetLimit,
        setSelectedMonth,
        setTheme,
        setLanguage,
        setCalendar,
        setCurrency,
        t,
        triggerConfetti,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
