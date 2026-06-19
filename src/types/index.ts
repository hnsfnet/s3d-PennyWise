export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  note: string;
  date: string;
  createdAt: number;
}

export interface Category {
  key: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

export interface FormErrors {
  amount?: string;
  category?: string;
}

export interface BudgetData {
  [categoryKey: string]: number;
}

export interface BudgetProgress {
  categoryKey: string;
  categoryLabel: string;
  color: string;
  bgColor: string;
  budget: number;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}

export interface MonthlyStat {
  month: string;
  monthLabel: string;
  income: number;
  expense: number;
}

export interface CategoryStat {
  name: string;
  value: number;
  color: string;
}
