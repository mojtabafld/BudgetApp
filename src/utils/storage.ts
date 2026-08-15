import type { User, Workspace, Transaction, BudgetLimit } from '../types';
import { getCurrentMonthKey, shiftMonth } from './date';

const STORAGE_KEYS = {
  USERS: 'budgetmaster_users_v1',
  CURRENT_USER_ID: 'budgetmaster_current_user_v1',
  WORKSPACES: 'budgetmaster_workspaces_v1',
  ACTIVE_WORKSPACE_ID: 'budgetmaster_active_workspace_v1',
  TRANSACTIONS: 'budgetmaster_transactions_v1',
  BUDGET_LIMITS: 'budgetmaster_budgets_v1',
  SETTINGS: 'budgetmaster_settings_v1',
};

// Seed initial users
const INITIAL_USERS: User[] = [
  {
    id: 'user_alice',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user_bob',
    name: 'Bob Miller (Partner)',
    email: 'bob@example.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user_charlie',
    name: 'Charlie Smith (Auditor)',
    email: 'charlie@example.com',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-01-01T00:00:00.000Z',
  },
];

// Seed initial workspaces in DKK
const INITIAL_WORKSPACES: Workspace[] = [
  {
    id: 'ws_personal',
    name: 'Personal Wallet',
    description: 'Personal day-to-day finances and savings',
    owner_id: 'user_alice',
    currency: 'DKK',
    members: [
      {
        user_id: 'user_alice',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        role: 'owner',
        joined_at: '2026-01-01T00:00:00.000Z',
      },
    ],
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'ws_family',
    name: 'Shared Family Budget',
    description: 'Joint household expenses and shared goals',
    owner_id: 'user_alice',
    currency: 'DKK',
    members: [
      {
        user_id: 'user_alice',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        role: 'owner',
        joined_at: '2026-01-01T00:00:00.000Z',
      },
      {
        user_id: 'user_bob',
        name: 'Bob Miller (Partner)',
        email: 'bob@example.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        role: 'editor', // CAN EDIT
        joined_at: '2026-01-05T00:00:00.000Z',
      },
      {
        user_id: 'user_charlie',
        name: 'Charlie Smith (Auditor)',
        email: 'charlie@example.com',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
        role: 'viewer', // VIEW ONLY
        joined_at: '2026-01-10T00:00:00.000Z',
      },
    ],
    created_at: '2026-01-02T00:00:00.000Z',
  },
];

