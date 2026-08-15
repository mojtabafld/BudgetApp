export type Language = 'en' | 'fa';
export type CalendarType = 'gregorian' | 'jalali';
export type Theme = 'dark' | 'light' | 'system';
export type CurrencyCode = 'DKK' | 'USD' | 'EUR' | 'GBP' | 'IRT' | 'IRR';

export type UserRole = 'owner' | 'editor' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  created_at: string;
}

export interface WorkspaceMember {
  user_id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  joined_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  currency: CurrencyCode;
  members: WorkspaceMember[];
  created_at: string;
}

export type TransactionType = 'expense' | 'income';

export interface Category {
  id: string;
  name: string;
  name_fa: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  workspace_id: string;
  type: TransactionType;
  amount: number;
  category_id: string;
  date: string; // ISO format: YYYY-MM-DD
  note?: string;
  payment_method?: 'cash' | 'card' | 'bank_transfer' | 'crypto';
  tags?: string[];
  created_by: {
    id: string;
    name: string;
    avatar?: string;
  };
  created_at: string;
}

export interface BudgetLimit {
  id: string;
  workspace_id: string;
  category_id: string;
  month: string; // YYYY-MM
  limit_amount: number;
}

export interface MonthSummary {
  month: string; // YYYY-MM
  income: number;
  expense: number;
  net: number;
  savings_rate: number;
}
