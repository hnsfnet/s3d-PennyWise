import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { formatAmount, formatDate, getTodayDateString, generateId } from '@/utils/formatters';
import { setSystemTime, resetSystemTime } from '../test-utils';

describe('formatters', () => {
  beforeEach(() => {
    setSystemTime(new Date('2026-06-19T10:00:00'));
  });

  afterEach(() => {
    resetSystemTime();
  });

  describe('formatAmount', () => {
    it('应该正确格式化整数金额为两位小数', () => {
      expect(formatAmount(100)).toBe('100.00');
      expect(formatAmount(0)).toBe('0.00');
      expect(formatAmount(999)).toBe('999.00');
    });

    it('应该正确格式化小数金额', () => {
      expect(formatAmount(100.5)).toBe('100.50');
      expect(formatAmount(100.555)).toBe('100.56');
      expect(formatAmount(99.99)).toBe('99.99');
    });

    it('应该正确格式化大额金额（带千分位）', () => {
      expect(formatAmount(1000)).toBe('1,000.00');
      expect(formatAmount(12345.67)).toBe('12,345.67');
      expect(formatAmount(1000000)).toBe('1,000,000.00');
    });
  });

  describe('formatDate', () => {
    it('应该返回"今天"当日期是今天时', () => {
      expect(formatDate('2026-06-19')).toBe('今天');
    });

    it('应该返回"昨天"当日期是昨天时', () => {
      expect(formatDate('2026-06-18')).toBe('昨天');
    });

    it('应该返回格式化的日期当日期是其他时间时', () => {
      expect(formatDate('2026-06-17')).toBe('6月17日 周三');
      expect(formatDate('2026-06-15')).toBe('6月15日 周一');
      expect(formatDate('2026-01-01')).toBe('1月1日 周四');
    });
  });

  describe('getTodayDateString', () => {
    it('应该返回 YYYY-MM-DD 格式的今天日期', () => {
      expect(getTodayDateString()).toBe('2026-06-19');
    });
  });

  describe('generateId', () => {
    it('应该生成唯一的 ID', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });
  });
});
