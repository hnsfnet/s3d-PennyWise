import { create } from 'zustand';
import type { BudgetData } from '@/types';

const STORAGE_KEY = 'coinkeeper_budgets';

interface BudgetState {
  budgets: BudgetData;
  setBudget: (categoryKey: string, amount: number) => void;
  setBudgets: (budgets: BudgetData) => void;
  getBudget: (categoryKey: string) => number;
  clearBudget: (categoryKey: string) => void;
  clearAllBudgets: () => void;
}

const loadFromStorage = (): BudgetData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load budgets from localStorage:', e);
  }
  return {};
};

const saveToStorage = (budgets: BudgetData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
  } catch (e) {
    console.error('Failed to save budgets to localStorage:', e);
  }
};

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: loadFromStorage(),

  setBudget: (categoryKey, amount) => {
    set((state) => {
      const newBudgets = { ...state.budgets };
      if (amount > 0) {
        newBudgets[categoryKey] = amount;
      } else {
        delete newBudgets[categoryKey];
      }
      saveToStorage(newBudgets);
      return { budgets: newBudgets };
    });
  },

  setBudgets: (budgets) => {
    const cleanedBudgets: BudgetData = {};
    Object.entries(budgets).forEach(([key, value]) => {
      if (value > 0) {
        cleanedBudgets[key] = value;
      }
    });
    saveToStorage(cleanedBudgets);
    set({ budgets: cleanedBudgets });
  },

  getBudget: (categoryKey) => {
    return get().budgets[categoryKey] || 0;
  },

  clearBudget: (categoryKey) => {
    set((state) => {
      const newBudgets = { ...state.budgets };
      delete newBudgets[categoryKey];
      saveToStorage(newBudgets);
      return { budgets: newBudgets };
    });
  },

  clearAllBudgets: () => {
    set({ budgets: {} });
    localStorage.removeItem(STORAGE_KEY);
  },
}));
