import { AlertTriangle } from 'lucide-react';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { BudgetProgress } from '@/types';
import { getCategoryByKey } from '@/utils/categories';
import { formatAmount } from '@/utils/formatters';

const iconMap: Record<string, LucideIcon> = {
  UtensilsCrossed: Icons.UtensilsCrossed,
  Car: Icons.Car,
  ShoppingBag: Icons.ShoppingBag,
  Gamepad2: Icons.Gamepad2,
  Wallet: Icons.Wallet,
  Briefcase: Icons.Briefcase,
  Gift: Icons.Gift,
};

export interface BudgetBarProps {
  progress: BudgetProgress;
}

export function BudgetBar({ progress }: BudgetBarProps) {
  const cat = getCategoryByKey(progress.categoryKey, 'expense');
  const IconComponent = iconMap[cat.icon] || Icons.Circle;

  return (
    <div>
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
          style={{ width: `${progress.percentage}%` }}
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
}
