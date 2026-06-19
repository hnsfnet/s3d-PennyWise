import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useTransactionStore, getSortedTransactions } from '@/store/useTransactionStore';
import { setSystemTime, resetSystemTime } from '../test-utils';

describe('useTransactionStore', () => {
  beforeEach(() => {
    setSystemTime(new Date('2026-06-19T10:00:00'));
    useTransactionStore.setState({ transactions: [] });
    window.localStorage.clear();
  });

  afterEach(() => {
    resetSystemTime();
    useTransactionStore.setState({ transactions: [] });
    window.localStorage.clear();
  });

  describe('addTransaction', () => {
    it('新增一笔账单后列表应该多一条', () => {
      expect(useTransactionStore.getState().transactions).toHaveLength(0);

      useTransactionStore.getState().addTransaction({
        amount: 100,
        type: 'expense',
        category: 'food',
        note: '测试餐饮',
        date: '2026-06-19',
      });

      const transactions = useTransactionStore.getState().transactions;
      expect(transactions).toHaveLength(1);
      expect(transactions[0].amount).toBe(100);
      expect(transactions[0].type).toBe('expense');
      expect(transactions[0].category).toBe('food');
      expect(transactions[0].note).toBe('测试餐饮');
      expect(transactions[0].date).toBe('2026-06-19');
      expect(transactions[0].id).toBeDefined();
      expect(transactions[0].createdAt).toBeDefined();
    });

    it('应该正确保存到 localStorage', () => {
      useTransactionStore.getState().addTransaction({
        amount: 200,
        type: 'income',
        category: 'salary',
        note: '工资',
        date: '2026-06-19',
      });

      const stored = localStorage.getItem('coinkeeper_transactions');
      expect(stored).toBeDefined();
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].amount).toBe(200);
    });

    it('金额校验应该拒绝非正数', () => {
      expect(() => {
        useTransactionStore.getState().addTransaction({
          amount: 0,
          type: 'expense',
          category: 'food',
          note: '',
          date: '2026-06-19',
        });
      }).not.toThrow();

      expect(() => {
        useTransactionStore.getState().addTransaction({
          amount: -100,
          type: 'expense',
          category: 'food',
          note: '',
          date: '2026-06-19',
        });
      }).not.toThrow();
    });
  });

  describe('deleteTransaction', () => {
    it('应该正确删除指定的交易记录', () => {
      useTransactionStore.getState().addTransaction({
        amount: 100,
        type: 'expense',
        category: 'food',
        note: '',
        date: '2026-06-19',
      });

      const id = useTransactionStore.getState().transactions[0].id;
      expect(useTransactionStore.getState().transactions).toHaveLength(1);

      useTransactionStore.getState().deleteTransaction(id);
      expect(useTransactionStore.getState().transactions).toHaveLength(0);

      const stored = localStorage.getItem('coinkeeper_transactions');
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(0);
    });

    it('删除不存在的 ID 应该不报错', () => {
      expect(() => useTransactionStore.getState().deleteTransaction('non-existent-id')).not.toThrow();
    });
  });

  describe('getTotalIncome', () => {
    it('应该正确计算总收入', () => {
      useTransactionStore.getState().addTransaction({
        amount: 5000,
        type: 'income',
        category: 'salary',
        note: '',
        date: '2026-06-19',
      });
      useTransactionStore.getState().addTransaction({
        amount: 1000,
        type: 'income',
        category: 'parttime',
        note: '',
        date: '2026-06-18',
      });
      useTransactionStore.getState().addTransaction({
        amount: 500,
        type: 'expense',
        category: 'food',
        note: '',
        date: '2026-06-19',
      });

      expect(useTransactionStore.getState().getTotalIncome()).toBe(6000);
    });

    it('没有收入时应该返回 0', () => {
      expect(useTransactionStore.getState().getTotalIncome()).toBe(0);
    });
  });

  describe('getTotalExpense', () => {
    it('应该正确计算总支出', () => {
      useTransactionStore.getState().addTransaction({
        amount: 500,
        type: 'expense',
        category: 'food',
        note: '',
        date: '2026-06-19',
      });
      useTransactionStore.getState().addTransaction({
        amount: 300,
        type: 'expense',
        category: 'transport',
        note: '',
        date: '2026-06-18',
      });
      useTransactionStore.getState().addTransaction({
        amount: 5000,
        type: 'income',
        category: 'salary',
        note: '',
        date: '2026-06-19',
      });

      expect(useTransactionStore.getState().getTotalExpense()).toBe(800);
    });

    it('没有支出时应该返回 0', () => {
      expect(useTransactionStore.getState().getTotalExpense()).toBe(0);
    });
  });

  describe('getBalance', () => {
    it('应该正确计算余额（总收入 - 总支出）', () => {
      useTransactionStore.getState().addTransaction({
        amount: 5000,
        type: 'income',
        category: 'salary',
        note: '',
        date: '2026-06-19',
      });
      useTransactionStore.getState().addTransaction({
        amount: 2000,
        type: 'expense',
        category: 'food',
        note: '',
        date: '2026-06-19',
      });

      expect(useTransactionStore.getState().getBalance()).toBe(3000);
    });

    it('支出大于收入时余额应该为负数', () => {
      useTransactionStore.getState().addTransaction({
        amount: 1000,
        type: 'income',
        category: 'salary',
        note: '',
        date: '2026-06-19',
      });
      useTransactionStore.getState().addTransaction({
        amount: 2000,
        type: 'expense',
        category: 'shopping',
        note: '',
        date: '2026-06-19',
      });

      expect(useTransactionStore.getState().getBalance()).toBe(-1000);
    });
  });

  describe('clearAll', () => {
    it('应该清空所有交易记录', () => {
      useTransactionStore.getState().addTransaction({
        amount: 100,
        type: 'expense',
        category: 'food',
        note: '',
        date: '2026-06-19',
      });

      expect(useTransactionStore.getState().transactions).toHaveLength(1);
      useTransactionStore.getState().clearAll();
      expect(useTransactionStore.getState().transactions).toHaveLength(0);

      const stored = localStorage.getItem('coinkeeper_transactions');
      expect(stored).toBeNull();
    });
  });

  describe('getSortedTransactions', () => {
    it('应该按日期倒序排列，日期相同按创建时间倒序', () => {
      const transactions = [
        {
          id: '1',
          amount: 100,
          type: 'expense' as const,
          category: 'food',
          note: '',
          date: '2026-06-19',
          createdAt: 1000,
        },
        {
          id: '2',
          amount: 200,
          type: 'expense' as const,
          category: 'transport',
          note: '',
          date: '2026-06-18',
          createdAt: 2000,
        },
        {
          id: '3',
          amount: 300,
          type: 'expense' as const,
          category: 'shopping',
          note: '',
          date: '2026-06-19',
          createdAt: 3000,
        },
      ];

      const sorted = getSortedTransactions(transactions);
      expect(sorted[0].id).toBe('3');
      expect(sorted[1].id).toBe('1');
      expect(sorted[2].id).toBe('2');
    });
  });
});
