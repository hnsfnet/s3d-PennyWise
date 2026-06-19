import type { Category } from '@/types';

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

export const getCategoryByKey = (key: string, type: 'income' | 'expense'): Category | undefined => {
  const categories = type === 'expense' ? expenseCategories : incomeCategories;
  return categories.find(c => c.key === key);
};

export const getCategoriesByType = (type: 'income' | 'expense'): Category[] => {
  return type === 'expense' ? expenseCategories : incomeCategories;
};
