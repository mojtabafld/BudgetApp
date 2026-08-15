import type { Transaction, Workspace, BudgetLimit, User, UserRole } from '../types';

const API_BASE = '/api';

export const ApiService = {
  // Check if backend database is reachable
  checkHealth: async (): Promise<{ status: string; database: string }> => {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) return { status: 'error', database: 'disconnected' };
      return await res.json();
    } catch {
      return { status: 'offline', database: 'local' };
    }
  },

  // Auth: Register real account in DigitalOcean PostgreSQL
  register: async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: User; workspaces?: Workspace[]; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || data.error || 'Registration failed' };
      }
      return { success: true, user: data.user, workspaces: data.workspaces };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network connection failed' };
    }
  },

  // Auth: Login real account against DigitalOcean PostgreSQL
  login: async (
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: User; workspaces?: Workspace[]; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || data.error || 'Invalid credentials' };
      }
      return { success: true, user: data.user, workspaces: data.workspaces };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network connection failed' };
    }
  },

  // Transactions
  getTransactions: async (workspaceId?: string, month?: string): Promise<Transaction[] | null> => {
    try {
      const query = new URLSearchParams();
      if (workspaceId) query.append('workspaceId', workspaceId);
      if (month) query.append('month', month);
      const res = await fetch(`${API_BASE}/transactions?${query.toString()}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  createTransaction: async (tx: any): Promise<Transaction | null> => {
    try {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tx),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  updateTransaction: async (id: string, updates: any): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  deleteTransaction: async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/transactions/${id}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Workspaces
  getWorkspaces: async (userId?: string): Promise<Workspace[] | null> => {
    try {
      const query = new URLSearchParams();
      if (userId) query.append('userId', userId);
      const res = await fetch(`${API_BASE}/workspaces?${query.toString()}`);
      if (!res.ok) return null;
      const data = await res.json();
      return Array.isArray(data) ? data : null;
    } catch {
      return null;
    }
  },

  createWorkspace: async (ws: any): Promise<Workspace | null> => {
    try {
      const res = await fetch(`${API_BASE}/workspaces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ws),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  addMember: async (workspaceId: string, userId: string, role: UserRole): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, role }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Budgets
  getBudgets: async (): Promise<BudgetLimit[] | null> => {
    try {
      const res = await fetch(`${API_BASE}/budgets`);
      if (!res.ok) return null;
      const data = await res.json();
      return Array.isArray(data) ? data : null;
    } catch {
      return null;
    }
  },

  saveBudget: async (budget: BudgetLimit): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/budgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budget),
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};
