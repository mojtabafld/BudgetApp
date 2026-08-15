import type { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense Categories
  {
    id: 'food_dining',
    name: 'Food & Dining',
    name_fa: 'خوراک و رستوران',
    icon: 'Utensils',
    color: '#f59e0b', // Amber
    type: 'expense',
  },
  {
    id: 'housing',
    name: 'Housing & Rent',
    name_fa: 'مسکن و اجاره',
    icon: 'Home',
    color: '#6366f1', // Indigo
    type: 'expense',
  },
  {
    id: 'transportation',
    name: 'Transportation & Fuel',
    name_fa: 'حمل و نقل و بنزین',
    icon: 'Car',
    color: '#3b82f6', // Blue
    type: 'expense',
  },
  {
    id: 'shopping',
    name: 'Shopping & Clothes',
    name_fa: 'خرید و پوشاک',
    icon: 'ShoppingBag',
    color: '#ec4899', // Pink
    type: 'expense',
  },
  {
    id: 'entertainment',
    name: 'Entertainment & Leisure',
    name_fa: 'تفریح و سرگرمی',
    icon: 'Film',
    color: '#8b5cf6', // Purple
    type: 'expense',
  },
  {
    id: 'health_medical',
    name: 'Healthcare & Medical',
    name_fa: 'سلامت و درمان',
    icon: 'HeartPulse',
    color: '#ef4444', // Red
    type: 'expense',
  },
  {
    id: 'education',
    name: 'Education & Courses',
    name_fa: 'آموزش و یادگیری',
    icon: 'GraduationCap',
    color: '#14b8a6', // Teal
    type: 'expense',
  },
  {
    id: 'bills_utilities',
    name: 'Bills & Utilities',
    name_fa: 'قبوض و اشتراک‌ها',
    icon: 'Zap',
    color: '#f97316', // Orange
    type: 'expense',
  },
  {
    id: 'travel',
    name: 'Travel & Vacation',
    name_fa: 'سفر و اقامت',
    icon: 'Plane',
    color: '#06b6d4', // Cyan
    type: 'expense',
  },
  {
    id: 'other_expense',
    name: 'Other Expenses',
    name_fa: 'سایر هزینه‌ها',
    icon: 'MoreHorizontal',
    color: '#64748b', // Slate
    type: 'expense',
  },

  // Income Categories
  {
    id: 'salary',
    name: 'Salary & Wage',
    name_fa: 'حقوق و دستمزد',
    icon: 'Briefcase',
    color: '#10b981', // Emerald
    type: 'income',
  },
  {
    id: 'freelance',
    name: 'Freelance & Projects',
    name_fa: 'پروژه و فریلنسری',
    icon: 'Laptop',
    color: '#059669', // Dark Emerald
    type: 'income',
  },
  {
    id: 'investments',
    name: 'Investments & Dividends',
    name_fa: 'سرمایه‌گذاری و سود',
    icon: 'TrendingUp',
    color: '#22c55e', // Green
    type: 'income',
  },
  {
    id: 'business',
    name: 'Business Revenue',
    name_fa: 'درآمد کسب‌وکار',
    icon: 'Store',
    color: '#34d399', // Mint
    type: 'income',
  },
  {
    id: 'bonus_gift',
    name: 'Bonus & Gift',
    name_fa: 'پاداش و هدیه',
    icon: 'Gift',
    color: '#a855f7', // Violet
    type: 'income',
  },
  {
    id: 'other_income',
    name: 'Other Income',
    name_fa: 'سایر درآمدها',
    icon: 'PlusCircle',
    color: '#10b981', // Emerald
    type: 'income',
  },
];

export const EXPENSE_CATEGORIES = DEFAULT_CATEGORIES.filter((c) => c.type === 'expense');
export const INCOME_CATEGORIES = DEFAULT_CATEGORIES.filter((c) => c.type === 'income');

export const getCategoryById = (id: string): Category => {
  const found = DEFAULT_CATEGORIES.find((c) => c.id === id);
  return found || DEFAULT_CATEGORIES[0];
};

