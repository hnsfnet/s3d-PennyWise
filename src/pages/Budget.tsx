import { useState, useEffect } from 'react';
import { ArrowLeft, Save, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBudgetStore } from '@/store/useBudgetStore';
import { expenseCategories } from '@/utils/categories';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { BudgetData } from '@/types';

const iconMap: Record<string, LucideIcon> = {
  UtensilsCrossed: Icons.UtensilsCrossed,
  Car: Icons.Car,
  ShoppingBag: Icons.ShoppingBag,
  Gamepad2: Icons.Gamepad2,
};

export default function Budget() {
  const navigate = useNavigate();
  const budgets = useBudgetStore((state) => state.budgets);
  const setBudgets = useBudgetStore((state) => state.setBudgets);

  const [localBudgets, setLocalBudgets] = useState<BudgetData>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalBudgets(budgets);
  }, [budgets]);

  const handleChange = (categoryKey: string, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    setLocalBudgets((prev) => ({
      ...prev,
      [categoryKey]: isNaN(numValue) ? 0 : Math.max(0, numValue),
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setBudgets(localBudgets);
      setIsSaving(false);
      navigate('/');
    }, 300);
  };

  const totalBudget = Object.values(localBudgets).reduce((sum, v) => sum + (v || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-bold text-gray-800">预算设置</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
              isSaving
                ? 'bg-gray-300 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:scale-105 active:scale-95'
            }`}
          >
            {isSaving ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>保存</span>
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-5 text-white shadow-lg shadow-primary-500/30">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-5 h-5 text-white/80" />
            <span className="text-sm text-white/80">本月总预算</span>
          </div>
          <p className="text-3xl font-bold">¥{totalBudget.toFixed(2)}</p>
          <p className="text-sm text-white/70 mt-1">
            设置各分类每月的支出上限，合理规划消费
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-5">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <span className="w-1 h-5 bg-primary-500 rounded-full" />
            支出分类预算
          </h3>

          <div className="space-y-4">
            {expenseCategories.map((cat) => {
              const IconComponent = iconMap[cat.icon] || Icons.Circle;
              const value = localBudgets[cat.key] || '';

              return (
                <div
                  key={cat.key}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: cat.bgColor }}
                  >
                    <IconComponent
                      className="w-6 h-6"
                      style={{ color: cat.color }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800">{cat.label}</p>
                    <p className="text-xs text-gray-400">设置每月{cat.label}支出上限</p>
                  </div>

                  <div className="relative shrink-0">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                      ¥
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={value}
                      onChange={(e) => handleChange(cat.key, e.target.value)}
                      placeholder="0"
                      className="w-32 pl-8 pr-3 py-2.5 text-right font-semibold text-gray-800 border-2 border-gray-200 bg-white rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4">
          <p className="text-sm text-yellow-700">
            💡 小贴士：设置合理的月度预算，当某个分类支出超过预算时，账单列表会用红色标记提醒你。
          </p>
        </div>
      </main>
    </div>
  );
}
