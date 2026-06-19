import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  PieChart as PieChartIcon,
  TrendingUp,
  TrendingDown,
  Receipt,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTransactionStore } from '@/store/useTransactionStore';
import {
  getMonthlyStats,
  getMonthCategoryStats,
  getCurrentMonthKey,
  getMonthTransactions,
} from '@/utils/budget';
import { formatAmount } from '@/utils/formatters';
import { ExpensePieChart } from '@/components/ExpensePieChart';
import { MonthlyTrendChart } from '@/components/MonthlyTrendChart';

const formatMonthKeyToLabel = (monthKey: string): string => {
  const [year, month] = monthKey.split('-');
  return `${year}年${parseInt(month, 10)}月`;
};

const shiftMonth = (monthKey: string, delta: number): string => {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

export default function Stats() {
  const navigate = useNavigate();
  const transactions = useTransactionStore((state) => state.transactions);
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey());

  const categoryStats = useMemo(() => {
    return getMonthCategoryStats(transactions, selectedMonth);
  }, [transactions, selectedMonth]);

  const monthlyStats = useMemo(() => {
    return getMonthlyStats(transactions);
  }, [transactions]);

  const selectedMonthStats = useMemo(() => {
    const monthTx = getMonthTransactions(transactions, selectedMonth);
    const income = monthTx
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const expense = monthTx
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    const total = monthTx.length;
    return { income, expense, total };
  }, [transactions, selectedMonth]);

  const currentMonthLabel = useMemo(
    () => formatMonthKeyToLabel(selectedMonth),
    [selectedMonth]
  );

  const handlePrevMonth = () => setSelectedMonth((m) => shiftMonth(m, -1));
  const handleNextMonth = () => setSelectedMonth((m) => shiftMonth(m, 1));

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">数据统计</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={handlePrevMonth}
              className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div className="px-4 py-1.5 bg-primary-50 rounded-lg">
              <span className="text-base font-bold text-primary-600">
                {currentMonthLabel}
              </span>
            </div>
            <button
              onClick={handleNextMonth}
              className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Receipt className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">记录笔数</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {selectedMonthStats.total}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp className="w-4 h-4 text-income" />
                <span className="text-xs text-gray-500">收入</span>
              </div>
              <p className="text-2xl font-bold text-income">
                ¥{formatAmount(selectedMonthStats.income)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingDown className="w-4 h-4 text-expense" />
                <span className="text-xs text-gray-500">支出</span>
              </div>
              <p className="text-2xl font-bold text-expense">
                ¥{formatAmount(selectedMonthStats.expense)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-5 h-5 text-primary-500" />
            <h3 className="font-semibold text-gray-800">
              {currentMonthLabel}支出占比
            </h3>
          </div>
          <ExpensePieChart data={categoryStats} />
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-500" />
            <h3 className="font-semibold text-gray-800">近6个月收支趋势</h3>
          </div>
          <MonthlyTrendChart data={monthlyStats} />
        </div>
      </main>
    </div>
  );
}
