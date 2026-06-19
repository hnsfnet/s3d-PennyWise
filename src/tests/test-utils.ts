import type { Transaction, BudgetData } from '@/types';
import { generateId } from '@/utils/formatters';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';

export const createMockTransaction = (
  overrides: Partial<Transaction> = {}
): Transaction => {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return {
    id: generateId(),
    amount: 100,
    type: 'expense',
    category: 'food',
    note: '',
    date: dateStr,
    createdAt: Date.now(),
    ...overrides,
  };
};

export const createMockBudgetData = (
  overrides: Partial<BudgetData> = {}
): BudgetData => {
  return {
    food: 2000,
    transport: 500,
    shopping: 1000,
    entertainment: 800,
    ...overrides,
  };
};

export const createTransactionsForMonth = (
  year: number,
  month: number,
  count: number = 3
): Transaction[] => {
  const monthStr = String(month).padStart(2, '0');
  const transactions: Transaction[] = [];
  const categories = ['food', 'transport', 'shopping'];

  for (let i = 0; i < count; i++) {
    const day = String((i % 28) + 1).padStart(2, '0');
    transactions.push(
      createMockTransaction({
        id: `tx-${year}-${monthStr}-${i}`,
        amount: 50 * (i + 1),
        category: categories[i % categories.length],
        date: `${year}-${monthStr}-${day}`,
        type: i % 3 === 0 ? 'income' : 'expense',
      })
    );
  }

  return transactions;
};

export const setSystemTime = (date: Date) => {
  vi.useFakeTimers();
  vi.setSystemTime(date);
};

export const resetSystemTime = () => {
  vi.useRealTimers();
};

export const renderWithRouter = (
  ui: ReactElement,
  { route = '/' }: { route?: string } = {}
) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: MemoryRouter });
};

export const resetAllStores = () => {
  window.localStorage.clear();
};

