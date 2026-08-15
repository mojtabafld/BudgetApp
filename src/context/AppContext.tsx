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
import { getCurrentMonthKey, shiftMonth } from '../utils/date';
import { translations } from '../utils/i18n';
import confetti from 'canvas-confetti';

interface AppContextType {
  // Auth & Onboarding State
  hasSeenOnboarding: boolean;
  completeOnboarding: () => void;
  currentUser: User | null;
  isAuthenticated: boolean;
  loginOrRegister: (data: {
    name: string;
    email: string;
    password: string;
    isSignUp: boolean;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  // Workspace & Sharing
  users: User[];
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
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
    is_recurring?: boolean;
    recurring_months?: number;
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
  // Onboarding & Persistent Session
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean>(() => StorageService.hasCompletedOnboarding());
  const [currentUser, setCurrentUser] = useState<User | null>(() => StorageService.getCurrentUser());

  // Workspace & Data State
  const [users, setUsers] = useState<User[]>(() => StorageService.getUsers());
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => StorageService.getWorkspaces());
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(() => StorageService.getActiveWorkspaceId());
  const [transactions, setTransactions] = useState<Transaction[]>(() => StorageService.getTransactions());
  const [budgetLimits, setBudgetLimits] = useState<BudgetLimit[]>(() => StorageService.getBudgetLimits());
  const [isDbOnline, setIsDbOnline] = useState<boolean>(false);

  // Preferences: Default to English and Gregorian with DKK currency
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

  const isAuthenticated = Boolean(currentUser);

  // Complete onboarding
  const completeOnboarding = () => {
    StorageService.setOnboardingCompleted();
    setHasSeenOnboarding(true);
  };

  // Sync with backend PostgreSQL database when user is authenticated
  useEffect(() => {
    async function syncWithDatabase() {
      const health = await ApiService.checkHealth();
      if (health.database === 'connected') {
        setIsDbOnline(true);
        console.log('🔗 PostgreSQL database active. Fetching verified user data...');

        if (currentUser) {
          const [remoteWs, remoteTxs, remoteBudgets] = await Promise.all([
            ApiService.getWorkspaces(currentUser.id),
            ApiService.getTransactions(activeWorkspaceId || undefined),
            ApiService.getBudgets(),
          ]);

          if (remoteWs && remoteWs.length > 0) {
            setWorkspaces(remoteWs);
            StorageService.saveWorkspaces(remoteWs);
            if (!activeWorkspaceId || !remoteWs.some((w) => w.id === activeWorkspaceId)) {
              setActiveWorkspaceId(remoteWs[0].id);
              StorageService.setActiveWorkspaceId(remoteWs[0].id);
            }
          }

          if (remoteTxs) {
            setTransactions(remoteTxs);
            StorageService.saveTransactions(remoteTxs);
          }

          if (remoteBudgets) {
            setBudgetLimits(remoteBudgets);
            StorageService.saveBudgetLimits(remoteBudgets);
          }
        }
      }
    }

    if (isAuthenticated) {
      syncWithDatabase();
    }
  }, [isAuthenticated, activeWorkspaceId, currentUser]);

  // Real Database Login & Register
  const loginOrRegister = async (data: {
    name: string;
    email: string;
    password: string;
    isSignUp: boolean;
  }): Promise<{ success: boolean; error?: string }> => {
    const emailNorm = data.email.toLowerCase().trim();

    if (data.isSignUp) {
      // 1. Real Registration on PostgreSQL
      const regRes = await ApiService.register(data.name, emailNorm, data.password);
      if (!regRes.success || !regRes.user) {
        return { success: false, error: regRes.error || 'Registration failed' };
      }

      const registeredUser = regRes.user;
      setCurrentUser(registeredUser);
      StorageService.setCurrentUser(registeredUser);

      const userWorkspaces = regRes.workspaces || [];
      if (userWorkspaces.length > 0) {
        setWorkspaces(userWorkspaces);
        StorageService.saveWorkspaces(userWorkspaces);
        setActiveWorkspaceId(userWorkspaces[0].id);
        StorageService.setActiveWorkspaceId(userWorkspaces[0].id);
      }

      return { success: true };
    } else {
      // 2. Real Login against PostgreSQL
      const loginRes = await ApiService.login(emailNorm, data.password);
      if (!loginRes.success || !loginRes.user) {
        return { success: false, error: loginRes.error || 'Invalid email or password' };
      }

      const loggedInUser = loginRes.user;
      setCurrentUser(loggedInUser);
      StorageService.setCurrentUser(loggedInUser);

      const userWorkspaces = loginRes.workspaces || [];
      if (userWorkspaces.length > 0) {
        setWorkspaces(userWorkspaces);
        StorageService.saveWorkspaces(userWorkspaces);
        setActiveWorkspaceId(userWorkspaces[0].id);
        StorageService.setActiveWorkspaceId(userWorkspaces[0].id);
      }

      // Fetch user's transactions
      const txs = await ApiService.getTransactions(userWorkspaces[0]?.id);
      if (txs) {
        setTransactions(txs);
        StorageService.saveTransactions(txs);
      }

      return { success: true };
    }
  };

  // Logout (Clears active session)
  const logout = () => {
    StorageService.clearSession();
    setCurrentUser(null);
    setActiveWorkspaceId(null);
    setTransactions([]);
    setWorkspaces([]);
  };

  // Active Workspace
  const activeWorkspace = useMemo(() => {
    if (!currentUser || workspaces.length === 0) return null;
    const found = workspaces.find((w) => w.id === activeWorkspaceId);
    return found || workspaces[0] || null;
  }, [workspaces, activeWorkspaceId, currentUser]);

  // Workspace Currency
  const currency = activeWorkspace?.currency || 'DKK';

  // Role
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

  // Switch Workspace
  const switchWorkspace = async (workspaceId: string) => {
    setActiveWorkspaceId(workspaceId);
    StorageService.setActiveWorkspaceId(workspaceId);
    // Fetch transactions for newly selected workspace
    const txs = await ApiService.getTransactions(workspaceId);
    if (txs) {
      setTransactions(txs);
      StorageService.saveTransactions(txs);
    }
  };

  // Create Workspace
  const createWorkspace = (name: string, description?: string, curr: CurrencyCode = 'DKK'): Workspace => {
    if (!currentUser) throw new Error('Must be logged in');
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
    if (!activeWorkspace || currentUserRole !== 'owner') return false;
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
      StorageService.saveUsers(updatedUsers);
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
    if (!activeWorkspace || currentUserRole !== 'owner') return;
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
    if (!activeWorkspace || currentUserRole !== 'owner') return;
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
    is_recurring?: boolean;
    recurring_months?: number;
  }): boolean => {
    if (!activeWorkspace || !currentUser || !canEdit) return false;

    const baseTxId = `tx_${Date.now()}`;
    const newTxList: Transaction[] = [];

    // 1. Create base transaction
    const primaryTx: Transaction = {
      id: baseTxId,
      workspace_id: activeWorkspace.id,
      type: data.type,
      amount: data.amount,
      category_id: data.category_id,
      date: data.date,
      note: data.note,
      payment_method: data.payment_method || 'card',
      tags: data.tags || [],
      is_recurring: data.is_recurring || false,
      recurring_months: data.recurring_months || 1,
      created_by: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
      },
      created_at: new Date().toISOString(),
    };
    newTxList.push(primaryTx);