// Seed realistic transactions in DKK
const generateInitialTransactions = (): Transaction[] => {
  const currentMonth = getCurrentMonthKey();
  const prevMonth1 = shiftMonth(currentMonth, -1);
  const prevMonth2 = shiftMonth(currentMonth, -2);

  const txs: Transaction[] = [
    // Current Month - Shared Workspace
    {
      id: 'tx_1',
      workspace_id: 'ws_family',
      type: 'income',
      amount: 32000,
      category_id: 'salary',
      date: `${currentMonth}-01`,
      note: 'Monthly Salary - Engineering Lead',
      payment_method: 'bank_transfer',
      tags: ['salary', 'main'],
      created_by: { id: 'user_alice', name: 'Alice Johnson', avatar: INITIAL_USERS[0].avatar },
      created_at: `${currentMonth}-01T08:30:00.000Z`,
    },
    {
      id: 'tx_2',
      workspace_id: 'ws_family',
      type: 'income',
      amount: 12500,
      category_id: 'freelance',
      date: `${currentMonth}-04`,
      note: 'UI/UX Design Project Milestone',
      payment_method: 'bank_transfer',
      tags: ['freelance'],
      created_by: { id: 'user_bob', name: 'Bob Miller', avatar: INITIAL_USERS[1].avatar },
      created_at: `${currentMonth}-04T14:15:00.000Z`,
    },
    {
      id: 'tx_3',
      workspace_id: 'ws_family',
      type: 'expense',
      amount: 9500,
      category_id: 'housing',
      date: `${currentMonth}-02`,
      note: 'Apartment Monthly Rent',
      payment_method: 'bank_transfer',
      tags: ['rent', 'fixed'],
      created_by: { id: 'user_alice', name: 'Alice Johnson', avatar: INITIAL_USERS[0].avatar },
      created_at: `${currentMonth}-02T09:00:00.000Z`,
    },
    {
      id: 'tx_4',
      workspace_id: 'ws_family',
      type: 'expense',
      amount: 3200,
      category_id: 'food_dining',
      date: `${currentMonth}-05`,
      note: 'Weekly Grocery Shopping at Føtex / Netto',
      payment_method: 'card',
      tags: ['groceries', 'food'],
      created_by: { id: 'user_bob', name: 'Bob Miller', avatar: INITIAL_USERS[1].avatar },
      created_at: `${currentMonth}-05T17:45:00.000Z`,
    },
    {
      id: 'tx_5',
      workspace_id: 'ws_family',
      type: 'expense',
      amount: 1200,
      category_id: 'bills_utilities',
      date: `${currentMonth}-06`,
      note: 'Electricity, Heating and Fiber Internet',
      payment_method: 'card',
      tags: ['utilities'],
      created_by: { id: 'user_alice', name: 'Alice Johnson', avatar: INITIAL_USERS[0].avatar },
      created_at: `${currentMonth}-06T11:20:00.000Z`,
    },
    {
      id: 'tx_6',
      workspace_id: 'ws_family',
      type: 'expense',
      amount: 950,
      category_id: 'entertainment',
      date: `${currentMonth}-09`,
      note: 'Cinema Tickets & Weekend Dinner in Copenhagen',
      payment_method: 'card',
      tags: ['leisure', 'weekend'],
      created_by: { id: 'user_bob', name: 'Bob Miller', avatar: INITIAL_USERS[1].avatar },
      created_at: `${currentMonth}-09T21:00:00.000Z`,
    },
    {
      id: 'tx_7',
      workspace_id: 'ws_family',
      type: 'expense',
      amount: 750,
      category_id: 'transportation',
      date: `${currentMonth}-11`,
      note: 'Fuel Refill & DSB Commuter Pass',
      payment_method: 'card',
      tags: ['fuel', 'transport'],
      created_by: { id: 'user_alice', name: 'Alice Johnson', avatar: INITIAL_USERS[0].avatar },
      created_at: `${currentMonth}-11T16:10:00.000Z`,
    },
    {
      id: 'tx_8',
      workspace_id: 'ws_family',
      type: 'expense',
      amount: 1650,
      category_id: 'shopping',
      date: `${currentMonth}-13`,
      note: 'Summer Clothes & Sneakers',
      payment_method: 'card',
      tags: ['shopping'],
      created_by: { id: 'user_bob', name: 'Bob Miller', avatar: INITIAL_USERS[1].avatar },
      created_at: `${currentMonth}-13T19:30:00.000Z`,
    },

    // Previous Month 1 - Shared
    {
      id: 'tx_prev1_1',
      workspace_id: 'ws_family',
      type: 'income',
      amount: 32000,
      category_id: 'salary',
      date: `${prevMonth1}-01`,
      note: 'Monthly Salary',
      payment_method: 'bank_transfer',
      tags: ['salary'],
      created_by: { id: 'user_alice', name: 'Alice Johnson', avatar: INITIAL_USERS[0].avatar },
      created_at: `${prevMonth1}-01T08:30:00.000Z`,
    },
    {
      id: 'tx_prev1_2',
      workspace_id: 'ws_family',
      type: 'income',
      amount: 11000,
      category_id: 'freelance',
      date: `${prevMonth1}-08`,
      note: 'Web Development Contract',
      payment_method: 'bank_transfer',
      tags: ['freelance'],
      created_by: { id: 'user_bob', name: 'Bob Miller', avatar: INITIAL_USERS[1].avatar },
      created_at: `${prevMonth1}-08T10:00:00.000Z`,
    },
    {
      id: 'tx_prev1_3',
      workspace_id: 'ws_family',
      type: 'expense',
      amount: 9500,
      category_id: 'housing',
      date: `${prevMonth1}-02`,
      note: 'Rent',
      payment_method: 'bank_transfer',
      tags: ['rent'],
      created_by: { id: 'user_alice', name: 'Alice Johnson', avatar: INITIAL_USERS[0].avatar },
      created_at: `${prevMonth1}-02T09:00:00.000Z`,
    },
    {
      id: 'tx_prev1_4',
      workspace_id: 'ws_family',
      type: 'expense',
      amount: 4500,
      category_id: 'food_dining',
      date: `${prevMonth1}-14`,
      note: 'Groceries & Dining Out',
      payment_method: 'card',
      tags: ['food'],
      created_by: { id: 'user_bob', name: 'Bob Miller', avatar: INITIAL_USERS[1].avatar },
      created_at: `${prevMonth1}-14T18:00:00.000Z`,
    },
    {
      id: 'tx_prev1_5',
      workspace_id: 'ws_family',
      type: 'expense',
      amount: 2200,
      category_id: 'travel',
      date: `${prevMonth1}-20`,
      note: 'Weekend Trip Hotel in Aarhus',
      payment_method: 'card',
      tags: ['vacation'],
      created_by: { id: 'user_alice', name: 'Alice Johnson', avatar: INITIAL_USERS[0].avatar },
      created_at: `${prevMonth1}-20T12:00:00.000Z`,
    },

    // Previous Month 2 - Shared
    {
      id: 'tx_prev2_1',
      workspace_id: 'ws_family',
      type: 'income',
      amount: 32000,
      category_id: 'salary',
      date: `${prevMonth2}-01`,
      note: 'Monthly Salary',
      payment_method: 'bank_transfer',
      tags: ['salary'],
      created_by: { id: 'user_alice', name: 'Alice Johnson', avatar: INITIAL_USERS[0].avatar },
      created_at: `${prevMonth2}-01T08:30:00.000Z`,
    },
    {
      id: 'tx_prev2_2',
      workspace_id: 'ws_family',
      type: 'expense',
      amount: 9500,
      category_id: 'housing',
      date: `${prevMonth2}-02`,
      note: 'Rent',
      payment_method: 'bank_transfer',
      tags: ['rent'],
      created_by: { id: 'user_alice', name: 'Alice Johnson', avatar: INITIAL_USERS[0].avatar },
      created_at: `${prevMonth2}-02T09:00:00.000Z`,
    },
    {
      id: 'tx_prev2_3',
      workspace_id: 'ws_family',
      type: 'expense',
      amount: 3800,
      category_id: 'food_dining',
      date: `${prevMonth2}-12`,
      note: 'Groceries',
      payment_method: 'card',
      tags: ['food'],
      created_by: { id: 'user_bob', name: 'Bob Miller', avatar: INITIAL_USERS[1].avatar },
      created_at: `${prevMonth2}-12T16:00:00.000Z`,
    },

    // Personal Workspace Transactions
    {
      id: 'tx_personal_1',
      workspace_id: 'ws_personal',
      type: 'income',
      amount: 8500,
      category_id: 'investments',
      date: `${currentMonth}-03`,
      note: 'Dividend Payout from Danish Equities',
      payment_method: 'bank_transfer',
      tags: ['dividends', 'passive'],
      created_by: { id: 'user_alice', name: 'Alice Johnson', avatar: INITIAL_USERS[0].avatar },
      created_at: `${currentMonth}-03T10:00:00.000Z`,
    },
    {
      id: 'tx_personal_2',
      workspace_id: 'ws_personal',
      type: 'expense',
      amount: 600,
      category_id: 'education',
      date: `${currentMonth}-07`,
      note: 'Online Masterclass Subscription',
      payment_method: 'card',
      tags: ['learning'],
      created_by: { id: 'user_alice', name: 'Alice Johnson', avatar: INITIAL_USERS[0].avatar },
      created_at: `${currentMonth}-07T15:00:00.000Z`,
    },
  ];

  return txs;
};

