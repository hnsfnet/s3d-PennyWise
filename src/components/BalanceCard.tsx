import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { formatAmount } from '@/utils/formatters';

export function BalanceCard() {
  const getTotalIncome = useTransactionStore((state) => state.getTotalIncome);
  const getTotalExpense = useTransactionStore((state) => state.getTotalExpense);
  const getBalance = useTransactionStore((state) => state.getBalance);
  const transactions = useTransactionStore((state) => state.transactions);

  const stats = useMemo(() => {
    return {
      balance: getBalance(),
      income: getTotalIncome(),
      expense: getTotalExpense(),
      count: transactions.length,
    };
  }, [transactions, getBalance, getTotalIncome, getTotalExpense]);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 p-6 text-white shadow-2xl shadow-primary-500/30">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="w-5 h-5 text-white/80" />
          <span className="text-sm text-white/80">账户余额</span>
        </div>

        <div className="mb-6">
          <span className="text-4xl font-bold tracking-tight">
            ¥{formatAmount(stats.balance)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-300" />
              </div>
              <span className="text-xs text-white/70">总收入</span>
            </div>
            <p className="text-xl font-semibold text-green-300">
              +¥{formatAmount(stats.income)}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-red-400/20 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-red-300" />
              </div>
              <span className="text-xs text-white/70">总支出</span>
            </div>
            <p className="text-xl font-semibold text-red-300">
              -¥{formatAmount(stats.expense)}
            </p>
          </div>
        </div>

        {stats.count > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <span className="text-xs text-white/60">
              共记录 {stats.count} 笔账单
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
