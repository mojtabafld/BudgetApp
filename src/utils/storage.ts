import type { User, Workspace, Transaction, BudgetLimit } from '../types';

const STORAGE_KEYS = {
  USERS: 'budgetmaster_users_v2',
  CURRENT_USER: 'budgetmaster_current_user_v2',
  WORKSPACES: 'budgetmaster_workspaces_v2',
  ACTIVE_WORKSPACE_ID: 'budgetmaster_active_workspace_v2',
  TRANSACTIONS: 'budgetmaster_transactions_v2',
  BUDGET_LIMITS: 'budgetmaster_budgets_v2',
  ONBOARDING_DONE: 'budgetmaster_onboarding_done_v2',
};

export const StorageService = {
  // Onboarding flag
  hasCompletedOnboarding: (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE) === 'true';
  },

  setOnboardingCompleted: () => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, 'true');
  },

  // Users
  getUsers: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveUsers: (users: User[]) => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  // Workspaces
  getWorkspaces: (): Workspace[] => {
    const data = localStorage.getItem(STORAGE_KEYS.WORKSPACES);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveWorkspaces: (workspaces: Workspace[]) => {
    localStorage.setItem(STORAGE_KEYS.WORKSPACES, JSON.stringify(workspaces));
  },

  getActiveWorkspaceId: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKSPACE_ID);
  },

  setActiveWorkspaceId: (id: string | null) => {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKSPACE_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKSPACE_ID);
    }
  },

  // Transactions (Starts completely empty)
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveTransactions: (transactions: Transaction[]) => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  // Budget Limits
  getBudgetLimits: (): BudgetLimit[] => {
    const data = localStorage.getItem(STORAGE_KEYS.BUDGET_LIMITS);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveBudgetLimits: (budgets: BudgetLimit[]) => {
    localStorage.setItem(STORAGE_KEYS.BUDGET_LIMITS, JSON.stringify(budgets));
  },

  // Clear Session for Logout
  clearSession: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKSPACE_ID);
  },
};
