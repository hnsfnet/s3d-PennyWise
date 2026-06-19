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
