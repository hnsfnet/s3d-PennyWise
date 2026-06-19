import { useState, useEffect, useCallback } from 'react';
import { X, Calendar, StickyNote, DollarSign } from 'lucide-react';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { TransactionType, FormErrors } from '@/types';
import { getCategoriesByType } from '@/utils/categories';
import { getTodayDateString } from '@/utils/formatters';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import type { Category } from '@/types';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const iconMap: Record<string, LucideIcon> = {
  UtensilsCrossed: Icons.UtensilsCrossed,
  Car: Icons.Car,
  ShoppingBag: Icons.ShoppingBag,
  Gamepad2: Icons.Gamepad2,
  Wallet: Icons.Wallet,
  Briefcase: Icons.Briefcase,
  Gift: Icons.Gift,
};

export function TransactionForm({ isOpen, onClose }: TransactionFormProps) {
  const addTransaction = useTransactionStore((state) => state.addTransaction);
  const getAllCategories = useCategoryStore((state) => state.getAllCategories);

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shakeField, setShakeField] = useState<string | null>(null);

  const categories = getAllCategories(type);

  const resetForm = useCallback(() => {
    setType('expense');
    setAmount('');
    setCategory('');
    setNote('');
    setDate(getTodayDateString());
    setErrors({});
    setIsSubmitting(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  useEffect(() => {
    setCategory('');
    setErrors((prev) => ({ ...prev, category: undefined }));
  }, [type]);

  const triggerShake = (field: string) => {
    setShakeField(field);
    setTimeout(() => setShakeField(null), 300);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    let valid = true;

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = '请输入有效的金额（大于0）';
      triggerShake('amount');
      valid = false;
    }

    if (!category) {
      newErrors.category = '请选择分类';
      triggerShake('category');
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      addTransaction({
        amount: parseFloat(amount),
        type,
        category,
        note: note.trim(),
        date,
      });

      setIsSubmitting(false);
      onClose();
    }, 300);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div className="w-full sm:max-w-md sm:mx-4 bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-up sm:animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-lg font-bold text-gray-800">记一笔</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex bg-gray-100 rounded-2xl p-1">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                type === 'expense'
                  ? 'bg-white text-expense shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              支出
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                type === 'income'
                  ? 'bg-white text-income shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              收入
            </button>
          </div>

          <div
            className={`space-y-2 ${shakeField === 'amount' ? 'animate-shake' : ''}`}
          >
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              金额
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">
                ¥
              </span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) {
                    setErrors((prev) => ({ ...prev, amount: undefined }));
                  }
                }}
                placeholder="0.00"
                className={`w-full pl-12 pr-4 py-4 text-3xl font-bold text-center border-2 rounded-2xl transition-all duration-200 focus:outline-none ${
                  errors.amount
                    ? 'border-red-300 bg-red-50 focus:border-red-500'
                    : 'border-gray-100 bg-gray-50 focus:border-primary-400 focus:bg-white'
                }`}
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount}</p>
            )}
          </div>

          <div
            className={`space-y-3 ${shakeField === 'category' ? 'animate-shake' : ''}`}
          >
            <label className="text-sm font-medium text-gray-700">选择分类</label>
            <div className="grid grid-cols-4 gap-3">
              {categories.map((cat: Category) => {
                const IconComponent = iconMap[cat.icon] || Icons.Circle;
                const isSelected = category === cat.key;

                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => {
                      setCategory(cat.key);
                      if (errors.category) {
                        setErrors((prev) => ({ ...prev, category: undefined }));
                      }
                    }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-200 ${
                      isSelected
                        ? 'bg-primary-50 ring-2 ring-primary-400 scale-105'
                        : 'bg-gray-50 hover:bg-gray-100 active:scale-95'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-200 ${
                        isSelected ? 'scale-110' : ''
                      }`}
                      style={{ backgroundColor: cat.bgColor }}
                    >
                      <IconComponent
                        className="w-6 h-6"
                        style={{ color: cat.color }}
                      />
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isSelected ? 'text-primary-600' : 'text-gray-600'
                      }`}
                    >
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-gray-400" />
              备注（可选）
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="添加备注..."
              maxLength={50}
              className="w-full px-4 py-3 border-2 border-gray-100 bg-gray-50 rounded-xl focus:outline-none focus:border-primary-400 focus:bg-white transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              日期
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-100 bg-gray-50 rounded-xl focus:outline-none focus:border-primary-400 focus:bg-white transition-all duration-200"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-2xl text-white font-semibold text-lg transition-all duration-200 ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 active:scale-[0.98]'
            }`}
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                保存中...
              </span>
            ) : (
              '保存'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
