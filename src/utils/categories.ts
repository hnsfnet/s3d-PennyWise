import type { Category, TransactionType } from '@/types';

export const expenseCategories: Category[] = [
  { key: 'food', label: '餐饮', icon: 'UtensilsCrossed', color: '#F97316', bgColor: '#FFF7ED' },
  { key: 'transport', label: '交通', icon: 'Car', color: '#3B82F6', bgColor: '#EFF6FF' },
  { key: 'shopping', label: '购物', icon: 'ShoppingBag', color: '#8B5CF6', bgColor: '#F5F3FF' },
  { key: 'entertainment', label: '娱乐', icon: 'Gamepad2', color: '#EC4899', bgColor: '#FDF2F8' },
];

export const incomeCategories: Category[] = [
  { key: 'salary', label: '工资', icon: 'Wallet', color: '#22C55E', bgColor: '#F0FDF4' },
  { key: 'parttime', label: '兼职', icon: 'Briefcase', color: '#06B6D4', bgColor: '#ECFEFF' },
  { key: 'other', label: '其他', icon: 'Gift', color: '#F59E0B', bgColor: '#FFFBEB' },
];

const CUSTOM_CATEGORIES_STORAGE_KEY = 'coinkeeper_custom_categories';

interface CustomCategories {
  expense: Category[];
  income: Category[];
}

const loadCustomCategories = (): CustomCategories => {
  try {
    const stored = localStorage.getItem(CUSTOM_CATEGORIES_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        expense: Array.isArray(parsed.expense) ? parsed.expense : [],
        income: Array.isArray(parsed.income) ? parsed.income : [],
      };
    }
  } catch (e) {
    console.error('Failed to load custom categories:', e);
  }
  return { expense: [], income: [] };
};

export const getAllCategoriesByType = (type: TransactionType): Category[] => {
  const defaultList = type === 'expense' ? expenseCategories : incomeCategories;
  const custom = loadCustomCategories();
  return [...defaultList, ...custom[type]];
};

export const getCategoryByKey = (key: string, type: TransactionType): Category => {
  const allCategories = getAllCategoriesByType(type);
  const found = allCategories.find((c) => c.key === key);
  if (found) return found;

  return {
    key,
    label: key,
    icon: 'Circle',
    color: '#6B7280',
    bgColor: '#F3F4F6',
  };
};

export const getCategoriesByType = (type: TransactionType): Category[] => {
  return getAllCategoriesByType(type);
};
