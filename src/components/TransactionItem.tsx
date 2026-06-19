import { useMemo } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import type { Transaction } from '@/types';
import { CategoryIcon } from './CategoryIcon';
import { getCategoryByKey } from '@/utils/categories';
import { formatAmount, formatDate } from '@/utils/formatters';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useBudgetStore } from '@/store/useBudgetStore';
import { isCategoryOverBudget } from '@/utils/budget';

interface TransactionItemProps {
  transaction: Transaction;
  index: number;
}

export function TransactionItem({ transaction, index }: TransactionItemProps) {
  const deleteTransaction = useTransactionStore((state) => state.deleteTransaction);
  const transactions = useTransactionStore((state) => state.transactions);
  const budgets = useBudgetStore((state) => state.budgets);
  const category = getCategoryByKey(transaction.category, transaction.type);

  const handleDelete = () => {
    if (window.confirm('确定要删除这条记录吗？')) {
      deleteTransaction(transaction.id);
    }
  };

  const overBudget = useMemo(() => {
    if (transaction.type !== 'expense') return false;
    return isCategoryOverBudget(transactions, budgets, transaction.category, transaction.date);
  }, [transactions, budgets, transaction.category, transaction.date, transaction.type]);

  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? 'text-income' : 'text-expense';
  const amountPrefix = isIncome ? '+' : '-';
  const categoryLabelColor = overBudget ? 'text-expense' : 'text-gray-800';
  const cardBorderColor = overBudget ? 'border border-red-200 bg-red-50/30' : '';

  return (
    <div
      className={`group flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 animate-slide-up ${cardBorderColor}`}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <CategoryIcon
        categoryKey={transaction.category}
        type={transaction.type}
        size="md"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`font-semibold truncate ${categoryLabelColor}`}>
            {category?.label || '未分类'}
          </span>
          {overBudget && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-red-100 text-expense text-xs font-medium rounded">
              <AlertTriangle className="w-3 h-3" />
              超支
            </span>
          )}
        </div>
        {transaction.note && (
          <p className="text-sm text-gray-500 truncate">
            {transaction.note}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          {formatDate(transaction.date)}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className={`text-lg font-bold ${amountColor}`}>
          {amountPrefix}¥{formatAmount(transaction.amount)}
        </span>
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-all duration-200"
          title="删除记录"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
