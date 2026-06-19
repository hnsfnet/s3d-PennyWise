import { create } from 'zustand';
import type { Transaction, TransactionType } from '@/types';
import { generateId } from '@/utils/formatters';

const STORAGE_KEY = 'coinkeeper_transactions';

interface TransactionState {
  transactions: Transaction[];
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;
  clearAll: () => void;
  getTotalIncome: () => number;
  getTotalExpense: () => number;
  getBalance: () => number;
}

const loadFromStorage = (): Transaction[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load transactions from localStorage:', e);
  }
  return [];
};

const saveToStorage = (transactions: Transaction[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (e) {
    console.error('Failed to save transactions to localStorage:', e);
  }
};

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: loadFromStorage(),

  addTransaction: (data) => {
    const newTransaction: Transaction = {
      ...data,
      id: generateId(),
      createdAt: Date.now(),
    };
    set((state) => {
      const transactions = [...state.transactions, newTransaction];
      saveToStorage(transactions);
      return { transactions };
    });
  },

  deleteTransaction: (id) => {
    set((state) => {
      const transactions = state.transactions.filter((t) => t.id !== id);
      saveToStorage(transactions);
      return { transactions };
    });
  },

  clearAll: () => {
    set({ transactions: [] });
    localStorage.removeItem(STORAGE_KEY);
  },

  getTotalIncome: () => {
    return get().transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getTotalExpense: () => {
    return get().transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getBalance: () => {
    return get().getTotalIncome() - get().getTotalExpense();
  },
}));

export const getSortedTransactions = (transactions: Transaction[]): Transaction[] => {
  return [...transactions].sort((a, b) => {
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date);
    }
    return b.createdAt - a.createdAt;
  });
};
