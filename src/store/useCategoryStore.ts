import { create } from 'zustand';
import type { Category, TransactionType } from '@/types';
import {
  expenseCategories as defaultExpenseCategories,
  incomeCategories as defaultIncomeCategories,
  getAllCategoriesByType,
  getCategoryByKey,
} from '@/utils/categories';

const STORAGE_KEY = 'coinkeeper_custom_categories';

interface CustomCategories {
  expense: Category[];
  income: Category[];
}

interface CategoryState {
  customCategories: CustomCategories;
  addCategory: (type: TransactionType, category: Category) => void;
  deleteCategory: (type: TransactionType, key: string) => void;
  getAllCategories: (type: TransactionType) => Category[];
  findCategory: (key: string, type: TransactionType) => Category;
}

const loadFromStorage = (): CustomCategories => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        expense: Array.isArray(parsed.expense) ? parsed.expense : [],
        income: Array.isArray(parsed.income) ? parsed.income : [],
      };
    }
  } catch (e) {
    console.error('Failed to load custom categories from localStorage:', e);
  }
  return { expense: [], income: [] };
};

const saveToStorage = (categories: CustomCategories) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save custom categories to localStorage:', e);
  }
};

const DEFAULT_COLORS = [
  { color: '#F97316', bgColor: '#FFF7ED' },
  { color: '#3B82F6', bgColor: '#EFF6FF' },
  { color: '#8B5CF6', bgColor: '#F5F3FF' },
  { color: '#EC4899', bgColor: '#FDF2F8' },
  { color: '#10B981', bgColor: '#ECFDF5' },
  { color: '#F59E0B', bgColor: '#FFFBEB' },
  { color: '#06B6D4', bgColor: '#ECFEFF' },
  { color: '#EF4444', bgColor: '#FEF2F2' },
];

export const generateCategoryColor = (index: number) => {
  return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
};

export const useCategoryStore = create<CategoryState>((set, get) => ({
  customCategories: loadFromStorage(),

  addCategory: (type, category) => {
    set((state) => {
      const newCustom = { ...state.customCategories };
      const existingKeys = [
        ...(type === 'expense' ? defaultExpenseCategories : defaultIncomeCategories).map((c) => c.key),
        ...newCustom[type].map((c) => c.key),
      ];

      if (existingKeys.includes(category.key)) {
        return state;
      }

      newCustom[type] = [...newCustom[type], category];
      saveToStorage(newCustom);
      return { customCategories: newCustom };
    });
  },

  deleteCategory: (type, key) => {
    set((state) => {
      const newCustom = { ...state.customCategories };
      newCustom[type] = newCustom[type].filter((c) => c.key !== key);
      saveToStorage(newCustom);
      return { customCategories: newCustom };
    });
  },

  getAllCategories: (type) => {
    return getAllCategoriesByType(type);
  },

  findCategory: (key, type) => {
    return getCategoryByKey(key, type);
  },
}));
