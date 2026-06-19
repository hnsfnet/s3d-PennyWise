import { useState, useEffect } from 'react';
import { ArrowLeft, Save, DollarSign, Plus, X, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBudgetStore } from '@/store/useBudgetStore';
import { useCategoryStore, generateCategoryColor } from '@/store/useCategoryStore';
import { expenseCategories } from '@/utils/categories';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { BudgetData, Category } from '@/types';
import { generateId } from '@/utils/formatters';

const iconMap: Record<string, LucideIcon> = {
  UtensilsCrossed: Icons.UtensilsCrossed,
  Car: Icons.Car,
  ShoppingBag: Icons.ShoppingBag,
  Gamepad2: Icons.Gamepad2,
  Wallet: Icons.Wallet,
  Briefcase: Icons.Briefcase,
  Gift: Icons.Gift,
};

const customCategoryIcons = [
  'Circle', 'Heart', 'Star', 'Home', 'Book', 'Music', 'Camera',
  'Briefcase', 'Gift', 'Coffee', 'Apple', 'Dog', 'Cat', 'Dumbbell',
  'Plane', 'Train', 'Bike', 'Phone', 'Monitor', 'Gamepad2',
];

export default function Budget() {
  const navigate = useNavigate();
  const budgets = useBudgetStore((state) => state.budgets);
  const setBudgets = useBudgetStore((state) => state.setBudgets);
  const customCategories = useCategoryStore((state) => state.customCategories);
  const addCategory = useCategoryStore((state) => state.addCategory);
  const deleteCategory = useCategoryStore((state) => state.deleteCategory);
  const getAllCategories = useCategoryStore((state) => state.getAllCategories);

  const [localBudgets, setLocalBudgets] = useState<BudgetData>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Circle');

  useEffect(() => {
    setLocalBudgets(budgets);
  }, [budgets]);

  const allExpenseCategories = getAllCategories('expense');
  const defaultCategoryKeys = expenseCategories.map((c) => c.key);

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

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;

    const colorIdx = customCategories.expense.length % 8;
    const colors = generateCategoryColor(colorIdx);
    const key = `custom_${generateId()}`;

    const newCat: Category = {
      key,
      label: newCategoryName.trim(),
      icon: selectedIcon,
      color: colors.color,
      bgColor: colors.bgColor,
    };

    addCategory('expense', newCat);
    setNewCategoryName('');
    setSelectedIcon('Circle');
    setShowAddModal(false);
  };

  const handleDeleteCategory = (key: string) => {
    if (!window.confirm('确定要删除这个分类吗？已有账单记录不会被删除。')) {
      return;
    }
    deleteCategory('expense', key);
    setLocalBudgets((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const totalBudget = Object.values(localBudgets).reduce((sum, v) => sum + (v || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
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
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-1 h-5 bg-primary-500 rounded-full" />
              支出分类预算
            </h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              添加分类
            </button>
          </div>

          <div className="space-y-3">
            {allExpenseCategories.map((cat) => {
              const IconComponent = iconMap[cat.icon] || Icons.Circle;
              const value = localBudgets[cat.key] || '';
              const isCustom = !defaultCategoryKeys.includes(cat.key);

              return (
                <div
                  key={cat.key}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: cat.bgColor }}
                  >
                    <IconComponent
                      className="w-5 h-5"
                      style={{ color: cat.color }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{cat.label}</p>
                    <p className="text-xs text-gray-400">
                      {isCustom ? '自定义分类' : `每月${cat.label}支出上限`}
                    </p>
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
                      className="w-28 pl-8 pr-3 py-2.5 text-right font-semibold text-gray-800 border-2 border-gray-200 bg-white rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                    />
                  </div>

                  {isCustom && (
                    <button
                      onClick={() => handleDeleteCategory(cat.key)}
                      className="w-9 h-9 rounded-full bg-red-50 text-red-400 flex items-center justify-center shrink-0 hover:bg-red-100 hover:text-red-500 transition-colors"
                      title="删除分类"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
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

      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
        >
          <div className="w-full sm:max-w-md sm:mx-4 bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-up sm:animate-scale-in">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-lg font-bold text-gray-800">添加自定义分类</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">分类名称</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="例如：宠物、医疗、教育..."
                  maxLength={10}
                  autoFocus
                  className="w-full px-4 py-3 border-2 border-gray-100 bg-gray-50 rounded-xl focus:outline-none focus:border-primary-400 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">选择图标</label>
                <div className="grid grid-cols-5 gap-2">
                  {customCategoryIcons.map((iconName) => {
                    const IconComp = (Icons as Record<string, LucideIcon>)[iconName] || Icons.Circle;
                    const isSelected = selectedIcon === iconName;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setSelectedIcon(iconName)}
                        className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-primary-100 ring-2 ring-primary-400 text-primary-600 scale-105'
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        <IconComp className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim()}
                className={`w-full py-3.5 rounded-xl font-semibold transition-all ${
                  !newCategoryName.trim()
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl active:scale-[0.98]'
                }`}
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
