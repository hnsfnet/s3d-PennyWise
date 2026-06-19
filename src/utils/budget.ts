import type { Transaction, BudgetProgress, MonthlyStat, CategoryStat } from '@/types';
import { expenseCategories, getCategoryByKey } from './categories';
import type { BudgetData } from '@/types';

export const getCurrentMonthKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const getMonthKey = (dateStr: string): string => {
  return dateStr.substring(0, 7);
};

export const getMonthTransactions = (
  transactions: Transaction[],
  monthKey: string
): Transaction[] => {
  return transactions.filter((t) => getMonthKey(t.date) === monthKey);
};

export const getCurrentMonthTransactions = (
  transactions: Transaction[]
): Transaction[] => {
  const currentMonth = getCurrentMonthKey();
  return getMonthTransactions(transactions, currentMonth);
};

export const getCategoryMonthSpent = (
  transactions: Transaction[],
  categoryKey: string,
  monthKey: string
): number => {
  return getMonthTransactions(transactions, monthKey)
    .filter((t) => t.type === 'expense' && t.category === categoryKey)
    .reduce((sum, t) => sum + t.amount, 0);
};

export const getCategoryCurrentMonthSpent = (
  transactions: Transaction[],
  categoryKey: string
): number => {
  return getCategoryMonthSpent(transactions, categoryKey, getCurrentMonthKey());
};

export const getBudgetProgressList = (
  transactions: Transaction[],
  budgets: BudgetData
): BudgetProgress[] => {
  const monthKey = getCurrentMonthKey();

  return expenseCategories
    .map((cat) => {
      const budget = budgets[cat.key] || 0;
      const spent = getCategoryMonthSpent(transactions, cat.key, monthKey);
      const remaining = budget - spent;
      const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
      const isOverBudget = budget > 0 && spent > budget;

      return {
        categoryKey: cat.key,
        categoryLabel: cat.label,
        color: cat.color,
        bgColor: cat.bgColor,
        budget,
        spent,
        remaining,
        percentage,
        isOverBudget,
      };
    })
    .filter((p) => p.budget > 0 || p.spent > 0);
};

export const isCategoryOverBudget = (
  transactions: Transaction[],
  budgets: BudgetData,
  categoryKey: string,
  dateStr: string
): boolean => {
  const budget = budgets[categoryKey] || 0;
  if (budget <= 0) return false;

  const monthKey = getMonthKey(dateStr);
  const spent = getCategoryMonthSpent(transactions, categoryKey, monthKey);
  return spent > budget;
};

export const getLast6Months = (): { month: string; monthLabel: string }[] => {
  const months: { month: string; monthLabel: string }[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const monthLabel = `${date.getMonth() + 1}月`;
    months.push({ month: `${year}-${month}`, monthLabel });
  }

  return months;
};

export const getMonthlyStats = (transactions: Transaction[]): MonthlyStat[] => {
  const last6Months = getLast6Months();

  return last6Months.map(({ month, monthLabel }) => {
    const monthTransactions = getMonthTransactions(transactions, month);
    const income = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { month, monthLabel, income, expense };
  });
};

export const getCurrentMonthCategoryStats = (
  transactions: Transaction[]
): CategoryStat[] => {
  const monthKey = getCurrentMonthKey();
  const monthExpenses = getMonthTransactions(transactions, monthKey).filter(
    (t) => t.type === 'expense'
  );

  const categoryTotals: Record<string, number> = {};
  monthExpenses.forEach((t) => {
    if (!categoryTotals[t.category]) {
      categoryTotals[t.category] = 0;
    }
    categoryTotals[t.category] += t.amount;
  });

  return Object.entries(categoryTotals)
    .map(([key, value]) => {
      const cat = getCategoryByKey(key, 'expense');
      return {
        name: cat?.label || key,
        value,
        color: cat?.color || '#9CA3AF',
      };
    })
    .sort((a, b) => b.value - a.value);
};
