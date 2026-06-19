import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getMonthKey,
  getMonthTransactions,
  getCategoryMonthSpent,
  isCategoryOverBudget,
  getBudgetProgressList,
  getMonthlyStats,
  getMonthCategoryStats,
  getCurrentMonthKey,
} from '@/utils/budget';
import type { Transaction } from '@/types';
import { setSystemTime, resetSystemTime, createMockTransaction } from '../test-utils';

describe('budget utils', () => {
  beforeEach(() => {
    setSystemTime(new Date('2026-06-19T10:00:00'));
  });

  afterEach(() => {
    resetSystemTime();
  });

  describe('getMonthKey', () => {
    it('应该从日期字符串提取 YYYY-MM 格式的月份', () => {
      expect(getMonthKey('2026-06-19')).toBe('2026-06');
      expect(getMonthKey('2025-12-31')).toBe('2025-12');
      expect(getMonthKey('2026-01-01')).toBe('2026-01');
    });
  });

  describe('getCurrentMonthKey', () => {
    it('应该返回当前月份的 YYYY-MM 格式', () => {
      expect(getCurrentMonthKey()).toBe('2026-06');
    });
  });

  describe('getMonthTransactions', () => {
    const transactions: Transaction[] = [
      createMockTransaction({ date: '2026-06-01', id: '1' }),
      createMockTransaction({ date: '2026-06-15', id: '2' }),
      createMockTransaction({ date: '2026-05-20', id: '3' }),
      createMockTransaction({ date: '2026-07-01', id: '4' }),
    ];

    it('应该只返回指定月份的交易记录', () => {
      const juneTransactions = getMonthTransactions(transactions, '2026-06');
      expect(juneTransactions).toHaveLength(2);
      expect(juneTransactions.map((t) => t.id)).toEqual(['1', '2']);

      const mayTransactions = getMonthTransactions(transactions, '2026-05');
      expect(mayTransactions).toHaveLength(1);
      expect(mayTransactions[0].id).toBe('3');
    });

    it('当没有指定月份的交易时应该返回空数组', () => {
      const result = getMonthTransactions(transactions, '2025-01');
      expect(result).toEqual([]);
    });
  });

  describe('getCategoryMonthSpent', () => {
    const transactions: Transaction[] = [
      createMockTransaction({ date: '2026-06-01', category: 'food', amount: 100, type: 'expense' }),
      createMockTransaction({ date: '2026-06-15', category: 'food', amount: 200, type: 'expense' }),
      createMockTransaction({ date: '2026-06-10', category: 'transport', amount: 50, type: 'expense' }),
      createMockTransaction({ date: '2026-06-20', category: 'food', amount: 300, type: 'income' }),
      createMockTransaction({ date: '2026-05-10', category: 'food', amount: 150, type: 'expense' }),
    ];

    it('应该正确计算指定分类在指定月份的总支出', () => {
      const foodJuneSpent = getCategoryMonthSpent(transactions, 'food', '2026-06');
      expect(foodJuneSpent).toBe(300);
    });

    it('不应该包含收入记录', () => {
      const foodJuneSpent = getCategoryMonthSpent(transactions, 'food', '2026-06');
      expect(foodJuneSpent).toBe(300);
    });

    it('不应该包含其他月份的支出', () => {
      const foodMaySpent = getCategoryMonthSpent(transactions, 'food', '2026-05');
      expect(foodMaySpent).toBe(150);
    });

    it('当没有支出时应该返回 0', () => {
      const shoppingSpent = getCategoryMonthSpent(transactions, 'shopping', '2026-06');
      expect(shoppingSpent).toBe(0);
    });
  });

  describe('isCategoryOverBudget', () => {
    const transactions: Transaction[] = [
      createMockTransaction({ date: '2026-06-01', category: 'food', amount: 1500, type: 'expense' }),
      createMockTransaction({ date: '2026-06-15', category: 'food', amount: 800, type: 'expense' }),
      createMockTransaction({ date: '2026-06-10', category: 'transport', amount: 300, type: 'expense' }),
    ];
    const budgets = { food: 2000, transport: 500 };

    it('当支出超过预算时应该返回 true', () => {
      const result = isCategoryOverBudget(transactions, budgets, 'food', '2026-06-15');
      expect(result).toBe(true);
    });

    it('当支出未超过预算时应该返回 false', () => {
      const result = isCategoryOverBudget(transactions, budgets, 'transport', '2026-06-10');
      expect(result).toBe(false);
    });

    it('当预算为 0 或未设置时应该返回 false', () => {
      const result = isCategoryOverBudget(transactions, budgets, 'shopping', '2026-06-10');
      expect(result).toBe(false);
    });

    it('应该只统计指定月份的支出', () => {
      const mayTransactions = [
        ...transactions,
        createMockTransaction({ date: '2026-05-15', category: 'food', amount: 5000, type: 'expense' }),
      ];
      const result = isCategoryOverBudget(mayTransactions, budgets, 'food', '2026-06-15');
      expect(result).toBe(true);
    });
  });

  describe('getBudgetProgressList', () => {
    const transactions: Transaction[] = [
      createMockTransaction({ date: '2026-06-01', category: 'food', amount: 1500, type: 'expense' }),
      createMockTransaction({ date: '2026-06-15', category: 'transport', amount: 600, type: 'expense' }),
    ];
    const budgets = { food: 2000, transport: 500 };

    it('应该返回正确的预算进度列表', () => {
      const result = getBudgetProgressList(transactions, budgets);

      expect(result.length).toBeGreaterThan(0);

      const foodProgress = result.find((p) => p.categoryKey === 'food');
      expect(foodProgress).toBeDefined();
      expect(foodProgress?.budget).toBe(2000);
      expect(foodProgress?.spent).toBe(1500);
      expect(foodProgress?.isOverBudget).toBe(false);
      expect(foodProgress?.percentage).toBe(75);

      const transportProgress = result.find((p) => p.categoryKey === 'transport');
      expect(transportProgress).toBeDefined();
      expect(transportProgress?.budget).toBe(500);
      expect(transportProgress?.spent).toBe(600);
      expect(transportProgress?.isOverBudget).toBe(true);
    });

    it('超支时 remaining 应该为负数', () => {
      const result = getBudgetProgressList(transactions, budgets);
      const transportProgress = result.find((p) => p.categoryKey === 'transport');
      expect(transportProgress?.remaining).toBe(-100);
    });
  });

  describe('getMonthlyStats', () => {
    const transactions: Transaction[] = [
      createMockTransaction({ date: '2026-06-01', amount: 5000, type: 'income' }),
      createMockTransaction({ date: '2026-06-15', amount: 2000, type: 'expense' }),
      createMockTransaction({ date: '2026-05-10', amount: 4000, type: 'income' }),
      createMockTransaction({ date: '2026-05-20', amount: 1500, type: 'expense' }),
    ];

    it('应该返回近6个月的收支统计', () => {
      const result = getMonthlyStats(transactions);
      expect(result).toHaveLength(6);

      const juneStats = result.find((s) => s.month === '2026-06');
      expect(juneStats).toBeDefined();
      expect(juneStats?.income).toBe(5000);
      expect(juneStats?.expense).toBe(2000);

      const mayStats = result.find((s) => s.month === '2026-05');
      expect(mayStats).toBeDefined();
      expect(mayStats?.income).toBe(4000);
      expect(mayStats?.expense).toBe(1500);
    });

    it('没有数据的月份应该返回 0', () => {
      const result = getMonthlyStats(transactions);
      const aprilStats = result.find((s) => s.month === '2026-04');
      expect(aprilStats?.income).toBe(0);
      expect(aprilStats?.expense).toBe(0);
    });
  });

  describe('getMonthCategoryStats', () => {
    const transactions: Transaction[] = [
      createMockTransaction({ date: '2026-06-01', category: 'food', amount: 100, type: 'expense' }),
      createMockTransaction({ date: '2026-06-15', category: 'food', amount: 200, type: 'expense' }),
      createMockTransaction({ date: '2026-06-10', category: 'transport', amount: 150, type: 'expense' }),
      createMockTransaction({ date: '2026-06-20', category: 'food', amount: 500, type: 'income' }),
      createMockTransaction({ date: '2026-05-10', category: 'food', amount: 300, type: 'expense' }),
    ];

    it('应该返回指定月份各分类的支出统计', () => {
      const result = getMonthCategoryStats(transactions, '2026-06');

      expect(result).toHaveLength(2);

      const foodStats = result.find((s) => s.name === '餐饮');
      expect(foodStats).toBeDefined();
      expect(foodStats?.value).toBe(300);

      const transportStats = result.find((s) => s.name === '交通');
      expect(transportStats).toBeDefined();
      expect(transportStats?.value).toBe(150);
    });

    it('应该按金额从大到小排序', () => {
      const result = getMonthCategoryStats(transactions, '2026-06');
      expect(result[0].value).toBeGreaterThan(result[1].value);
    });

    it('不应该包含收入记录', () => {
      const result = getMonthCategoryStats(transactions, '2026-06');
      const foodStats = result.find((s) => s.name === '餐饮');
      expect(foodStats?.value).toBe(300);
    });

    it('不应该包含其他月份的记录', () => {
      const mayResult = getMonthCategoryStats(transactions, '2026-05');
      expect(mayResult).toHaveLength(1);
      expect(mayResult[0].value).toBe(300);
    });
  });
});