    // 2. If recurring monthly expense is selected, generate future months
    if (data.is_recurring && data.recurring_months && data.recurring_months > 1) {
      const [yearStr, monthStr, dayStr] = data.date.split('-');
      const baseMonthKey = `${yearStr}-${monthStr}`;
      const dayNum = parseInt(dayStr || '1', 10);

      for (let offset = 1; offset < data.recurring_months; offset++) {
        // Calculate future YYYY-MM
        const futureMonthKey = shiftMonth(baseMonthKey, offset);
        const [fYear, fMonth] = futureMonthKey.split('-');

        // Ensure day is valid for future month
        const maxDaysInFutureMonth = new Date(parseInt(fYear, 10), parseInt(fMonth, 10), 0).getDate();
        const validDay = Math.min(dayNum, maxDaysInFutureMonth).toString().padStart(2, '0');
        const futureDate = `${futureMonthKey}-${validDay}`;

        const recurringTx: Transaction = {
          id: `tx_${Date.now()}_rec_${offset}`,
          workspace_id: activeWorkspace.id,
          type: data.type,
          amount: data.amount,
          category_id: data.category_id,
          date: futureDate,
          note: data.note,
          payment_method: data.payment_method || 'card',
          tags: [...(data.tags || []), 'recurring'],
          is_recurring: true,
          recurring_months: data.recurring_months,
          created_by: {
            id: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatar,
          },
          created_at: new Date().toISOString(),
        };

        newTxList.push(recurringTx);
      }
    }

    const updated = [...newTxList, ...transactions];
    setTransactions(updated);
    StorageService.saveTransactions(updated);

    // Async save to PostgreSQL database API
    newTxList.forEach((tx) => ApiService.createTransaction(tx));

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
    if (!activeWorkspace || !canEdit) return;
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
    if (!activeWorkspace || currentUserRole !== 'owner') return;
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
        hasSeenOnboarding,
        completeOnboarding,
        currentUser,
        isAuthenticated,
        loginOrRegister,
        logout,
        users,
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
