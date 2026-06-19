import { useMemo } from 'react';
import { Receipt, PlusCircle } from 'lucide-react';
import { useTransactionStore, getSortedTransactions } from '@/store/useTransactionStore';
import { TransactionItem } from './TransactionItem';

export function TransactionList() {
  const transactions = useTransactionStore((state) => state.transactions);

  const sortedTransactions = useMemo(() => {
    return getSortedTransactions(transactions);
  }, [transactions]);

  if (sortedTransactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Receipt className="w-10 h-10 text-gray-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          还没有账单记录
        </h3>
        <p className="text-sm text-gray-400 max-w-xs">
          点击右上角"记一笔"开始记录你的第一笔收支吧
        </p>
        <div className="mt-6 flex items-center gap-2 text-primary-500">
          <PlusCircle className="w-5 h-5" />
          <span className="text-sm font-medium">简单几步，轻松记账</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-700">账单记录</h2>
        <span className="text-xs text-gray-400">
          共 {sortedTransactions.length} 条
        </span>
      </div>

      <div className="space-y-3">
        {sortedTransactions.map((transaction, index) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
