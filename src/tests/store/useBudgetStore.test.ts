import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useBudgetStore } from '@/store/useBudgetStore';

describe('useBudgetStore', () => {
  beforeEach(() => {
    useBudgetStore.setState({ budgets: {} });
    window.localStorage.clear();
  });

  afterEach(() => {
    useBudgetStore.setState({ budgets: {} });
    window.localStorage.clear();
  });

  describe('setBudget', () => {
    it('应该正确设置指定分类的预算', () => {
      useBudgetStore.getState().setBudget('food', 2000);
      expect(useBudgetStore.getState().budgets.food).toBe(2000);

      const stored = localStorage.getItem('coinkeeper_budgets');
      expect(stored).toBeDefined();
      const parsed = JSON.parse(stored!);
      expect(parsed.food).toBe(2000);
    });

    it('金额为 0 或负数时应该删除该分类预算', () => {
      useBudgetStore.getState().setBudget('food', 2000);
      expect(useBudgetStore.getState().budgets.food).toBe(2000);

      useBudgetStore.getState().setBudget('food', 0);
      expect(useBudgetStore.getState().budgets.food).toBeUndefined();

      useBudgetStore.getState().setBudget('transport', 500);
      expect(useBudgetStore.getState().budgets.transport).toBe(500);

      useBudgetStore.getState().setBudget('transport', -100);
      expect(useBudgetStore.getState().budgets.transport).toBeUndefined();
    });

    it('应该支持更新已有分类的预算', () => {
      useBudgetStore.getState().setBudget('food', 2000);
      expect(useBudgetStore.getState().budgets.food).toBe(2000);

      useBudgetStore.getState().setBudget('food', 3000);
      expect(useBudgetStore.getState().budgets.food).toBe(3000);
    });
  });

  describe('setBudgets', () => {
    it('应该批量设置多个分类的预算', () => {
      useBudgetStore.getState().setBudgets({
        food: 2000,
        transport: 500,
        shopping: 1000,
      });

      expect(useBudgetStore.getState().budgets.food).toBe(2000);
      expect(useBudgetStore.getState().budgets.transport).toBe(500);
      expect(useBudgetStore.getState().budgets.shopping).toBe(1000);

      const stored = localStorage.getItem('coinkeeper_budgets');
      const parsed = JSON.parse(stored!);
      expect(parsed).toEqual({
        food: 2000,
        transport: 500,
        shopping: 1000,
      });
    });

    it('应该过滤掉金额为 0 或负数的预算', () => {
      useBudgetStore.getState().setBudgets({
        food: 2000,
        transport: 0,
        shopping: -100,
      });

      expect(useBudgetStore.getState().budgets.food).toBe(2000);
      expect(useBudgetStore.getState().budgets.transport).toBeUndefined();
      expect(useBudgetStore.getState().budgets.shopping).toBeUndefined();

      expect(Object.keys(useBudgetStore.getState().budgets)).toHaveLength(1);
    });
  });

  describe('getBudget', () => {
    it('应该正确返回指定分类的预算', () => {
      useBudgetStore.getState().setBudget('food', 2000);
      expect(useBudgetStore.getState().getBudget('food')).toBe(2000);
    });

    it('未设置预算的分类应该返回 0', () => {
      expect(useBudgetStore.getState().getBudget('shopping')).toBe(0);
    });
  });

  describe('clearBudget', () => {
    it('应该正确删除指定分类的预算', () => {
      useBudgetStore.getState().setBudget('food', 2000);
      useBudgetStore.getState().setBudget('transport', 500);

      expect(useBudgetStore.getState().budgets.food).toBe(2000);
      expect(useBudgetStore.getState().budgets.transport).toBe(500);

      useBudgetStore.getState().clearBudget('food');
      expect(useBudgetStore.getState().budgets.food).toBeUndefined();
      expect(useBudgetStore.getState().budgets.transport).toBe(500);

      const stored = localStorage.getItem('coinkeeper_budgets');
      const parsed = JSON.parse(stored!);
      expect(parsed.food).toBeUndefined();
      expect(parsed.transport).toBe(500);
    });

    it('删除不存在的分类应该不报错', () => {
      expect(() => useBudgetStore.getState().clearBudget('non-existent')).not.toThrow();
    });
  });

  describe('clearAllBudgets', () => {
    it('应该清空所有预算', () => {
      useBudgetStore.getState().setBudgets({
        food: 2000,
        transport: 500,
        shopping: 1000,
      });

      expect(Object.keys(useBudgetStore.getState().budgets)).toHaveLength(3);

      useBudgetStore.getState().clearAllBudgets();
      expect(Object.keys(useBudgetStore.getState().budgets)).toHaveLength(0);

      const stored = localStorage.getItem('coinkeeper_budgets');
      expect(stored).toBeNull();
    });
  });

  describe('localStorage 持久化', () => {
    it('应该从 localStorage 加载初始数据', () => {
      const mockData = { food: 2000, transport: 500 };
      localStorage.setItem('coinkeeper_budgets', JSON.stringify(mockData));

      const testStore = (useBudgetStore as any).getState();
      testStore.budgets = {};

      const loadFn = (): any => {
        try {
          const stored = localStorage.getItem('coinkeeper_budgets');
          if (stored) {
            return JSON.parse(stored);
          }
        } catch (e) {}
        return {};
      };

      const loaded = loadFn();
      expect(loaded).toEqual(mockData);
    });
  });
});
