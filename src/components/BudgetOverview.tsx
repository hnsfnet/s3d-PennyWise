import { useMemo } from 'react';
import { Target, AlertTriangle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useBudgetStore } from '@/store/useBudgetStore';
import { getBudgetProgressList } from '@/utils/budget';
import { formatAmount } from '@/utils/formatters';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getCategoryByKey } from '@/utils/categories';

const iconMap: Record<string, LucideIcon> = {
  UtensilsCrossed: Icons.UtensilsCrossed,
  Car: Icons.Car,
  ShoppingBag: Icons.ShoppingBag,
  Gamepad2: Icons.Gamepad2,
  Wallet: Icons.Wallet,
  Briefcase: Icons.Briefcase,
  Gift: Icons.Gift,
};

export function BudgetOverview() {
  const navigate = useNavigate();
  const transactions = useTransactionStore((state) => state.transactions);
  const budgets = useBudgetStore((state) => state.budgets);

  const progressList = useMemo(() => {
    return getBudgetProgressList(transactions, budgets);
  }, [transactions, budgets]);

  const totalBudget = useMemo(() => {
    return Object.values(budgets).reduce((sum, v) => sum + v, 0);
  }, [budgets]);

  const totalSpent = useMemo(() => {
    return progressList.reduce((sum, p) => sum + p.spent, 0);
  }, [progressList]);

  const hasOverBudget = progressList.some((p) => p.isOverBudget);
  const hasBudgets = progressList.length > 0 && totalBudget > 0;

  if (!hasBudgets) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-500" />
            <h3 className="font-semibold text-gray-800">本月预算</h3>
          </div>
          <button
            onClick={() => navigate('/budget')}
            className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600 transition-colors"
          >
            去设置
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="py-6 text-center">
          <p className="text-gray-500 text-sm mb-2">还没有设置预算</p>
          <p className="text-gray-400 text-xs">设置分类预算，控制每月支出</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary-500" />
          <h3 className="font-semibold text-gray-800">本月预算</h3>
          {hasOverBudget && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-500 text-xs font-medium rounded-full">
              <AlertTriangle className="w-3 h-3" />
              超支
            </span>
          )}
        </div>
        <button
          onClick={() => navigate('/budget')}
          className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600 transition-colors"
        >
          管理
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-5 p-4 bg-gray-50 rounded-xl">
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-xs text-gray-500">已支出 / 预算</p>
            <p className="text-lg font-bold text-gray-800">
              ¥{formatAmount(totalSpent)}
              <span className="text-sm font-normal text-gray-400 ml-1">
                / ¥{formatAmount(totalBudget)}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">剩余</p>
            <p
              className={`text-lg font-bold ${
                totalBudget - totalSpent >= 0 ? 'text-income' : 'text-expense'
              }`}
            >
              ¥{formatAmount(Math.abs(totalBudget - totalSpent))}
            </p>
          </div>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              totalSpent > totalBudget ? 'bg-expense' : 'bg-primary-500'
            }`}
            style={{
              width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%`,
            }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {progressList.map((progress) => {
          const cat = getCategoryByKey(progress.categoryKey, 'expense');
          const IconComponent = iconMap[cat.icon] || Icons.Circle;

          return (
            <div key={progress.categoryKey}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: progress.bgColor }}
                  >
                    <IconComponent
                      className="w-3.5 h-3.5"
                      style={{ color: progress.color }}
                    />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      progress.isOverBudget ? 'text-expense' : 'text-gray-700'
                    }`}
                  >
                    {progress.categoryLabel}
                  </span>
                  {progress.isOverBudget && (
                    <AlertTriangle className="w-3.5 h-3.5 text-expense" />
                  )}
                </div>
                <div className="text-right">
                  <span
                    className={`text-sm font-semibold ${
                      progress.isOverBudget ? 'text-expense' : 'text-gray-800'
                    }`}
                  >
                    ¥{formatAmount(progress.spent)}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">
                    / ¥{formatAmount(progress.budget)}
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    progress.isOverBudget
                      ? 'bg-gradient-to-r from-red-400 to-red-500'
                      : 'bg-gradient-to-r from-primary-400 to-primary-500'
                  }`}
                  style={{
                    width: `${progress.percentage}%`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span
                  className={`text-xs ${
                    progress.isOverBudget ? 'text-expense' : 'text-gray-400'
                  }`}
                >
                  {progress.isOverBudget
                    ? `超支 ¥${formatAmount(Math.abs(progress.remaining))}`
                    : `剩 ¥${formatAmount(progress.remaining)}`}
                </span>
                <span className="text-xs text-gray-400">
                  {progress.percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