// Seed initial budget limits in DKK
const generateInitialBudgetLimits = (): BudgetLimit[] => {
  const currentMonth = getCurrentMonthKey();
  return [
    {
      id: 'bl_1',
      workspace_id: 'ws_family',
      category_id: 'housing',
      month: currentMonth,
      limit_amount: 10000,
    },
    {
      id: 'bl_2',
      workspace_id: 'ws_family',
      category_id: 'food_dining',
      month: currentMonth,
      limit_amount: 4500,
    },
    {
      id: 'bl_3',
      workspace_id: 'ws_family',
      category_id: 'entertainment',
      month: currentMonth,
      limit_amount: 1800,
    },
    {
      id: 'bl_4',
      workspace_id: 'ws_family',
      category_id: 'shopping',
      month: currentMonth,
      limit_amount: 2500,
    },
    {
      id: 'bl_5',
      workspace_id: 'ws_family',
      category_id: 'transportation',
      month: currentMonth,
      limit_amount: 1200,
    },
  ];
};

export const StorageService = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_USERS;
    }
  },

  getCurrentUserId: (): string => {
    const id = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (!id) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'user_alice');
      return 'user_alice';
    }
    return id;
  },

  setCurrentUserId: (id: string) => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
  },

  getWorkspaces: (): Workspace[] => {
    const data = localStorage.getItem(STORAGE_KEYS.WORKSPACES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.WORKSPACES, JSON.stringify(INITIAL_WORKSPACES));
      return INITIAL_WORKSPACES;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_WORKSPACES;
    }
  },

  saveWorkspaces: (workspaces: Workspace[]) => {
    localStorage.setItem(STORAGE_KEYS.WORKSPACES, JSON.stringify(workspaces));
  },

  getActiveWorkspaceId: (): string => {
    const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKSPACE_ID);
    if (!id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKSPACE_ID, 'ws_family');
      return 'ws_family';
    }
    return id;
  },

  setActiveWorkspaceId: (id: string) => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKSPACE_ID, id);
  },

  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!data) {
      const init = generateInitialTransactions();
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(init));
      return init;
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveTransactions: (transactions: Transaction[]) => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  getBudgetLimits: (): BudgetLimit[] => {
    const data = localStorage.getItem(STORAGE_KEYS.BUDGET_LIMITS);
    if (!data) {
      const init = generateInitialBudgetLimits();
      localStorage.setItem(STORAGE_KEYS.BUDGET_LIMITS, JSON.stringify(init));
      return init;
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveBudgetLimits: (budgets: BudgetLimit[]) => {
    localStorage.setItem(STORAGE_KEYS.BUDGET_LIMITS, JSON.stringify(budgets));
  },
};
